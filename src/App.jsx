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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '100px' }}>
        {activeTab === 'practice' ? (
          <PracticeMode grammarSets={grammarSets} deleteSet={deleteSet} />
        ) : (
          <RegisterMode grammarSets={grammarSets} saveToLocalStorage={saveToLocalStorage} />
        )}
      </div>

      <div style={{
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid #ccc',
        backgroundColor: '#fff',
        height: '70px',
        zIndex: 100
      }}>
        <button
          onClick={() => setActiveTab('practice')}
          style={{ flex: 1, border: 'none', backgroundColor: activeTab === 'practice' ? '#eee' : '#fff', fontSize: '14px' }}
        >
          Pattern Practice
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{ flex: 1, border: 'none', backgroundColor: activeTab === 'register' ? '#eee' : '#fff', fontSize: '14px', borderLeft: '1px solid #ccc' }}
        >
          例文登録
        </button>
      </div>
    </div>
  );
}

// --- 練習モード ---
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

  if (isPracticing) {
    const current = practiceQueue[currentIndex];
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#666' }}>{current.grammarName} ({currentIndex + 1}/{practiceQueue.length})</p>
        <div style={{ margin: '40px 0', fontSize: '22px', fontWeight: 'bold', minHeight: '60px' }}>{current.ja}</div>
        <div style={{ minHeight: '60px', marginBottom: '40px' }}>
          {showAnswer && <div style={{ fontSize: '22px', color: '#d32f2f' }}>{current.es}</div>}
        </div>
        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#000', color: '#fff' }}>解答を表示</button>
        ) : (
          <button onClick={() => {
            if (currentIndex < practiceQueue.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setShowAnswer(false);
            } else {
              alert('終了！');
              setIsPracticing(false);
            }
          }} style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#000', color: '#fff' }}>次へ</button>
        )}
        <button onClick={() => setIsPracticing(false)} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline' }}>中断して戻る</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '18px' }}>学習セット一覧</h2>
      {grammarSets.map(set => (
        <div key={set.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div 
            onClick={() => toggleSelection(set.id)}
            style={{ flex: 1, border: '1px solid #000', padding: '12px', backgroundColor: selectedIds.includes(set.id) ? '#e3f2fd' : '#fff' }}
          >
            <strong>{set.grammarName}</strong> [{set.cefrLevel}]
          </div>
          <button onClick={() => deleteSet(set.id)} style={{ marginLeft: '8px', padding: '12px', color: 'red', border: '1px solid red', backgroundColor: '#fff' }}>消去</button>
        </div>
      ))}
      <div style={{ margin: '20px 0' }}>
        <label><input type="checkbox" checked={isRandom} onChange={e => setIsRandom(e.target.checked)} /> ランダムに出題</label>
      </div>
      <button onClick={startPractice} style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#000', color: '#fff' }}>練習開始</button>
    </div>
  );
}

// --- 登録モード ---
function RegisterMode({ grammarSets, saveToLocalStorage }) {
  const [grammarName, setGrammarName] = useState('');
  const [cefrLevel, setCefrLevel] = useState('A1');
  const [bulkInput, setBulkInput] = useState('');
  const [sentences, setSentences] = useState(Array.from({ length: 10 }, () => ({ ja: '', es: '' })));

  // 一括ペーストを解析する関数
  const handleApplyBulk = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l !== '');
    const newSentences = Array.from({ length: 10 }, () => ({ ja: '', es: '' }));
    
    // 2行ずつペアにして抽出 (奇数行: 日本語, 偶数行: スペイン語)
    for (let i = 0; i < 10; i++) {
      if (lines[i * 2]) newSentences[i].ja = lines[i * 2];
      if (lines[i * 2 + 1]) newSentences[i].es = lines[i * 2 + 1];
    }
    setSentences(newSentences);
    setBulkInput('');
    alert('反映しました。下の各項目で微調整できます。');
  };

  const handleSave = () => {
    if (!grammarName) return alert('文法名を入力してください');
    const validSentences = sentences.filter(s => s.ja && s.es);
    if (validSentences.length === 0) return alert('例文を入力してください');

    const newSet = { id: Date.now().toString(), grammarName, cefrLevel, sentences: validSentences };
    saveToLocalStorage([...grammarSets, newSet]);
    setGrammarName('');
    setSentences(Array.from({ length: 10 }, () => ({ ja: '', es: '' })));
    alert('登録完了しました');
  };

  return (
    <div>
      <h2 style={{ fontSize: '18px' }}>新規セット登録</h2>
      <input type="text" placeholder="文法名 (例: 点過去)" value={grammarName} onChange={e => setGrammarName(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '12px', boxSizing: 'border-box' }} />
      <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px' }}>
        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lv => <option key={lv} value={lv}>{lv}</option>)}
      </select>

      <div style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '24px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ fontSize: '14px', marginTop: 0 }}>一括ペースト反映</h3>
        <textarea 
          placeholder="日本語&#10;スペイン語&#10;の順に貼り付けてください" 
          value={bulkInput} 
          onChange={e => setBulkInput(e.target.value)} 
          style={{ width: '100%', height: '80px', marginBottom: '8px' }}
        />
        <button onClick={handleApplyBulk} style={{ width: '100%', padding: '8px', backgroundColor: '#666', color: '#fff', border: 'none' }}>上記内容を下の一覧に反映</button>
      </div>

      <h3 style={{ fontSize: '14px' }}>個別修正</h3>
      {sentences.map((s, i) => (
        <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
          <input type="text" placeholder="日本語" value={s.ja} onChange={e => {
            const n = [...sentences]; n[i].ja = e.target.value; setSentences(n);
          }} style={{ width: '100%', marginBottom: '4px', padding: '8px', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Español" value={s.es} onChange={e => {
            const n = [...sentences]; n[i].es = e.target.value; setSentences(n);
          }} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
      ))}
      <button onClick={handleSave} style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#000', color: '#fff', marginBottom: '40px' }}>このセットを保存</button>
    </div>
  );
}
