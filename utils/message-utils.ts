// Import types, using FragranceRecipe from the root types directory
import { type ChoiceOption, type Message, type ChatPhase } from '@/app/fragrance-lab/chat/types'
import { type FragranceRecipe } from '@/types/chat-types' // Changed import source for FragranceRecipe

// Add missing types for compatibility
export type Choice = ChoiceOption;

// Define the MessagePart type
interface MessagePart {
  content: string;
  choices?: ChoiceOption[];
  recipe?: FragranceRecipe;
  shouldSplit?: boolean;
}

/**
 * メッセージ処理ユーティリティ
 * チャットメッセージの解析、処理、フォーマットを担当
 */

// JSON解析キャッシュ（同じ入力に対する再解析を避ける）
const jsonParseCache = new Map<string, any>()

/**
 * メッセージの内容からJSONを抽出して解析する関数
 * @param content メッセージの内容
 * @returns 解析されたJSONオブジェクト、または解析に失敗した場合はnull
 */
export function parseMessageContent(content: string): any | null {
  // 空の入力を早期リターン
  if (!content) return null
  
  // キャッシュがあれば使用
  const cacheKey = content.slice(0, 100) // 長すぎる文字列はカットしてキーにする
  if (jsonParseCache.has(cacheKey)) {
    return jsonParseCache.get(cacheKey)
  }
  
  let result = null
  
  try {
    // 直接JSONとして解析を試みる
    result = JSON.parse(content)
  } catch (error) {
    // 失敗した場合は別の方法を試す
    try {
      // JSONとして解析できない場合、マークダウンJSON形式（```json ... ```）を探す
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        const extractedJson = jsonMatch[1].trim()
        result = JSON.parse(extractedJson)
      } 
      // JSONが途中で切れている場合の処理
      else if (content.includes('{ "content": "') && !content.endsWith('"}')) {
        // 不完全なJSONを修正して完全なJSONにする
        const fixedContent = content.replace(/\{ "content": "(.*?)$/, '{"content": "$1"}')
        const escapedContent = fixedContent.replace(/\n/g, '\\n') // 改行をエスケープ
        result = JSON.parse(escapedContent)
      }
      // コンテンツからJSONっぽい部分を抽出
      else {
        const jsonBlockMatch = content.match(/\{[\s\S]*\}/)
        if (jsonBlockMatch) {
          // マッチしたJSON部分を解析
          const extractedJson = jsonBlockMatch[0].replace(/\n/g, '\\n')
          result = JSON.parse(extractedJson)
        }
      }
    } catch (nestedError) {
      // すべての方法が失敗した場合は静かに失敗
      console.log('JSON解析に失敗:', nestedError)
      result = null
    }
  }
  
  // 結果をキャッシュに保存（パフォーマンス向上のため）
  if (jsonParseCache.size > 100) {
    // キャッシュが大きくなりすぎないように古いエントリを削除
    const firstKey = jsonParseCache.keys().next().value
    if (firstKey) jsonParseCache.delete(firstKey)
  }
  jsonParseCache.set(cacheKey, result)
  
  return result
}

/**
 * 選択肢を正規化する関数
 * @param choice 選択肢（文字列またはオブジェクト）
 * @returns 正規化された選択肢オブジェクト
 */
export function normalizeChoice(choice: Choice): ChoiceOption {
  if (typeof choice === 'string') {
    return { name: choice }
  }
  return choice
}

/**
 * テキストから選択肢を抽出する関数
 * @param content テキスト内容
 * @returns 抽出された選択肢と説明の配列
 */
export function extractChoicesFromText(content: string): { choices: ChoiceOption[], descriptions: string[] } {
  const choices: ChoiceOption[] = []
  const descriptions: string[] = []

  // 複数の選択肢パターンに対応
  const patterns = [
    // 1. **シダーウッド** - 乾いた樹木の落ち着いた香り (マークダウン形式)
    /(\d+\.\s*\*\*([^*]+)\*\*\s*[-–—]\s*([^\n]+))/g,

    // 2. シダーウッド - 乾いた樹木の落ち着いた香り (マークダウンなし)
    /(\d+\.\s*([^-–—]+)\s*[-–—]\s*([^\n]+))/g,

    // 3. シンプルな番号付きリスト
    /(\d+\.\s*([^\n\d\.]+))/g,
    
    // 4. 番号なしの箇条書き
    /(・\s*([^\n]+))/g
  ]

  // 各パターンを試す
  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern))

    if (matches.length > 0) {
      // 選択肢を抽出
      matches.forEach(match => {
        // 選択肢テキストを掘り下げる (** マークダウンも除去)
        const name = match[2]?.replace(/\*\*/g, '').trim()
        const description = match[3] ? match[3].replace(/\*\*/g, '').trim() : ''

        if (name) {
          choices.push({ name, ...(description ? { description } : {}) })
          if (description) descriptions.push(description)
        }
      })

      // 選択肢が見つかったらループを抜ける
      break
    }
  }

  return { choices, descriptions }
}

