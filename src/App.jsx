import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('practice');
  const [grammarSets, setGrammarSets] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem('spanishPatternData');
    if (savedData) {
      setGrammarSets(JSON.parse(savedData));
    }
  }, []);

  const saveToLocalStorage = (data) => {
    setGrammarSets(data);
    localStorage.setItem('spanishPatternData', JSON.stringify(data));
  };

  const deleteSet = (id) => {
    if (window.confirm('このセットを削除しますか？')) {
      const newData = grammarSets.filter(set => set.id !== id);
      saveToLocalStorage(newData);
    }
  };

  // デザイン共通定数
  const colors = {
    bg: '#FFFBF5',           // 非常に薄いベージュ
    primary: '#E67E22',      // 暖かいオレンジ
    secondary: '#A04000',    // 深い茶色
    text: '#4A2711',         // 濃いブラウン
    accent: '#FDEBD0',       // 選択時
    white: '#FFFFFF',
    border: '#E5D3B3'        // 境界線
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    backgroundColor: colors.white,
    color: colors.text,
    appearance: 'none',
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: colors.bg,
      color: colors.text
    }}>
      
      {/* メインコンテンツ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'practice' ? (
          <PracticeMode grammarSets={grammarSets} deleteSet={deleteSet} colors={colors} />
        ) : (
          <RegisterMode grammarSets={grammarSets} saveToLocalStorage={saveToLocalStorage} inputStyle={inputStyle} colors={colors} />
        )}
      </div>

      {/* 下部タブバー */}
      <div style={{
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${colors.border}`,
        height: '84px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setActiveTab('practice')}
          style={{ 
            flex: 1, 
            border: 'none', 
            backgroundColor: 'transparent', 
            fontSize: '11px', 
            color: activeTab === 'practice' ? colors.primary : '#999',
            fontWeight: activeTab === 'practice' ? 'bold' : 'normal'
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>Practice</div>
          練習
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{ 
            flex: 1, 
            border: 'none', 
            backgroundColor: 'transparent', 
            fontSize: '11px', 
            color: activeTab === 'register' ? colors.primary : '#999',
            fontWeight: activeTab === 'register' ? 'bold' : 'normal',
            borderLeft: `1px solid ${colors.border}`
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>Register</div>
          登録
        </button>
      </div>
    </div>
  );
}

function PracticeMode({ grammarSets, deleteSet, colors }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRandom, setIsRandom] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const startPractice = () => {
    let queue = [];
    grammarSets.forEach(set => {
      if (selectedIds.includes(set.id)) {
        set.sentences.forEach(s => {
          if (s.ja && s.es) queue.push({ ...s, grammarName: set.grammarName });
        });
      }
    });

    if (queue.length === 0) return alert('教材を選択してください');
    if (isRandom) queue.sort(() => Math.random() - 0.5);

    setPracticeQueue(queue);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsPracticing(true);
  };

  if (isPracticing) {
    const current = practiceQueue[currentIndex];
    return (
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <p style={{ color: colors.secondary, fontSize: '14px' }}>{current.grammarName} ({currentIndex + 1}/{practiceQueue.length})</p>
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
              alert('全例文が終了しました！');
              setIsPracticing(false);
            }
          }} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: colors.text, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}>次へ進む</button>
        )}
        <button onClick={() => setIsPracticing(false)} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#999', textDecoration: 'underline', fontSize: '15px' }}>終了して戻る</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: '800' }}>Library</h2>
      
      {/* リスト部分 */}
      <div style={{ paddingBottom: '180px' }}>
        {grammarSets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>教材を登録しましょう</div>
        ) : (
          grammarSets.map(set => (
            <div key={set.id} style={{ 
              display: 'flex', 
              width: '100%', // 画面横いっぱいに
              marginBottom: '16px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: colors.white,
              border: `1px solid ${selectedIds.includes(set.id) ? colors.primary : 'transparent'}`,
              boxSizing: 'border-box'
            }}>
              <div 
                onClick={() => toggleSelection(set.id)}
                style={{ 
                  flex: 1, 
                  padding: '20px', 
                  backgroundColor: selectedIds.includes(set.id) ? colors.accent : colors.white, 
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{set.grammarName}</div>
                <div style={{ fontSize: '13px', color: colors.secondary, opacity: 0.8 }}>Level: {set.cefrLevel}</div>
              </div>
              <button 
                onClick={() => deleteSet(set.id)} 
                style={{ 
                  width: '70px', // 削除ボタンの幅を少し広げて押しやすく
                  color: '#E74C3C', 
                  border: 'none',
                  backgroundColor: '#FFF1F0', // 削除エリアのみ薄い赤
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderLeft: `1px solid ${colors.border}`
                }}
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>

      {/* 固定操作エリア */}
      <div style={{
        position: 'fixed',
        bottom: '84px',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 251, 245, 0.95)',
        padding: '20px',
        borderTop: `1px solid ${colors.border}`,
        zIndex: 500
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: colors.secondary, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isRandom} 
              onChange={e => setIsRandom(e.target.checked)} 
              style={{ width: '22px', height: '22px', marginRight: '10px', accentColor: colors.primary }} 
            /> 
            シャッフル再生
          </label>
        </div>
        <button 
          onClick={startPractice} 
          style={{ 
            width: '100%', 
            padding: '18px', 
            fontSize: '18px', 
            backgroundColor: colors.primary, 
            color: '#fff', 
            border: 'none', 
            borderRadius: '16px', 
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)'
          }}
        >
          練習を開始 ({selectedIds.length})
        </button>
      </div>
    </div>
  );
}

function RegisterMode({ grammarSets, saveToLocalStorage, inputStyle, colors }) {
  const [grammarName, setGrammarName] = useState('');
  const [cefrLevel, setCefrLevel] = useState('A1');
  const [bulkInput, setBulkInput] = useState('');
  const [sentences, setSentences] = useState(Array.from({ length: 10 }, () => ({ ja: '', es: '' })));

  const handleApplyBulk = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l !== '');
    const newSentences = Array.from({ length: 10 }, () => ({ ja: '', es: '' }));
    for (let i = 0; i < 10; i++) {
      if (lines[i * 2]) newSentences[i].ja = lines[i * 2];
      if (lines[i * 2 + 1]) newSentences[i].es = lines[i * 2 + 1];
    }
    setSentences(newSentences);
    setBulkInput('');
  };

  const handleSave = () => {
    if (!grammarName) return alert('文法名を入力してください');
    const validSentences = sentences.filter(s => s.ja && s.es);
    if (validSentences.length === 0) return alert('例文を入力してください');
    const newSet = { id: Date.now().toString(), grammarName, cefrLevel, sentences: validSentences };
    saveToLocalStorage([...grammarSets, newSet]);
    setGrammarName('');
    setSentences(Array.from({ length: 10 }, () => ({ ja: '', es: '' })));
    alert('保存しました');
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: '800' }}>New Set</h2>
      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder="文法項目（例: 点過去）" value={grammarName} onChange={e => setGrammarName(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '24px' }}>
        <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} style={inputStyle}>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lv => <option key={lv} value={lv}>{lv}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor: colors.accent, padding: '20px', borderRadius: '20px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '15px', marginTop: 0, marginBottom: '12px', opacity: 0.8 }}>Bulk Import</h3>
        <textarea 
          placeholder="日本語とスペイン語を交互に貼り付け" 
          value={bulkInput} 
          onChange={e => setBulkInput(e.target.value)} 
          style={{ ...inputStyle, height: '140px', marginBottom: '12px', border: 'none' }}
        />
        <button onClick={handleApplyBulk} style={{ width: '100%', padding: '12px', backgroundColor: colors.white, color: colors.primary, border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>反映</button>
      </div>

      <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Preview</h3>
      {sentences.map((s, i) => (
        <div key={i} style={{ marginBottom: '20px', padding: '16px', backgroundColor: colors.white, borderRadius: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', color: '#BBB', marginBottom: '8px' }}>{i + 1}</div>
          <input type="text" placeholder="日本語" value={s.ja} onChange={e => {
            const n = [...sentences]; n[i].ja = e.target.value; setSentences(n);
          }} style={{ ...inputStyle, marginBottom: '8px', border: 'none', backgroundColor: '#F9F9F9' }} />
          <input type="text" placeholder="Español" value={s.es} onChange={e => {
            const n = [...sentences]; n[i].es = e.target.value; setSentences(n);
          }} style={{ ...inputStyle, border: 'none', backgroundColor: '#F9F9F9' }} />
        </div>
      ))}
      <button onClick={handleSave} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}>セットを保存する</button>
    </div>
  );
}
