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
    const { data, error } = await resend.emails.send({
      from: 'Oh My Fragrance <noreply@ohmyfragrance.com>',
      to: customerEmail,
      subject: 'ご注文ありがとうございます - Oh My Fragrance',
      html: `
        <h1>${customerName}様</h1>
        <p>ご注文ありがとうございます。</p>
        <h2>ご注文内容</h2>
        <ul>
          <li>フレグランス: ${fragranceName}</li>
          <li>ボトルタイプ: ${bottleType}</li>
          <li>金額: ¥${orderAmount.toLocaleString()}</li>
        </ul>
        ${imageUrl ? `<img src="${imageUrl}" alt="カスタムラベル" style="max-width: 300px;" />` : ''}
        <p>商品の発送までしばらくお待ちください。</p>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
} 