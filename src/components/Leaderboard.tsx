import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Users, Building2, Medal, Crown, Award, Loader2, Ticket, Swords, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { battleChampions } from '@/data/mockData';
import kompasTVLogo from '@/assets/aset-eco-kompastv-logo.svg';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  department: string | null;
  points: number;
  rank: number;
}

const rankIcons = {
  1: { icon: Crown, color: 'text-yellow-400' },
  2: { icon: Medal, color: 'text-gray-300' },
  3: { icon: Award, color: 'text-amber-600' },
};

export function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('individual');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, department, points')
        .order('points', { ascending: false })
        .limit(20);

      if (data) {
        setEntries(data.map((p, i) => ({ ...p, rank: i + 1 })));
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  // Department aggregation
  const deptMap = new Map<string, { total: number; count: number }>();
  entries.forEach(e => {
    const dept = e.department || 'Lainnya';
    const prev = deptMap.get(dept) || { total: 0, count: 0 };
    deptMap.set(dept, { total: prev.total + e.points, count: prev.count + 1 });
  });
  const departments = Array.from(deptMap.entries())
    .map(([name, { total, count }], i) => ({ name, totalPoints: total, memberCount: count, avgPoints: Math.round(total / count), rank: i + 1 }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((d, i) => ({ ...d, rank: i + 1 }));

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
        <span className="text-3xl">🏆</span>
        <h2 className="text-2xl font-bold font-display">Leaderboard</h2>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="individual" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display">
            <Users className="w-4 h-4 mr-2" />Individu
          </TabsTrigger>
          <TabsTrigger value="department" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display">
            <Building2 className="w-4 h-4 mr-2" />Departemen
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="individual" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 mt-6">
                  {[1, 0, 2].map((podiumIdx, idx) => {
                    const entry = entries[podiumIdx];
                    if (!entry) return null;
                    const heights = ['h-20 sm:h-24', 'h-28 sm:h-32', 'h-16 sm:h-20'];
                    const positions = ['2nd', '1st', '3rd'];
                    const colors = ['from-gray-400 to-gray-600', 'from-yellow-400 to-yellow-600', 'from-amber-600 to-amber-800'];
                    return (
                      <motion.div 
                        key={entry.user_id} 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 border-4 border-white/20 shadow-lg">
                          👤
                        </div>
                        
                        <div className={`w-full ${heights[idx]} rounded-t-2xl bg-gradient-to-t ${colors[idx]} flex flex-col items-center ${
                          idx === 1 ? 'justify-center' : 'justify-end pb-3'
                        } shadow-xl relative overflow-hidden`}>
                          {entry.rank === 1 && (
                            <div className="absolute inset-0">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                                  style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${20 + (i % 2) * 30}%`,
                                  }}
                                  animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="text-white font-bold text-base sm:text-lg font-display mb-1">{positions[idx]}</div>
                          <div className="text-white/90 font-semibold text-xs sm:text-sm truncate w-full text-center px-1 sm:px-2 mb-1">
                            {(entry.display_name || 'User').split(' ')[0]}
                          </div>
                          <div className="text-white/70 text-xs font-bold">
                            {entry.points.toLocaleString()} pts
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                {entries.map((entry, index) => {
                  const isCurrentUser = user?.id === entry.user_id;
                  const isTopThree = entry.rank <= 3;
                  const rankColors = {
                    1: 'from-yellow-400 to-yellow-600',
                    2: 'from-gray-400 to-gray-600', 
                    3: 'from-amber-600 to-amber-800'
                  };
                  
                  return (
                    <motion.div 
                      key={entry.user_id} 
                      initial={{ opacity: 0, x: -30 }} 
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="cursor-pointer"
                      >
                        <Card 
                          variant={isCurrentUser ? 'glow' : 'glass'} 
                          className={`overflow-hidden transition-all duration-300 ${
                            isCurrentUser ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                          } ${
                            isTopThree ? 'border-l-4 border-l-primary' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="relative">
                                {isTopThree ? (
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${rankColors[entry.rank as keyof typeof rankColors]} flex items-center justify-center shadow-lg`}>
                                    <span className="text-white font-bold text-sm sm:text-lg">#{entry.rank}</span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                                    <span className="text-muted-foreground font-bold text-xs sm:text-sm">#{entry.rank}</span>
                                  </div>
                                )}
                                
                                {entry.rank === 1 && (
                                  <motion.div
                                    className="absolute -top-2 -right-1 text-yellow-400"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    👑
                                  </motion.div>
                                )}
                              </div>
                              
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl sm:text-2xl border-2 border-white/10">
                                👤
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold font-display text-base sm:text-lg truncate">
                                    {entry.display_name || 'EcoWarrior'}
                                  </h3>
                                  {isCurrentUser && (
                                    <Badge variant="glow" className="text-xs px-2 py-1">
                                      🚀 You
                                    </Badge>
                                  )}
                                  {isTopThree && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs px-2 py-1 ${
                                        entry.rank === 1 ? 'border-yellow-400 text-yellow-400' :
                                        entry.rank === 2 ? 'border-gray-400 text-gray-400' :
                                        'border-amber-600 text-amber-600'
                                      }`}
                                    >
                                      #{entry.rank}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                  {entry.department || 'Software Engineer'} • {(entry.company || 'KG Media').replace('KG Media', 'KG')}
                                </p>
                                
                                {isTopThree && (
                                  <div className="mt-2">
                                    <div className="w-full bg-muted/30 rounded-full h-1.5">
                                      <motion.div
                                        className={`h-1.5 rounded-full bg-gradient-to-r ${
                                          entry.rank === 1 ? 'from-yellow-400 to-yellow-600' :
                                          entry.rank === 2 ? 'from-gray-400 to-gray-600' :
                                          'from-amber-600 to-amber-800'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (entry.points / 3500) * 100)}%` }}
                                        transition={{ duration: 1.5, delay: index * 0.1 }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className={`font-bold font-display text-xl sm:text-2xl ${
                                  isTopThree ? 'text-primary' : 'text-foreground'
                                }`}>
                                  {entry.points.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground font-semibold">
                                  points
                                </div>
                                
                                <div className="flex items-center justify-end mt-1">
                                  {entry.change === 'up' && (
                                    <div className="flex items-center text-green-400 text-xs">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      <span className="font-semibold">UP</span>
                                    </div>
                                  )}
                                  {entry.change === 'down' && (
                                    <div className="flex items-center text-red-400 text-xs">
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                      <span className="font-semibold">DOWN</span>
                                    </div>
                                  )}
                                  {entry.change === 'same' && (
                                    <div className="flex items-center text-muted-foreground text-xs">
                                      <Minus className="w-3 h-3 mr-1" />
                                      <span className="font-semibold">SAME</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {entries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada data leaderboard</p>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="department" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {departments.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 mt-6">
                  {[1, 0, 2].map((podiumIdx, idx) => {
                    const dept = departments[podiumIdx];
                    if (!dept) return null;
                    const heights = ['h-20 sm:h-24', 'h-28 sm:h-32', 'h-16 sm:h-20'];
                    const positions = ['2nd', '1st', '3rd'];
                    const colors = ['from-gray-400 to-gray-600', 'from-yellow-400 to-yellow-600', 'from-amber-600 to-amber-800'];
                    const isKompasTV = dept.name === 'Kompas TV';
                    
                    return (
                      <motion.div 
                        key={dept.name} 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3 sm:mb-4 border-4 border-white/20 shadow-lg">
                          {isKompasTV ? (
                            <img 
                              src={kompasTVLogo} 
                              alt="Kompas TV" 
                              className="w-6 h-6 sm:w-8 sm:h-8"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          )}
                        </div>
                        
                        <div className={`w-full ${heights[idx]} rounded-t-2xl bg-gradient-to-t ${colors[idx]} flex flex-col items-center ${
                          idx === 1 ? 'justify-center' : 'justify-end pb-3'
                        } shadow-xl relative overflow-hidden`}>
                          {dept.rank === 1 && (
                            <div className="absolute inset-0">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                                  style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${20 + (i % 2) * 30}%`,
                                  }}
                                  animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="text-white font-bold text-base sm:text-lg font-display mb-1">{positions[idx]}</div>
                          <div className="text-white/90 font-semibold text-xs sm:text-sm truncate w-full text-center px-1 sm:px-2 mb-1">
                            {dept.name}
                          </div>
                          <div className="text-white/70 text-xs font-bold">
                            {dept.totalPoints.toLocaleString()} pts
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="space-y-3">
                {departments.map((dept, index) => {
                  const isTopThree = dept.rank <= 3;
                  const isKompasTV = dept.name === 'Kompas TV';
                  const rankColors = {
                    1: 'from-yellow-400 to-yellow-600',
                    2: 'from-gray-400 to-gray-600', 
                    3: 'from-amber-600 to-amber-800'
                  };
                  
                  return (
                    <motion.div 
                      key={dept.name} 
                      initial={{ opacity: 0, x: -30 }} 
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="cursor-pointer"
                      >
                        <Card 
                          variant="glass" 
                          className={`overflow-hidden transition-all duration-300 ${
                            isTopThree ? 'border-l-4 border-l-primary' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="relative">
                                {isTopThree ? (
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${rankColors[dept.rank as keyof typeof rankColors]} flex items-center justify-center shadow-lg`}>
                                    <span className="text-white font-bold text-sm sm:text-lg">#{dept.rank}</span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                                    <span className="text-muted-foreground font-bold text-xs sm:text-sm">#{dept.rank}</span>
                                  </div>
                                )}
                                
                                {dept.rank === 1 && (
                                  <motion.div
                                    className="absolute -top-2 -right-1 text-yellow-400"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    👑
                                  </motion.div>
                                )}
                              </div>
                              
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-white/10">
                                {isKompasTV ? (
                                  <img 
                                    src={kompasTVLogo} 
                                    alt="Kompas TV" 
                                    className="w-6 h-6 sm:w-7 sm:h-7"
                                  />
                                ) : (
                                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold font-display text-base sm:text-lg">
                                    {dept.name}
                                  </h3>
                                  {isTopThree && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs px-2 py-1 ${
                                        dept.rank === 1 ? 'border-yellow-400 text-yellow-400' :
                                        dept.rank === 2 ? 'border-gray-400 text-gray-400' :
                                        'border-amber-600 text-amber-600'
                                      }`}
                                    >
                                      #{dept.rank}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">
                                  {dept.memberCount} members • Avg: {dept.avgPoints} pts
                                </p>
                                
                                {isTopThree && (
                                  <div className="mt-2">
                                    <div className="w-full bg-muted/30 rounded-full h-1.5">
                                      <motion.div
                                        className={`h-1.5 rounded-full bg-gradient-to-r ${
                                          dept.rank === 1 ? 'from-yellow-400 to-yellow-600' :
                                          dept.rank === 2 ? 'from-gray-400 to-gray-600' :
                                          'from-amber-600 to-amber-800'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (dept.totalPoints / 16000) * 100)}%` }}
                                        transition={{ duration: 1.5, delay: index * 0.1 }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className={`font-bold font-display text-xl sm:text-2xl ${
                                  isTopThree ? 'text-primary' : 'text-foreground'
                                }`}>
                                  {dept.totalPoints.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground font-semibold">
                                  total points
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
      {/* Enhanced Game Rewards Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="space-y-6 mt-8"
      >
        {/* Header with countdown */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <span className="text-3xl">🎮</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-display gradient-text">Arena Hadiah</h3>
                <p className="text-sm text-muted-foreground">Kompetisi mingguan & bulanan untuk para eco-warriors</p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 text-sm shadow-lg">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  ⏰ Pengumuman Jumat
                </motion.div>
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Setiap minggu pukul 17:00</div>
            </div>
          </div>
          
          {/* Progress bar for week */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress Minggu Ini</span>
              <span>5/7 hari</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: '71%' }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Main featured competition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <Card className="overflow-hidden bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-400/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-400/5" />
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                FEATURED
              </Badge>
            </div>
            
            <CardContent className="p-6 relative">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
                      <span className="text-3xl">👑</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold font-display">The Three Barons</h4>
                      <p className="text-muted-foreground">Kompetisi bulanan bergengsi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <div className="font-semibold">3 Pemenang Utama</div>
                        <div className="text-sm text-muted-foreground">Berdasarkan total poin bulanan</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                      <span className="text-2xl">💰</span>
                      <div>
                        <div className="font-semibold">Hadiah Eksklusif</div>
                        <div className="text-sm text-muted-foreground">Voucher, merchandise, dan surprise gifts</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-yellow-400/50 text-yellow-400">
                      Reset setiap bulan
                    </Badge>
                    <Badge variant="outline" className="border-orange-400/50 text-orange-400">
                      18 hari tersisa
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="text-sm text-muted-foreground mb-2">Kandidat Baron Bulan Ini</div>
                  </div>
                  
                  {entries.slice(0, 3).map((entry, index) => {
                    const positions = ['🥇 Baron Emas', '🥈 Baron Perak', '🥉 Baron Perunggu'];
                    const colors = ['from-yellow-400 to-yellow-600', 'from-gray-400 to-gray-600', 'from-amber-600 to-amber-800'];
                    
                    return (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${colors[index]} shadow-lg`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-white font-bold">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">
                            {(entry.display_name || 'EcoWarrior').split(' ')[0]}
                          </div>
                          <div className="text-white/80 text-sm">{entry.points.toLocaleString()} pts</div>
                        </div>
                        <div className="text-white/90 text-sm font-medium">
                          {positions[index].split(' ')[0]}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Other competitions grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weekly Knights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="cursor-pointer group"
          >
            <Card className="h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300">
              <CardContent className="p-5">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <h4 className="font-bold font-display text-lg">Weekly Knights</h4>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30 text-xs mt-1">
                    Mingguan
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10">
                    <span className="text-purple-400">🏅 Pemenang</span>
                    <span>Top 3</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10">
                    <span className="text-purple-400">📊 Basis</span>
                    <span>Poin mingguan</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10">
                    <span className="text-purple-400">⏰ Reset</span>
                    <span>Setiap Senin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lucky Draw */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="cursor-pointer group"
          >
            <Card className="h-full bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-400/30 group-hover:border-green-400/60 transition-all duration-300">
              <CardContent className="p-5">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg mb-3">
                    <motion.span 
                      className="text-2xl"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      🎲
                    </motion.span>
                  </div>
                  <h4 className="font-bold font-display text-lg">Lucky Draw</h4>
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs mt-1">
                    Bulanan
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                    <span className="text-green-400">🎟️ Pemenang</span>
                    <span>1 Lucky</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                    <span className="text-green-400">📌 Syarat</span>
                    <span>Min 50 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                    <span className="text-green-400">⭐ Bonus</span>
                    <span>Newbie 2×</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Battle Arena */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="cursor-pointer group"
          >
            <Card className="h-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/30 group-hover:border-red-400/60 transition-all duration-300">
              <CardContent className="p-5">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg mb-3">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <h4 className="font-bold font-display text-lg">Battle Arena</h4>
                  <Badge className="bg-red-500/20 text-red-400 border-red-400/30 text-xs mt-1">
                    Live Battle
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  {battleChampions.slice(0, 2).map((champion, index) => {
                    const isLeading = champion.isLeading;
                    return (
                      <motion.div
                        key={champion.id}
                        animate={isLeading ? { 
                          scale: [1, 1.05, 1],
                          boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 4px rgba(239, 68, 68, 0.3)', '0 0 0 0 rgba(239, 68, 68, 0)']
                        } : {}}
                        transition={isLeading ? { duration: 2, repeat: Infinity } : {}}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                          isLeading 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40' 
                            : 'bg-red-500/10'
                        }`}
                      >
                        <span className="text-lg">{champion.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm truncate ${
                            isLeading ? 'text-yellow-400' : 'text-foreground'
                          }`}>
                            {champion.name.split(' ')[0]}
                            {isLeading && <span className="ml-1">👑</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {champion.points} pts
                          </div>
                        </div>
                        {isLeading && (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-yellow-400"
                          >
                            🏆
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="text-center">
                  <Badge variant="outline" className="border-red-400/50 text-red-400 text-xs">
                    🔥 Battle sedang berlangsung
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
