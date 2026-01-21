import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, X, CheckCircle, AlertCircle, Zap, Droplets, Footprints } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QRLocation {
  id: string;
  name: string;
  points: number;
  icon: typeof Zap;
  category: string;
}

const qrLocations: Record<string, QRLocation> = {
  'ECO-COMMUTE-001': { id: '1', name: 'Green Commute - Lobi MRT', points: 50, icon: Footprints, category: 'commute' },
  'ECO-TUMBLER-001': { id: '2', name: 'Isi Ulang Tumbler', points: 20, icon: Droplets, category: 'waste' },
  'ECO-STAIRS-001': { id: '3', name: 'Naik Tangga', points: 25, icon: Zap, category: 'energy' },
  'ECO-BIKE-001': { id: '4', name: 'Parkir Sepeda', points: 50, icon: Footprints, category: 'commute' },
};

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; location?: QRLocation; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const location = qrLocations[decodedText];
          if (location) {
            setScanResult({
              success: true,
              location,
              message: `Berhasil scan di ${location.name}!`,
            });
          } else {
            setScanResult({
              success: false,
              message: 'QR Code tidak valid. Pastikan scan QR EcoQuest resmi.',
            });
          }
          stopScanning();
        },
        () => {}
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setScanResult({
        success: false,
        message: 'Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan.',
      });
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const simulateScan = (code: string) => {
    const location = qrLocations[code];
    if (location) {
      setScanResult({
        success: true,
        location,
        message: `Berhasil scan di ${location.name}!`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <span className="text-3xl">📱</span>
        <h2 className="text-2xl font-bold font-display">QR Scanner</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="glass">
          <CardContent className="p-6">
            {!isScanning && !scanResult && (
              <div className="text-center space-y-4">
                <motion.div
                  className="w-24 h-24 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <QrCode className="w-12 h-12 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-bold font-display text-lg">Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scan QR di titik-titik strategis kantor untuk klaim poin
                  </p>
                </div>
                <Button variant="hero" onClick={startScanning} className="w-full">
                  <Camera className="w-5 h-5 mr-2" />
                  Mulai Scan
                </Button>
              </div>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div className="relative">
                  <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
                  <Button
                    variant="glass"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={stopScanning}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Arahkan kamera ke QR Code...
                </p>
              </div>
            )}

            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-4"
                >
                  {scanResult.success ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
                      >
                        <CheckCircle className="w-10 h-10 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold font-display text-lg text-primary">
                          {scanResult.message}
                        </h3>
                        <Badge variant="points" className="text-lg px-4 py-2 mt-3">
                          +{scanResult.location?.points} Poin! 🎉
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                      </div>
                      <p className="text-muted-foreground">{scanResult.message}</p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setScanResult(null)}
                    className="w-full"
                  >
                    Scan Lagi
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Locations Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📍</span> Lokasi QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(qrLocations).map(([code, location], index) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => simulateScan(code)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <location.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{location.name}</span>
                </div>
                <Badge variant="points">+{location.points}</Badge>
              </motion.div>
            ))}
            <p className="text-xs text-muted-foreground text-center mt-2">
              💡 Tap lokasi untuk simulasi scan (demo)
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
