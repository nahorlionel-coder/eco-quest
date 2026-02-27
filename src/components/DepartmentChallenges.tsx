import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, Trophy, Users, ChevronRight, Loader2, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  team_a: string;
  team_b: string;
  target_points: number;
  team_a_points: number;
  team_b_points: number;
  start_date: string;
  end_date: string;
  status: string;
  reward_description: string | null;
  icon: string;
}

function timeRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Selesai';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}h ${hours}j tersisa`;
  return `${hours}j tersisa`;
}

export function DepartmentChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from('department_challenges')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data) setChallenges(data);
      setLoading(false);
    };
    fetchChallenges();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Belum ada tantangan aktif saat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
        <span className="text-3xl">⚔️</span>
        <h2 className="text-2xl font-bold font-display">Battle Divisi</h2>
        <Badge variant="outline" className="ml-auto border-destructive/40 text-destructive">
          <Flame className="w-3 h-3 mr-1" />LIVE
        </Badge>
      </motion.div>

      <div className="space-y-4">
        {challenges.map((challenge, index) => {
          const totalA = challenge.team_a_points;
          const totalB = challenge.team_b_points;
          const maxPoints = Math.max(totalA, totalB, challenge.target_points);
          const progressA = maxPoints > 0 ? (totalA / maxPoints) * 100 : 0;
          const progressB = maxPoints > 0 ? (totalB / maxPoints) * 100 : 0;
          const isExpanded = expanded === challenge.id;
          const leading = totalA > totalB ? 'a' : totalB > totalA ? 'b' : 'tie';

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="glass"
                className="overflow-hidden cursor-pointer border-primary/20 hover:border-primary/40 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : challenge.id)}
              >
                {/* Battle header gradient */}
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

                <CardContent className="p-4 space-y-4">
                  {/* Title & Timer */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{challenge.icon}</span>
                      <div>
                        <h3 className="font-bold font-display text-base leading-tight">{challenge.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Timer className="w-3 h-3" />
                          {timeRemaining(challenge.end_date)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {/* VS Display */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    {/* Team A */}
                    <div className="text-center space-y-1">
                      <div className={`text-sm font-bold font-display ${leading === 'a' ? 'text-primary' : 'text-foreground'}`}>
                        {challenge.team_a}
                      </div>
                      <div className={`text-2xl font-bold font-display ${leading === 'a' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {totalA.toLocaleString()}
                      </div>
                      <Progress value={progressA} className="h-2" />
                    </div>

                    {/* VS */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 border border-destructive/30"
                    >
                      <span className="font-black font-display text-destructive text-sm">VS</span>
                    </motion.div>

                    {/* Team B */}
                    <div className="text-center space-y-1">
                      <div className={`text-sm font-bold font-display ${leading === 'b' ? 'text-primary' : 'text-foreground'}`}>
                        {challenge.team_b}
                      </div>
                      <div className={`text-2xl font-bold font-display ${leading === 'b' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {totalB.toLocaleString()}
                      </div>
                      <Progress value={progressB} className="h-2" />
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-border/50 space-y-3">
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          {challenge.reward_description && (
                            <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
                              <Trophy className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <p className="text-sm text-primary">{challenge.reward_description}</p>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Target: {challenge.target_points.toLocaleString()} poin
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
