import { useState, useEffect } from 'react';
import { TelegramWebApp } from '@twa-dev/sdk';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from 'ton-core';
import './App.css';

// --- 1. የሰርቨርህን አድራሻ እዚህ ጋ ገልጸናል ---
const API_URL = 'http://localhost:3001'; 

function BunaGame() {
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [level, setLevel] = useState(1);
  const [coinsPerTap, setCoinsPerTap] = useState(1);
  const [referrals, setReferrals] = useState(0);
  const [isTapped, setIsTapped] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    TelegramWebApp.ready();
    TelegramWebApp.expand();
    const initData = TelegramWebApp.initDataUnsafe;
    const id = initData?.user?.id?.toString() || 'guest';
    setUserId(id);
    
    // መጀመሪያ ዳታውን ከሰርቨር አምጣ
    if (id !== 'guest') {
        fetchPoints(id);
    }

    const interval = setInterval(regenEnergy, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. ዳታ ከሰርቨር ለማምጣት የተስተካከለ ---
  const fetchPoints = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/user/${id}`);
      const data = await res.json();
      if (data) {
        setPoints(data.points || 0);
        setEnergy(data.energy || 100);
        setLevel(data.level || 1);
        setCoinsPerTap(data.coinsPerTap || 1);
      }
    } catch (err) {
      console.error("Backend server አልተገኘም! node server.js መብራቱን አረጋግጥ።");
    }
  };

  // --- 3. ነጥብ ለመመዝገብ (Tap) የተስተካከለ ---
  const handleTap = async () => {
    if (energy <= 0) return;
    
    setIsTapped(true);
    const newPoints = points + (coinsPerTap * level);
    const newEnergy = energy - 1;
    
    setPoints(newPoints);
    setEnergy(newEnergy);

    try {
      await fetch(`${API_URL}/api/tap`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId: userId, 
            points: newPoints,
            energy: newEnergy 
        }) 
      });
    } catch (err) {
      console.error("ዳታ መመዝገብ አልተቻለም።");
    }
    
    setTimeout(() => setIsTapped(false), 150);
  };

  const regenEnergy = () => setEnergy(prev => Math.min(prev + 5, 100));

  // --- 4. Airdrop Claim የተስተካከለ ---
  const claimAirdrop = async () => {
    if (points < 1000) return alert('Min 1000 points!');
    
    try {
        await fetch(`${API_URL}/api/claim/${userId}`, { method: 'POST' });
        setPoints(0);
        alert('Airdrop claimed! Check wallet.');
    } catch (err) {
        alert('Claim Error: ሰርቨሩ እየሰራ አይደለም።');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD700] to-[#FF8C00] flex flex-col items-center justify-center p-4 text-black font-bold">
      <h1 className="text-5xl mb-8 animate-bounce">☕ Buna Game</h1>
      
      <div className="text-6xl mb-4">{points.toLocaleString()}</div>
      <p className="text-2xl mb-8">BUNA Points (Airdrop Ready!)</p>

      <div
        onClick={handleTap}
        className={`w-72 h-72 rounded-full bg-white shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${isTapped ? 'scale-95 rotate-12' : ''}`}
      >
        <div className="text-8xl animate-pulse">☕</div>
      </div>

      <div className="mt-12 w-full max-w-md space-y-4">
        <div className="flex justify-between">
          <span>Energy:</span> <span>{energy}</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-6">
          <div className="bg-green-500 h-6 rounded-full transition-all" style={{width: `${energy}%`}} />
        </div>
        <div>Level: {level} | Tap Power: {coinsPerTap}x</div>
      </div>

      <div className="mt-12 space-y-4 text-center">
        <TonConnectButton className="mx-auto" />
        <button onClick={claimAirdrop} className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold block w-full">
          Claim BUNA Airdrop!
        </button>
      </div>

      <p className="mt-8 text-center text-lg">
        Invite friends: t.me/{TelegramWebApp.initDataUnsafe?.user?.username || 'yourbot'}?start=ref_{userId}
      </p>
    </div>
  );
}

export default BunaGame;
