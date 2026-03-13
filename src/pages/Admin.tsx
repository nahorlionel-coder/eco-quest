import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard, Target, Swords, Gift, Users,
  Plus, Pencil, Trash2, ArrowLeft, Search, RefreshCw
} from 'lucide-react';

// ─── Types ───
interface Mission {
  id: string; title: string; description: string; points: number;
  category: string; type: string; icon: string; active: boolean;
  is_sponsored: boolean; sponsor_name: string | null; redirect_url: string | null; sort_order: number;
}
interface Challenge {
  id: string; title: string; description: string; team_a: string; team_b: string;
  team_a_points: number; team_b_points: number; target_points: number;
  status: string; icon: string; reward_description: string | null;
  start_date: string; end_date: string;
}
interface Reward {
  id: string; title: string; description: string; points_cost: number;
  image: string; category: string; available: boolean;
  is_sponsored: boolean; sponsor_name: string | null;
}
interface Profile {
  id: string; user_id: string; display_name: string | null;
  department: string | null; points: number; level: number; streak: number;
  created_at: string;
}

// ─── Mission Form ───
function MissionForm({ mission, onSave, onClose }: { mission?: Mission; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: mission?.title || '', description: mission?.description || '',
    points: mission?.points || 10, category: mission?.category || 'energy',
    type: mission?.type || 'check-in', icon: mission?.icon || '🎯',
    active: mission?.active ?? true, is_sponsored: mission?.is_sponsored || false,
    sponsor_name: mission?.sponsor_name || '', redirect_url: mission?.redirect_url || '',
    sort_order: mission?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return; }
    setSaving(true);
    const payload = { ...form, sponsor_name: form.sponsor_name || null, redirect_url: form.redirect_url || null };
    const { error } = mission
      ? await supabase.from('missions').update(payload).eq('id', mission.id)
      : await supabase.from('missions').insert(payload);
    setSaving(false);
    if (error) { toast.error('Gagal menyimpan: ' + error.message); return; }
    toast.success(mission ? 'Misi diperbarui' : 'Misi ditambahkan');
    onSave(); onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Icon</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
        <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} /></div>
      </div>
      <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
      <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Poin</Label><Input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: +e.target.value }))} /></div>
        <div>
          <Label>Kategori</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="waste">Waste</SelectItem>
              <SelectItem value="commute">Commute</SelectItem>
              <SelectItem value="food">Food</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tipe</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="check-in">Check-in</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="qr">QR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>Aktif</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.is_sponsored} onCheckedChange={v => setForm(f => ({ ...f, is_sponsored: v }))} /><Label>Sponsored</Label></div>
      </div>
      {form.is_sponsored && (
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Nama Sponsor</Label><Input value={form.sponsor_name} onChange={e => setForm(f => ({ ...f, sponsor_name: e.target.value }))} /></div>
          <div><Label>Redirect URL</Label><Input value={form.redirect_url} onChange={e => setForm(f => ({ ...f, redirect_url: e.target.value }))} /></div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </div>
  );
}

