import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Target, Trophy, QrCode, Gift, Menu, X, Leaf, UserCircle, LogIn, Swords } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Beranda', icon: Home },
  { id: 'missions', label: 'Misi', icon: Target },
  { id: 'challenges', label: 'Battle', icon: Swords },
  { id: 'leaderboard', label: 'Ranking', icon: Trophy },
  { id: 'scanner', label: 'Scan', icon: QrCode },
  { id: 'marketplace', label: 'Hadiah', icon: Gift },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 bg-card/50 backdrop-blur-xl border-r border-border z-50"
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-sm">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-glow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50 safe-area-inset-bottom"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px]',
                activeTab === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <motion.div
                animate={activeTab === item.id ? { y: -2 } : { y: 0 }}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300',
                  activeTab === item.id && 'bg-primary/20 shadow-glow-sm'
                )}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </>
  );
}

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-sm"
            >
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold font-display gradient-text">EcoQuest</h1>
              <p className="text-xs text-muted-foreground">Gamifikasi Peduli Lingkungan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <Avatar className="w-8 h-8">
                  {user.user_metadata?.avatar_url ? (
                    <AvatarImage src={user.user_metadata.avatar_url} />
                  ) : null}
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </motion.button>
            ) : (
              <Button variant="glow" size="sm" onClick={() => navigate('/auth')}>
                <LogIn className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
