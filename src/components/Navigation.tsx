import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Target, Trophy, Camera, Gift, Menu, X, Leaf, UserCircle, LogIn, Swords, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'missions', label: 'Misi', icon: Target },
    { id: 'challenges', label: 'Battle', icon: Swords },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'scanner', label: 'Foto', icon: Camera },
    { id: 'marketplace', label: 'Hadiah', icon: Gift },
  ];
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
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-50 pb-safe"
      >
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-300 min-w-[50px] max-w-[60px]',
                activeTab === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <motion.div
                animate={activeTab === item.id ? { y: -1 } : { y: 0 }}
                className={cn(
                  'p-1.5 rounded-lg transition-all duration-300',
                  activeTab === item.id && 'bg-primary/20 shadow-glow-sm'
                )}
              >
                <item.icon className="w-4 h-4" />
              </motion.div>
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
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
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  // Quick admin setup access (for development/first setup)
  const handleQuickAdminAccess = () => {
    if (user?.email?.includes('admin') || user?.email?.includes('test')) {
      navigate('/admin-setup');
    } else {
      navigate('/admin-setup');
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-sm"
            >
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-display gradient-text">EcoQuest</h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                      {user.user_metadata?.avatar_url ? (
                        <AvatarImage src={user.user_metadata.avatar_url} />
                      ) : null}
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleQuickAdminAccess}>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Setup
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
