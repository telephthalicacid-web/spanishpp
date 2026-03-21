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

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
    appearance: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#fff' }}>
      
      {/* メインコンテンツ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'practice' ? (
          <PracticeMode grammarSets={grammarSets} deleteSet={deleteSet} />
        ) : (
          <RegisterMode grammarSets={grammarSets} saveToLocalStorage={saveToLocalStorage} inputStyle={inputStyle} />
        )}
      </div>

      {/* 下部タブバー (iPhoneホームバー考慮) */}
      <div style={{
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid #ccc',
        backgroundColor: '#fff',
        height: '80px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setActiveTab('practice')}
          style={{ flex: 1, border: 'none', backgroundColor: activeTab === 'practice' ? '#f0f0f0' : '#fff', fontSize: '14px', fontWeight: activeTab === 'practice' ? 'bold' : 'normal' }}
        >
          Pattern Practice
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{ flex: 1, border: 'none', backgroundColor: activeTab === 'register' ? '#f0f0f0' : '#fff', fontSize: '14px', fontWeight: activeTab === 'register' ? 'bold' : 'normal', borderLeft: '1px solid #ccc' }}
        >
          例文登録
        </button>
      </div>
    </div>
  );
}

function PracticeMode({ grammarSets, deleteSet }) {
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

    if (queue.length === 0) return alert('セットを選択してください');
    if (isRandom) queue.sort(() => Math.random() - 0.5);

    setPracticeQueue(queue);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsPracticing(true);
  };

  // --- 練習実行中の画面 ---
  if (isPracticing) {
    const current = practiceQueue[currentIndex];
    return (
      <div style={{ textAlign: 'center', paddingTop: '20px' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>{current.grammarName} ({currentIndex + 1}/{practiceQueue.length})</p>
        <div style={{ margin: '40px 0', fontSize: '22px', fontWeight: 'bold', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{current.ja}</div>
        <div style={{ minHeight: '80px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {showAnswer && <div style={{ fontSize: '22px', color: '#d32f2f', fontWeight: 'bold' }}>{current.es}</div>}
        </div>
        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px' }}>解答を表示</button>
        ) : (
          <button onClick={() => {
            if (currentIndex < practiceQueue.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setShowAnswer(false);
            } else {
              alert('全例文が終了しました！');
              setIsPracticing(false);
            }
          }} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px' }}>次へ</button>
        )}
        <button onClick={() => setIsPracticing(false)} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline', fontSize: '16px' }}>中断して戻る</button>
      </div>
    );
  }

  // --- 教材選択画面 ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '20px', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>学習セット</h2>
      
      {/* スクロールするリスト部分 (ボタンに被らないよう下に余白) */}
      <div style={{ paddingBottom: '160px' }}>
        {grammarSets.length === 0 ? (
          <p style={{ color: '#666' }}>登録されたセットがありません。</p>
        ) : (
          grammarSets.map(set => (
            <div key={set.id} style={{ display: 'flex', width: '100%', marginBottom: '12px', boxSizing: 'border-box' }}>
              <div 
                onClick={() => toggleSelection(set.id)}
                style={{ 
                  flex: 1, 
                  border: '1px solid #000', 
                  padding: '16px', 
                  backgroundColor: selectedIds.includes(set.id) ? '#e3f2fd' : '#fff', 
                  borderRadius: '8px 0 0 8px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{set.grammarName}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Level: {set.cefrLevel}</div>
              </div>
              <button 
                onClick={() => deleteSet(set.id)} 
                style={{ 
                  width: '60px',
                  color: 'red', 
                  border: '1px solid #000', 
                  borderLeft: 'none', 
                  backgroundColor: '#fff', 
                  borderRadius: '0 8px 8px 0', 
                  fontSize: '12px' 
                }}
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>

      {/* 下部に固定される操作エリア */}
      <div style={{
        position: 'fixed',
        bottom: '80px', // タブバーのすぐ上
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: '16px',
        borderTop: '1px solid #eee',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        zIndex: 500
      }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isRandom} 
              onChange={e => setIsRandom(e.target.checked)} 
              style={{ width: '22px', height: '22px', marginRight: '10px' }} 
            /> 
            ランダムに出題
          </label>
        </div>
        <button 
          onClick={startPractice} 
          style={{ 
            width: '100%', 
            padding: '18px', 
            fontSize: '18px', 
            backgroundColor: '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold' 
          }}
        >
          練習開始 ({selectedIds.length}セット選択中)
        </button>
      </div>
    </div>
  );
}

function RegisterMode({ grammarSets, saveToLocalStorage, inputStyle }) {
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
    alert('反映しました');
  };

  const handleSave = () => {
    if (!grammarName) return alert('文法名を入力してください');
    const validSentences = sentences.filter(s => s.ja && s.es);
    if (validSentences.length === 0) return alert('例文を1つ以上入力してください');
    const newSet = { id: Date.now().toString(), grammarName, cefrLevel, sentences: validSentences };
    saveToLocalStorage([...grammarSets, newSet]);
    setGrammarName('');
    setSentences(Array.from({ length: 10 }, () => ({ ja: '', es: '' })));
    alert('保存しました');
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>新規登録</h2>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>文法名</label>
        <input type="text" placeholder="例: 点過去" value={grammarName} onChange={e => setGrammarName(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>CEFRレベル</label>
        <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} style={inputStyle}>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lv => <option key={lv} value={lv}>{lv}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '16px', marginTop: 0, marginBottom: '8px' }}>一括ペースト</h3>
        <textarea 
          placeholder="日本語&#10;スペイン語&#10;の順に貼り付け" 
          value={bulkInput} 
          onChange={e => setBulkInput(e.target.value)} 
          style={{ ...inputStyle, height: '120px', marginBottom: '12px' }}
        />
        <button onClick={handleApplyBulk} style={{ width: '100%', padding: '12px', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>反映</button>
      </div>

      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>内容確認・修正</h3>
      {sentences.map((s, i) => (
        <div key={i} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>例文 {i + 1}</div>
          <input type="text" placeholder="日本語" value={s.ja} onChange={e => {
            const n = [...sentences]; n[i].ja = e.target.value; setSentences(n);
          }} style={{ ...inputStyle, marginBottom: '8px', padding: '8px' }} />
          <input type="text" placeholder="Español" value={s.es} onChange={e => {
            const n = [...sentences]; n[i].es = e.target.value; setSentences(n);
          }} style={{ ...inputStyle, padding: '8px' }} />
        </div>
      ))}
      <button onClick={handleSave} style={{ width: '100%', padding: '20px', fontSize: '18px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>セットを保存</button>
    </div>
  );
}