/**
 * メッセージを分割するかどうかを判断する関数
 * @param content メッセージの内容
 * @param choices 選択肢の配列
 * @returns 分割するかどうかのブール値
 */
export function shouldSplitMessage(content: string, choices: ChoiceOption[] = []): boolean {
  return (content && content.length > 20) || choices.length > 0
}

/**
 * メッセージを複数の部分に分割する関数
 * @param content メッセージの内容
 * @param params 追加パラメータ（選択肢、レシピなど）
 * @returns 分割されたメッセージのパート
 */
export function splitMessageIntoParts(
  content: string | { text?: string; choices?: ChoiceOption[]; recipe?: FragranceRecipe },
  params: {
    currentPhase?: ChatPhase;
    maxPartLength?: number;
  } = {}
): MessagePart[] {
  const { maxPartLength = 500 } = params

  // オブジェクトの場合
  if (typeof content !== 'string') {
    return [{
      content: content.text || '',
      choices: content.choices,
      recipe: content.recipe
    }]
  }

  // 文字列の場合
  let textContent = content

  // 選択肢を抽出
  const { choices } = extractChoicesFromText(textContent)

  // 選択肢を除去したコンテンツ
  if (choices.length > 0) {
    const firstChoiceIndex = findFirstChoiceIndex(textContent)
    if (firstChoiceIndex > 0) {
      textContent = textContent.substring(0, firstChoiceIndex).trim()
    }
  }

  // レシピ情報を抽出（完了フェーズの場合）
  const recipe = extractRecipe(content, params.currentPhase)

  // テキストが短い場合は分割しない
  if (textContent.length <= maxPartLength) {
    return [{
      content: textContent,
      choices,
      recipe: recipe || undefined,
      shouldSplit: false
    }]
  }

  // 文が終わる位置で分割するように試みる
  const parts: MessagePart[] = []
  let startIndex = 0

  while (startIndex < textContent.length) {
    let endIndex = findSentenceEnd(textContent, startIndex, maxPartLength)

    // 文の終わりが見つからない場合は強制的に分割
    if (endIndex <= startIndex) {
      endIndex = Math.min(startIndex + maxPartLength, textContent.length)
    }

    parts.push({
      content: textContent.substring(startIndex, endIndex).trim(),
      shouldSplit: true
    })

    startIndex = endIndex
  }

  // 選択肢とレシピは最後のパートに含める
  if (parts.length > 0) {
    parts[parts.length - 1].choices = choices
    parts[parts.length - 1].recipe = recipe || undefined
    parts[parts.length - 1].shouldSplit = false
  }

  return parts
}

/**
 * メッセージからレシピ情報を抽出する関数
 * @param content メッセージの内容
 * @param currentPhase 現在のフェーズ
 * @returns 抽出されたレシピ情報
 */
