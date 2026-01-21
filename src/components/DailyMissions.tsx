import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, QrCode, Zap, Recycle, Bike, Salad, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dailyMissions, type Mission } from '@/data/mockData';

const categoryConfig = {
  energy: { icon: Zap, color: 'energy' as const, bg: 'bg-energy/20', text: 'text-energy' },
  waste: { icon: Recycle, color: 'waste' as const, bg: 'bg-waste/20', text: 'text-waste' },
  commute: { icon: Bike, color: 'commute' as const, bg: 'bg-commute/20', text: 'text-commute' },
  food: { icon: Salad, color: 'food' as const, bg: 'bg-food/20', text: 'text-food' },
};

const typeIcons = {
  'check-in': Check,
  'photo': Camera,
  'qr': QrCode,
};

interface MissionCardProps {
  mission: Mission;
  onClaim: (id: string) => void;
}

function MissionCard({ mission, onClaim }: MissionCardProps) {
  const category = categoryConfig[mission.category];
  const TypeIcon = typeIcons[mission.type];
  const [isClaimingAnimation, setIsClaimingAnimation] = useState(false);

  const handleClaim = () => {
    if (!mission.completed) {
      setIsClaimingAnimation(true);
      setTimeout(() => {
        onClaim(mission.id);
        setIsClaimingAnimation(false);
      }, 600);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: mission.completed ? 1 : 1.02 }}
      className="relative"
    >
      <Card
        variant={mission.completed ? 'glass' : 'mission'}
        className={`overflow-hidden ${mission.completed ? 'opacity-60' : ''}`}
      >
        {isClaimingAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 20, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-primary rounded-full z-10"
            style={{ transformOrigin: 'center' }}
          />
        )}
        
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              className={`p-3 rounded-xl ${category.bg} shrink-0`}
              animate={mission.completed ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">{mission.icon}</span>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold font-display truncate">{mission.title}</h3>
                <Badge variant={mission.category} className="shrink-0">
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {mission.type === 'check-in' ? 'Check-in' : mission.type === 'photo' ? 'Foto' : 'QR'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {mission.description}
              </p>
            </div>

            {/* Action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="points" className="font-bold">
                +{mission.points}
              </Badge>
              {mission.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-primary"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-semibold">Selesai</span>
                </motion.div>
              ) : (
                <Button
                  size="sm"
                  variant={mission.category === 'energy' ? 'energy' : 
                           mission.category === 'commute' ? 'commute' : 
                           mission.category === 'food' ? 'food' : 'default'}
                  onClick={handleClaim}
                  className="gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Klaim
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DailyMissions() {
  const [missions, setMissions] = useState(dailyMissions);
  const completedCount = missions.filter(m => m.completed).length;
  const totalPoints = missions.reduce((acc, m) => acc + (m.completed ? m.points : 0), 0);

  const handleClaim = (id: string) => {
    setMissions(prev => 
      prev.map(m => m.id === id ? { ...m, completed: true } : m)
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="text-3xl">🎯</span> Misi Harian
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Selesaikan misi untuk mendapat poin!
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-display text-primary">
            {completedCount}/{missions.length}
          </div>
          <div className="text-xs text-muted-foreground">
            +{totalPoints} pts hari ini
          </div>
        </div>
      </motion.div>

      {/* Mission List */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MissionCard mission={mission} onClaim={handleClaim} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
