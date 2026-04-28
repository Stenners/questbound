import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Trash2, XCircle } from 'lucide-react';

function ParentPortal({ players, quests }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [newQuest, setNewQuest] = useState({ title: '', xp: 10, gold: 10, assignedTo: 'co-op', isNonNegotiable: false });

  const CORRECT_PIN = import.meta.env.VITE_PARENT_PIN || '1234';

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };

  const handleAddQuest = async (e) => {
    e.preventDefault();
    if (!newQuest.title) return;
    await addDoc(collection(db, 'quests'), {
      ...newQuest,
      xp: Number(newQuest.xp),
      gold: Number(newQuest.gold),
      status: 'Available',
    });
    setNewQuest({ title: '', xp: 10, gold: 10, assignedTo: 'co-op', isNonNegotiable: false });
  };

  const handleDeleteQuest = async (questId) => {
    if (window.confirm('Delete this quest?')) {
      await deleteDoc(doc(db, 'quests', questId));
    }
  };

  const handleRejectClaim = async (quest) => {
    if (!quest.claimedBy) {
      alert('Cannot reject: We do not know who claimed this quest.');
      return;
    }
    const player = players.find(p => p.id === quest.claimedBy);
    if (!player) return;

    if (window.confirm(`Reject this claim? This will deduct ${quest.xp} XP and ${quest.gold} Gold from ${player.name}.`)) {
      let newXp = (player.xp || 0) - (quest.xp || 0);
      if (newXp < 0) newXp = 0;
      
      let newCompleted = player.weeklyNonNegotiablesCompleted || 0;
      if (quest.isNonNegotiable && newCompleted > 0) {
        newCompleted -= 1;
      }

      await updateDoc(doc(db, 'players', player.id), {
        xp: newXp,
        gold: Math.max(0, (player.gold || 0) - (quest.gold || 0)),
        weeklyNonNegotiablesCompleted: newCompleted
      });

      await updateDoc(doc(db, 'quests', quest.id), {
        status: 'Available',
        claimedBy: null
      });
    }
  };

  const handleUpdatePlayer = async (player, field, delta) => {
    let newVal = (player[field] || 0) + delta;
    if (newVal < 0) newVal = 0;
    await updateDoc(doc(db, 'players', player.id), {
      [field]: newVal
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: '80vh' }}>
        <div className="panel parchment" style={{ padding: '32px', maxWidth: '400px', width: '100%' }}>
          <h2 className="game-font" style={{ textAlign: 'center', marginBottom: '24px', color: '#3d2616', fontSize: '2rem' }}>Parent Portal</h2>
          <form onSubmit={handleLogin} className="flex-col">
            <input 
              type="password" 
              value={pin} 
              onChange={e => setPin(e.target.value)} 
              placeholder="Enter PIN (1234)"
              className="game-font"
              style={{ fontSize: '1.5rem', padding: '12px', textAlign: 'center', borderRadius: '8px', border: '3px solid #d4ba94', outline: 'none' }}
            />
            <button type="submit" className="btn-game success">ENTER</button>
          </form>
          <button className="btn-game" style={{ width: '100%', marginTop: '16px' }} onClick={() => navigate('/')}>RETURN</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <button className="btn-game" style={{ fontSize: '1rem', padding: '8px 16px' }} onClick={() => navigate('/')}>
          <div className="flex-center" style={{ gap: '8px' }}>
            <ArrowLeft size={18} /> EXIT PORTAL
          </div>
        </button>
        <h1 className="app-header" style={{ marginBottom: 0, color: '#ef4444' }}>Dungeon Master</h1>
        <div style={{ width: 140 }}></div>
      </div>

      <div className="portal-grid">
        
        {/* Left Column: Heroes */}
        <div className="flex-col">
          <div className="panel parchment">
            <h2 className="game-font panel-header" style={{ color: '#3d2616' }}>Hero Management</h2>
            <div className="panel-inner flex-col" style={{ padding: '16px', gap: '16px' }}>
              {players.map(p => (
                <div key={p.id} style={{ backgroundColor: '#fff9eb', border: '2px solid #d4ba94', borderRadius: '12px', padding: '16px' }}>
                  <h3 className="game-font" style={{ fontSize: '1.4rem', color: '#3d2616', marginBottom: '8px' }}>{(p.name || 'Unknown Hero').toUpperCase()}</h3>
                  
                  <div className="flex-between" style={{ marginBottom: '8px', color: '#78350f', fontWeight: 'bold' }}>
                    <span>Gold: {p.gold || 0}</span>
                    <div className="flex-center" style={{ gap: '8px' }}>
                      <button onClick={() => handleUpdatePlayer(p, 'gold', -10)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>-10</button>
                      <button onClick={() => handleUpdatePlayer(p, 'gold', 10)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>+10</button>
                    </div>
                  </div>

                  <div className="flex-between" style={{ marginBottom: '8px', color: '#1e3a8a', fontWeight: 'bold' }}>
                    <span>XP: {p.xp || 0}</span>
                    <div className="flex-center" style={{ gap: '8px' }}>
                      <button onClick={() => handleUpdatePlayer(p, 'xp', -10)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>-10</button>
                      <button onClick={() => handleUpdatePlayer(p, 'xp', 10)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>+10</button>
                    </div>
                  </div>
                  
                  <div className="flex-between" style={{ color: '#b45309', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <span>Weekly: {p.weeklyNonNegotiablesCompleted || 0}/{p.weeklyNonNegotiablesTotal || 5}</span>
                    <div className="flex-center" style={{ gap: '8px' }}>
                      <button onClick={() => handleUpdatePlayer(p, 'weeklyNonNegotiablesCompleted', -1)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>-1</button>
                      <button onClick={() => handleUpdatePlayer(p, 'weeklyNonNegotiablesCompleted', 1)} style={{ padding: '4px 8px', borderRadius: '4px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>+1</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quests */}
        <div className="flex-col">
          <div className="panel parchment">
            <h2 className="game-font panel-header" style={{ color: '#3d2616' }}>Create Quest</h2>
            <form className="panel-inner flex-col" style={{ padding: '16px', gap: '16px' }} onSubmit={handleAddQuest}>
              <input type="text" placeholder="Quest Title" value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #d4ba94', fontSize: '1.1rem' }} required />
              
              <div className="flex-between" style={{ gap: '16px' }}>
                <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', color: '#78350f', fontWeight: 'bold' }}>XP Reward</label>
                  <input type="number" value={newQuest.xp} onChange={e => setNewQuest({...newQuest, xp: e.target.value})} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #d4ba94', fontSize: '1.1rem' }} required />
                </div>
                <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', color: '#78350f', fontWeight: 'bold' }}>Gold Reward</label>
                  <input type="number" value={newQuest.gold} onChange={e => setNewQuest({...newQuest, gold: e.target.value})} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #d4ba94', fontSize: '1.1rem' }} required />
                </div>
              </div>

              <div className="flex-col" style={{ gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#78350f', fontWeight: 'bold' }}>Assign To</label>
                <select value={newQuest.assignedTo} onChange={e => setNewQuest({...newQuest, assignedTo: e.target.value})} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #d4ba94', fontSize: '1.1rem' }}>
                  <option value="co-op">Co-op (Anyone)</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <label className="flex-center" style={{ gap: '8px', color: '#b45309', fontWeight: 'bold', justifyContent: 'flex-start' }}>
                <input type="checkbox" checked={newQuest.isNonNegotiable} onChange={e => setNewQuest({...newQuest, isNonNegotiable: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                Is Non-Negotiable?
              </label>

              <button type="submit" className="btn-game success">ADD QUEST</button>
            </form>
          </div>

          <div className="panel parchment">
            <h2 className="game-font panel-header" style={{ color: '#3d2616' }}>Active & Claimed Quests</h2>
            <div className="panel-inner flex-col" style={{ padding: '16px', gap: '12px' }}>
              {quests.map(q => (
                <div key={q.id} className="flex-between" style={{ backgroundColor: q.status === 'Completed' ? '#dcfce7' : '#fff9eb', border: '2px solid', borderColor: q.status === 'Completed' ? '#10b981' : '#d4ba94', borderRadius: '12px', padding: '12px', opacity: q.status === 'Completed' ? 0.8 : 1 }}>
                  <div>
                    <div className="game-font" style={{ fontSize: '1.1rem', color: '#3d2616' }}>{(q.title || 'Unknown').toUpperCase()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '4px' }}>
                      {q.status === 'Completed' ? `CLAIMED (by ${players.find(p => p.id === q.claimedBy)?.name || 'Unknown'})` : `For: ${q.assignedTo === 'co-op' ? 'Everyone' : (players.find(p => p.id === q.assignedTo)?.name || 'Unknown')}`}
                    </div>
                  </div>
                  <div className="flex-center" style={{ gap: '8px' }}>
                    {q.status === 'Completed' && (
                      <button onClick={() => handleRejectClaim(q)} title="Reject Claim" style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                        <XCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteQuest(q.id)} title="Delete Quest" style={{ background: '#78350f', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {quests.length === 0 && <div style={{ textAlign: 'center', color: '#78350f' }}>No quests found.</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ParentPortal;
