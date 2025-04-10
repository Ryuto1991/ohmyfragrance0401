import {
  parseMessageContent,
  normalizeChoice,
  extractChoicesFromText,
  shouldSplitMessage,
  splitMessageIntoParts,
  extractRecipe,
  createMessage,
  addErrorInfo
} from '@/utils/message-utils';
import { ChatPhase } from '@/app/fragrance-lab/chat/types';

describe('parseMessageContent', () => {
  test('should return null for empty input', () => {
    expect(parseMessageContent('')).toBeNull();
  });

  test('should parse valid JSON string', () => {
    const jsonString = '{"content": "test"}';
    expect(parseMessageContent(jsonString)).toEqual({ content: 'test' });
  });

  test('should parse JSON inside markdown code block', () => {
    const markdownJson = '```json\n{"content": "test"}\n```';
    expect(parseMessageContent(markdownJson)).toEqual({ content: 'test' });
  });

  test('should handle incomplete JSON with content string', () => {
    const incompleteJson = '{ "content": "test';
    expect(parseMessageContent(incompleteJson)).toEqual({ content: 'test' });
  });

  test('should extract JSON block from mixed content', () => {
    const mixedContent = 'Some text before\n{"key": "value"}\nSome text after';
    expect(parseMessageContent(mixedContent)).toEqual({ key: 'value' });
  });
});

describe('normalizeChoice', () => {
  test('should convert string to object with name property', () => {
    expect(normalizeChoice('Test Choice')).toEqual({ name: 'Test Choice' });
  });

  test('should keep object unchanged', () => {
    const choice = { name: 'Test', description: 'Description' };
    expect(normalizeChoice(choice)).toEqual(choice);
  });
});

describe('extractChoicesFromText', () => {
  test('should extract markdown formatted choices', () => {
    const text = '1. **シダーウッド** - 乾いた樹木の落ち着いた香り\n2. **バニラ** - 甘く温かみのある香り';
    const result = extractChoicesFromText(text);
    expect(result.choices).toEqual([
      { name: 'シダーウッド', description: '乾いた樹木の落ち着いた香り' },
      { name: 'バニラ', description: '甘く温かみのある香り' }
    ]);
    expect(result.descriptions).toEqual([
      '乾いた樹木の落ち着いた香り',
      '甘く温かみのある香り'
    ]);
  });

  test('should extract plain text numbered choices', () => {
    const text = '1. シダーウッド - 乾いた樹木の香り\n2. バニラ - 甘い香り';
    const result = extractChoicesFromText(text);
    expect(result.choices).toEqual([
      { name: 'シダーウッド', description: '乾いた樹木の香り' },
      { name: 'バニラ', description: '甘い香り' }
    ]);
  });

  test('should extract simple numbered choices without descriptions', () => {
    const text = '1. シダーウッド\n2. バニラ\n3. サンダルウッド';
    const result = extractChoicesFromText(text);
    expect(result.choices).toEqual([
      { name: 'シダーウッド' },
      { name: 'バニラ' },
      { name: 'サンダルウッド' }
    ]);
    expect(result.descriptions).toEqual([]);
  });

  test('should extract bullet point choices', () => {
    const text = '・ シダーウッド\n・ バニラ\n・ サンダルウッド';
    const result = extractChoicesFromText(text);
    expect(result.choices).toEqual([
      { name: 'シダーウッド' },
      { name: 'バニラ' },
      { name: 'サンダルウッド' }
    ]);
  });

  test('should return empty arrays when no choices found', () => {
    const text = 'This text has no choices in it.';
    const result = extractChoicesFromText(text);
    expect(result.choices).toEqual([]);
    expect(result.descriptions).toEqual([]);
  });
});

describe('shouldSplitMessage', () => {
  test('should return true for long content', () => {
    const longContent = 'a'.repeat(30);
    expect(shouldSplitMessage(longContent)).toBe(true);
  });

  test('should return true when choices are present', () => {
    const content = 'Short content';
    const choices = [{ name: 'Choice 1' }, { name: 'Choice 2' }];
    expect(shouldSplitMessage(content, choices)).toBe(true);
  });

  test('should return false for short content without choices', () => {
    const shortContent = 'Short';
    expect(shouldSplitMessage(shortContent)).toBe(false);
  });
});