export function extractRecipe(content: string, currentPhase?: ChatPhase): FragranceRecipe | null {
  if (!currentPhase || !['finalized', 'complete'].includes(currentPhase)) {
    return null
  }

  // トップ/ミドル/ベースノートの情報を抽出
  const topMatches = content.match(/トップノート[：:]\s*([^。\n]+)/)
  const middleMatches = content.match(/ミドルノート[：:]\s*([^。\n]+)/)
  const baseMatches = content.match(/ベースノート[：:]\s*([^。\n]+)/)

  // レシピ名を抽出（最初の行から）
  const titleMatches = content.match(/^(.+?)[（\(（【]|^(.+?)(?=\n)/)
  const title = titleMatches ? (titleMatches[1] || titleMatches[2] || "オリジナルフレグランス").trim() : "オリジナルフレグランス"

  // 説明文を抽出（最初の2-3文から）
  const sentences = content.split(/[。！？!?]/).slice(0, 3).join('。')
  const description = sentences || "あなただけのカスタムフレグランス"

  if (topMatches || middleMatches || baseMatches) {
    return {
      name: title,
      description: description,
      topNotes: topMatches ? parseNotes(topMatches[1]) : [],
      middleNotes: middleMatches ? parseNotes(middleMatches[1]) : [],
      baseNotes: baseMatches ? parseNotes(baseMatches[1]) : []
    }
  }

  return null
}

/**
 * カンマ区切りのノートリストを配列に変換する
 * @param notesStr カンマ区切りのノートリスト文字列
 * @returns ノートの配列
 */
function parseNotes(notesStr: string): string[] {
  return notesStr
    .split(/[、,]/)
    .map(note => note.trim())
    .filter(note => note.length > 0)
}

/**
 * 最初の選択肢が始まるインデックスを見つける
 * @param content メッセージの内容
 * @returns 選択肢が開始するインデックス
 */
function findFirstChoiceIndex(content: string): number {
  const patterns = [
    /\d+\.\s*\*\*/,
    /\d+\.\s*[^-–—]+\s*[-–—]/,
    /\d+\.\s*[^\n\d\.]+/,
    /・\s*/
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match.index !== undefined) {
      return match.index
    }
  }

  return -1
}

/**
 * 指定された最大長以内の文の終わりを見つける
 * @param text テキスト内容
 * @param startIndex 開始インデックス
 * @param maxLength 最大長
 * @returns 文の終わりのインデックス
 */
function findSentenceEnd(text: string, startIndex: number, maxLength: number): number {
  const endCandidates = ['.', '。', '!', '！', '?', '？', '\n\n']
  let endIndex = startIndex

  // 最大長以内で文の終わりを見つける
  for (let i = 0; i < endCandidates.length; i++) {
    const candidate = endCandidates[i]
    const candidateIndex = text.indexOf(candidate, startIndex)

    if (candidateIndex !== -1 && candidateIndex <= startIndex + maxLength) {
      // 文の終わりの位置を更新（候補文字の次の文字）
      const newEndIndex = candidateIndex + candidate.length

      // より遠い文の終わりを選ぶ
      if (newEndIndex > endIndex) {
        endIndex = newEndIndex
      }
    }
  }

  return endIndex > startIndex ? endIndex : startIndex + maxLength
}

/**
 * チャットメッセージを作成する関数
 * @param role メッセージの役割
 * @param content メッセージの内容
 * @param options 追加オプション
 * @returns メッセージオブジェクト
 */
export function createMessage(
  role: Message['role'], 
  content: string,
  options: Partial<Omit<Message, 'role' | 'content' | 'timestamp'>> = {}
): Message {
  // UUIDの生成（実装の詳細に応じて）
  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    ...options
  }
}

/**
 * メッセージにエラー情報を追加する関数
 * @param message 元のメッセージ
 * @param error エラー情報
 * @returns エラー情報を含むメッセージ
 */
export function addErrorInfo(message: string, error: Error): string {
  const errorDetails = getErrorDetails(error)
  return `${message}\n\n(エラー詳細: ${errorDetails})`
}

/**
 * エラーの詳細情報を取得する関数
 * @param error エラーオブジェクト
 * @returns エラーの詳細説明
 */
function getErrorDetails(error: Error): string {
  if (error.name === 'AbortError') {
    return 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。'
  }

  if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
  }

  if (error.message.includes('429')) {
    return 'サーバーへのリクエストが多すぎます。しばらく待ってから再試行してください。'
  }

  if (error.message.includes('500')) {
    return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
  }

  return error.message || 'エラーが発生しました。もう一度お試しください。'
}
