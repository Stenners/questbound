// Run with: node scripts/seed-emulator.mjs
// Requires the Firestore emulator to be running on port 8080

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, setDoc, doc, collection, addDoc } from 'firebase/firestore';

const app = initializeApp({ projectId: 'questbound-stenners' });
const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8080);

const players = [
  { id: 'player-1', name: 'Hero One', gold: 100, xp: 50, level: 1 },
  { id: 'player-2', name: 'Hero Two', gold: 10, xp: 20, level: 1 },
];

const rewards = [
  { title: 'Extra Screen Time', cost: 30, icon: 'Tv' },
  { title: 'Ice Cream Trip', cost: 50, icon: 'IceCream' },
  { title: 'Choose Dinner', cost: 20, icon: 'Utensils' },
  { title: 'Movie Night Pick', cost: 40, icon: 'Film' },
];

const quests = [
  { title: 'Clean Your Room', xp: 10, gold: 10, assignedTo: 'co-op', status: 'Available', frequency: 'daily', isNonNegotiable: false },
  { title: 'Do Homework', xp: 20, gold: 15, assignedTo: 'player-1', status: 'Available', frequency: 'daily', isNonNegotiable: true },
];

for (const { id, ...data } of players) {
  await setDoc(doc(db, 'players', id), data);
}
for (const reward of rewards) {
  await addDoc(collection(db, 'rewards'), reward);
}
for (const quest of quests) {
  await addDoc(collection(db, 'quests'), quest);
}

console.log('Emulator seeded. Open http://localhost:4000 to inspect data.');
process.exit(0);
