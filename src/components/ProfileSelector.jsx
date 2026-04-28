import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarDisplay from './AvatarDisplay';

function ProfileSelector({ players }) {
  const navigate = useNavigate();

  return (
    <div className="flex-col flex-center" style={{ minHeight: '80vh', gap: '32px' }}>
      <h1 className="app-header" style={{ fontSize: '3.5rem' }}>QuestBound</h1>
      <div className="flex-center" style={{ gap: '32px', flexWrap: 'wrap' }}>
        {players.map(p => {
          return (
            <div
              key={p.id}
              className="panel"
              style={{ cursor: 'pointer', transition: 'transform 0.2s', width: '280px', flex: 'none' }}
              onClick={() => navigate(`/dashboard/${p.id}`)}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="panel-inner flex-col items-center" style={{ gap: '16px', padding: '32px 16px' }}>
                <div style={{ backgroundColor: '#374151', borderRadius: '50%', padding: '8px', border: '4px solid #94a3b8', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}>
                  <AvatarDisplay config={p.avatarConfig || {}} size={140} />
                </div>
                <h2 className="game-font" style={{ color: '#fff', fontSize: '2rem', letterSpacing: '1px', marginTop: '8px' }}>{(p.name || 'Unknown Hero').toUpperCase()}</h2>
                <div className="game-font" style={{ color: p.themeColor || '#10b981', letterSpacing: '0.5px' }}>{(p.title || 'Novice').toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileSelector;
