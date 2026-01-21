import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Users, Building2, Medal, Crown, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { leaderboard, departmentRanks } from '@/data/mockData';

const rankIcons = {
  1: { icon: Crown, color: 'text-yellow-400' },
  2: { icon: Medal, color: 'text-gray-300' },
  3: { icon: Award, color: 'text-amber-600' },
};

const changeIcons = {
  up: { icon: TrendingUp, color: 'text-green-400' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  same: { icon: Minus, color: 'text-muted-foreground' },
};

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <span className="text-3xl">🏆</span>
        <h2 className="text-2xl font-bold font-display">Leaderboard</h2>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger
            value="individual"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display"
          >
            <Users className="w-4 h-4 mr-2" />
            Individu
          </TabsTrigger>
          <TabsTrigger
            value="department"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Departemen
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="individual" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {leaderboard.slice(0, 3).map((entry, index) => {
                  const podiumOrder = [1, 0, 2];
                  const actualEntry = leaderboard[podiumOrder[index]];
                  const RankIcon = rankIcons[actualEntry.rank as keyof typeof rankIcons]?.icon || Medal;
                  const rankColor = rankIcons[actualEntry.rank as keyof typeof rankIcons]?.color || 'text-primary';
                  const heights = ['h-28', 'h-36', 'h-24'];
                  
                  return (
                    <motion.div
                      key={actualEntry.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        className="text-4xl mb-2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {actualEntry.avatar}
                      </motion.div>
                      <div className={`w-full ${heights[index]} rounded-t-xl bg-gradient-to-t from-primary/30 to-primary/10 flex flex-col items-center justify-end pb-3`}>
                        <RankIcon className={`w-6 h-6 ${rankColor} mb-1`} />
                        <span className="font-bold font-display text-sm truncate w-full text-center px-1">
                          {actualEntry.name.split(' ')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {actualEntry.points.toLocaleString()} pts
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Full List */}
              {leaderboard.map((entry, index) => {
                const ChangeIcon = changeIcons[entry.change].icon;
                const changeColor = changeIcons[entry.change].color;
                const isCurrentUser = entry.name === 'Budi Santoso';
                
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      variant={isCurrentUser ? 'glow' : 'glass'}
                      className={isCurrentUser ? 'ring-2 ring-primary' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 text-center font-bold font-display text-lg">
                            {entry.rank <= 3 ? (
                              <span className={rankIcons[entry.rank as keyof typeof rankIcons]?.color}>
                                #{entry.rank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">#{entry.rank}</span>
                            )}
                          </div>
                          <div className="text-3xl">{entry.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold font-display truncate">
                              {entry.name}
                              {isCurrentUser && (
                                <Badge variant="glow" className="ml-2 text-xs">Kamu</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{entry.department}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold font-display text-primary">
                              {entry.points.toLocaleString()}
                            </div>
                            <ChangeIcon className={`w-4 h-4 ${changeColor} ml-auto`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="department" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {departmentRanks.map((dept, index) => {
                const RankIcon = rankIcons[dept.rank as keyof typeof rankIcons]?.icon || Medal;
                const rankColor = rankIcons[dept.rank as keyof typeof rankIcons]?.color || 'text-muted-foreground';
                
                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
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
                            <div className="text-sm text-muted-foreground">
                              {dept.memberCount} anggota • Avg: {dept.avgPoints} pts
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold font-display text-primary text-xl">
                              {dept.totalPoints.toLocaleString()}
                            </div>
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
