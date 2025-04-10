// app/fragrance-lab/chat/hooks/useChatState.ts の修正
// おまかせモード機能とフェーズ遷移の改善

// handleAutoCreateRecipe 関数の修正版
const handleAutoCreateRecipe = useCallback(async () => {
  if (isLoading) return;

  try {
    setIsLoading(true);
    console.log('おまかせレシピ作成を開始します');

    // 現在のフェーズを保存
    const originalPhase = currentPhase;
    console.log('元のフェーズ:', originalPhase);

    // おまかせモードフラグの設定
    const isAutoMode = true;

    // デフォルトの香り選択
    const defaultScents = {
      top: ['レモン'],
      middle: ['ラベンダー'],
      base: ['サンダルウッド']
    };

    // ユーザーに通知メッセージを表示
    const autoMessage: Message = {
      id: uuid(),
      role: 'user',
      content: 'おまかせでレシピを作成してください',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, autoMessage]);

    // 段階的な遷移と香り選択の適用
    // まずトップノートフェーズに移動
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('トップノートフェーズに移動');
    setCurrentPhase('top');
    
    // トップノートを選択
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('トップノート選択:', defaultScents.top[0]);
    setSelectedScents(prev => ({ ...prev, top: defaultScents.top }));
    
    // 自動選択メッセージの表示 (トップノート)
    const topSelectMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `トップノートとして「${defaultScents.top[0]}」を選択しました。爽やかな柑橘系の香りです。`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, topSelectMessage]);

    // ミドルノートフェーズに移動
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('ミドルノートフェーズに移動');
    setCurrentPhase('middle');
    
    // ミドルノートを選択
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('ミドルノート選択:', defaultScents.middle[0]);
    setSelectedScents(prev => ({ ...prev, middle: defaultScents.middle }));
    
    // 自動選択メッセージの表示 (ミドルノート)
    const middleSelectMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `ミドルノートとして「${defaultScents.middle[0]}」を選択しました。穏やかでリラックス効果のあるハーブの香りです。`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, middleSelectMessage]);

    // ベースノートフェーズに移動
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('ベースノートフェーズに移動');
    setCurrentPhase('base');
    
    // ベースノートを選択
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('ベースノート選択:', defaultScents.base[0]);
    setSelectedScents(prev => ({ ...prev, base: defaultScents.base }));
    
    // 自動選択メッセージの表示 (ベースノート)
    const baseSelectMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `ベースノートとして「${defaultScents.base[0]}」を選択しました。深みのある温かみのあるウッディな香りです。`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, baseSelectMessage]);

    // レシピ情報を作成
    const defaultRecipe: FragranceRecipe = {
      name: "リラックスブレンド",
      description: "穏やかな気分になれるリラックス効果のあるブレンド",
      topNotes: defaultScents.top,
      middleNotes: defaultScents.middle,
      baseNotes: defaultScents.base
    };

    // レシピを設定
    setRecipe(defaultRecipe);

    // レシピをローカルストレージに保存
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SELECTED_RECIPE, JSON.stringify({
          name: defaultRecipe.name,
          description: defaultRecipe.description,
          top_notes: defaultRecipe.topNotes,
          middle_notes: defaultRecipe.middleNotes,
          base_notes: defaultRecipe.baseNotes
        }));
        console.log('レシピをローカルストレージに保存しました:', defaultRecipe);
      }
    } catch (storageError) {
      console.error('ローカルストレージへの保存に失敗しました:', storageError);
    }

    // 最終確認フェーズに移動
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('最終確認フェーズに移動');
    setCurrentPhase('finalized');
    
    // レシピ完成メッセージの表示
    const finalizedMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: `
レシピが完成しました！

トップノート: ${defaultScents.top[0]}
ミドルノート: ${defaultScents.middle[0]} 
ベースノート: ${defaultScents.base[0]}

この組み合わせで、爽やかさから始まり、落ち着きのある優しい香りへと変化していきます。リラックスしたい時間にぴったりのブレンドです✨

このレシピでよろしければ、下の注文ボタンから進めることができます。`,
      timestamp: Date.now(),
      recipe: defaultRecipe
    };
    setMessages(prev => [...prev, finalizedMessage]);

    // 完了フェーズに遅延遷移
    setTimeout(() => {
      console.log('完了フェーズに移動');
      setCurrentPhase('complete');
      
      // 完了メッセージの表示
      const completeMessage: Message = {
        id: uuid(),
        role: 'assistant',
        content: `おまかせレシピが完成しました！こちらのレシピで注文を進められます。または、もう一度最初からレシピを作り直すこともできます。`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, completeMessage]);
    }, 2500);

    return defaultRecipe;
  } catch (error) {
    console.error('自動レシピ作成エラー:', error);
    setError(error instanceof Error ? error : new Error('自動レシピ作成中にエラーが発生しました'));
    
    // エラーメッセージの表示
    const errorMessage: Message = {
      id: uuid(),
      role: 'assistant',
      content: '申し訳ありません、レシピの自動作成中にエラーが発生しました。もう一度お試しください。',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
}, [isLoading, currentPhase, setMessages, setSelectedScents, setCurrentPhase, setRecipe, setError]);

// updatePhase 関数の修正版 - おまかせモードをサポート
const updatePhase = useCallback((newPhase: ChatPhase, isAutoMode: boolean = false) => {
  // おまかせモードの場合、遷移バリデーションをスキップ
  if (isAutoMode) {
    console.log(`自動モードによるフェーズ更新: ${currentPhase} -> ${newPhase}`);
    setCurrentPhase(newPhase);
    setLastPhaseChangeTime(Date.now());
    
    // カスタムイベントハンドラがあれば呼び出す
    if (onPhaseAdvance) {
      onPhaseAdvance();
    }
    
    // レシピ情報の更新
    updateRecipeFromSelectedScents(newPhase);
    return;
  }
  
  // 通常の遷移バリデーション
  if (!canTransition(currentPhase, newPhase)) {
    console.warn(`無効なフェーズ遷移: ${currentPhase} -> ${newPhase}`);
    return;
  }

  console.log(`フェーズを更新: ${currentPhase} -> ${newPhase}`);
  setCurrentPhase(newPhase);
  setLastPhaseChangeTime(Date.now());

  // カスタムイベントハンドラがあれば呼び出す
  if (onPhaseAdvance) {
    onPhaseAdvance();
  }

  // レシピ情報の更新
  updateRecipeFromSelectedScents(newPhase);
}, [currentPhase, onPhaseAdvance, updateRecipeFromSelectedScents]);
