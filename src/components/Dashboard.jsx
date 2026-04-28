import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Coins, Star, ArrowLeft, Palette } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AvatarDisplay from './AvatarDisplay';
import {
  dictTop,
  dictEyes,
  dictMouth,
  dictClothing,
  dictAccessories,
  dictThemeColors,
  dictSkinColors,
  dictHairColors,
  dictClothesColors,
  ICON_MAP
} from '../constants';

function Dashboard({ players, quests, shopItems }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dbPlayer = players.find(p => p.id === id);
  const [view, setView] = useState('quests'); // 'quests' or 'wardrobe'
  const [wardrobeTab, setWardrobeTab] = useState('Top');
  const [pageState, setPageState] = useState({});
  const [draftAvatar, setDraftAvatar] = useState(null);

  if (!dbPlayer) return <div>Hero not found...</div>;

  const player = draftAvatar ? { ...dbPlayer, ...draftAvatar } : dbPlayer;

  const handleClaim = async (quest) => {
    let newXp = (player.xp || 0) + (quest.xp || 0);
    let newMax = player.maxXp || 100;
    if (newXp >= (player.maxXp || 100)) {
      newXp = newXp - (player.maxXp || 100);
      newMax = (player.maxXp || 100) + 50;
    }

    let newCompleted = player.weeklyNonNegotiablesCompleted || 0;
    if (quest.isNonNegotiable) {
      newCompleted += 1;
    }

    await updateDoc(doc(db, 'players', player.id), {
      xp: newXp,
      maxXp: newMax,
      gold: (player.gold || 0) + (quest.gold || 0),
      weeklyNonNegotiablesCompleted: newCompleted
    });

    await updateDoc(doc(db, 'quests', quest.id), {
      status: 'Completed',
      claimedBy: player.id
    });
  };

  const updateAvatar = (key, value) => {
    if (key === 'themeColor') {
      setDraftAvatar(prev => ({ ...prev, themeColor: value }));
    } else if (key === 'name') {
      setDraftAvatar(prev => ({ ...prev, name: value }));
    } else {
      setDraftAvatar(prev => ({
        ...prev,
        avatarConfig: {
          ...(prev?.avatarConfig || {}),
          [key]: value === 'none' ? [] : [value]
        }
      }));
    }
  };

  const handleEquipAndReturn = async () => {
    if (draftAvatar) {
      await updateDoc(doc(db, 'players', dbPlayer.id), {
        name: draftAvatar.name || '',
        themeColor: draftAvatar.themeColor || '#10b981',
        avatarConfig: draftAvatar.avatarConfig || {}
      });
      setDraftAvatar(null);
    }
    setView('quests');
  };

  const renderCarousel = (options, key, renderItem, itemsPerPage) => {
    const page = pageState[key] || 0;
    const maxPage = Math.ceil(options.length / itemsPerPage) - 1;
    const currentOptions = options.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    const setPage = (delta) => {
      setPageState(prev => ({ ...prev, [key]: Math.max(0, Math.min((prev[key] || 0) + delta, maxPage)) }));
    };

    return (
      <div className="flex-col items-center" style={{ marginBottom: '32px', width: '100%', gap: '16px' }}>
        <div className="flex-between" style={{ gap: '16px', width: '100%' }}>
          <button
            className="btn-game"
            style={{ padding: '8px 12px', borderRadius: '50%', fontSize: '1.2rem', minWidth: '44px', visibility: page === 0 ? 'hidden' : 'visible' }}
            onClick={() => setPage(-1)}
          >
            {"<"}
          </button>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            {currentOptions.map(renderItem)}
          </div>

          <button
            className="btn-game"
            style={{ padding: '8px 12px', borderRadius: '50%', fontSize: '1.2rem', minWidth: '44px', visibility: page >= maxPage ? 'hidden' : 'visible' }}
            onClick={() => setPage(1)}
          >
            {">"}
          </button>
        </div>
        {maxPage > 0 && (
          <div className="flex-center" style={{ gap: '8px' }}>
            {Array.from({ length: maxPage + 1 }).map((_, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: i === page ? '#10b981' : '#94a3b8' }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOptionGrid = (options, key) => renderCarousel(options, key, (opt) => {
    const isSelected = player.avatarConfig?.[key]?.[0] === opt || (opt === 'none' && (!player.avatarConfig?.[key] || player.avatarConfig?.[key].length === 0));
    return (
      <div
        key={opt}
        style={{
          backgroundColor: isSelected ? 'var(--color-success)' : '#374151',
          padding: '12px',
          borderRadius: '16px',
          border: '4px solid',
          borderColor: isSelected ? '#10b981' : '#0f172a',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isSelected ? `0 4px 0 rgba(0,0,0,0.2)` : 'none'
        }}
        onClick={() => updateAvatar(key, opt)}
        title={opt.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
      >
        <AvatarDisplay
          config={{
            ...(player.avatarConfig || {}),
            [key]: opt === 'none' ? [] : [opt]
          }}
          size={80}
        />
      </div>
    );
  }, 6);

  const renderColorGrid = (options, key) => renderCarousel(options, key, (color) => {
    const isSelected = player.avatarConfig?.[key]?.[0] === color;
    return (
      <div
        key={color}
        onClick={() => updateAvatar(key, color)}
        style={{
          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `#${color}`,
          border: '3px solid', borderColor: isSelected ? '#111' : 'rgba(0,0,0,0.1)',
          cursor: 'pointer', transform: isSelected ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      />
    );
  }, 8);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn-game" style={{ fontSize: '0.9rem', padding: '8px 16px', backgroundColor: '#3b82f6', borderColor: '#1e3a8a', color: '#fff' }} onClick={() => navigate('/')}>
            <div className="flex-center" style={{ gap: '8px' }}>
              <ArrowLeft size={18} /> SWITCH HERO
            </div>
          </button>
        </div>
        <h1 className="app-header" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>QuestBound</h1>
        <div />
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Character Sheet */}
        <div className="flex-col">
          <div className="panel">
            <h2 className="game-font panel-header">Character Sheet</h2>
            <div className="panel-inner flex-col items-center" style={{ paddingTop: '32px', borderColor: player.themeColor || '#10b981', borderWidth: '4px' }}>
              <div style={{ backgroundColor: '#374151', borderRadius: '50%', padding: '12px', border: `4px solid ${player.themeColor || '#10b981'}`, boxShadow: `0 8px 16px ${player.themeColor || '#10b981'}40`, marginBottom: '16px' }}>
                <AvatarDisplay config={player.avatarConfig || {}} size={140} />
              </div>
              <h3 className="game-font" style={{ fontSize: '1.6rem', color: '#fff' }}>{(player.name || 'UNKNOWN HERO').toUpperCase()}</h3>
              <p className="game-font" style={{ fontSize: '1rem', color: player.themeColor || '#10b981', letterSpacing: '0.5px', marginBottom: '24px' }}>{(player.title || 'NOVICE').toUpperCase()}</p>

              <div style={{ width: '100%' }}>
                <div className="flex-between game-font" style={{ fontSize: '1rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fff' }}>XP Bar</span>
                  <span style={{ color: player.themeColor || '#10b981' }}>{Math.floor(((player.xp || 0) / (player.maxXp || 100)) * 100)}%</span>
                </div>
                <div className="xp-bar-bg" style={{ height: '24px', borderRadius: '12px' }}>
                  <div className="xp-bar-fill" style={{ width: `${((player.xp || 0) / (player.maxXp || 100)) * 100}%`, backgroundColor: player.themeColor || '#10b981' }}></div>
                </div>
              </div>

              <div className="flex-center" style={{ gap: '8px', color: 'var(--color-quest)', marginTop: '24px', marginBottom: '24px', backgroundColor: '#1a2227', width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #111' }}>
                <Coins size={28} fill="currentColor" strokeWidth={2} />
                <span className="game-font" style={{ fontSize: '1.5rem' }}>{player.gold || 0} Gold</span>
              </div>

              <button
                className="btn-game"
                style={{ width: '100%', backgroundColor: '#3b82f6', borderColor: '#1e3a8a', color: '#fff', fontSize: '1rem', padding: '12px' }}
                onClick={() => {
                  setDraftAvatar({
                    name: dbPlayer.name || '',
                    themeColor: dbPlayer.themeColor || '#10b981',
                    avatarConfig: dbPlayer.avatarConfig || {}
                  });
                  setView('wardrobe');
                }}
                disabled={view === 'wardrobe'}
              >
                <div className="flex-center" style={{ gap: '8px' }}>
                  <Palette size={18} /> CUSTOMIZE AVATAR
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Center Column */}
        {view === 'quests' ? (
          <div className="flex-col">
            <div className="panel parchment">
              <h2 className="game-font panel-header">Weekly Quests</h2>
              <div className="panel-inner" style={{ padding: '24px' }}>
                <div className="quests-grid">
                  {quests
                    .filter(q => q.assignedTo === player.id || q.assignedTo === 'co-op' || !q.assignedTo)
                    .map(q => (
                      <div key={q.id} className="quest-paper flex-col" style={{ opacity: q.status === 'Completed' ? 0.6 : 1 }}>
                        <h3 className="game-font" style={{ marginBottom: '8px', fontSize: '1.3rem', lineHeight: '1.2', color: '#1e293b' }}>{(q.title || 'UNKNOWN QUEST').toUpperCase()}</h3>

                        {q.isNonNegotiable && (
                          <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 'bold', marginBottom: '8px', border: '1px solid #b45309', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', alignSelf: 'flex-start' }}>
                            NON-NEGOTIABLE
                          </div>
                        )}

                        <div className="flex-center" style={{ gap: '12px', marginBottom: '20px', fontSize: '1rem', fontWeight: 800 }}>
                          <div className="flex-center" style={{ gap: '4px', color: '#1e3a8a' }}>
                            <Star size={18} fill="#3b82f6" strokeWidth={1} /> {q.xp || 0} XP
                          </div>
                          <div className="flex-center" style={{ gap: '4px', color: '#334155' }}>
                            <Coins size={18} fill="#f59e0b" strokeWidth={1} /> {q.gold || 0}
                          </div>
                        </div>

                        <button
                          className={`btn-game ${q.status === 'Completed' ? 'success' : ''}`}
                          disabled={q.status === 'Completed'}
                          onClick={() => handleClaim(q)}
                        >
                          {q.status === 'Completed' ? 'CLAIMED' : 'CLAIM'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-col">
            <div className="panel parchment animate-bounce-in">
              <h2 className="game-font panel-header">The Wardrobe</h2>
              <div className="panel-inner" style={{ padding: '24px' }}>

                <div className="flex-center flex-col" style={{ marginBottom: '16px' }}>
                  <label className="game-font" style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>HERO NAME</label>
                  <input
                    type="text"
                    value={player.name || ''}
                    onChange={(e) => updateAvatar('name', e.target.value)}
                    className="game-font"
                    style={{
                      fontSize: '1.4rem',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: '3px solid #94a3b8',
                      backgroundColor: '#f1f5f9',
                      color: '#1e293b',
                      textAlign: 'center',
                      width: '75%',
                      maxWidth: '300px',
                      outline: 'none',
                      boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)'
                    }}
                  />
                </div>

                <div className="flex-center" style={{ gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {['Theme', 'Top', 'Face', 'Clothes', 'Accessories'].map(tab => (
                    <button
                      key={tab}
                      className={`btn-game`}
                      onClick={() => setWardrobeTab(tab)}
                      style={{ padding: '8px 20px', fontSize: '1.2rem', margin: 0, backgroundColor: wardrobeTab === tab ? '#10b981' : 'var(--color-quest)' }}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ backgroundColor: '#e2e8f0', borderRadius: '16px', padding: '24px', border: '3px solid #94a3b8', minHeight: '300px' }}>
                  {wardrobeTab === 'Theme' && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dictThemeColors.map(color => (
                        <div
                          key={color.label}
                          onClick={() => updateAvatar('themeColor', color.value)}
                          style={{
                            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: color.value,
                            border: '4px solid', borderColor: (player.themeColor || '#10b981') === color.value ? '#111' : 'rgba(0,0,0,0.1)',
                            cursor: 'pointer', transform: (player.themeColor || '#10b981') === color.value ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  )}
                  {wardrobeTab === 'Top' && (
                    <>
                      {renderOptionGrid(dictTop, 'top')}
                      <div style={{ height: '2px', backgroundColor: '#94a3b8', margin: '24px 0' }}></div>
                      <h3 className="game-font" style={{ color: '#1e293b', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem' }}>Hair Color</h3>
                      {renderColorGrid(dictHairColors, 'hairColor')}
                    </>
                  )}
                  {wardrobeTab === 'Clothes' && (
                    <>
                      {renderOptionGrid(dictClothing, 'clothing')}
                      <div style={{ height: '2px', backgroundColor: '#94a3b8', margin: '24px 0' }}></div>
                      <h3 className="game-font" style={{ color: '#1e293b', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem' }}>Clothes Color</h3>
                      {renderColorGrid(dictClothesColors, 'clothesColor')}
                    </>
                  )}
                  {wardrobeTab === 'Accessories' && renderOptionGrid(dictAccessories, 'accessories')}

                  {wardrobeTab === 'Face' && (
                    <>
                      <h3 className="game-font" style={{ color: '#1e293b', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem' }}>Skin Color</h3>
                      {renderColorGrid(dictSkinColors, 'skinColor')}
                      <div style={{ height: '2px', backgroundColor: '#94a3b8', margin: '24px 0' }}></div>
                      <h3 className="game-font" style={{ color: '#1e293b', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem' }}>Eyes</h3>
                      {renderOptionGrid(dictEyes, 'eyes')}
                      <div style={{ height: '2px', backgroundColor: '#94a3b8', margin: '24px 0' }}></div>
                      <h3 className="game-font" style={{ color: '#1e293b', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem' }}>Mouth</h3>
                      {renderOptionGrid(dictMouth, 'mouth')}
                    </>
                  )}
                </div>

                <div className="flex-center" style={{ marginTop: '32px' }}>
                  <button className="btn-game success" style={{ fontSize: '1.5rem', padding: '16px 48px' }} onClick={handleEquipAndReturn}>
                    EQUIP & RETURN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Reward Shop */}
        <div className="flex-col">
          <div className="panel">
            <h2 className="game-font panel-header">Reward Shop</h2>
            <div className="panel-inner" style={{ backgroundColor: '#374151' }}>
              {shopItems.map(item => {
                const ItemIcon = ICON_MAP[item.icon] || ICON_MAP.ShoppingBag;
                return (
                  <div key={item.id} className="shop-item">
                    <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '50%', border: '4px solid #0f172a' }}>
                      <ItemIcon size={24} color="#10b981" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="game-font" style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>{item.title.toUpperCase()}</div>
                      <div className="flex-center game-font" style={{ gap: '6px', color: 'var(--color-quest)', justifyContent: 'flex-start', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                        <Coins size={16} fill="currentColor" strokeWidth={2} /> {item.cost} Gold
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '32px' }}>
            <h2 className="game-font panel-header">Allowance Tracker</h2>
            <div className="panel-inner flex-col items-center" style={{ backgroundColor: '#374151', padding: '24px' }}>
              <div className="flex-between game-font" style={{ fontSize: '1rem', marginBottom: '8px', width: '100%' }}>
                <span style={{ color: '#fff' }}>Weekly Quests</span>
                <span style={{ color: '#f59e0b' }}>{player.weeklyNonNegotiablesCompleted || 0} / {player.weeklyNonNegotiablesTotal || 5}</span>
              </div>
              <div className="xp-bar-bg" style={{ height: '24px', borderRadius: '12px', width: '100%', backgroundColor: '#0f172a' }}>
                <div className="xp-bar-fill" style={{
                  width: `${Math.min(((player.weeklyNonNegotiablesCompleted || 0) / (player.weeklyNonNegotiablesTotal || 5)) * 100, 100)}%`,
                  backgroundColor: '#f59e0b',
                  boxShadow: '0 0 10px #f59e0b'
                }}></div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '16px', textAlign: 'center' }}>
                Complete your non-negotiable quests to fill the bar and earn your weekly pocket money!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
