import React from 'react';

export default function RewardStore() {
  return (
    <div className="game-card flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
      <h2 className="game-font" style={{ fontSize: '2rem', color: 'var(--color-critical)' }}>
        The Reward Store
      </h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Coming soon! Trade your gold for mysterious digital items and epic real-world loot.
      </p>
      <button className="btn-game critical" disabled>Shop Closed</button>
    </div>
  );
}
