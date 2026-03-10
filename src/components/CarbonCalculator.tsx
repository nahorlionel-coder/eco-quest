import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Car, Zap, UtensilsCrossed, Recycle, ChevronRight, RotateCcw, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CategoryInput {
  id: string;
  icon: typeof Car;
  label: string;
  emoji: string;
  color: string;
  questions: {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    default: number;
    co2PerUnit: number; // kg CO2 per unit per month
  }[];
}

const categories: CategoryInput[] = [
  {
    id: 'transport',
    icon: Car,
    label: 'Transportasi',
    emoji: '🚗',
    color: 'text-commute',
    questions: [
      { id: 'car_km', label: 'Jarak berkendara mobil/motor', unit: 'km/minggu', min: 0, max: 200, step: 5, default: 50, co2PerUnit: 0.21 * 4 },
      { id: 'public_km', label: 'Transportasi umum', unit: 'km/minggu', min: 0, max: 200, step: 5, default: 30, co2PerUnit: 0.06 * 4 },
    ],
  },
  {
    id: 'energy',
    icon: Zap,
    label: 'Energi Rumah',
    emoji: '⚡',
    color: 'text-energy',
    questions: [
      { id: 'electricity', label: 'Tagihan listrik', unit: 'kWh/bulan', min: 0, max: 500, step: 10, default: 150, co2PerUnit: 0.7 },
      { id: 'ac_hours', label: 'Penggunaan AC', unit: 'jam/hari', min: 0, max: 24, step: 1, default: 8, co2PerUnit: 1.5 * 30 },
    ],
  },
  {
    id: 'food',
    icon: UtensilsCrossed,
    label: 'Makanan',
    emoji: '🍖',
    color: 'text-food',
    questions: [
      { id: 'meat_meals', label: 'Makan daging', unit: 'porsi/minggu', min: 0, max: 21, step: 1, default: 7, co2PerUnit: 3.3 * 4 },
      { id: 'food_waste', label: 'Sisa makanan dibuang', unit: 'kg/minggu', min: 0, max: 5, step: 0.5, default: 1, co2PerUnit: 2.5 * 4 },
    ],
  },
  {
    id: 'waste',
    icon: Recycle,
    label: 'Sampah & Daur Ulang',
    emoji: '♻️',
    color: 'text-waste',
    questions: [
      { id: 'plastic_bags', label: 'Kantong plastik digunakan', unit: 'buah/minggu', min: 0, max: 30, step: 1, default: 10, co2PerUnit: 0.04 * 4 },
      { id: 'recycle_pct', label: 'Persentase didaur ulang', unit: '%', min: 0, max: 100, step: 5, default: 20, co2PerUnit: -0.5 },
    ],
  },
];

