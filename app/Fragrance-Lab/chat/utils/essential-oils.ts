import { EssentialOils } from '../types'

let essentialOilsData: EssentialOils | null = null

export async function getEssentialOils(): Promise<EssentialOils> {
  if (essentialOilsData) {
    return essentialOilsData
  }

  try {
    const response = await fetch('/components/chat/essential-oils.json')
    if (!response.ok) {
      throw new Error('エッセンシャルオイルデータの読み込みに失敗しました')
    }
    const data = await response.json()
    essentialOilsData = data.perfumeNotes
    return essentialOilsData
  } catch (error) {
    console.error('エッセンシャルオイルデータの読み込みエラー:', error)
    throw error
  }
}

export function getDefaultChoices(phase: string): string[] {
  switch (phase) {
    case 'purpose':
      return ['レモン', 'ベルガモット', 'ペパーミント']
    case 'personality':
      return ['ローズ', 'イランイラン', 'カモミール']
    case 'preferences':
      return ['サンダルウッド', 'シダーウッド', 'パチュリ']
    default:
      return []
  }
}

export function getChoiceDescription(choice: string): string {
  if (!essentialOilsData) {
    return ''
  }

  const allOils = [
    ...essentialOilsData.topNotes,
    ...essentialOilsData.middleNotes,
    ...essentialOilsData.baseNotes
  ]

  const oil = allOils.find(o => o.name === choice)
  return oil?.description || ''
} 