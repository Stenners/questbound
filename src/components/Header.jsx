import React from 'react';
import { User, Coins, Star } from 'lucide-react';

export default function Header({ player }) {
  return (
    <header className="game-card flex-between" style={{ marginBottom: '24px' }}>
      <div className="flex-center" style={{ gap: '16px' }}>
        <div style={{ backgroundColor: '#1e1e2e', padding: '12px', borderRadius: '50%' }}>
          <User size={32} color="var(--color-text)" />
        </div>
        <div>
          <h2 className="game-font">{player.name}</h2>
          <div className="flex-center" style={{ gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <span>Level {player.level}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-center" style={{ gap: '24px' }}>
        <div className="flex-center" style={{ gap: '8px' }}>
          <Star color="var(--color-critical)" fill="var(--color-critical)" size={24} />
          <span className="stat-text" style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>
            {player.xp} XP
          </span>
        </div>
        <div className="flex-center" style={{ gap: '8px' }}>
          <Coins color="var(--color-quest)" fill="var(--color-quest)" size={24} />
          <span className="stat-text" style={{ fontSize: '1.5rem' }}>
            {player.gold_balance}
          </span>
        </div>
      </div>
    </header>
  );
}
