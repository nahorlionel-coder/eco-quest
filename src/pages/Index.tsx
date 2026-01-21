import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Header } from '@/components/Navigation';
import { StatsOverview } from '@/components/StatsOverview';
import { DailyMissions } from '@/components/DailyMissions';
import { Leaderboard } from '@/components/Leaderboard';
import { QRScanner } from '@/components/QRScanner';
import { Marketplace } from '@/components/Marketplace';
import ecoPattern from '@/assets/eco-pattern.png';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsOverview />;
      case 'missions':
        return <DailyMissions />;
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

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
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
