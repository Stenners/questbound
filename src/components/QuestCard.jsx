import React from 'react';
import { Coins, Star } from 'lucide-react';

export default function QuestCard({ quest, onClaim }) {
  const isCompleted = quest.status === 'Completed';

  return (
    <div className="game-card" style={{ marginBottom: '16px', opacity: isCompleted ? 0.7 : 1 }}>
      <div className="flex-between">
        <div>
          <h3 className="game-font" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{quest.title}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>{quest.description}</p>
          
          <div className="flex-center" style={{ gap: '16px', justifyContent: 'flex-start' }}>
            <div className="flex-center" style={{ gap: '4px', color: 'var(--color-critical)' }}>
              <Star size={18} fill="currentColor" /> {quest.reward_xp}
            </div>
            <div className="flex-center" style={{ gap: '4px', color: 'var(--color-quest)' }}>
              <Coins size={18} fill="currentColor" /> {quest.reward_gold}
            </div>
          </div>
        </div>
        
        <button 
          className={`btn-game ${isCompleted ? 'success' : ''}`}
          disabled={isCompleted}
          onClick={() => onClaim(quest.id)}
        >
          {isCompleted ? 'Claimed!' : 'Claim'}
        </button>
      </div>
    </div>
  );
}
