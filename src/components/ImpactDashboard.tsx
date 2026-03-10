import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TreePine, Wind, Trash2, Droplets, TrendingUp, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Conversion factors per mission point
const IMPACT_PER_POINT = {
  energy: { co2Kg: 0.05, label: 'kg CO₂' },
  waste: { plasticKg: 0.02, label: 'kg plastik' },
  commute: { co2Kg: 0.08, label: 'kg CO₂' },
  food: { co2Kg: 0.03, label: 'kg CO₂' },
};

const monthlyData = [
  { month: 'Jan', co2: 12, plastic: 5, trees: 1 },
  { month: 'Feb', co2: 18, plastic: 8, trees: 2 },
  { month: 'Mar', co2: 25, plastic: 12, trees: 3 },
  { month: 'Apr', co2: 32, plastic: 15, trees: 4 },
  { month: 'Mei', co2: 45, plastic: 20, trees: 6 },
  { month: 'Jun', co2: 58, plastic: 28, trees: 8 },
];

const chartConfig = {
  co2: { label: 'CO₂ Dihemat (kg)', color: 'hsl(168 80% 50%)' },
  plastic: { label: 'Plastik Dikurangi (kg)', color: 'hsl(85 80% 55%)' },
  trees: { label: 'Pohon Ditanam', color: 'hsl(140 70% 50%)' },
};

const pieData = [
  { name: 'Energi', value: 35, color: 'hsl(45 100% 55%)' },
  { name: 'Limbah', value: 25, color: 'hsl(280 70% 60%)' },
  { name: 'Transportasi', value: 28, color: 'hsl(200 90% 55%)' },
  { name: 'Makanan', value: 12, color: 'hsl(140 70% 50%)' },
];

export function ImpactDashboard() {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('points').eq('user_id', user.id).single();
      if (data) setTotalPoints(data.points);
    };
    fetchProfile();
  }, [user]);

  // Calculate real impact from points
  const co2Saved = Math.round(totalPoints * 0.05 * 10) / 10;
  const plasticReduced = Math.round(totalPoints * 0.02 * 10) / 10;
  const treesPlanted = Math.max(1, Math.floor(totalPoints / 200));
  const waterSaved = Math.round(totalPoints * 0.3);

  const impactCards = [
    { icon: Wind, label: 'CO₂ Dihemat', value: `${co2Saved} kg`, color: 'text-primary', bg: 'bg-primary/20', target: 100, current: co2Saved, unit: 'kg' },
    { icon: TreePine, label: 'Pohon Ditanam', value: `${treesPlanted}`, color: 'text-food', bg: 'bg-food/20', target: 50, current: treesPlanted, unit: 'pohon' },
    { icon: Trash2, label: 'Plastik Dikurangi', value: `${plasticReduced} kg`, color: 'text-waste', bg: 'bg-waste/20', target: 50, current: plasticReduced, unit: 'kg' },
    { icon: Droplets, label: 'Air Dihemat', value: `${waterSaved} L`, color: 'text-commute', bg: 'bg-commute/20', target: 5000, current: waterSaved, unit: 'L' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="glow" className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-food/5 to-secondary/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/20">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display">Impact Dashboard</h2>
                <p className="text-sm text-muted-foreground">Dampak nyata kontribusimu untuk bumi 🌍</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total poin yang berkontribusi:</span>
                <span className="font-bold text-primary font-display">{totalPoints.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Impact Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {impactCards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card variant="interactive" className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-xl ${item.bg}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-display">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{Math.round((item.current / item.target) * 100)}%</span>
                    <span>Target: {item.target} {item.unit}</span>
                  </div>
                  <Progress value={Math.min((item.current / item.target) * 100, 100)} indicatorColor="gradient" className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CO2 Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wind className="w-5 h-5 text-primary" />
              Tren CO₂ Dihemat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(168 80% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(168 80% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220 10% 60%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(220 10% 60%)' }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="co2" stroke="hsl(168 80% 50%)" fill="url(#co2Gradient)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Distribution Pie */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="w-5 h-5 text-food" />
              Distribusi Dampak per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ChartContainer config={chartConfig} className="h-[180px] w-[180px] mx-auto flex-shrink-0">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 flex-1">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-bold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              🏆 Milestone Dampak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Hemat 10 kg CO₂', threshold: 10, current: co2Saved, emoji: '💨' },
              { label: 'Tanam 10 pohon', threshold: 10, current: treesPlanted, emoji: '🌳' },
              { label: 'Kurangi 20 kg plastik', threshold: 20, current: plasticReduced, emoji: '♻️' },
              { label: 'Hemat 1000 L air', threshold: 1000, current: waterSaved, emoji: '💧' },
            ].map((milestone) => {
              const achieved = milestone.current >= milestone.threshold;
              return (
                <div key={milestone.label} className={`flex items-center gap-3 p-3 rounded-xl ${achieved ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                  <span className="text-2xl">{milestone.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${achieved ? 'text-primary' : 'text-muted-foreground'}`}>{milestone.label}</p>
                    <p className="text-xs text-muted-foreground">{milestone.current} / {milestone.threshold}</p>
                  </div>
                  {achieved && <Badge variant="points" className="text-xs">✅ Tercapai</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
