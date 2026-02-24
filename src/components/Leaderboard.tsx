import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Users, Building2, Medal, Crown, Award, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
              {/* Top 3 Podium */}
              {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[1, 0, 2].map((podiumIdx, idx) => {
                    const entry = entries[podiumIdx];
                    if (!entry) return null;
                    const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons]?.icon || Medal;
                    const rankColor = rankIcons[entry.rank as keyof typeof rankIcons]?.color || 'text-primary';
                    const heights = ['h-28', 'h-36', 'h-24'];
                    return (
                      <motion.div key={entry.user_id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }} className="flex flex-col items-center"
                      >
                        <motion.div className="text-4xl mb-2" animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                        >
                          {entry.avatar_url ? '👤' : '👤'}
                        </motion.div>
                        <div className={`w-full ${heights[idx]} rounded-t-xl bg-gradient-to-t from-primary/30 to-primary/10 flex flex-col items-center justify-end pb-3`}>
                          <RankIcon className={`w-6 h-6 ${rankColor} mb-1`} />
                          <span className="font-bold font-display text-sm truncate w-full text-center px-1">
                            {(entry.display_name || 'User').split(' ')[0]}
                          </span>
                          <span className="text-xs text-muted-foreground">{entry.points.toLocaleString()} pts</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full List */}
              {entries.map((entry, index) => {
                const isCurrentUser = user?.id === entry.user_id;
                return (
                  <motion.div key={entry.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card variant={isCurrentUser ? 'glow' : 'glass'} className={isCurrentUser ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 text-center font-bold font-display text-lg">
                            {entry.rank <= 3 ? (
                              <span className={rankIcons[entry.rank as keyof typeof rankIcons]?.color}>#{entry.rank}</span>
                            ) : (
                              <span className="text-muted-foreground">#{entry.rank}</span>
                            )}
                          </div>
                          <div className="text-3xl">👤</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold font-display truncate">
                              {entry.display_name || 'EcoWarrior'}
                              {isCurrentUser && <Badge variant="glow" className="ml-2 text-xs">Kamu</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">{entry.department || '-'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold font-display text-primary">{entry.points.toLocaleString()}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {entries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada data leaderboard</p>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="department" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              {departments.map((dept, index) => {
                const RankIcon = rankIcons[dept.rank as keyof typeof rankIcons]?.icon || Medal;
                const rankColor = rankIcons[dept.rank as keyof typeof rankIcons]?.color || 'text-muted-foreground';
                return (
                  <motion.div key={dept.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card variant="glass">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <RankIcon className={`w-5 h-5 ${rankColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold font-display">{dept.name}</div>
                            <div className="text-sm text-muted-foreground">{dept.memberCount} anggota • Avg: {dept.avgPoints} pts</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold font-display text-primary text-xl">{dept.totalPoints.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">total poin</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
