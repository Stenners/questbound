import React from 'react';
import { Coins } from 'lucide-react';
import { ICON_MAP } from '../constants';

export default function RewardStore({ player, shopItems, onPurchase }) {
  return (
    <div className="panel-inner" style={{ backgroundColor: '#374151', padding: '16px' }}>
      <div className="flex-col" style={{ gap: '12px' }}>
        {shopItems.map(item => {
          const ItemIcon = ICON_MAP[item.icon] || ICON_MAP.ShoppingBag;
          const canAfford = (player.gold || 0) >= item.cost;
          
          return (
            <div key={item.id} className="shop-item flex-between" style={{ padding: '12px', background: '#1f2937', borderRadius: '12px', border: '2px solid #4b5563' }}>
              <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#111', padding: '10px', borderRadius: '50%', border: '3px solid #0f172a' }}>
                  <ItemIcon size={20} color="#10b981" />
                </div>
                <div>
                  <div className="game-font" style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '2px' }}>
                    {item.title.toUpperCase()}
                  </div>
                  <div className="flex-center game-font" style={{ gap: '6px', color: '#f59e0b', justifyContent: 'flex-start', fontSize: '1rem' }}>
                    <Coins size={14} fill="currentColor" strokeWidth={2} /> {item.cost} Gold
                  </div>
                </div>
              </div>
              
              <button 
                className={`btn-game ${canAfford ? 'success' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.9rem', minWidth: '80px' }}
                disabled={!canAfford}
                onClick={() => onPurchase(item)}
              >
                {canAfford ? 'BUY' : 'LOCKED'}
              </button>
            </div>
          );
        })}
        {shopItems.length === 0 && (
          <div className="flex-center flex-col" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p className="game-font" style={{ color: 'var(--color-text-muted)' }}>The store is currently empty...</p>
          </div>
        )}
      </div>
    </div>
  );
}
