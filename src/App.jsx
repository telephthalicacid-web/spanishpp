import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('practice');
  const [grammarSets, setGrammarSets] = useState([]);

  // --- データの永続化 (localStorage) ---
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* メインコンテンツエリア */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' }}>
        {activeTab === 'practice' ? (
          <PracticeMode grammarSets={grammarSets} />
        ) : (
          <RegisterMode grammarSets={grammarSets} saveToLocalStorage={saveToLocalStorage} />
        )}
      </div>

      {/* 下部タブナビゲーション */}
      <div style={{
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid #ccc',
        backgroundColor: '#fff',
        height: '60px'
      }}>
        <button
          onClick={() => setActiveTab('practice')}
          style={{ flex: 1, border: 'none', backgroundColor: activeTab === 'practice' ? '#e0e0e0' : '#fff', fontSize: '16px' }}
        >
          Pattern Practice
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{ flex: 1, border: 'none', backgroundColor: activeTab === 'register' ? '#e0e0e0' : '#fff', fontSize: '16px', borderLeft: '1px solid #ccc' }}
        >
          例文登録
        </button>
      </div>
    </div>
  );
}

// --- パターンプラクティス モード ---
function PracticeMode({ grammarSets }) {
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
        set.sentences.forEach(sentence => {
          if (sentence.ja && sentence.es) {
            queue.push({ ...sentence, grammarName: set.grammarName });
          }
        });
      }
    });

    if (queue.length === 0) {
      alert('例文が登録されているセットを選択してください。');
      return;
    }

    if (isRandom) {
      queue = queue.sort(() => Math.random() - 0.5);
    }

    setPracticeQueue(queue);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsPracticing(true);
  };

  const nextSentence = () => {
    if (currentIndex < practiceQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      alert('すべての例文が終了しました。');
      setIsPracticing(false);
    }
  };

  if (isPracticing) {
    const current = practiceQueue[currentIndex];
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>{current.grammarName} ({currentIndex + 1} / {practiceQueue.length})</p>
        <div style={{ margin: '40px 0', fontSize: '20px', fontWeight: 'bold' }}>
          {current.ja}
        </div>
        
        {showAnswer ? (
          <div style={{ margin: '40px 0', fontSize: '20px', color: '#d32f2f' }}>
            {current.es}
          </div>
        ) : (
          <button 
            onClick={() => setShowAnswer(true)}
            style={{ padding: '12px 24px', fontSize: '16px', margin: '40px 0', cursor: 'pointer' }}
          >
            解答を表示
          </button>
        )}

        {showAnswer && (
          <button 
            onClick={nextSentence}
            style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer', display: 'block', margin: '0 auto' }}
          >
            次の例文へ
          </button>
        )}

        <button 
          onClick={() => setIsPracticing(false)}
          style={{ marginTop: '60px', padding: '8px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>学習セット選択</h2>
      {grammarSets.length === 0 ? (
        <p>登録されたデータがありません。「例文登録」タブから追加してください。</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            {grammarSets.map(set => (
              <div 
                key={set.id} 
                onClick={() => toggleSelection(set.id)}
                style={{
                  border: '1px solid #000',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: selectedIds.includes(set.id) ? '#e3f2fd' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{set.grammarName}</span>
                <span style={{ fontSize: '16px' }}>{set.cefrLevel}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
              <input 
                type="checkbox" 
                checked={isRandom} 
                onChange={(e) => setIsRandom(e.target.checked)} 
                style={{ marginRight: '8px', transform: 'scale(1.5)' }}
              />
              ランダム出題にする
            </label>
          </div>

          <button 
            onClick={startPractice}
            style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            練習を開始する
          </button>
        </>
      )}
    </div>
  );
}

// --- 例文登録 モード ---
function RegisterMode({ grammarSets, saveToLocalStorage }) {
  const [grammarName, setGrammarName] = useState('');
  const [cefrLevel, setCefrLevel] = useState('A1');
  
  // 10個の空の例文オブジェクトで初期化
  const [sentences, setSentences] = useState(
    Array.from({ length: 10 }, () => ({ ja: '', es: '' }))
  );

  const handleSentenceChange = (index, field, value) => {
    const newSentences = [...sentences];
    newSentences[index][field] = value;
    setSentences(newSentences);
  };

  const handleSave = () => {
    if (!grammarName.trim()) {
      alert('文法名を入力してください。');
      return;
    }

    // 少なくとも1つは入力されているか確認
    const hasValidSentence = sentences.some(s => s.ja.trim() !== '' && s.es.trim() !== '');
    if (!hasValidSentence) {
      alert('少なくとも1つの例文（日本語とスペイン語の両方）を入力してください。');
      return;
    }

    const newSet = {
      id: Date.now().toString(),
      grammarName,
      cefrLevel,
      sentences: sentences.filter(s => s.ja.trim() !== '' || s.es.trim() !== '') // 空の項目は除外して保存
    };

    saveToLocalStorage([...grammarSets, newSet]);
    
    // フォームをリセット
    setGrammarName('');
    setCefrLevel('A1');
    setSentences(Array.from({ length: 10 }, () => ({ ja: '', es: '' })));
    alert('保存しました。');
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>新規セット登録</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>文法名</label>
        <input 
          type="text" 
          value={grammarName} 
          onChange={(e) => setGrammarName(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          placeholder="例: 点過去"
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>CEFRレベル</label>
        <select 
          value={cefrLevel} 
          onChange={(e) => setCefrLevel(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        >
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>例文 (最大10個)</h3>
      {sentences.map((sentence, index) => (
        <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #eee', backgroundColor: '#fafafa' }}>
          <div style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>#{index + 1}</div>
          <input 
            type="text" 
            placeholder="日本語" 
            value={sentence.ja}
            onChange={(e) => handleSentenceChange(index, 'ja', e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <input 
            type="text" 
            placeholder="Español" 
            value={sentence.es}
            onChange={(e) => handleSentenceChange(index, 'es', e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
      ))}

      <button 
        onClick={handleSave}
        style={{ width: '100%', padding: '16px', fontSize: '18px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', marginBottom: '20px' }}
      >
        登録する
      </button>
    </div>
  );
}
