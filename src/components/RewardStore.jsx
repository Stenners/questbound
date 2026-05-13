import React from 'react';
import { Coins } from 'lucide-react';
import { ICON_MAP } from '../constants';

export default function RewardStore({ player, shopItems, onPurchase }) {
  return (
    <div style={{ width: '100%' }}>
      <div className="shop-grid">
        {shopItems.map(item => {
          const ItemIcon = ICON_MAP[item.icon] || ICON_MAP.ShoppingBag;
          const canAfford = (player.gold || 0) >= item.cost;
          
          return (
            <div key={item.id} className="shop-item-card">
              <div className="shop-item-icon-wrapper">
                <ItemIcon size={48} color="#10b981" />
              </div>
              
              <div className="game-font shop-item-title">
                {item.title.toUpperCase()}
              </div>
              
              <div className="game-font shop-item-cost">
                <Coins size={18} fill="currentColor" strokeWidth={2} /> 
                {item.cost} Gold
              </div>
              
              <button 
                className={`btn-game ${canAfford ? 'success' : ''}`}
                style={{ padding: '12px 24px', fontSize: '1.1rem', width: '100%', marginTop: 'auto', zIndex: 1 }}
                disabled={!canAfford}
                onClick={() => onPurchase(item)}
              >
                {canAfford ? 'PURCHASE' : 'LOCKED'}
              </button>
            </div>
          );
        })}
      </div>
      {shopItems.length === 0 && (
        <div className="flex-center flex-col" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p className="game-font" style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>The bazaar is currently empty...</p>
        </div>
      )}
    </div>
  );
}
