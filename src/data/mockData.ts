// Mock data for the application
export interface User {
  id: string;
  name: string;
  avatar: string;
  department: string;
  points: number;
  level: number;
  streak: number;
  rank: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'energy' | 'waste' | 'commute' | 'food';
  type: 'check-in' | 'photo' | 'qr';
  completed: boolean;
  icon: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  image: string;
  category: string;
  available: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  department: string;
  points: number;
  rank: number;
  change: 'up' | 'down' | 'same';
}

export interface DepartmentRank {
  id: string;
  name: string;
  totalPoints: number;
  memberCount: number;
  rank: number;
  avgPoints: number;
}

export const currentUser: User = {
  id: '1',
  name: 'Budi Santoso',
  avatar: '🧑‍💼',
  department: 'Engineering',
  points: 2450,
  level: 12,
  streak: 7,
  rank: 3,
};

export const dailyMissions: Mission[] = [
  {
    id: '1',
    title: 'Energy Saver',
    description: 'Matikan monitor saat istirahat makan siang',
    points: 10,
    category: 'energy',
    type: 'check-in',
    completed: false,
    icon: '💡',
  },
  {
    id: '2',
    title: 'Zero Waste Hero',
    description: 'Upload foto makan siang tanpa plastik sekali pakai',
    points: 50,
    category: 'waste',
    type: 'photo',
    completed: true,
    icon: '♻️',
  },
  {
    id: '3',
    title: 'Green Commute',
    description: 'Scan QR di area parkir sepeda atau lobi MRT',
    points: 50,
    category: 'commute',
    type: 'qr',
    completed: false,
    icon: '🚲',
  },
  {
    id: '4',
    title: 'Meatless Monday',
    description: 'Pilih menu vegetarian di kantin hari ini',
    points: 30,
    category: 'food',
    type: 'photo',
    completed: false,
    icon: '🥗',
  },
  {
    id: '5',
    title: 'Tumbler Time',
    description: 'Isi ulang tumbler di dispenser (scan QR)',
    points: 20,
    category: 'waste',
    type: 'qr',
    completed: true,
    icon: '🥤',
  },
  {
    id: '6',
    title: 'Stair Climber',
    description: 'Naik tangga minimal 3 lantai (scan QR di tangga)',
    points: 25,
    category: 'energy',
    type: 'qr',
    completed: false,
    icon: '🏃',
  },
];

export const rewards: Reward[] = [
  {
    id: '1',
    title: 'Voucher Kopi Gratis',
    description: 'Gratis 1 kopi di kantin kantor',
    pointsCost: 500,
    image: '☕',
    category: 'Food & Drink',
    available: true,
  },
  {
    id: '2',
    title: 'Pulang 1 Jam Lebih Awal',
    description: 'Pulang lebih awal di hari Jumat',
    pointsCost: 2000,
    image: '🎉',
    category: 'Time Off',
    available: true,
  },
  {
    id: '3',
    title: 'Merchandise Eco Bag',
    description: 'Tas belanja ramah lingkungan eksklusif',
    pointsCost: 800,
    image: '👜',
    category: 'Merchandise',
    available: true,
  },
  {
    id: '4',
    title: 'Donasi Penanaman Pohon',
    description: '1 pohon ditanam atas nama kamu',
    pointsCost: 300,
    image: '🌳',
    category: 'Charity',
    available: true,
  },
  {
    id: '5',
    title: 'Voucher Makan Siang',
    description: 'Gratis makan siang di kantin',
    pointsCost: 1000,
    image: '🍱',
    category: 'Food & Drink',
    available: true,
  },
  {
    id: '6',
    title: 'Premium Tumbler',
    description: 'Tumbler stainless steel premium',
    pointsCost: 1500,
    image: '🥤',
    category: 'Merchandise',
    available: false,
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Siti Rahayu', avatar: '👩‍💻', department: 'Marketing', points: 3200, rank: 1, change: 'same' },
  { id: '2', name: 'Ahmad Wijaya', avatar: '👨‍💼', department: 'Finance', points: 2890, rank: 2, change: 'up' },
  { id: '3', name: 'Budi Santoso', avatar: '🧑‍💼', department: 'Engineering', points: 2450, rank: 3, change: 'up' },
  { id: '4', name: 'Maya Putri', avatar: '👩‍🔬', department: 'R&D', points: 2340, rank: 4, change: 'down' },
  { id: '5', name: 'Riko Pratama', avatar: '👨‍🎨', department: 'Design', points: 2100, rank: 5, change: 'same' },
  { id: '6', name: 'Dewi Lestari', avatar: '👩‍🏫', department: 'HR', points: 1980, rank: 6, change: 'up' },
  { id: '7', name: 'Andi Saputra', avatar: '👨‍💻', department: 'Engineering', points: 1850, rank: 7, change: 'down' },
  { id: '8', name: 'Lisa Anggraeni', avatar: '👩‍⚕️', department: 'Operations', points: 1720, rank: 8, change: 'same' },
];

export const departmentRanks: DepartmentRank[] = [
  { id: '1', name: 'Engineering', totalPoints: 15400, memberCount: 25, rank: 1, avgPoints: 616 },
  { id: '2', name: 'Marketing', totalPoints: 12800, memberCount: 18, rank: 2, avgPoints: 711 },
  { id: '3', name: 'Finance', totalPoints: 9600, memberCount: 15, rank: 3, avgPoints: 640 },
  { id: '4', name: 'Design', totalPoints: 8200, memberCount: 12, rank: 4, avgPoints: 683 },
  { id: '5', name: 'HR', totalPoints: 6400, memberCount: 10, rank: 5, avgPoints: 640 },
];

export const categoryStats = {
  energy: { points: 580, missions: 12 },
  waste: { points: 890, missions: 18 },
  commute: { points: 650, missions: 8 },
  food: { points: 330, missions: 11 },
};
