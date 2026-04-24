import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Coins, Star, Clock, Car, IceCream, Book, ArrowLeft, Palette } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import './index.css';

// Curated selections from the DiceBear Avataaars library
const dictTop = ['straight01', 'curly', 'shortFlat', 'theCaesar', 'dreads01', 'shaggy', 'hat', 'hijab'];
const dictEyes = ['happy', 'smile', 'surprised', 'wink', 'squint', 'eyeRoll'];
const dictMouth = ['smile', 'twinkle', 'serious', 'grimace'];
const dictClothing = ['blazerAndShirt', 'blazerAndSweater', 'hoodie', 'overall', 'shirtCrewNeck'];
const dictAccessories = ['none', 'kurt', 'prescription01', 'round', 'sunglasses'];
const dictThemeColors = [
  { label: 'Emerald', value: '#10b981' },
  { label: 'Sapphire', value: '#3b82f6' },
  { label: 'Ruby', value: '#ef4444' },
  { label: 'Amethyst', value: '#8b5cf6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#ec4899' },
  { label: 'Slate', value: '#94a3b8' }
];

const dictSkinColors = ['614335', 'd08b5b', 'ae5d29', 'edb98a', 'ffdbb4', 'fd9841', 'f8d25c'];
const dictHairColors = ['2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'd6b370', 'e8e1e1', 'c93305', 'f59797'];

const initialPlayers = [
  { id: 'p1', name: 'Princess Luna', subtitle: 'Aged 7', title: 'Lvl 4 Novice Mage', 
    xp: 75, maxXp: 100, gold: 125, themeColor: '#8b5cf6',
    avatarConfig: { seed: 'Luna', top: ['curly'], clothing: ['hoodie'], eyes: ['happy'], mouth: ['smile'], accessories: [] }
  },
  { id: 'p2', name: 'Ranger Amelia', subtitle: 'Aged 9', title: 'Lvl 6 Apprentice Knight', 
    xp: 85, maxXp: 100, gold: 180, themeColor: '#10b981',
    avatarConfig: { seed: 'Amelia', top: ['shortFlat'], clothing: ['blazerAndShirt'], eyes: ['wink'], mouth: ['twinkle'], accessories: ['prescription01'] }
  },
];

const initialQuests = [
  { id: 'q1', title: 'Fold the Laundry', xp: 5, gold: 10, status: 'Available' },
  { id: 'q2', title: 'Math Magic', xp: 10, gold: 15, status: 'Available' },
  { id: 'q3', title: 'Reading Adventure', xp: 8, gold: 12, status: 'Available' },
  { id: 'q4', title: 'Clear the Table', xp: 6, gold: 8, status: 'Available' },
];

const shopItems = [
  { id: 's1', icon: Clock, title: '15min Screen Time', cost: 20 },
  { id: 's2', icon: Car, title: 'Car DJ', cost: 15 },
  { id: 's3', icon: IceCream, title: 'Ice Cream Trip', cost: 150 },
  { id: 's4', icon: Book, title: 'New Book', cost: 200 },
];

function AvatarDisplay({ config, size = 120 }) {
  const svg = useMemo(() => {
    return createAvatar(avataaars, {
      ...config,
      size: size,
      backgroundColor: ['transparent'],
      radius: 50,
      // Dicebear Avataaars checks probability for optional items to render. Force it if they selected something!
      accessoriesProbability: config.accessories && config.accessories.length > 0 && config.accessories[0] !== 'none' ? 100 : 0
    }).toDataUri();
  }, [config, size]);

  return <img src={svg} alt="Avatar" style={{ width: size, height: size, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} />;
}

function ProfileSelector({ players }) {
  const navigate = useNavigate();

  return (
    <div className="flex-col flex-center" style={{ minHeight: '80vh', gap: '32px' }}>
      <h1 className="app-header" style={{ fontSize: '4.5rem' }}>Who goes there?</h1>
      <div className="flex-center" style={{ gap: '32px' }}>
        {players.map(p => {
          return (
            <div 
              key={p.id} 
              className="panel" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', width: '280px' }}
              onClick={() => navigate(`/dashboard/${p.id}`)}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="panel-inner flex-col flex-center" style={{ gap: '16px', padding: '32px 16px' }}>
                <div style={{ backgroundColor: '#2d1d13', borderRadius: '50%', padding: '8px', border: '4px solid #d4ba94', boxShadow: '0 8px 16px rgba(0,0,0,0.4)'}}>
                  <AvatarDisplay config={p.avatarConfig} size={140} />
                </div>
                <h2 className="game-font" style={{ color: '#fff', fontSize: '2rem', letterSpacing: '1px', marginTop: '8px' }}>{p.name.toUpperCase()}</h2>
                <div className="game-font" style={{ color: p.themeColor, letterSpacing: '0.5px' }}>{p.title.toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({ players, setPlayers, quests, setQuests, shopItems }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const player = players.find(p => p.id === id);
  const [view, setView] = useState('quests'); // 'quests' or 'wardrobe'
  const [wardrobeTab, setWardrobeTab] = useState('Top');

  if (!player) return <div>Hero not found...</div>;

  const handleClaim = (quest) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === player.id) {
        let newXp = p.xp + quest.xp;
        let newMax = p.maxXp;
        if (newXp >= p.maxXp) {
          newXp = newXp - p.maxXp;
          newMax = p.maxXp + 50; 
        }
        return { ...p, xp: newXp, maxXp: newMax, gold: p.gold + quest.gold };
      }
      return p;
    }));
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, status: 'Completed' } : q));
  };

  const updateAvatar = (key, value) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === player.id) {
        if (key === 'themeColor') {
          return { ...p, themeColor: value };
        }
        return { ...p, avatarConfig: { ...p.avatarConfig, [key]: value === 'none' ? [] : [value] } };
      }
      return p;
    }));
  };

  const renderOptionGrid = (options, key) => (
    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px', justifyContent: 'center'}}>
      {options.map(opt => {
        const isSelected = player.avatarConfig[key]?.[0] === opt || (opt === 'none' && (!player.avatarConfig[key] || player.avatarConfig[key].length === 0));
        return (
          <div 
            key={opt}
            style={{
              backgroundColor: isSelected ? 'var(--color-success)' : '#2d1d13',
              padding: '12px',
              borderRadius: '16px',
              border: '4px solid',
              borderColor: isSelected ? '#10b981' : '#160d07',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSelected ? `0 4px 0 rgba(0,0,0,0.2)` : 'none'
            }}
            onClick={() => updateAvatar(key, opt)}
            title={opt.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
          >
             <AvatarDisplay 
                config={{
                   ...player.avatarConfig,
                   [key]: opt === 'none' ? [] : [opt]
                }} 
                size={80} 
             />
          </div>
        );
      })}
    </div>
  );

  const renderColorGrid = (options, key) => (
    <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px', justifyContent: 'center'}}>
      {options.map(color => {
        const isSelected = player.avatarConfig[key]?.[0] === color;
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
      })}
    </div>
  );

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <button className="btn-game" style={{ fontSize: '1rem', padding: '8px 16px' }} onClick={() => navigate('/')}>
          <div className="flex-center" style={{gap: '8px'}}>
            <ArrowLeft size={18} /> SWITCH HERO
          </div>
        </button>
        <h1 className="app-header" style={{ marginBottom: 0 }}>QuestBound</h1>
        <div style={{ width: 140 }}></div>
      </div>
      
      <div className="dashboard-grid">
        {/* Left Column: Character Sheet */}
        <div className="flex-col">
          <div className="panel">
            <h2 className="game-font panel-header">Character Sheet</h2>
            <div className="panel-inner flex-col flex-center" style={{ paddingTop: '32px', borderColor: player.themeColor, borderWidth: '4px' }}>
              <div style={{ backgroundColor: '#2d1d13', borderRadius: '50%', padding: '12px', border: `4px solid ${player.themeColor}`, boxShadow: `0 8px 16px ${player.themeColor}40`, marginBottom: '16px'}}>
                 <AvatarDisplay config={player.avatarConfig} size={140} />
              </div>
              <h3 className="game-font" style={{fontSize: '1.6rem', color: '#fff'}}>{player.name.toUpperCase()}</h3>
              <p style={{fontSize: '1rem', color: 'var(--color-text)'}}>{player.subtitle}</p>
              <p className="game-font" style={{fontSize: '1rem', color: player.themeColor, letterSpacing: '0.5px', marginBottom: '24px'}}>{player.title.toUpperCase()}</p>

              <div style={{ width: '100%' }}>
                <div className="flex-between game-font" style={{ fontSize: '1rem', marginBottom: '4px' }}>
                  <span style={{color: '#fff'}}>XP Bar</span>
                  <span style={{color: player.themeColor}}>{Math.floor((player.xp / player.maxXp) * 100)}%</span>
                </div>
                <div className="xp-bar-bg" style={{height: '24px', borderRadius: '12px'}}>
                  <div className="xp-bar-fill" style={{ width: `${(player.xp / player.maxXp) * 100}%`, backgroundColor: player.themeColor }}></div>
                </div>
              </div>
              
              <div className="flex-center" style={{ gap: '8px', color: 'var(--color-quest)', marginTop: '24px', marginBottom: '24px', backgroundColor: '#1a2227', width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #111' }}>
                <Coins size={28} fill="currentColor" strokeWidth={2} />
                <span className="game-font" style={{fontSize: '1.5rem'}}>{player.gold} Gold</span>
              </div>

              <button 
                className="btn-game" 
                style={{width: '100%', backgroundColor: '#3b82f6', borderColor: '#1e3a8a', color: '#fff', fontSize: '1rem', padding: '12px'}} 
                onClick={() => setView('wardrobe')}
                disabled={view === 'wardrobe'}
              >
                <div className="flex-center" style={{gap: '8px'}}>
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
              <h2 className="game-font panel-header">Daily Bounties</h2>
              <div className="panel-inner" style={{ padding: '24px' }}>
                <div className="quests-grid">
                  {quests.map(q => (
                    <div key={q.id} className="quest-paper flex-col" style={{ opacity: q.status === 'Completed' ? 0.6 : 1 }}>
                      <h3 className="game-font" style={{ marginBottom: '16px', fontSize: '1.3rem', lineHeight: '1.2', color: '#3d2616' }}>{q.title.toUpperCase()}</h3>
                      
                      <div className="flex-center" style={{ gap: '12px', marginBottom: '20px', fontSize: '1rem', fontWeight: 800 }}>
                        <div className="flex-center" style={{ gap: '4px', color: '#1e3a8a' }}>
                          <Star size={18} fill="#3b82f6" strokeWidth={1} /> {q.xp} XP
                        </div>
                        <div className="flex-center" style={{ gap: '4px', color: '#78350f' }}>
                          <Coins size={18} fill="#f59e0b" strokeWidth={1} /> {q.gold}
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

                <div style={{ backgroundColor: '#fdf6e8', borderRadius: '16px', padding: '24px', border: '3px solid #d4ba94', minHeight: '300px' }}>
                  {wardrobeTab === 'Theme' && (
                    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center'}}>
                      {dictThemeColors.map(color => (
                        <div 
                          key={color.label}
                          onClick={() => updateAvatar('themeColor', color.value)}
                          style={{
                            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: color.value,
                            border: '4px solid', borderColor: player.themeColor === color.value ? '#111' : 'rgba(0,0,0,0.1)',
                            cursor: 'pointer', transform: player.themeColor === color.value ? 'scale(1.1)' : 'scale(1)',
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
                        <div style={{height: '2px', backgroundColor: '#d4ba94', margin: '24px 0'}}></div>
                        <h3 className="game-font" style={{color: '#3d2616', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem'}}>Hair Color</h3>
                        {renderColorGrid(dictHairColors, 'hairColor')}
                     </>
                  )}
                  {wardrobeTab === 'Clothes' && renderOptionGrid(dictClothing, 'clothing')}
                  {wardrobeTab === 'Accessories' && renderOptionGrid(dictAccessories, 'accessories')}

                  {wardrobeTab === 'Face' && (
                     <>
                        <h3 className="game-font" style={{color: '#3d2616', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem'}}>Skin Color</h3>
                        {renderColorGrid(dictSkinColors, 'skinColor')}
                        <div style={{height: '2px', backgroundColor: '#d4ba94', margin: '24px 0'}}></div>
                        <h3 className="game-font" style={{color: '#3d2616', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem'}}>Eyes</h3>
                        {renderOptionGrid(dictEyes, 'eyes')}
                        <div style={{height: '2px', backgroundColor: '#d4ba94', margin: '24px 0'}}></div>
                        <h3 className="game-font" style={{color: '#3d2616', marginBottom: '16px', textAlign: 'center', fontSize: '1.5rem'}}>Mouth</h3>
                        {renderOptionGrid(dictMouth, 'mouth')}
                     </>
                  )}
                </div>

                <div className="flex-center" style={{ marginTop: '32px' }}>
                  <button className="btn-game success" style={{fontSize: '1.5rem', padding: '16px 48px'}} onClick={() => setView('quests')}>
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
            <div className="panel-inner" style={{backgroundColor: '#2d1d13'}}>
              {shopItems.map(item => (
                <div key={item.id} className="shop-item">
                  <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '50%', border: '4px solid #160d07' }}>
                    <item.icon size={24} color="#10b981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="game-font" style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>{item.title.toUpperCase()}</div>
                    <div className="flex-center game-font" style={{ gap: '6px', color: 'var(--color-quest)', justifyContent: 'flex-start', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                      <Coins size={16} fill="currentColor" strokeWidth={2} /> {item.cost} Gold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [players, setPlayers] = useState(initialPlayers);
  const [quests, setQuests] = useState(initialQuests);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelector players={players} />} />
        <Route path="/dashboard/:id" element={
          <Dashboard 
            players={players} 
            setPlayers={setPlayers}
            quests={quests}
            setQuests={setQuests}
            shopItems={shopItems}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default MainApp;
