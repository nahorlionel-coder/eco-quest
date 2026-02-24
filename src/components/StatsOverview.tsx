import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Recycle, Bike, Salad, Trophy, Flame, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser, categoryStats } from '@/data/mockData';

export function StatsOverview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ points: number; level: number; streak: number; display_name: string | null; department: string | null; avatar_url: string | null } | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setProfile(data);
        // Get rank
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('points', data.points);
        setRank((count || 0) + 1);
      }
    };
    fetch();
  }, [user]);

  const displayUser = profile ? {
    name: profile.display_name || 'EcoWarrior',
    department: profile.department || '-',
    points: profile.points,
    level: profile.level,
    streak: profile.streak,
    avatar: '🧑‍💼',
    rank: rank || 0,
  } : currentUser;

  const nextLevelPoints = displayUser.level * 500;
  const levelProgress = (displayUser.points % 500) / 5;

  const categoryIcons = {
    energy: { icon: Zap, color: 'energy' as const },
    waste: { icon: Recycle, color: 'waste' as const },
    commute: { icon: Bike, color: 'commute' as const },
    food: { icon: Salad, color: 'food' as const },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card variant="glow" className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-4">
              <motion.div className="text-5xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                {displayUser.avatar}
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold font-display">{displayUser.name}</h2>
                <p className="text-muted-foreground">{displayUser.department}</p>
              </div>
              <div className="text-right">
                <Badge variant="points" className="text-lg px-4 py-2">
                  <Trophy className="w-4 h-4 mr-1" />#{displayUser.rank}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="text-3xl font-bold font-display gradient-text">{displayUser.points.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Poin</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="text-3xl font-bold font-display text-secondary">Lv.{displayUser.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6 text-accent" />
                  <span className="text-3xl font-bold font-display text-accent">{displayUser.streak}</span>
                </div>
                <div className="text-sm text-muted-foreground">Hari Streak</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Level {displayUser.level}</span>
                <span className="text-primary font-semibold">{displayUser.points % 500} / 500 XP</span>
              </div>
              <Progress value={levelProgress} indicatorColor="gradient" className="h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 gap-4">
        {Object.entries(categoryStats).map(([key, stat], index) => {
          const category = categoryIcons[key as keyof typeof categoryIcons];
          const Icon = category.icon;
          return (
            <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
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
                    {stat.points}<span className="text-sm font-normal text-muted-foreground ml-1">pts</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.missions} misi selesai</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
