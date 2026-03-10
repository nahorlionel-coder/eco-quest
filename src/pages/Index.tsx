import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Calculator, ArrowRight } from 'lucide-react';
import { Navigation, Header } from '@/components/Navigation';
import { StatsOverview } from '@/components/StatsOverview';
import { DailyMissions } from '@/components/DailyMissions';
import { Leaderboard } from '@/components/Leaderboard';
import { QRScanner } from '@/components/QRScanner';
import { Marketplace } from '@/components/Marketplace';
import { DepartmentChallenges } from '@/components/DepartmentChallenges';
import { ImpactDashboard } from '@/components/ImpactDashboard';
import { CarbonCalculator } from '@/components/CarbonCalculator';
import { OnboardingGuide, useOnboarding } from '@/components/OnboardingGuide';
import ecoPattern from '@/assets/eco-pattern.png';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsOverview />;
      case 'missions':
        return <DailyMissions />;
      case 'challenges':
        return <DepartmentChallenges />;
      case 'impact':
        return <ImpactDashboard />;
      case 'carbon':
        return <CarbonCalculator />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'scanner':
        return <QRScanner />;
      case 'marketplace':
        return <Marketplace />;
      default:
        return <StatsOverview />;
    }
  };

  const showFeatureBanner = !['impact', 'carbon'].includes(activeTab);

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Onboarding Guide */}
      <AnimatePresence>
        {showOnboarding && <OnboardingGuide onComplete={completeOnboarding} />}
      </AnimatePresence>

      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url(${ecoPattern})`,
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Gradient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="lg:pl-20">
        <Header />

        {/* Feature Banner - Impact & Carbon */}
        {showFeatureBanner && (
          <div className="container mx-auto px-4 pt-4">
            <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('impact')}
                className="relative group overflow-hidden rounded-2xl p-4 text-left border border-primary/20 bg-gradient-to-br from-primary/15 via-card/80 to-food/10 backdrop-blur-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-primary/20">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg">🌍</span>
                  </div>
                  <h3 className="font-bold font-display text-sm">Impact Dashboard</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-tight">Lihat dampak nyatamu untuk bumi</p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-primary font-semibold">
                    Lihat <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('carbon')}
                className="relative group overflow-hidden rounded-2xl p-4 text-left border border-accent/20 bg-gradient-to-br from-accent/15 via-card/80 to-energy/10 backdrop-blur-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-accent/20">
                      <Calculator className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-lg">🧮</span>
                  </div>
                  <h3 className="font-bold font-display text-sm">Carbon Calculator</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-tight">Hitung jejak karbonmu sekarang</p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-accent font-semibold">
                    Hitung <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        )}
        
        <main className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;
