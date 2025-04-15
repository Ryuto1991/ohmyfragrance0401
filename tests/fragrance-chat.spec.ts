import { test, expect } from '@playwright/test';

test.describe('フレグランスチャット E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // チャットページに移動
    await page.goto('/fragrance-lab/chat');
    
    // h1が表示され、かつテキストエリアが表示されるのを待つ
    await page.waitForSelector('h1');
    await page.waitForSelector('textarea');
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

    // 応答メッセージが表示されるのを待つ (ユーザーメッセージ + 初期メッセージ + 応答 = 3つ以上)
    // メッセージ要素の数が3つになるまで待機
    await page.waitForFunction(() => document.querySelectorAll('[class*="chat-message"]').length === 3);


    // ユーザーメッセージと応答が表示されていることを確認
    const messages = await page.locator('[class*="chat-message"]');
    await expect(messages).toHaveCount(3); // 初期メッセージ + ユーザー + 応答

    // 最新のメッセージがボットからの応答であることを確認 (例: 'user' クラスがないことを確認)
    const lastMessage = messages.last();
    await expect(lastMessage).not.toHaveClass(/user/);
    // 必要であれば、応答内容の一部を検証
    // await expect(lastMessage).toContainText('何かお手伝いできることはありますか？'); // 例
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

    // トップノートのフェーズに移行し、選択肢が表示されるのを待つ
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('トップノート');
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 }); // Wait for new choices

    // トップノートの選択肢をクリック
    // Note: Re-querying buttons as the DOM might have changed
    const topNoteButtons = await page.locator('[class*="choice-button"]');
    await topNoteButtons.first().click();

    // ミドルノートのフェーズに移行し、選択肢が表示されるのを待つ
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('ミドルノート');
    await page.waitForSelector('[class*="choice-button"]', { timeout: 10000 }); // Wait for new choices
  });

  test('完全なフローで注文ボタンが有効になることを確認', async ({ page }) => {
    // チャットをリセット
    await page.click('button:has-text("リセット")');
    // リセットが完了し、初期メッセージが表示されるのを待つ
    await page.waitForFunction(() => document.querySelectorAll('[class*="chat-message"]').length === 1); // Assuming 1 initial message
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('イメージ入力'); // Check initial phase

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

    // 完了フェーズに移行し、注文ボタンが表示され有効になるのを待つ
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('完了');
    const orderButton = await page.locator('button:has-text("注文する")');
    await expect(orderButton).toBeVisible({ timeout: 10000 }); // Wait for button to appear
    await expect(orderButton).toBeEnabled();
  });

  test('おまかせボタンが機能することを確認', async ({ page }) => {
    // チャットをリセット
    await page.click('button:has-text("リセット")');
    // リセットが完了し、初期メッセージが表示されるのを待つ
    await page.waitForFunction(() => document.querySelectorAll('[class*="chat-message"]').length === 1); // Assuming 1 initial message
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('イメージ入力'); // Check initial phase

    // おまかせボタンをクリック
    await page.click('button:has-text("おまかせ")');

    // 完了フェーズに移行し、注文ボタンが表示され有効になるのを待つ
    await expect(page.locator('.flex.md\\:hidden .text-xs')).toContainText('完了', { timeout: 15000 }); // Increased timeout for potentially long operation
    
    // レシピ情報が表示されていることを確認
    const lastMessage = await page.locator('[class*="chat-message"]:last-child');
    await expect(lastMessage).toContainText('ノート');
    
    // 注文ボタンが有効になっていることを確認
    const orderButton = await page.locator('button:has-text("注文する")');
    await expect(orderButton).toBeVisible({ timeout: 10000 }); // Wait for button to appear
    await expect(orderButton).toBeEnabled();
  });

  test('リセットボタンが機能することを確認', async ({ page }) => {
    // 初期メッセージ数を記録
    const initialMessages = await page.$$('[class*="chat-message"]');
    const initialCount = initialMessages.length;
    
    // メッセージを送信して会話を進める
    await page.fill('textarea', 'テスト');
    await page.click('button[type="submit"]');
    // 応答メッセージが表示されるのを待つ (メッセージ数が initialCount + 2 になるまで)
    await page.waitForFunction((initialCount) => document.querySelectorAll('[class*="chat-message"]').length === initialCount + 2, initialCount);


    // メッセージ数が増えていることを確認
    const messagesAfterSend = await page.locator('[class*="chat-message"]');
    await expect(messagesAfterSend).toHaveCount(initialCount + 2);

    // リセットボタンをクリック
    await page.click('button:has-text("リセット")');
    // リセットが完了し、メッセージ数が初期状態に戻るのを待つ
    await page.waitForFunction((initialCount) => document.querySelectorAll('[class*="chat-message"]').length === initialCount, initialCount);


    // メッセージ数が初期状態に戻っていることを確認
    const messagesAfterReset = await page.locator('[class*="chat-message"]');
    await expect(messagesAfterReset).toHaveCount(initialCount);
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
