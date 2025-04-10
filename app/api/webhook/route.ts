import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { appendOrderToSpreadsheet } from '@/lib/spreadsheet'
import { moveImageToFinal } from '@/lib/actions/imageActions' // 新しいパスに修正
import { appendSpreadsheetRow } from '@/lib/spreadsheet'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log('🔄 Webhook受信開始');
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    console.log('🔍 Webhook署名検証中...');
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret)
    console.log('✅ Webhook署名検証成功');
  } catch (err: any) {
    console.error('❌ Webhook署名検証失敗:', err.message)
    return NextResponse.json({ received: false }, { status: 200 })
  }

  if (event.type === 'checkout.session.completed') {
    console.log('💰 チェックアウトセッション完了イベントを検出');
    const session = event.data.object as Stripe.Checkout.Session;

    // --- ここから try...catch を追加 ---
    try {
      console.log('📝 セッションID:', session.id);
      console.log('📦 メタデータ:', JSON.stringify(session.metadata, null, 2));

      const metadata = session.metadata || {}
      const {
        fragranceName,
        bottleType,
        imageKey,
        finalImageKey,
        customerName,
        customerEmail,
        originalImageUrl,
        originalImageSize,
        originalImageFormat,
        labelImageUrl,
        labelImageSize,
        // originalImageUrl と finalImageUrl もメタデータから取得
        originalImageUrl: metaOriginalImageUrl, 
        finalImageUrl: metaFinalImageUrl,
        mode: metaMode, // mode をメタデータから取得
        recipe: metaRecipe, // recipe をメタデータから取得
        labelImageFormat, 
        labelSize: metaLabelSize, 
        userId,
        anonymousId,
        orderDetails: orderDetailsString 
      } = metadata

      // カスタムフィールドの値を取得 (今回は使用しないが、念のため残す)
      // const orderNote = session.custom_fields?.find(
      //   field => field.key === 'order_note'
      // )?.text?.value || '';

      // orderDetailsをパース
      let parsedOrderDetails: any[] | any = {}; // 配列またはオブジェクトの可能性
      let labelType = ''; // デフォルトは空文字
      let extractedLabelSize = ''; // ラベルサイズを抽出する変数
      try {
        if (orderDetailsString) {
          parsedOrderDetails = JSON.parse(orderDetailsString);
          // orderDetailsが配列かオブジェクトかで処理を分岐
          const detailItem = Array.isArray(parsedOrderDetails) ? parsedOrderDetails[0] : parsedOrderDetails;
          if (detailItem) {
            // ラベルタイプを決定
            if (detailItem.t === 'template') {
              labelType = 'テンプレート';
            } else if (detailItem.t) { // 'template' 以外なら 'オリジナル' とする
               labelType = 'オリジナル';
            }
            // ラベルサイズを抽出
            if (detailItem.s) {
              extractedLabelSize = detailItem.s;
            }
          }
        }
      } catch (parseError) {
        console.error('❌ Failed to parse orderDetails:', orderDetailsString, parseError);
        // パース失敗時の処理
        labelType = 'パースエラー';
        extractedLabelSize = '不明';
      }

      // 商品タイプの判断
      let productType = 'その他';
      if (session.metadata?.productId === 'prod_S2kQjCXti9ub7Z') {
        productType = 'Oh my custom';
      } else if (session.metadata?.productId === 'prod_S2geMiCNZiXwbY') {
        productType = 'Fragrance Lab';
      }

      if (!fragranceName || !bottleType) {
        console.warn('⚠️ 必須メタデータが不足:', metadata)
      }

      // カートをクリア
      if (userId) {
        console.log('🛒 Clearing cart for user:', userId)
        const { error: deleteError } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('user_id', userId)

        if (deleteError) {
          console.error('❌ Failed to clear cart:', deleteError)
        } else {
          console.log('✅ Cart cleared successfully')
        }
      } else if (anonymousId) {
        // 非ログインユーザーのカートクリアは、フロントエンド側で
        // localStorage.removeItem('cartItems') を実行する必要があります
        console.log('🛒 Anonymous user cart will be cleared on client side:', anonymousId);
      }
      // --- カートクリア処理を try...catch で囲む (メインtryの内側) ---
      try {
        if (userId) {
          console.log('🛒 Clearing cart for user:', userId);
          const { error: deleteError } = await supabase.from('shopping_cart').delete().eq('user_id', userId);
          if (deleteError) console.error('❌ Failed to clear cart:', deleteError);
          else console.log('✅ Cart cleared successfully');
        } else if (anonymousId) {
          console.log('🛒 Anonymous user cart will be cleared on client side:', anonymousId);
        }
      } catch (cartError) {
        console.error('❌ Error during cart clearing:', cartError);
      }
      // --- カートクリア処理ここまで ---

      // --- 画像移動処理を try...catch で囲む (メインtryの内側) ---
      let finalImageUrlResult: string | undefined; // 移動後のURLを格納する変数
      let imageMoveErrorOccurred = false; // 画像移動エラーフラグ
      try {
        // imageKey と finalImageKey が存在し、かつテンプレートでない場合のみ移動処理
        if (imageKey && finalImageKey && imageKey !== 'template/default' && finalImageKey !== 'template/default') {
          // moveImageToFinal が期待する形式にキーを整形 (既に actions で整形済みのはずだが念のため)
          const tempKey = imageKey.startsWith('temp/') ? imageKey : `temp/${imageKey.split('/').pop()}`;
          const finalKey = finalImageKey.startsWith('orders/') ? finalImageKey : `orders/${finalImageKey.split('/').pop()}`;

          console.log(`🛠 Moving image from ${tempKey} to ${finalKey}...`);
          const moveResult = await moveImageToFinal(tempKey, finalKey);
          if (!moveResult.success) {
             console.error('❌ Failed to move image:', moveResult.error);
             imageMoveErrorOccurred = true; // エラーフラグを立てる
          } else {
            console.log('✅ Image moved to:', moveResult.publicUrl);
            finalImageUrlResult = moveResult.publicUrl; // 結果を保存
          }
        } else if (imageKey === 'template/default') {
          console.log('ℹ️ Template image selected, skipping move.');
          finalImageUrlResult = 'テンプレート'; // スプレッドシート用にテンプレートを示す
        } else {
          console.log('ℹ️ Image keys not provided or invalid for moving.');
          imageMoveErrorOccurred = true; // キーがない場合もエラー扱いとする
        }
      } catch (imageMoveError) {
        console.error('❌ Error during image move:', imageMoveError);
        imageMoveErrorOccurred = true; // 予期せぬエラーもフラグを立てる
      }
      // --- 画像移動処理ここまで ---

      // --- スプレッドシート書き込み処理: アイテムごとにループ ---
      if (Array.isArray(parsedOrderDetails) && parsedOrderDetails.length > 0) {
        console.log(`📊 ${parsedOrderDetails.length}個のアイテムをスプレッドシートに書き込み開始`);

        // 現在の日時を取得（日本時間） - ループの外で一度だけ取得
        const now = new Date();
        const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const formattedDate = japanTime.toISOString().replace('T', ' ').split('.')[0]; // 秒まで取得

        for (const item of parsedOrderDetails) {
          try {
            // 各アイテムから詳細情報を抽出
            const itemFragranceName = item.n || fragranceName || ''; // アイテム名優先、なければ全体
            const itemBottleType = item.bn || bottleType || ''; // アイテムボトル名優先、なければ全体
            const itemLabelSize = item.s || '';
            let itemLabelType = '';
            if (item.t === 'template') {
              itemLabelType = 'テンプレート';
            } else if (item.t) {
              itemLabelType = 'オリジナル';
            }
            // 画像URLの取得ロジックを修正
            // 1. orderDetails内のアイテムごとのURLを優先 (item.u)
            // 2. なければメタデータのトップレベルのURLを使用 (metaOriginalImageUrl)
            const itemImageUrl = item.originalImageUrl || metaOriginalImageUrl || ''; 
            // finalImageUrl の設定ロジックを修正
            let itemFinalImageUrl = '';
            // テンプレートの場合を最優先でチェック
            if (finalImageUrlResult === 'テンプレート' || itemLabelType === 'テンプレート') {
              itemFinalImageUrl = 'テンプレート';
            } else if (finalImageUrlResult) { // 移動成功時のURL
              itemFinalImageUrl = finalImageUrlResult;
            } else if (imageMoveErrorOccurred) { // 移動失敗時
              itemFinalImageUrl = '移動エラー';
            } else { // それ以外（オリジナル画像でURL取得失敗など）
              itemFinalImageUrl = ''; // 空文字
            }


            console.log(`📝 アイテム「${itemFragranceName}」のデータを準備中...`);

            const spreadsheetResult = await appendOrderToSpreadsheet({
              orderId: session.id, // セッションIDは共通
              orderTimestamp: formattedDate, // 注文日時は共通
              customerName: session.customer_details?.name || customerName || '',
              customerEmail: session.customer_details?.email || customerEmail || '',
              customerPhone: session.customer_details?.phone || '',
              fragranceName: itemFragranceName, // アイテムごとの情報
              bottleType: itemBottleType,       // アイテムごとの情報
              labelSize: itemLabelSize,         // アイテムごとの情報
              labelType: itemLabelType,         // アイテムごとの情報
              amountTotal: parsedOrderDetails.length > 1 ? -1 : (session.amount_total ? session.amount_total / 100 : 0),
              paymentStatus: session.payment_status, 
              orderStatus: '未発送', 
              imageUrl: itemImageUrl,           
              finalImageUrl: itemFinalImageUrl,
              mode: metaMode, // mode を渡す
              recipe: metaRecipe, // recipe を渡す
            });

            if (!spreadsheetResult.success) {
              console.error(`❌ アイテム「${itemFragranceName}」のスプレッドシート書き込み失敗:`, spreadsheetResult.error);
            } else {
              console.log(`✅ アイテム「${itemFragranceName}」のスプレッドシート書き込み成功`);
            }
          } catch (itemSpreadsheetError) {
            console.error(`❌ アイテム処理中に致命的なエラー:`, itemSpreadsheetError);
          }
        } // end for loop

      } else {
         // orderDetailsがない、または配列でない場合 (既製品注文の可能性)
         console.warn('⚠️ orderDetails が見つからないか、配列形式ではありません。既製品注文として処理を試みます。');
         try {
           // Stripe APIからラインアイテムを取得して商品名を取得
           const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
           const productName = lineItems.data[0]?.description || '不明な商品'; // description に商品名が入っていると仮定

           // 現在の日時を取得
           const now = new Date();
           const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
           const formattedDate = japanTime.toISOString().replace('T', ' ').split('.')[0];

           console.log(`📝 既製品「${productName}」のデータを準備中...`);

           const spreadsheetResult = await appendOrderToSpreadsheet({
             orderId: session.id,
             orderTimestamp: formattedDate,
             customerName: session.customer_details?.name || customerName || '',
             customerEmail: session.customer_details?.email || customerEmail || '',
             customerPhone: session.customer_details?.phone || '',
             mode: "既製品", // モードを"既製品"に設定
             fragranceName: productName, // 商品名を香りの列に記録
             recipe: '', // レシピは空欄
             bottleType: '', // ボトルは空欄
             labelSize: '', // ラベルサイズは空欄
             labelType: '', // ラベルタイプは空欄
             amountTotal: session.amount_total ? session.amount_total / 100 : 0, // 金額はそのまま記録
             paymentStatus: session.payment_status,
             orderStatus: '未発送',
             imageUrl: '', // 画像URLは空欄
             finalImageUrl: '', // 画像URL(切り抜き後)は空欄
           });

           if (!spreadsheetResult.success) {
             console.error(`❌ 既製品「${productName}」のスプレッドシート書き込み失敗:`, spreadsheetResult.error);
           } else {
             console.log(`✅ 既製品「${productName}」のスプレッドシート書き込み成功`);
           }
         } catch (fallbackError) {
            console.error('❌ 既製品注文のフォールバック処理中にエラー:', fallbackError);
         }
      }
      // --- スプレッドシート書き込み処理ここまで ---

      // 成功レスポンスを返す
      return NextResponse.json({ received: true });

    } catch (error) {
      // --- ここで全体のエラーを捕捉 ---
      console.error('❌ Webhook処理中に予期せぬエラー:', error);
      // エラーオブジェクト全体を出力してみる
      console.error('Webhook Error Details:', JSON.stringify(error, null, 2));
      // エラーが発生してもStripeには成功したと返し、再送を防ぐ
      return NextResponse.json({ received: true });
    }
    // --- try...catch ここまで ---
  }

  return NextResponse.json({ received: true })
}