// ─── Challenge Form ───
function ChallengeForm({ challenge, onSave, onClose }: { challenge?: Challenge; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: challenge?.title || '', description: challenge?.description || '',
    team_a: challenge?.team_a || '', team_b: challenge?.team_b || '',
    target_points: challenge?.target_points || 1000, icon: challenge?.icon || '⚔️',
    status: challenge?.status || 'active', reward_description: challenge?.reward_description || '',
    end_date: challenge?.end_date ? challenge.end_date.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.team_a.trim() || !form.team_b.trim()) { toast.error('Lengkapi data'); return; }
    setSaving(true);
    const payload = { ...form, reward_description: form.reward_description || null, end_date: form.end_date || new Date(Date.now() + 7 * 86400000).toISOString() };
    const { error } = challenge
      ? await supabase.from('department_challenges').update(payload).eq('id', challenge.id)
      : await supabase.from('department_challenges').insert(payload);
    setSaving(false);
    if (error) { toast.error('Gagal menyimpan: ' + error.message); return; }
    toast.success(challenge ? 'Battle diperbarui' : 'Battle ditambahkan');
    onSave(); onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Icon</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
      <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Tim A</Label><Input value={form.team_a} onChange={e => setForm(f => ({ ...f, team_a: e.target.value }))} /></div>
        <div><Label>Tim B</Label><Input value={form.team_b} onChange={e => setForm(f => ({ ...f, team_b: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Target Poin</Label><Input type="number" value={form.target_points} onChange={e => setForm(f => ({ ...f, target_points: +e.target.value }))} /></div>
        <div><Label>Tanggal Selesai</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
      </div>
      <div><Label>Deskripsi Hadiah</Label><Input value={form.reward_description} onChange={e => setForm(f => ({ ...f, reward_description: e.target.value }))} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </div>
  );
}

// ─── Reward Form ───
function RewardForm({ reward, onSave, onClose }: { reward?: Reward; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: reward?.title || '', description: reward?.description || '',
    points_cost: reward?.points_cost || 100, image: reward?.image || '🎁',
    category: reward?.category || 'Merchandise', available: reward?.available ?? true,
    is_sponsored: reward?.is_sponsored || false, sponsor_name: reward?.sponsor_name || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return; }
    setSaving(true);
    const payload = { ...form, sponsor_name: form.sponsor_name || null };
    const { error } = reward
      ? await supabase.from('rewards').update(payload).eq('id', reward.id)
      : await supabase.from('rewards').insert(payload);
    setSaving(false);
    if (error) { toast.error('Gagal menyimpan: ' + error.message); return; }
    toast.success(reward ? 'Hadiah diperbarui' : 'Hadiah ditambahkan');
    onSave(); onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Icon/Image</Label><Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} /></div>
        <div>
          <Label>Kategori</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Charity">Charity</SelectItem>
              <SelectItem value="Food & Drink">Food & Drink</SelectItem>
              <SelectItem value="Merchandise">Merchandise</SelectItem>
              <SelectItem value="Time Off">Time Off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
      <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div><Label>Biaya Poin</Label><Input type="number" value={form.points_cost} onChange={e => setForm(f => ({ ...f, points_cost: +e.target.value }))} /></div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2"><Switch checked={form.available} onCheckedChange={v => setForm(f => ({ ...f, available: v }))} /><Label>Tersedia</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.is_sponsored} onCheckedChange={v => setForm(f => ({ ...f, is_sponsored: v }))} /><Label>Sponsored</Label></div>
      </div>
      {form.is_sponsored && (
        <div><Label>Nama Sponsor</Label><Input value={form.sponsor_name} onChange={e => setForm(f => ({ ...f, sponsor_name: e.target.value }))} /></div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </div>
  );
}

// ─── Points Editor Dialog ───
function PointsEditor({ profile, onSave, onClose }: { profile: Profile; onSave: () => void; onClose: () => void }) {
  const [points, setPoints] = useState(profile.points);
  const [level, setLevel] = useState(profile.level);
  const [streak, setStreak] = useState(profile.streak);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ points, level, streak }).eq('id', profile.id);
    setSaving(false);
    if (error) { toast.error('Gagal update: ' + error.message); return; }
    toast.success('Data peserta diperbarui');
    onSave(); onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{profile.display_name || 'Tanpa nama'} — {profile.department || '-'}</p>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Poin</Label><Input type="number" value={points} onChange={e => setPoints(+e.target.value)} /></div>
        <div><Label>Level</Label><Input type="number" value={level} onChange={e => setLevel(+e.target.value)} /></div>
        <div><Label>Streak</Label><Input type="number" value={streak} onChange={e => setStreak(+e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('missions');
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Data states
  const [missions, setMissions] = useState<Mission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [editMission, setEditMission] = useState<Mission | undefined>();
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [editChallenge, setEditChallenge] = useState<Challenge | undefined>();
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [editReward, setEditReward] = useState<Reward | undefined>();
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | undefined>();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Check admin role
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
    if (!authLoading) checkAdmin();
  }, [user, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const [m, c, r, p] = await Promise.all([
      supabase.from('missions').select('*').order('sort_order'),
      supabase.from('department_challenges').select('*').order('created_at', { ascending: false }),
      supabase.from('rewards').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('points', { ascending: false }),
    ]);
    if (m.data) setMissions(m.data);
    if (c.data) setChallenges(c.data);
    if (r.data) setRewards(r.data);
    if (p.data) setProfiles(p.data);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  if (authLoading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) { navigate('/auth'); return null; }
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-bold font-display">Akses Ditolak</h1>
      <p className="text-muted-foreground">Anda tidak memiliki izin admin untuk mengakses halaman ini.</p>
      <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
    </div>
  );

  const filtered = <T extends { title?: string; display_name?: string | null }>(arr: T[]) =>
    arr.filter(item => {
      const name = ('title' in item ? item.title : (item as any).display_name) || '';
      return name.toLowerCase().includes(search.toLowerCase());
    });

  const deleteMission = async (id: string) => {
    if (!confirm('Hapus misi ini?')) return;
    await supabase.from('missions').delete().eq('id', id);
    toast.success('Misi dihapus'); fetchAll();
  };
  const deleteChallenge = async (id: string) => {
    if (!confirm('Hapus battle ini?')) return;
    await supabase.from('department_challenges').delete().eq('id', id);
    toast.success('Battle dihapus'); fetchAll();
  };
  const deleteReward = async (id: string) => {
    if (!confirm('Hapus hadiah ini?')) return;
    await supabase.from('rewards').delete().eq('id', id);
    toast.success('Hadiah dihapus'); fetchAll();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold font-display">CMS Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchAll}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-lg mb-6">
            <TabsTrigger value="missions" className="gap-1"><Target className="w-4 h-4" />Misi</TabsTrigger>
            <TabsTrigger value="battles" className="gap-1"><Swords className="w-4 h-4" />Battle</TabsTrigger>
            <TabsTrigger value="rewards" className="gap-1"><Gift className="w-4 h-4" />Hadiah</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="w-4 h-4" />Peserta</TabsTrigger>
          </TabsList>

          {/* ═══ Missions Tab ═══ */}
          <TabsContent value="missions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Kelola Misi ({missions.length})</h2>
              <Dialog open={showMissionDialog} onOpenChange={v => { setShowMissionDialog(v); if (!v) setEditMission(undefined); }}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Tambah Misi</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editMission ? 'Edit Misi' : 'Tambah Misi Baru'}</DialogTitle></DialogHeader>
                  <MissionForm mission={editMission} onSave={fetchAll} onClose={() => { setShowMissionDialog(false); setEditMission(undefined); }} />
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Poin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : filtered(missions).length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : filtered(missions).map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xl">{m.icon}</TableCell>
                        <TableCell className="font-medium">
                          {m.title}
                          {m.is_sponsored && <Badge className="ml-2 text-[10px]" variant="outline">⭐ Sponsor</Badge>}
                        </TableCell>
                        <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{m.type}</Badge></TableCell>
                        <TableCell className="text-right font-bold">{m.points}</TableCell>
                        <TableCell>{m.active ? <Badge className="bg-primary/20 text-primary">Aktif</Badge> : <Badge variant="outline">Nonaktif</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditMission(m); setShowMissionDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteMission(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Battles Tab ═══ */}
          <TabsContent value="battles">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Kelola Battle ({challenges.length})</h2>
              <Dialog open={showChallengeDialog} onOpenChange={v => { setShowChallengeDialog(v); if (!v) setEditChallenge(undefined); }}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Tambah Battle</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editChallenge ? 'Edit Battle' : 'Tambah Battle Baru'}</DialogTitle></DialogHeader>
                  <ChallengeForm challenge={editChallenge} onSave={fetchAll} onClose={() => { setShowChallengeDialog(false); setEditChallenge(undefined); }} />
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Tim A vs Tim B</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : filtered(challenges).length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : filtered(challenges).map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xl">{c.icon}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.team_a} vs {c.team_b}</TableCell>
                        <TableCell className="text-right font-bold">{c.target_points}</TableCell>
                        <TableCell><span className="text-primary font-bold">{c.team_a_points}</span> : <span className="text-accent font-bold">{c.team_b_points}</span></TableCell>
                        <TableCell>
                          <Badge className={c.status === 'active' ? 'bg-primary/20 text-primary' : ''} variant={c.status === 'active' ? 'default' : 'outline'}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditChallenge(c); setShowChallengeDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteChallenge(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Rewards Tab ═══ */}
          <TabsContent value="rewards">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Kelola Hadiah ({rewards.length})</h2>
              <Dialog open={showRewardDialog} onOpenChange={v => { setShowRewardDialog(v); if (!v) setEditReward(undefined); }}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Tambah Hadiah</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editReward ? 'Edit Hadiah' : 'Tambah Hadiah Baru'}</DialogTitle></DialogHeader>
                  <RewardForm reward={editReward} onSave={fetchAll} onClose={() => { setShowRewardDialog(false); setEditReward(undefined); }} />
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Biaya Poin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : filtered(rewards).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : filtered(rewards).map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xl">{r.image}</TableCell>
                        <TableCell className="font-medium">
                          {r.title}
                          {r.is_sponsored && <Badge className="ml-2 text-[10px]" variant="outline">⭐ {r.sponsor_name}</Badge>}
                        </TableCell>
                        <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                        <TableCell className="text-right font-bold">{r.points_cost}</TableCell>
                        <TableCell>{r.available ? <Badge className="bg-primary/20 text-primary">Tersedia</Badge> : <Badge variant="outline">Habis</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditReward(r); setShowRewardDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteReward(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Users Tab ═══ */}
          <TabsContent value="users">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Data Peserta ({profiles.length})</h2>
              <Button variant="ghost" size="sm" onClick={fetchAll}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead className="text-right">Poin</TableHead>
                      <TableHead className="text-right">Level</TableHead>
                      <TableHead className="text-right">Streak</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : profiles.filter(p => (p.display_name || '').toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : profiles.filter(p => (p.display_name || '').toLowerCase().includes(search.toLowerCase())).map((p, i) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.display_name || 'Tanpa nama'}</TableCell>
                        <TableCell><Badge variant="outline">{p.department || '-'}</Badge></TableCell>
                        <TableCell className="text-right font-bold text-primary">{p.points.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{p.level}</TableCell>
                        <TableCell className="text-right">🔥 {p.streak}</TableCell>
                        <TableCell>
                          <Dialog open={showProfileDialog && editProfile?.id === p.id} onOpenChange={v => { setShowProfileDialog(v); if (!v) setEditProfile(undefined); }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => { setEditProfile(p); setShowProfileDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Data Peserta</DialogTitle></DialogHeader>
                              {editProfile && <PointsEditor profile={editProfile} onSave={fetchAll} onClose={() => { setShowProfileDialog(false); setEditProfile(undefined); }} />}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
