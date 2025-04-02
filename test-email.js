const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // テストメールを送信
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: 'テストメール from Oh my fragrance',
      text: `
これはテストメールです。

送信時刻: ${new Date().toLocaleString('ja-JP')}
設定内容:
- SMTP_HOST: ${process.env.SMTP_HOST}
- SMTP_PORT: ${process.env.SMTP_PORT}
- SMTP_USER: ${process.env.SMTP_USER}
- SMTP_FROM: ${process.env.SMTP_FROM}

このメールが届いていれば、メール送信の設定は正常です。
      `
    });

    console.log('テストメールを送信しました');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

sendTestEmail(); 