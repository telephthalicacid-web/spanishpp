import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('practice');
  const [grammarSets, setGrammarSets] = useState([]);
  
  const [modal, setModal] = useState({
    isOpen: false, message: '', onConfirm: null, isConfirm: false
  });

  useEffect(() => {
    const savedData = localStorage.getItem('spanishPatternData');
    if (savedData) setGrammarSets(JSON.parse(savedData));
  }, []);

  const saveToLocalStorage = (data) => {
    setGrammarSets(data);
    localStorage.setItem('spanishPatternData', JSON.stringify(data));
  };

  const showAlert = (message) => setModal({ isOpen: true, message, isConfirm: false, onConfirm: null });
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, isConfirm: true, onConfirm });

  const deleteSet = (id) => {
    showConfirm('この教材セットを削除してもよろしいですか？', () => {
      const newData = grammarSets.filter(set => set.id !== id);
      saveToLocalStorage(newData);
    });
  };

  const incrementPracticeCount = (ids) => {
    const newData = grammarSets.map(set => {
      if (ids.includes(set.id)) return { ...set, practiceCount: (set.practiceCount || 0) + 1 };
      return set;
    });
    saveToLocalStorage(newData);
  };

  const colors = {
    bg: '#FFFBF5', primary: '#E67E22', secondary: '#A04000',
    text: '#4A2711', accent: '#FDEBD0', white: '#FFFFFF', border: '#E5D3B3'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backgroundColor: colors.bg, color: colors.text, overflow: 'hidden' }}>
      
      <style>{`
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', width: '100%', boxSizing: 'border-box', WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'practice' ? (
          <PracticeMode grammarSets={grammarSets} deleteSet={deleteSet} incrementPracticeCount={incrementPracticeCount} showAlert={showAlert} colors={colors} />
        ) : (
          <RegisterMode grammarSets={grammarSets} saveToLocalStorage={saveToLocalStorage} showAlert={showAlert} colors={colors} />
        )}
      </div>

      <div style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${colors.border}`, height: '84px', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 1000, boxSizing: 'border-box' }}>
        <button onClick={() => setActiveTab('practice')} style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '11px', color: activeTab === 'practice' ? colors.primary : '#999', fontWeight: activeTab === 'practice' ? 'bold' : 'normal' }}>
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>Practice</div>練習
        </button>
        <button onClick={() => setActiveTab('register')} style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '11px', color: activeTab === 'register' ? colors.primary : '#999', fontWeight: activeTab === 'register' ? 'bold' : 'normal', borderLeft: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>Register</div>登録
        </button>
      </div>

      {modal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: colors.bg, borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.5' }}>{modal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {modal.isConfirm && <button onClick={() => setModal({ ...modal, isOpen: false })} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: '#fff', color: '#999', fontWeight: 'bold' }}>キャンセル</button>}
              <button onClick={() => { if (modal.onConfirm) modal.onConfirm(); setModal({ ...modal, isOpen: false }); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: colors.primary, color: '#fff', fontWeight: 'bold' }}>{modal.isConfirm ? '削除する' : 'OK'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeMode({ grammarSets, deleteSet, incrementPracticeCount, showAlert, colors }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRandom, setIsRandom] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  
  // 出題数制限用のステート (0 = 無制限)
  const [questionLimit, setQuestionLimit] = useState(10);

  const THINKING_TIME = 8000;

  useEffect(() => {
    let timer;
    if (isPracticing && isAutoMode && !showAnswer) {
      setTimerKey(prev => prev + 1);
      timer = setTimeout(() => { setShowAnswer(true); }, THINKING_TIME);
    }
    return () => clearTimeout(timer);
  }, [isPracticing, isAutoMode, showAnswer, currentIndex]);

  const startPractice = () => {
    let allSentences = [];
    grammarSets.forEach(set => {
      if (selectedIds.includes(set.id)) {
        set.sentences.forEach(s => {
          if (s.ja && s.es) allSentences.push({ ...s, grammarName: set.grammarName });
        });
      }
    });

    if (allSentences.length === 0) return showAlert('教材を選択してください');

    let queue = [...allSentences];
    const isMultiple = selectedIds.length > 1;

    // 複数選択時は強制シャッフル、単体時は設定に従う
    if (isMultiple || isRandom) {
      queue.sort(() => Math.random() - 0.5);
    }

    // 複数選択時かつ制限がある場合は切り出し
    if (isMultiple && questionLimit > 0) {
      queue = queue.slice(0, questionLimit);
    }

    setPracticeQueue(queue);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsPracticing(true);
  };

  if (isPracticing) {
    const current = practiceQueue[currentIndex];
    return (
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        {isAutoMode && !showAnswer && (
          <div style={{ width: '100%', height: '6px', backgroundColor: colors.border, borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
            <div key={timerKey} style={{ width: '100%', height: '100%', backgroundColor: colors.primary, animation: `shrink ${THINKING_TIME/1000}s linear forwards` }} />
          </div>
        )}
        <p style={{ color: colors.secondary, fontSize: '14px' }}>
          {current.grammarName} ({currentIndex + 1}/{practiceQueue.length})
        </p>
        <div style={{ margin: '40px 0', fontSize: '24px', fontWeight: 'bold', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1.4' }}>{current.ja}</div>
        <div style={{ minHeight: '100px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {showAnswer && <div style={{ fontSize: '24px', color: colors.primary, fontWeight: 'bold' }}>{current.es}</div>}
        </div>
        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}>解答を表示</button>
        ) : (
          <button onClick={() => {
            if (currentIndex < practiceQueue.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setShowAnswer(false);
            } else {
              incrementPracticeCount(selectedIds);
              showAlert('¡Excelente! 練習完了です！');
              setIsPracticing(false);
            }
          }} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: colors.text, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}>次へ進む</button>
        )}
        <button onClick={() => setIsPracticing(false)} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#999', textDecoration: 'underline', fontSize: '15px' }}>中断して戻る</button>
      </div>
    );
  }

  const isMultipleSelected = selectedIds.length > 1;

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: '800' }}>Library</h2>
      <div style={{ paddingBottom: '240px', width: '100%' }}>
        {grammarSets.map(set => (
          <div key={set.id} style={{ display: 'flex', width: '100%', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden', backgroundColor: colors.white, border: `1px solid ${selectedIds.includes(set.id) ? colors.primary : 'transparent'}`, boxSizing: 'border-box' }}>
            <div onClick={() => setSelectedIds(prev => prev.includes(set.id) ? prev.filter(i => i !== set.id) : [...prev, set.id])} style={{ flex: 1, padding: '16px 20px', backgroundColor: selectedIds.includes(set.id) ? colors.accent : colors.white, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{set.grammarName}</span>
                <span style={{ fontSize: '12px', backgroundColor: colors.secondary, color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>{set.cefrLevel}</span>
              </div>
              <div style={{ fontSize: '13px', color: colors.secondary }}>練習回数: {set.practiceCount || 0}回</div>
            </div>
            <button onClick={() => deleteSet(set.id)} style={{ width: '60px', color: '#E74C3C', border: 'none', backgroundColor: '#FFF1F0', fontSize: '12px', borderLeft: `1px solid ${colors.border}` }}>削除</button>
          </div>
        ))}
      </div>

      {/* 操作パネル */}
      <div style={{ position: 'fixed', bottom: '84px', left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '16px 20px', borderTop: `1px solid ${colors.border}`, zIndex: 500, boxSizing: 'border-box' }}>
        
        {/* モード設定 */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-around' }}>
          {!isMultipleSelected ? (
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: colors.secondary }}>
              <input type="checkbox" checked={isRandom} onChange={e => setIsRandom(e.target.checked)} style={{ width: '20px', height: '20px', marginRight: '8px' }} />シャッフル
            </label>
          ) : (
            <div style={{ fontSize: '14px', color: colors.primary, fontWeight: 'bold' }}>✨ 複数選択: シャッフルON</div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: colors.secondary }}>
            <input type="checkbox" checked={isAutoMode} onChange={e => setIsAutoMode(e.target.checked)} style={{ width: '20px', height: '20px', marginRight: '8px' }} />オート解答
          </label>
        </div>

        {/* 複数選択時のみ出題数ボタンを表示 */}
        {isMultipleSelected && (
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.secondary }}>出題数:</span>
            {[10, 20, 0].map(num => (
              <button key={num} onClick={() => setQuestionLimit(num)} style={{ 
                flex: 1, padding: '8px 0', fontSize: '12px', borderRadius: '8px', border: `1px solid ${questionLimit === num ? colors.primary : colors.border}`,
                backgroundColor: questionLimit === num ? colors.primary : '#fff', color: questionLimit === num ? '#fff' : colors.text
              }}>
                {num === 0 ? '全て' : `${num}問`}
              </button>
            ))}
          </div>
        )}

        <button onClick={startPractice} style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)' }}>
          {isMultipleSelected ? `${questionLimit === 0 ? '全問' : questionLimit + '問'}で練習開始` : '練習を開始'}
        </button>
      </div>
    </div>
  );
}

// RegisterMode は変更なしのため省略（前のコードと同じものを使ってください）