export function CarbonCalculator() {
  const [step, setStep] = useState(0); // 0 = intro, 1-4 = categories, 5 = result
  const [values, setValues] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    categories.forEach((cat) => cat.questions.forEach((q) => (defaults[q.id] = q.default)));
    return defaults;
  });

  const totalSteps = categories.length + 1;

  const calculateCO2 = () => {
    let total = 0;
    categories.forEach((cat) =>
      cat.questions.forEach((q) => {
        total += values[q.id] * q.co2PerUnit;
      })
    );
    return Math.max(0, Math.round(total));
  };

  const co2Monthly = calculateCO2();
  const co2Yearly = co2Monthly * 12;
  const avgIndonesia = 2100; // kg CO2/year average

  const getRating = () => {
    if (co2Yearly < avgIndonesia * 0.5) return { label: 'Eco Hero! 🌟', color: 'text-primary', desc: 'Jejak karbonmu jauh di bawah rata-rata!' };
    if (co2Yearly < avgIndonesia * 0.8) return { label: 'Eco Friendly 🌿', color: 'text-food', desc: 'Bagus! Kamu sudah di bawah rata-rata.' };
    if (co2Yearly < avgIndonesia) return { label: 'Cukup Baik 👍', color: 'text-energy', desc: 'Masih bisa ditingkatkan lagi!' };
    return { label: 'Perlu Perbaikan ⚠️', color: 'text-accent', desc: 'Yuk mulai kurangi jejak karbonmu!' };
  };

  const tips = [
    { condition: values.car_km > 50, tip: '🚲 Coba ganti sebagian perjalanan mobil dengan bersepeda atau jalan kaki', save: '~20 kg CO₂/bulan' },
    { condition: values.ac_hours > 6, tip: '❄️ Kurangi AC 2 jam/hari bisa hemat banyak energi', save: '~90 kg CO₂/bulan' },
    { condition: values.meat_meals > 5, tip: '🥗 Coba 2 hari tanpa daging per minggu (Meatless Monday)', save: '~26 kg CO₂/bulan' },
    { condition: values.plastic_bags > 5, tip: '🛍️ Bawa tas belanja sendiri untuk kurangi plastik', save: '~0.8 kg CO₂/bulan' },
    { condition: values.recycle_pct < 50, tip: '♻️ Tingkatkan daur ulang sampahmu hingga 50%+', save: '~15 kg CO₂/bulan' },
  ];

  const activeTips = tips.filter((t) => t.condition);

  const reset = () => {
    setStep(0);
    const defaults: Record<string, number> = {};
    categories.forEach((cat) => cat.questions.forEach((q) => (defaults[q.id] = q.default)));
    setValues(defaults);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card variant="glow" className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-energy/10" />
              <CardContent className="relative p-6 text-center">
                <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  🌍
                </motion.div>
                <h2 className="text-2xl font-bold font-display mb-2">Carbon Footprint Calculator</h2>
                <p className="text-muted-foreground mb-6">Hitung jejak karbon bulananmu dan temukan cara menguranginya!</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-sm text-muted-foreground">{cat.label}</span>
                    </div>
                  ))}
                </div>
                <Button variant="glow" className="w-full" onClick={() => setStep(1)}>
                  Mulai Hitung <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step >= 1 && step <= categories.length && (
          <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            {(() => {
              const cat = categories[step - 1];
              return (
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{step}/{categories.length}</span>
                    <Progress value={(step / categories.length) * 100} indicatorColor="gradient" className="flex-1 h-2" />
                  </div>

                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-muted/50`}>
                          <cat.icon className={`w-6 h-6 ${cat.color}`} />
                        </div>
                        <div>
                          <span className="text-lg">{cat.emoji} {cat.label}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {cat.questions.map((q) => (
                        <div key={q.id} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">{q.label}</label>
                            <Badge variant="outline" className="font-mono">
                              {values[q.id]} {q.unit}
                            </Badge>
                          </div>
                          <Slider
                            value={[values[q.id]]}
                            onValueChange={([v]) => setValues((prev) => ({ ...prev, [q.id]: v }))}
                            min={q.min}
                            max={q.max}
                            step={q.step}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{q.min}</span>
                            <span>{q.max} {q.unit}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                      Kembali
                    </Button>
                    <Button variant="glow" className="flex-1" onClick={() => setStep(step + 1)}>
                      {step === categories.length ? 'Lihat Hasil' : 'Lanjut'} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {step > categories.length && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              {/* Result Card */}
              <Card variant="glow" className="overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                <CardContent className="relative p-6 text-center">
                  <motion.div className="text-5xl mb-3" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    🌍
                  </motion.div>
                  <h2 className="text-xl font-bold font-display mb-1">Jejak Karbon Bulananmu</h2>
                  <div className="text-5xl font-bold font-display gradient-text my-4">
                    {co2Monthly} <span className="text-lg">kg CO₂</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">≈ {co2Yearly.toLocaleString()} kg CO₂/tahun</p>
                  
                  <Badge className={`${getRating().color} text-sm px-4 py-1`}>
                    {getRating().label}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">{getRating().desc}</p>

                  {/* Comparison bar */}
                  <div className="mt-6 p-4 rounded-xl bg-muted/50">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Kamu: {co2Yearly.toLocaleString()} kg</span>
                      <span>Rata-rata Indonesia: {avgIndonesia.toLocaleString()} kg</span>
                    </div>
                    <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-30 rounded-full" />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((co2Yearly / (avgIndonesia * 1.5)) * 100, 100)}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                      <div
                        className="absolute h-full w-0.5 bg-accent top-0"
                        style={{ left: `${(avgIndonesia / (avgIndonesia * 1.5)) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">📊 Rincian per Kategori</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((cat) => {
                    const catCO2 = cat.questions.reduce((sum, q) => sum + values[q.id] * q.co2PerUnit, 0);
                    const pct = co2Monthly > 0 ? Math.round((Math.max(0, catCO2) / co2Monthly) * 100) : 0;
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <span className="text-xl">{cat.emoji}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{cat.label}</span>
                            <span className="font-bold">{Math.round(Math.max(0, catCO2))} kg</span>
                          </div>
                          <Progress value={pct} indicatorColor="gradient" className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Tips */}
              {activeTips.length > 0 && (
                <Card variant="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-primary" />
                      Tips Mengurangi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeTips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="p-3 rounded-xl bg-muted/50 border border-primary/10"
                      >
                        <p className="text-sm">{tip.tip}</p>
                        <p className="text-xs text-primary mt-1 font-semibold">Hemat {tip.save}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button variant="outline" className="w-full" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Hitung Ulang
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
