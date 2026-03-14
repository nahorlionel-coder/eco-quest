import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft, UserPlus, Crown } from 'lucide-react';

export default function AdminSetup() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAnyAdmin, setHasAnyAdmin] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      // Check if any admin exists using an edge-case: we query user_roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      setHasAnyAdmin(!!roles && roles.length > 0);

      // Check if current user is admin
      const { data: myRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!myRole);
    };
    if (!authLoading) check();
  }, [user, authLoading]);

  const assignSelfAsAdmin = async () => {
    if (!user) return;
    setAssigning(true);
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'admin' });
    setAssigning(false);
    if (error) {
      toast.error('Gagal: ' + error.message);
      return;
    }
    toast.success('Anda sekarang adalah Admin! 🎉');
    setIsAdmin(true);
    setHasAnyAdmin(true);
  };

  const assignByEmail = async () => {
    if (!email.trim()) { toast.error('Masukkan email'); return; }
    setAssigning(true);
    // Look up profile by matching email in auth (we search profiles)
    // Since we can't query auth.users, we use a workaround: search profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name');

    if (!profiles || profiles.length === 0) {
      toast.error('Tidak ada user ditemukan');
      setAssigning(false);
      return;
    }

    // We need to find the user by checking auth - let's use the admin's knowledge
    // For simplicity, we'll look for the email in profiles display_name or ask for user_id
    toast.error('Untuk assign admin via email, gunakan User ID. Lihat tab Peserta di CMS.');
    setAssigning(false);
  };

  const assignByUserId = async (userId: string) => {
    if (!userId.trim()) { toast.error('Masukkan User ID'); return; }
    setAssigning(true);
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' });
    setAssigning(false);
    if (error) {
      if (error.code === '23505') { toast.info('User sudah memiliki role admin'); return; }
      toast.error('Gagal: ' + error.message);
      return;
    }
    toast.success('Admin baru berhasil ditambahkan! 🎉');
  };

  if (authLoading || hasAnyAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">🔐</div>
        <h1 className="text-2xl font-bold font-display">Login Diperlukan</h1>
        <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
        <Button onClick={() => navigate('/auth')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold font-display">Admin Setup</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Self-assign (only if no admin exists) */}
        {!hasAnyAdmin && !isAdmin && (
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Setup Admin Pertama
              </CardTitle>
              <CardDescription>
                Belum ada admin di sistem. Jadikan diri Anda sebagai admin pertama.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Akun Anda saat ini</p>
                </div>
                <Button onClick={assignSelfAsAdmin} disabled={assigning}>
                  {assigning ? 'Memproses...' : 'Jadikan Admin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        {isAdmin && (
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold font-display">Anda adalah Admin</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button onClick={() => navigate('/admin')}>Buka CMS Dashboard</Button>
            </CardContent>
          </Card>
        )}

        {/* Assign another admin (only if current user is admin) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Tambah Admin Baru
              </CardTitle>
              <CardDescription>
                Masukkan User ID dari peserta yang ingin dijadikan admin. Anda bisa melihat User ID di tab Peserta pada CMS Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAssigner onAssign={assignByUserId} assigning={assigning} />
            </CardContent>
          </Card>
        )}

        {/* Not admin but admin exists */}
        {hasAnyAdmin && !isAdmin && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl">🔒</div>
              <h2 className="text-xl font-bold font-display">Akses Terbatas</h2>
              <p className="text-muted-foreground">
                Sistem sudah memiliki admin. Hubungi admin untuk mendapatkan akses.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>Kembali</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function AdminAssigner({ onAssign, assigning }: { onAssign: (id: string) => void; assigning: boolean }) {
  const [userId, setUserId] = useState('');
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Paste User ID di sini..."
        value={userId}
        onChange={e => setUserId(e.target.value)}
        className="flex-1"
      />
      <Button onClick={() => { onAssign(userId); setUserId(''); }} disabled={assigning || !userId.trim()}>
        {assigning ? 'Memproses...' : 'Assign Admin'}
      </Button>
    </div>
  );
}
