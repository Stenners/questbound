import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Trash2, XCircle, ShoppingBag, Plus, RotateCcw } from 'lucide-react';
import { ICON_MAP } from '../constants';

const MODAL_OVERLAY = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)',
};

const MODAL_BOX = {
  background: '#fff',
  borderRadius: '16px',
  padding: '28px 32px',
  textAlign: 'center',
  maxWidth: '380px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

function ParentPortal({ players, quests, rewards, rewardLogs }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'confirm'|'error', title, body, onConfirm? }

  const [newQuest, setNewQuest] = useState({ title: '', xp: 10, gold: 10, assignedTo: 'co-op', isNonNegotiable: false, frequency: 'daily' });
  const [newReward, setNewReward] = useState({ title: '', cost: 20, icon: 'ShoppingBag' });

  const confirm = (title, body, onConfirm) => setModal({ type: 'confirm', title, body, onConfirm });
  const showError = (title, body) => setModal({ type: 'error', title, body });

  const CORRECT_PIN = import.meta.env.VITE_PARENT_PIN;

  const handleAddReward = async (e) => {
    e.preventDefault();
    if (!newReward.title) return;
    await addDoc(collection(db, 'rewards'), {
      ...newReward,
      cost: Number(newReward.cost)
    });
    setNewReward({ title: '', cost: 20, icon: 'ShoppingBag' });
  };

  const handleDeleteReward = (rewardId) => {
    confirm('Delete Reward', 'Are you sure? This cannot be undone.', () => deleteDoc(doc(db, 'rewards', rewardId)));
  };

  const handleFulfillReward = async (logId) => {
    await updateDoc(doc(db, 'rewardLogs', logId), {
      status: 'fulfilled'
    });
  };

  const handleDenyReward = async (log) => {
    await updateDoc(doc(db, 'players', log.playerId), {
      gold: (players.find(p => p.id === log.playerId)?.gold || 0) + log.cost
    });
    await updateDoc(doc(db, 'rewardLogs', log.id), {
      status: 'denied'
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
    } else {
      showError('Wrong PIN', 'Incorrect PIN. Try again.');
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
      frequency: newQuest.frequency
    });
    setNewQuest({ title: '', xp: 10, gold: 10, assignedTo: 'co-op', isNonNegotiable: false, frequency: 'daily' });
  };

  const handleDeleteQuest = (questId) => {
    confirm('Delete Quest', 'Are you sure? This cannot be undone.', () => deleteDoc(doc(db, 'quests', questId)));
  };

  const handleResetQuest = (quest) => {
    confirm(
      'Reset Quest',
      `Reset "${quest.title || 'this quest'}" to Available? This does NOT deduct XP or Gold.`,
      async () => {
        await updateDoc(doc(db, 'quests', quest.id), { status: 'Available', claimedBy: null });
        await addDoc(collection(db, 'questLogs'), {
          questId: quest.id,
          questTitle: quest.title || 'UNKNOWN QUEST',
          action: 'RESET_QUEST_MANUAL',
          timestamp: serverTimestamp()
        });
      }
    );
  };

  const handleRejectClaim = (quest) => {
    if (!quest.claimedBy) {
      showError('Cannot Reject', 'We do not know who claimed this quest.');
      return;
    }
    const player = players.find(p => p.id === quest.claimedBy);
    if (!player) return;

    confirm(
      'Reject Claim',
      `This will deduct ${quest.xp} XP and ${quest.gold} Gold from ${player.name}.`,
      async () => {
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

      await addDoc(collection(db, 'questLogs'), {
        questId: quest.id,
        questTitle: quest.title || 'UNKNOWN QUEST',
        playerId: player.id,
        playerName: player.name || 'UNKNOWN HERO',
        xpDeducted: quest.xp || 0,
        goldDeducted: quest.gold || 0,
        action: 'REJECT_CLAIM',
        timestamp: serverTimestamp()
      });
    });
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
        <div className="panel" style={{ padding: '32px', maxWidth: '400px', width: '100%' }}>
          <h2 className="game-font panel-header" style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>Parent Portal</h2>
          <form onSubmit={handleLogin} className="flex-col">
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN (1234)"
              className="game-font"
              style={{ fontSize: '1.5rem', padding: '12px', textAlign: 'center', borderRadius: '8px', border: '3px solid #94a3b8', outline: 'none' }}
            />
            <button type="submit" className="btn-game success">ENTER</button>
          </form>
          <button className="btn-game blue" style={{ width: '100%', marginTop: '16px' }} onClick={() => navigate('/')}>RETURN</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {modal && (
        <div style={MODAL_OVERLAY} onClick={() => modal.type === 'error' && setModal(null)}>
          <div style={{ ...MODAL_BOX, border: `3px solid ${modal.type === 'error' ? '#ef4444' : '#f59e0b'}` }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: modal.type === 'error' ? '#ef4444' : '#92400e' }}>
              {modal.title}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#334155' }}>{modal.body}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {modal.type === 'confirm' && (
                <button
                  className="btn-game success"
                  style={{ padding: '10px 24px' }}
                  onClick={() => { modal.onConfirm(); setModal(null); }}
                >
                  Confirm
                </button>
              )}
              <button
                className="btn-game"
                style={{ padding: '10px 24px' }}
                onClick={() => setModal(null)}
              >
                {modal.type === 'error' ? 'OK' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="app-nav">
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn-game blue" style={{ fontSize: '0.9rem' }} onClick={() => navigate('/')}>
            <div className="flex-center" style={{ gap: '8px' }}>
              <ArrowLeft size={18} /> EXIT PORTAL
            </div>
          </button>
        </div>
        <h1 className="app-header" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Dungeon Master</h1>
        <div />
      </div>

      <div className="portal-grid">

        {/* Left Column: Heroes */}
        <div className="flex-col">
          <div className="panel">
            <h2 className="game-font panel-header">Hero Management</h2>
            <div className="panel-inner flex-col" style={{ padding: '16px', gap: '16px' }}>
              {players.map(p => (
                <div key={p.id} style={{ backgroundColor: '#f1f5f9', border: '2px solid #94a3b8', borderRadius: '12px', padding: '16px' }}>
                  <h3 className="game-font" style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '8px' }}>{(p.name || 'Unknown Hero').toUpperCase()}</h3>

                  <div className="flex-between" style={{ marginBottom: '8px', color: '#334155', fontWeight: 'bold' }}>
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
              {players.length === 0 && <div style={{ textAlign: 'center', color: '#334155' }}>No heroes found.</div>}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '24px' }}>
            <h2 className="game-font panel-header">Reward Management</h2>
            <div className="panel-inner flex-col" style={{ padding: '16px', gap: '16px' }}>
              <form onSubmit={handleAddReward} className="flex-col" style={{ gap: '12px', paddingBottom: '16px', borderBottom: '2px solid #94a3b8' }}>
                <input 
                  type="text" 
                  placeholder="Reward Title" 
                  value={newReward.title} 
                  onChange={e => setNewReward({ ...newReward, title: e.target.value })} 
                  style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1.1rem' }} 
                  required 
                />
                <div className="flex-between" style={{ gap: '12px' }}>
                  <div className="flex-col" style={{ flex: 1, gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 'bold' }}>Cost (Gold)</label>
                    <input 
                      type="number" 
                      value={newReward.cost} 
                      onChange={e => setNewReward({ ...newReward, cost: e.target.value })} 
                      style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1rem' }} 
                      required 
                    />
                  </div>
                  <div className="flex-col" style={{ flex: 1, gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 'bold' }}>Icon</label>
                    <select 
                      value={newReward.icon} 
                      onChange={e => setNewReward({ ...newReward, icon: e.target.value })} 
                      style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1rem' }}
                    >
                      {Object.keys(ICON_MAP).map(iconName => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-game success">ADD REWARD</button>
              </form>

              <div className="flex-col" style={{ gap: '8px' }}>
                {rewards.map(r => {
                  const RewardIcon = ICON_MAP[r.icon] || ShoppingBag;
                  return (
                    <div key={r.id} className="flex-between" style={{ backgroundColor: '#f1f5f9', border: '2px solid #94a3b8', borderRadius: '12px', padding: '12px' }}>
                      <div className="flex-center" style={{ gap: '12px' }}>
                        <div style={{ backgroundColor: '#374151', padding: '6px', borderRadius: '50%' }}>
                          <RewardIcon size={20} color="#10b981" />
                        </div>
                        <div>
                          <div className="game-font" style={{ fontSize: '1rem', color: '#1e293b' }}>{r.title.toUpperCase()}</div>
                          <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold' }}>{r.cost} GOLD</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteReward(r.id)} style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
                {rewards.length === 0 && <div style={{ textAlign: 'center', color: '#334155' }}>No rewards set.</div>}
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: '24px' }}>
            <h2 className="game-font panel-header">Reward Claims</h2>
            <div className="panel-inner flex-col" style={{ padding: '16px', gap: '12px' }}>
              {rewardLogs && rewardLogs.filter(log => log.status === 'pending').map(log => (
                <div key={log.id} className="flex-between" style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="game-font" style={{ fontSize: '1rem', color: '#92400e' }}>
                      {log.playerName.toUpperCase()} BOUGHT:
                    </div>
                    <div className="game-font" style={{ fontSize: '1.2rem', color: '#1e293b' }}>
                      {log.itemTitle.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 'bold' }}>
                      COST: {log.cost} GOLD | {log.timestamp?.toDate().toLocaleString() || 'Just now'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleFulfillReward(log.id)}
                      className="btn-game success"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    >
                      FULFILL
                    </button>
                    <button
                      onClick={() => handleDenyReward(log)}
                      className="btn-game"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#ef4444', borderColor: '#b91c1c' }}
                    >
                      DENY
                    </button>
                  </div>
                </div>
              ))}
              {(!rewardLogs || rewardLogs.filter(log => log.status === 'pending').length === 0) && (
                <div style={{ textAlign: 'center', color: '#334155', padding: '12px' }}>No pending reward claims.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quests */}
        <div className="flex-col">
          <div className="panel">
            <h2 className="game-font panel-header">Create Quest</h2>
            <form className="panel-inner flex-col" style={{ padding: '16px', gap: '16px' }} onSubmit={handleAddQuest}>
              <input type="text" placeholder="Quest Title" value={newQuest.title} onChange={e => setNewQuest({ ...newQuest, title: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1.1rem' }} required />

              <div className="flex-between" style={{ gap: '16px' }}>
                <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>XP Reward</label>
                  <input type="number" value={newQuest.xp} onChange={e => setNewQuest({ ...newQuest, xp: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1.1rem' }} required />
                </div>
                <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>Gold Reward</label>
                  <input type="number" value={newQuest.gold} onChange={e => setNewQuest({ ...newQuest, gold: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1.1rem' }} required />
                </div>
              </div>

              <div className="flex-between" style={{ gap: '16px' }}>
                <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>Assign To</label>
                  <select value={newQuest.assignedTo} onChange={e => setNewQuest({ ...newQuest, assignedTo: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1.1rem' }}>
                    <option value="co-op">Co-op (Anyone)</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex-col" style={{ gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>Frequency</label>
                  <select value={newQuest.frequency} onChange={e => setNewQuest({ ...newQuest, frequency: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '2px solid #94a3b8', fontSize: '1.1rem' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="one-off">One-off</option>
                  </select>
                </div>
              </div>

              <label className="flex-center" style={{ gap: '8px', color: '#b45309', fontWeight: 'bold', justifyContent: 'flex-start' }}>
                <input type="checkbox" checked={newQuest.isNonNegotiable} onChange={e => setNewQuest({ ...newQuest, isNonNegotiable: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                Is Non-Negotiable?
              </label>

              <button type="submit" className="btn-game success">ADD QUEST</button>
            </form>
          </div>

          <div className="panel">
            <h2 className="game-font panel-header">Active & Claimed Quests</h2>
            <div className="panel-inner flex-col" style={{ padding: '16px', gap: '12px' }}>
              {quests.map(q => (
                <div key={q.id} className="flex-between" style={{ backgroundColor: q.status === 'Completed' ? '#dcfce7' : '#f1f5f9', border: '2px solid', borderColor: q.status === 'Completed' ? '#10b981' : '#94a3b8', borderRadius: '12px', padding: '12px', opacity: q.status === 'Completed' ? 0.8 : 1 }}>
                  <div>
                    <div className="game-font" style={{ fontSize: '1.1rem', color: '#1e293b' }}>{(q.title || 'Unknown').toUpperCase()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px' }}>
                      {q.status === 'Completed' ? `CLAIMED (by ${players.find(p => p.id === q.claimedBy)?.name || 'Unknown'})` : `For: ${q.assignedTo === 'co-op' ? 'Everyone' : (players.find(p => p.id === q.assignedTo)?.name || 'Unknown')}`}
                      <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {q.frequency || 'one-off'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-center" style={{ gap: '8px' }}>
                    <button onClick={() => handleResetQuest(q)} title="Reset to Available" style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                      <RotateCcw size={18} />
                    </button>
                    {q.status === 'Completed' && (
                      <button onClick={() => handleRejectClaim(q)} title="Reject Claim" style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                        <XCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteQuest(q.id)} title="Delete Quest" style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {quests.length === 0 && <div style={{ textAlign: 'center', color: '#334155' }}>No quests found.</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ParentPortal;
