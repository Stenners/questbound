import React from 'react';
import QuestCard from './QuestCard';

export default function QuestBoard({ quests, onClaim }) {
  const availableQuests = quests.filter(q => q.status !== 'Completed');
  const completedQuests = quests.filter(q => q.status === 'Completed');

  return (
    <div>
      <h2 className="game-font" style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-quest)' }}>
        Active Quests
      </h2>
      
      {availableQuests.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>No active quests remaining. Great job!</p>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          {availableQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} onClaim={onClaim} />
          ))}
        </div>
      )}

      {completedQuests.length > 0 && (
        <>
          <h2 className="game-font" style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
            Completed Today
          </h2>
          <div>
            {completedQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} onClaim={onClaim} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
