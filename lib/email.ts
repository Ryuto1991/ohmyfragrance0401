import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail({
  customerEmail,
  customerName,
  fragranceName,
  bottleType,
  imageUrl,
  orderAmount
}: {
  customerEmail: string;
  customerName: string;
  fragranceName: string;
  bottleType: string;
  imageUrl?: string;
  orderAmount: number;
}) {
  try {
    // 環境に基づいて適切なFromアドレスを使用
    // 開発環境では resend.dev ドメインを使用し、本番環境では ohmyfragrance.com を使用
    const fromEmail = process.env.NODE_ENV === 'production' && process.env.USE_VERIFIED_DOMAIN === 'true'
      ? 'Oh my fragrance <noreply@ohmyfragrance.com>'
      : 'Oh my fragrance <onboarding@resend.dev>'; // Resendの認証済みドメイン

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: 'ご注文ありがとうございます - Oh my fragrance',
      html: `
        <h1>${customerName}様</h1>
        <p>この度は <strong>Oh my fragrance</strong> をご利用いただき、誠にありがとうございます。</p>
        <p>お選びいただいた香りが、あなたの日常に特別な輝きを加えることをスタッフ一同心より願っております。</p>
        <h2>ご注文内容</h2>
        <ul>
          <li>フレグランス: ${fragranceName}</li>
          <li>ボトルタイプ: ${bottleType}</li>
          <li>金額: ¥${orderAmount.toLocaleString()}</li>
        </ul>
        ${imageUrl ? `<img src="${imageUrl}" alt="カスタムラベル" style="max-width: 300px;" />` : ''}
        <p>商品の発送は通常、ご注文後<span style="font-weight: bold;">3週間以内</span>に行っております。発送完了後、追跡番号等の詳細情報を別途メールにてご連絡いたします。</p>
        <p>ご不明な点やご質問がございましたら、どうぞお気軽にお問い合わせください。</p>
        <p>今後とも <strong>Oh my fragrance</strong> をよろしくお願い申し上げます。</p>
        <p>素敵な香りと共に、素晴らしい日々をお過ごしください。</p>
        <hr/>
        <p><small>
          【Oh my fragrance 運営元情報】<br/>
          株式会社PxCell<br/>
          住所: 渋谷区渋谷3丁目27-1<br/>
          Eメール: info@ohmyfragrance.com
        </small></p>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      // エラーハンドリング: エラーをログに記録するが、Webhook処理全体は止めないようにする
      // 必要に応じて、エラー通知などの処理を追加することも検討
      return { success: false, error }; // 失敗したことを呼び出し元に返す
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    // エラーハンドリング
    return { success: false, error };
  }
}
