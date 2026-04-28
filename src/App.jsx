import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

import ProfileSelector from './components/ProfileSelector';
import Dashboard from './components/Dashboard';
import ParentPortal from './components/ParentPortal';
import { shopItems } from './constants';

function MainApp() {
  const [players, setPlayers] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(p);
    });

    const unsubQuests = onSnapshot(collection(db, 'quests'), (snapshot) => {
      const q = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuests(q);
      setLoading(false);
    });

    return () => {
      unsubPlayers();
      unsubQuests();
    };
  }, []);

  if (players.length === 0 && !loading) {
    return (
      <div className="flex-center flex-col" style={{ height: '100vh', color: '#fff', gap: '24px' }}>
        <h1 className="game-font">Database Empty!</h1>
        <p className="game-font" style={{ color: 'var(--color-text)' }}>Waiting for heroes to be created in Firestore...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelector players={players} />} />
        <Route path="/dashboard/:id" element={
          <Dashboard
            players={players}
            quests={quests}
            shopItems={shopItems}
          />
        } />
        <Route path="/admin" element={<ParentPortal players={players} quests={quests} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default MainApp;
