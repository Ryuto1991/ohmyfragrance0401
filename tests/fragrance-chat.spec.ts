import { test, expect } from '@playwright/test';

test.describe('フレグランスチャット E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // チャットページに移動
    await page.goto('/fragrance-lab/chat');
    
    // ページが完全に読み込まれるのを待つ
    await page.waitForSelector('h1');
  });

  test('初期ロードと基本UI要素の確認', async ({ page }) => {
    // ヘッダーが表示されていることを確認
    expect(await page.textContent('h1')).toContain('フレグランス');

    // チャット進行ステップが表示されていることを確認
    await page.waitForSelector('[class*="flex items-center justify-between"]');
    
    // 初期メッセージが表示されていることを確認
    const chatMessages = await page.$$('[class*="chat-message"]');
    expect(chatMessages.length).toBeGreaterThan(0);
    
    // 入力フォームが表示されていることを確認
    await page.waitForSelector('textarea');
  });

  test('メッセージ送信の基本機能', async ({ page }) => {
    // メッセージを入力
    await page.fill('textarea', 'こんにちは');
    
    // 送信ボタンをクリック
    await page.click('button[type="submit"]');
    
    // 応答が返ってくるのを待つ
    await page.waitForTimeout(3000);
    
    // ユーザーメッセージと応答が表示されていることを確認
    const messages = await page.$$('[class*="chat-message"]');
    expect(messages.length).toBeGreaterThan(1);
    
    // 最新のメッセージがユーザーメッセージであることを確認
    const userMessages = await page.$$('[class*="user"]');
    expect(await userMessages[userMessages.length - 1].textContent()).toContain('こんにちは');
  });

  test('選択肢をクリックしてフェーズを進める', async ({ page }) => {
    // 最初のフェーズ
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('イメージ入力');
    
    // ユーザー入力をして返答を待つ
    await page.fill('textarea', '爽やかなリラックス系の香りが欲しい');
    await page.click('button[type="submit"]');
    
    // 選択肢が表示されるのを待つ
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 });
    
    // 選択肢をクリック
    const choiceButtons = await page.$$('[class*="choice-button"]');
    await choiceButtons[0].click();
    
    // 応答とフェーズの更新を待つ
    await page.waitForTimeout(3000);
    
    // トップノートのフェーズに移行していることを確認
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('トップノート');
    
    // トップノートの選択肢をクリック
    const topNoteButtons = await page.$$('[class*="choice-button"]');
    await topNoteButtons[0].click();
    
    // 応答とフェーズの更新を待つ
    await page.waitForTimeout(3000);
    
    // ミドルノートのフェーズに移行していることを確認
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('ミドルノート');
  });

  test('完全なフローで注文ボタンが有効になることを確認', async ({ page }) => {
    // チャットをリセット
    await page.click('button:has-text("リセット")');
    await page.waitForTimeout(1000);
    
    // 要件を入力
    await page.fill('textarea', '爽やかなリラックス系の香りが欲しい');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 });
    
    // 選択肢をクリック
    const themeButtons = await page.$$('[class*="choice-button"]');
    await themeButtons[0].click();
    
    // トップノートを選択
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 });
    const topNoteButtons = await page.$$('[class*="choice-button"]');
    await topNoteButtons[0].click();
    
    // ミドルノートを選択
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 });
    const middleNoteButtons = await page.$$('[class*="choice-button"]');
    await middleNoteButtons[0].click();
    
    // ベースノートを選択
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 });
    const baseNoteButtons = await page.$$('[class*="choice-button"]');
    await baseNoteButtons[0].click();
    
    // 完了フェーズに移行するのを待つ
    await page.waitForTimeout(5000);
    
    // 注文ボタンが有効になっていることを確認
    const orderButton = await page.locator('button:has-text("注文する")');
    await expect(orderButton).toBeEnabled();
  });

  test('おまかせボタンが機能することを確認', async ({ page }) => {
    // チャットをリセット
    await page.click('button:has-text("リセット")');
    await page.waitForTimeout(1000);
    
    // おまかせボタンをクリック
    await page.click('button:has-text("おまかせ")');
    
    // 完了フェーズに移行するのを待つ
    await page.waitForTimeout(5000);
    
    // 完了フェーズになっていることを確認
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('完了');
    
    // レシピ情報が表示されていることを確認
    const lastMessage = await page.locator('[class*="chat-message"]:last-child');
    await expect(lastMessage).toContainText('ノート');
    
    // 注文ボタンが有効になっていることを確認
    const orderButton = await page.locator('button:has-text("注文する")');
    await expect(orderButton).toBeEnabled();
  });

  test('リセットボタンが機能することを確認', async ({ page }) => {
    // 初期メッセージ数を記録
    const initialMessages = await page.$$('[class*="chat-message"]');
    const initialCount = initialMessages.length;
    
    // メッセージを送信して会話を進める
    await page.fill('textarea', 'テスト');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // メッセージ数が増えていることを確認
    const messagesAfterSend = await page.$$('[class*="chat-message"]');
    expect(messagesAfterSend.length).toBeGreaterThan(initialCount);
    
    // リセットボタンをクリック
    await page.click('button:has-text("リセット")');
    await page.waitForTimeout(1000);
    
    // メッセージ数が初期状態に戻っていることを確認
    const messagesAfterReset = await page.$$('[class*="chat-message"]');
    expect(messagesAfterReset.length).toBe(initialCount);
  });

  test('パフォーマンスチェック: レンダリング速度', async ({ page }) => {
    // メッセージ送信前後のタイムスタンプを記録してレンダリング速度を測定
    await page.evaluate(() => {
      window.performance.mark('test-start');
    });
    
    // メッセージを送信
    await page.fill('textarea', 'パフォーマンステスト');
    await page.click('button[type="submit"]');
    
    // 応答を待つ
    await page.waitForSelector('[class*="chat-message"]:nth-child(3)');
    
    await page.evaluate(() => {
      window.performance.mark('test-end');
      window.performance.measure('test-duration', 'test-start', 'test-end');
      return window.performance.getEntriesByName('test-duration')[0].duration;
    });
    
    // パフォーマンスの測定結果を取得
    const duration = await page.evaluate(() => {
      return window.performance.getEntriesByName('test-duration')[0].duration;
    });
    
    // 応答時間を記録（テスト失敗にはしない）
    console.log(`応答表示までの時間: ${duration}ms`);
    
    // ある程度の応答速度を期待（必要に応じて調整）
    expect(duration).toBeLessThan(10000); // 10秒以内に応答があることを期待
  });
});
