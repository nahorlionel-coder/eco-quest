import { motion } from 'framer-motion';
import { Zap, Recycle, Bike, Salad, Trophy, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { currentUser, categoryStats } from '@/data/mockData';

const categoryIcons = {
  energy: { icon: Zap, color: 'energy' as const },
  waste: { icon: Recycle, color: 'waste' as const },
  commute: { icon: Bike, color: 'commute' as const },
  food: { icon: Salad, color: 'food' as const },
};

export function StatsOverview() {
  const nextLevelPoints = currentUser.level * 500;
  const levelProgress = (currentUser.points % 500) / 5;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glow" className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentUser.avatar}
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold font-display">{currentUser.name}</h2>
                <p className="text-muted-foreground">{currentUser.department}</p>
              </div>
              <div className="text-right">
                <Badge variant="points" className="text-lg px-4 py-2">
                  <Trophy className="w-4 h-4 mr-1" />
                  #{currentUser.rank}
                </Badge>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="text-3xl font-bold font-display gradient-text">
                  {currentUser.points.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Poin</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="text-3xl font-bold font-display text-secondary">
                  Lv.{currentUser.level}
                </div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6 text-accent" />
                  <span className="text-3xl font-bold font-display text-accent">
                    {currentUser.streak}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Hari Streak</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Level {currentUser.level}</span>
                <span className="text-primary font-semibold">
                  {currentUser.points % 500} / 500 XP
                </span>
              </div>
              <Progress value={levelProgress} indicatorColor="gradient" className="h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        {Object.entries(categoryStats).map(([key, stat], index) => {
          const category = categoryIcons[key as keyof typeof categoryIcons];
          const Icon = category.icon;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Card variant="interactive" className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl bg-${category.color}/20`}>
                      <Icon className={`w-5 h-5 text-${category.color}`} />
                    </div>
                    <span className="font-semibold capitalize font-display">{key}</span>
                  </div>
                  <div className="text-2xl font-bold font-display">
                    {stat.points}
                    <span className="text-sm font-normal text-muted-foreground ml-1">pts</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.missions} misi selesai
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
