import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Gift, Coffee, Clock, TreePine, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rewards, currentUser, type Reward } from '@/data/mockData';

const categoryIcons: Record<string, typeof Coffee> = {
  'Food & Drink': Coffee,
  'Time Off': Clock,
  'Merchandise': ShoppingBag,
  'Charity': TreePine,
};

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (id: string) => void;
}

function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.pointsCost;
  const Icon = categoryIcons[reward.category] || Gift;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: canAfford && reward.available ? 1.03 : 1 }}
      className="h-full"
    >
      <Card
        variant={!reward.available ? 'glass' : canAfford ? 'interactive' : 'glass'}
        className={`h-full overflow-hidden ${!reward.available || !canAfford ? 'opacity-60' : ''}`}
      >
        <CardContent className="p-4 flex flex-col h-full">
          {/* Image/Icon */}
          <div className="relative mb-4">
            <motion.div
              className="text-6xl text-center py-6 rounded-xl bg-gradient-to-br from-muted to-muted/50"
              animate={canAfford && reward.available ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {reward.image}
            </motion.div>
            {!reward.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-xl">
                <Badge variant="destructive">Habis</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold font-display leading-tight">{reward.title}</h3>
              <Badge variant="outline" className="shrink-0">
                <Icon className="w-3 h-3 mr-1" />
                {reward.category.split(' ')[0]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reward.description}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold font-display text-lg gradient-text">
                  {reward.pointsCost.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">poin</div>
              </div>
              <Button
                variant={canAfford ? 'glow' : 'ghost'}
                size="sm"
                disabled={!canAfford || !reward.available}
                onClick={() => onRedeem(reward.id)}
              >
                {canAfford ? 'Tukar' : 'Kurang Poin'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Marketplace() {
  const [userPoints, setUserPoints] = useState(currentUser.points);
  const [redeemedItems, setRedeemedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<Reward | null>(null);

  const handleRedeem = (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (reward && userPoints >= reward.pointsCost) {
      setUserPoints(prev => prev - reward.pointsCost);
      setRedeemedItems(prev => [...prev, id]);
      setShowSuccess(reward);
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const categories = [...new Set(rewards.map(r => r.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎁</span>
          <h2 className="text-2xl font-bold font-display">Marketplace</h2>
        </div>
        <Badge variant="points" className="text-lg px-4 py-2">
          💰 {userPoints.toLocaleString()} pts
        </Badge>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card variant="glow" className="shadow-glow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-bold font-display">Berhasil ditukar! 🎉</div>
                  <div className="text-sm text-muted-foreground">{showSuccess.title}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      {categories.map((category, catIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: catIndex * 0.1 }}
        >
          <h3 className="font-bold font-display text-lg mb-3 flex items-center gap-2">
            {React.createElement(categoryIcons[category] || Gift, { className: 'w-5 h-5 text-primary' })}
            {category}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {rewards
              .filter(r => r.category === category)
              .map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 + index * 0.05 }}
                >
                  <RewardCard
                    reward={{
                      ...reward,
                      available: reward.available && !redeemedItems.includes(reward.id),
                    }}
                    userPoints={userPoints}
                    onRedeem={handleRedeem}
                  />
                </motion.div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Need to import React for React.createElement
import React from 'react';
