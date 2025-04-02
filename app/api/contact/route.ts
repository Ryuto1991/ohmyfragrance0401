import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, name, email, phone, subject, message } = body

    // メール送信の設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // SSL接続を使用
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // 自己署名証明書を許可
      }
    })

    // 管理者向けメール
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: `【お問い合わせ】${subject}`,
      text: `
お問い合わせ種別: ${type === 'general' ? '一般的なお問い合わせ' : type === 'product' ? '商品について' : 'その他（量産・コラボ）'}

お名前: ${name}
メールアドレス: ${email}
電話番号: ${phone || '未入力'}

件名: ${subject}

メッセージ:
${message}
      `,
    })

    // 自動返信メール
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: '【Oh My Fragrance】お問い合わせありがとうございます',
      text: `
${name} 様

お問い合わせありがとうございます。
以下の内容で承りました。

お問い合わせ種別: ${type === 'general' ? '一般的なお問い合わせ' : type === 'product' ? '商品について' : 'その他（量産・コラボ）'}

お名前: ${name}
メールアドレス: ${email}
電話番号: ${phone || '未入力'}

件名: ${subject}

メッセージ:
${message}

内容を確認次第、改めてご連絡させていただきます。

--
Oh My Fragrance
info@ohmyfragrance.com
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
} 