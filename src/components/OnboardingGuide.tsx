import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Leaf, Target, QrCode, Gift, Trophy, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Leaf,
    emoji: '🌍',
    title: 'Selamat Datang di EcoQuest!',
    description: 'Jadilah pahlawan lingkungan di kantor! Selesaikan misi harian, kumpulkan poin, dan tukar dengan hadiah menarik.',
    tip: 'Setiap aksi kecil berdampak besar untuk bumi 🌱',
  },
  {
    icon: Target,
    emoji: '🎯',
    title: 'Selesaikan Misi Harian',
    description: 'Buka tab Misi untuk melihat tantangan hari ini. Ada 3 jenis misi: Check-in, Upload Foto, dan Scan QR Code.',
    tip: 'Misi baru muncul setiap hari — jangan sampai terlewat!',
  },
  {
    icon: QrCode,
    emoji: '📱',
    title: 'Scan QR Code',
    description: 'Temukan QR Code di area parkir sepeda, tangga, dan dispenser air. Scan untuk membuktikan aksi hijau kamu!',
    tip: 'Gunakan tab Scanner untuk memindai QR Code',
  },
  {
    icon: Swords,
    emoji: '⚔️',
    title: 'Battle Antar Divisi',
    description: 'Gabung tantangan Head-to-Head melawan divisi lain! Kumpulkan poin bersama timmu untuk memenangkan hadiah kolektif.',
    tip: 'Buka tab Battle untuk lihat tantangan aktif!',
  },
  {
    icon: Gift,
    emoji: '🎁',
    title: 'Tukar Poin di Marketplace',
    description: 'Kumpulkan poin dari misi dan tukar dengan hadiah dari sponsor seperti Starbucks, Adidas, dan lainnya!',
    tip: 'Ada hadiah sponsor eksklusif dengan harga spesial! ⭐',
  },
  {
    icon: Trophy,
    emoji: '🏆',
    title: 'Bersaing di Leaderboard',
    description: 'Lihat peringkatmu vs rekan kerja dan departemen lain. Siapa yang paling hijau bulan ini?',
    tip: 'Kamu siap menjadi Eco Hero! Ayo mulai misi pertamamu 🚀',
  },
];

const ONBOARDING_KEY = 'ecoquest_onboarding_done';

export function OnboardingGuide({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm"
      >
        <Card variant="glow" className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header with icon */}
            <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-8 text-center">
              <button
                onClick={onComplete}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                className="text-6xl mb-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {current.emoji}
              </motion.div>

              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold font-display text-center">{current.title}</h2>
              <p className="text-muted-foreground text-center text-sm leading-relaxed">
                {current.description}
              </p>

              {/* Tip box */}
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-center text-muted-foreground">
                  💡 {current.tip}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 py-2">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === step ? 'w-6 bg-primary' : i < step ? 'w-2 bg-primary/50' : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {step > 0 && (
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setStep(s => s - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Kembali
                  </Button>
                )}
                <Button
                  variant="glow"
                  className="flex-1"
                  onClick={() => {
                    if (isLast) {
                      onComplete();
                    } else {
                      setStep(s => s + 1);
                    }
                  }}
                >
                  {isLast ? 'Mulai Bermain! 🚀' : 'Lanjut'}
                  {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShowOnboarding(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
