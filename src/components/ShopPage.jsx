import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Coins, Sparkles } from 'lucide-react';
import { runTransaction, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import RewardStore from './RewardStore';

const MODAL_OVERLAY = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)',
  animation: 'bounceIn 0.3s ease-out',
};

const MODAL_BOX = {
  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
  borderRadius: '24px',
  padding: '32px 40px',
  textAlign: 'center',
  maxWidth: '400px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

function ShopPage({ players, shopItems }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const player = players.find(p => p.id === id);
  const [modal, setModal] = useState(null); // { type: 'confirm'|'success'|'error', item?, message? }

  if (!player) return <div className="flex-center" style={{ height: '100vh', color: '#fff' }}><h1 className="game-font">Loading...</h1></div>;

  const handlePurchase = (item) => {
    if ((player.gold || 0) < item.cost) {
      setModal({ type: 'error', message: "Not enough gold!" });
      return;
    }
    setModal({ type: 'confirm', item });
  };

  const confirmPurchase = async (item) => {
    setModal(null);
    const playerRef = doc(db, 'players', player.id);
    try {
      await runTransaction(db, async (tx) => {
        const playerSnap = await tx.get(playerRef);
        const currentGold = playerSnap.data()?.gold || 0;
        if (currentGold < item.cost) throw new Error("Not enough gold!");
        tx.update(playerRef, { gold: currentGold - item.cost });
      });
    } catch (e) {
      setModal({ type: 'error', message: e.message || "Purchase failed. Please try again." });
      return;
    }

    await addDoc(collection(db, 'rewardLogs'), {
      playerId: player.id,
      playerName: player.name || 'UNKNOWN HERO',
      itemId: item.id,
      itemTitle: item.title || 'UNKNOWN REWARD',
      cost: item.cost,
      timestamp: serverTimestamp(),
      status: 'pending'
    });

    setModal({ type: 'success', item });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'bounceIn 0.5s ease-out', paddingBottom: '40px' }}>

      {modal?.type === 'confirm' && (
        <div style={MODAL_OVERLAY}>
          <div style={{ ...MODAL_BOX, border: '4px solid #f59e0b', boxShadow: '0 0 40px rgba(245,158,11,0.4)' }}>
            <div className="game-font" style={{ fontSize: '1.8rem', color: '#f59e0b' }}>CONFIRM PURCHASE</div>
            <div className="game-font" style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{modal.item.title.toUpperCase()}</div>
            <div className="game-font flex-center" style={{ gap: '8px', color: '#f59e0b', fontSize: '1.3rem' }}>
              <Coins size={20} fill="#f59e0b" strokeWidth={2} color="#f59e0b" /> {modal.item.cost} Gold
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-game success" style={{ padding: '12px 28px', fontSize: '1rem' }} onClick={() => confirmPurchase(modal.item)}>BUY IT!</button>
              <button className="btn-game" style={{ padding: '12px 28px', fontSize: '1rem' }} onClick={() => setModal(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'success' && (
        <div style={MODAL_OVERLAY} onClick={() => setModal(null)}>
          <div style={{ ...MODAL_BOX, border: '4px solid #10b981', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
            <div className="game-font" style={{ fontSize: '2rem', color: '#10b981' }}>PURCHASED!</div>
            <div className="game-font" style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{modal.item.title.toUpperCase()}</div>
            <div className="game-font" style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Tell the Dungeon Master to claim your reward.</div>
            <button className="btn-game success" style={{ padding: '12px 28px', fontSize: '1rem' }} onClick={() => setModal(null)}>NICE!</button>
          </div>
        </div>
      )}

      {modal?.type === 'error' && (
        <div style={MODAL_OVERLAY} onClick={() => setModal(null)}>
          <div style={{ ...MODAL_BOX, border: '4px solid #ef4444', boxShadow: '0 0 40px rgba(239,68,68,0.4)' }}>
            <div className="game-font" style={{ fontSize: '2rem', color: '#ef4444' }}>NOT ENOUGH GOLD!</div>
            <div className="game-font" style={{ fontSize: '1rem', color: '#94a3b8' }}>{modal.message}</div>
            <button className="btn-game" style={{ padding: '12px 28px', fontSize: '1rem' }} onClick={() => setModal(null)}>DANG...</button>
          </div>
        </div>
      )}
      <div className="app-nav">
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn-game blue" style={{ fontSize: '0.9rem' }} onClick={() => navigate(`/dashboard/${id}`)}>
            <div className="flex-center" style={{ gap: '8px' }}>
              <ArrowLeft size={18} /> BACK TO QUESTS
            </div>
          </button>
        </div>
        <h1 className="app-header flex-center" style={{ marginBottom: 0, whiteSpace: 'nowrap', color: '#f59e0b', textShadow: '0 4px 0 #b45309, 0 -2px 0 #b45309, 2px 0 0 #b45309, -2px 0 0 #b45309' }}>
          <Sparkles size={32} style={{ marginRight: '12px', color: '#fbbf24' }}/>
          The Grand Bazaar
          <Sparkles size={32} style={{ marginLeft: '12px', color: '#fbbf24' }}/>
        </h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="gold-badge" style={{ width: 'auto', padding: '12px 24px', backgroundColor: '#1e293b', border: '3px solid #f59e0b', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
            <Coins size={24} fill="#f59e0b" strokeWidth={2} color="#f59e0b" />
            <span className="game-font" style={{ fontSize: '1.4rem' }}>{player.gold || 0} Gold</span>
          </div>
        </div>
      </div>

      <div className="panel parchment" style={{ marginTop: '32px', padding: '24px', border: '4px solid #f59e0b', boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)', background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
        <p className="game-font" style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '24px', color: '#cbd5e1', fontStyle: 'italic' }}>
          "Welcome, adventurer! Choose your prize..."
        </p>
        <RewardStore 
          player={player} 
          shopItems={shopItems} 
          onPurchase={handlePurchase} 
        />
      </div>
    </div>
  );
}

export default ShopPage;
