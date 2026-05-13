import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Coins, Sparkles } from 'lucide-react';
import { updateDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import RewardStore from './RewardStore';

function ShopPage({ players, shopItems }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const player = players.find(p => p.id === id);

  if (!player) return <div className="flex-center" style={{ height: '100vh', color: '#fff' }}><h1 className="game-font">Loading...</h1></div>;

  const handlePurchase = async (item) => {
    if ((player.gold || 0) < item.cost) {
      alert("Not enough gold!");
      return;
    }

    if (window.confirm(`Buy ${item.title} for ${item.cost} Gold?`)) {
      await updateDoc(doc(db, 'players', player.id), {
        gold: (player.gold || 0) - item.cost
      });

      await addDoc(collection(db, 'rewardLogs'), {
        playerId: player.id,
        playerName: player.name || 'UNKNOWN HERO',
        itemId: item.id,
        itemTitle: item.title || 'UNKNOWN REWARD',
        cost: item.cost,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      alert(`Purchased ${item.title}! Inform the Dungeon Master to claim your reward.`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'bounceIn 0.5s ease-out', paddingBottom: '40px' }}>
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
