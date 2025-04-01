import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LABEL_SIZES_FILE = path.join(process.cwd(), 'data', 'label-sizes.json')

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'))
}

// 初期データ
const initialData = {
  black: {
    large: { width: 189, height: 151, x: 0, y: 0 },
    medium: { width: 151, height: 121, x: 0, y: 0 },
    small: { width: 113, height: 91, x: 0, y: 0 },
    square: { width: 113, height: 113, x: 0, y: 0 }
  },
  clear: {
    large: { width: 189, height: 151, x: 0, y: 0 },
    medium: { width: 151, height: 121, x: 0, y: 0 },
    small: { width: 113, height: 91, x: 0, y: 0 },
    square: { width: 113, height: 113, x: 0, y: 0 }
  }
}

// ファイルが存在しない場合は初期データを作成
if (!fs.existsSync(LABEL_SIZES_FILE)) {
  fs.writeFileSync(LABEL_SIZES_FILE, JSON.stringify(initialData, null, 2))
}

export async function GET() {
  try {
    let data
    if (fs.existsSync(LABEL_SIZES_FILE)) {
      data = JSON.parse(fs.readFileSync(LABEL_SIZES_FILE, 'utf-8'))
    } else {
      data = initialData
      fs.writeFileSync(LABEL_SIZES_FILE, JSON.stringify(initialData, null, 2))
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to read label sizes:', error)
    return NextResponse.json(initialData)
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 既存のデータを読み込む
    let existingData = initialData
    if (fs.existsSync(LABEL_SIZES_FILE)) {
      existingData = JSON.parse(fs.readFileSync(LABEL_SIZES_FILE, 'utf-8'))
    }

    // 新しいデータを既存のデータにマージ
    const mergedData = {
      ...existingData,
      ...data
    }

    fs.writeFileSync(LABEL_SIZES_FILE, JSON.stringify(mergedData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save label sizes:', error)
    return NextResponse.json({ error: 'Failed to save label sizes' }, { status: 500 })
  }
} 