import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Camera, QrCode, Zap, Recycle, Bike, Salad, Sparkles, Upload, Loader2, ExternalLink, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMissions, type MissionWithStatus } from '@/hooks/useMissions';
import { useNavigate } from 'react-router-dom';

const categoryConfig = {
  energy: { icon: Zap, bg: 'bg-energy/20', text: 'text-energy' },
  waste: { icon: Recycle, bg: 'bg-waste/20', text: 'text-waste' },
  commute: { icon: Bike, bg: 'bg-commute/20', text: 'text-commute' },
  food: { icon: Salad, bg: 'bg-food/20', text: 'text-food' },
};

const typeIcons = {
  'check-in': Check,
  'photo': Camera,
  'qr': QrCode,
};

interface MissionCardProps {
  mission: MissionWithStatus;
  onClaim: (id: string, photoFile?: File) => Promise<void>;
}

function MissionCard({ mission, onClaim }: MissionCardProps) {
  const category = categoryConfig[mission.category];
  const TypeIcon = typeIcons[mission.type];
  const [isClaimingAnimation, setIsClaimingAnimation] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClaim = async (file?: File) => {
    if (mission.completed || claiming) return;
    setClaiming(true);
    setIsClaimingAnimation(true);
    
    await onClaim(mission.id, file);
    
    setTimeout(() => {
      setIsClaimingAnimation(false);
      setClaiming(false);
    }, 600);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleClaim(file);
  };

  const isSponsored = mission.is_sponsored;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: mission.completed ? 1 : 1.02 }}
      className="relative"
    >
      <Card variant={mission.completed ? 'glass' : 'mission'}
        className={`overflow-hidden ${mission.completed ? 'opacity-60' : ''} ${isSponsored ? 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-400/10' : ''}`}
      >
        {isSponsored && (
          <div className="absolute top-0 right-0 z-20">
            <div className="bg-gradient-to-l from-amber-500 to-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              SPONSORED
            </div>
          </div>
        )}
        {isClaimingAnimation && (
          <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 20, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-primary rounded-full z-10"
            style={{ transformOrigin: 'center' }}
          />
        )}
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <motion.div className={`p-3 rounded-xl ${isSponsored ? 'bg-amber-100 dark:bg-amber-900/30' : category.bg} shrink-0`}
              animate={mission.completed ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">{mission.icon}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold font-display truncate">{mission.title}</h3>
                <Badge variant={mission.category} className="shrink-0">
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {mission.type === 'check-in' ? 'Check-in' : mission.type === 'photo' ? 'Foto' : 'QR'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{mission.description}</p>
              {isSponsored && mission.sponsor_name && (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                  🤝 {mission.sponsor_name}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="points" className="font-bold">+{mission.points}</Badge>
              {mission.completed ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-primary"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-semibold">Selesai</span>
                </motion.div>
              ) : mission.redirect_url ? (
                <Button size="sm" variant="default"
                  className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => window.open(mission.redirect_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka
                </Button>
              ) : mission.type === 'photo' ? (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={handleFileChange} />
                  <Button size="sm" variant={mission.category === 'food' ? 'food' : 'default'}
                    onClick={handlePhotoClick} disabled={claiming} className="gap-1"
                  >
                    {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </Button>
                </>
              ) : (
                <Button size="sm"
                  variant={mission.category === 'energy' ? 'energy' : 
                           mission.category === 'commute' ? 'commute' : 
                           mission.category === 'food' ? 'food' : 'default'}
                  onClick={() => handleClaim()} disabled={claiming} className="gap-1"
                >
                  {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { missions, loading, completeMission } = useMissions();
  const completedCount = missions.filter(m => m.completed).length;
  const totalPoints = missions.reduce((acc, m) => acc + (m.completed ? m.points : 0), 0);

  const handleClaim = async (id: string, photoFile?: File) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await completeMission(id, { photoFile });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="text-3xl">🎯</span> Misi Harian
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {user ? 'Selesaikan misi untuk mendapat poin!' : 'Login untuk menyelesaikan misi'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-display text-primary">
            {completedCount}/{missions.length}
          </div>
          <div className="text-xs text-muted-foreground">+{totalPoints} pts hari ini</div>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {missions.map((mission, index) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            >
              <MissionCard mission={mission} onClaim={handleClaim} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