describe('splitMessageIntoParts', () => {
  test('should not split short messages', () => {
    const content = 'This is a short message';
    const result = splitMessageIntoParts(content);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(content);
    expect(result[0].shouldSplit).toBe(false);
  });

  test('should split long messages', () => {
    const content = 'This is a longer message that should be split into multiple parts. '.repeat(10);
    const result = splitMessageIntoParts(content);
    expect(result.length).toBeGreaterThan(1);
    expect(result[0].shouldSplit).toBe(true);
    expect(result[result.length - 1].shouldSplit).toBe(false);
  });

  test('should add choices to the last part', () => {
    const content = 'This is a longer message that should be split into multiple parts. '.repeat(10) + 
                   '1. Choice 1 - Description 1\n2. Choice 2 - Description 2';
    const result = splitMessageIntoParts(content);
    expect(result.length).toBeGreaterThan(1);
    expect(result[result.length - 1].choices).toBeDefined();
    expect(result[result.length - 1].choices?.length).toBe(2);
  });

  test('should handle object input', () => {
    const content = {
      text: 'Text content',
      choices: [{ name: 'Choice' }],
      recipe: { name: 'Recipe', description: 'Description', topNotes: [], middleNotes: [], baseNotes: [] }
    };
    const result = splitMessageIntoParts(content);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Text content');
    expect(result[0].choices).toEqual([{ name: 'Choice' }]);
    expect(result[0].recipe).toEqual(content.recipe);
  });

  test('should try to split on sentence boundaries', () => {
    const content = 'This is sentence one. This is sentence two. This is sentence three.';
    const result = splitMessageIntoParts(content, { maxPartLength: 25 });
    expect(result.length).toBeGreaterThan(1);
    // Check if the first part ends with a period
    expect(result[0].content.endsWith('.')).toBe(true);
  });
});

describe('extractRecipe', () => {
  test('should return null when phase is not finalized or complete', () => {
    const content = 'トップノート: シトラス、ベルガモット\nミドルノート: ローズ、ジャスミン\nベースノート: サンダルウッド、アンバー';
    const phase = 'top' as ChatPhase;
    expect(extractRecipe(content, phase)).toBeNull();
  });

  test('should extract recipe when phase is finalized', () => {
    const content = 'フローラルシトラス\nトップノート: シトラス、ベルガモット\nミドルノート: ローズ、ジャスミン\nベースノート: サンダルウッド、アンバー';
    const phase = 'finalized' as ChatPhase;
    expect(extractRecipe(content, phase)).toEqual({
      name: 'フローラルシトラス',
      description: 'フローラルシトラス',
      topNotes: ['シトラス', 'ベルガモット'],
      middleNotes: ['ローズ', 'ジャスミン'],
      baseNotes: ['サンダルウッド', 'アンバー']
    });
  });

  test('should extract recipe when phase is complete', () => {
    const content = 'リラックスブレンド（穏やかな香り）\nトップノート：レモン、ベルガモット\nミドルノート：ラベンダー\nベースノート：サンダルウッド、シダーウッド';
    const phase = 'complete' as ChatPhase;
    expect(extractRecipe(content, phase)).toEqual({
      name: 'リラックスブレンド',
      description: 'リラックスブレンド（穏やかな香り）',
      topNotes: ['レモン', 'ベルガモット'],
      middleNotes: ['ラベンダー'],
      baseNotes: ['サンダルウッド', 'シダーウッド']
    });
  });

  test('should handle different note formats', () => {
    const content = 'ブレンド\nトップノート: レモン\nミドルノート: ジャスミン\nベースノート: サンダルウッド';
    const phase = 'complete' as ChatPhase;
    expect(extractRecipe(content, phase)).toEqual({
      name: 'ブレンド',
      description: 'ブレンド',
      topNotes: ['レモン'],
      middleNotes: ['ジャスミン'],
      baseNotes: ['サンダルウッド']
    });
  });

  test('should return null when note data is missing', () => {
    const content = 'ブレンド\n香りの詳細について';
    const phase = 'complete' as ChatPhase;
    expect(extractRecipe(content, phase)).toBeNull();
  });
});

describe('createMessage', () => {
  test('should create a message with required fields', () => {
    const message = createMessage('user', 'Hello');
    expect(message).toHaveProperty('id');
    expect(message).toHaveProperty('role', 'user');
    expect(message).toHaveProperty('content', 'Hello');
    expect(message).toHaveProperty('timestamp');
  });

  test('should include additional options', () => {
    const options = { choices: [{ name: 'Option 1' }] };
    const message = createMessage('assistant', 'Choose an option', options);
    expect(message).toHaveProperty('choices', [{ name: 'Option 1' }]);
  });
});

describe('addErrorInfo', () => {
  test('should add error details to message', () => {
    const message = 'An error occurred';
    const error = new Error('Network failure');
    const result = addErrorInfo(message, error);
    expect(result).toContain(message);
    expect(result).toContain('Network failure');
  });

  test('should format known error types differently', () => {
    const message = 'An error occurred';
    
    // Test AbortError
    const abortError = new Error('Request timeout');
    abortError.name = 'AbortError';
    const abortResult = addErrorInfo(message, abortError);
    expect(abortResult).toContain('タイムアウト');
    
    // Test NetworkError
    const networkError = new TypeError('NetworkError when attempting to fetch resource');
    const networkResult = addErrorInfo(message, networkError);
    expect(networkResult).toContain('ネットワークエラー');
    
    // Test 429 error
    const rateLimitError = new Error('Request failed with status code 429');
    const rateLimitResult = addErrorInfo(message, rateLimitError);
    expect(rateLimitResult).toContain('リクエストが多すぎ');
    
    // Test 500 error
    const serverError = new Error('Request failed with status code 500');
    const serverResult = addErrorInfo(message, serverError);
    expect(serverResult).toContain('サーバーエラー');
  });
});
