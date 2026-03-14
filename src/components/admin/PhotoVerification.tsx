import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Eye, RefreshCw, Loader2, Bot } from 'lucide-react';

interface Completion {
  id: string;
  user_id: string;
  mission_id: string;
  photo_url: string | null;
  points_earned: number;
  status: string;
  ai_result: string | null;
  ai_confidence: number | null;
  completed_at: string;
  completion_date: string;
  mission_title?: string;
  user_name?: string;
}

export function PhotoVerification({ onRefresh }: { onRefresh?: () => void }) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompletions = async () => {
    setLoading(true);
    let query = supabase
      .from('mission_completions')
      .select('*')
      .not('photo_url', 'is', null)
      .order('completed_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (!data) { setLoading(false); return; }

    // Fetch mission titles and user names
    const missionIds = [...new Set(data.map(d => d.mission_id))];
    const userIds = [...new Set(data.map(d => d.user_id))];

    const [missionsRes, profilesRes] = await Promise.all([
      supabase.from('missions').select('id, title').in('id', missionIds),
      supabase.from('profiles').select('user_id, display_name').in('user_id', userIds),
    ]);

    const missionMap = new Map((missionsRes.data || []).map(m => [m.id, m.title]));
    const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.display_name]));

    const enriched: Completion[] = data.map(d => ({
      ...d,
      status: (d as any).status || 'pending',
      ai_result: (d as any).ai_result || null,
      ai_confidence: (d as any).ai_confidence || null,
      mission_title: missionMap.get(d.mission_id) || 'Unknown',
      user_name: profileMap.get(d.user_id) || 'Unknown',
    }));

    setCompletions(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchCompletions(); }, [filter]);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    const { error } = await supabase
      .from('mission_completions')
      .update({ status, reviewed_at: new Date().toISOString() } as any)
      .eq('id', id);

    setActionLoading(null);
    if (error) {
      toast.error('Gagal memperbarui: ' + error.message);
      return;
    }
    toast.success(status === 'approved' ? '✅ Foto disetujui, poin ditambahkan!' : '❌ Foto ditolak');
    fetchCompletions();
    onRefresh?.();
  };

  const statusBadge = (status: string, aiConfidence?: number | null) => {
    switch (status) {
      case 'approved': return <Badge className="bg-primary/20 text-primary">✅ Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">❌ Rejected</Badge>;
      default: return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-amber-600 border-amber-400">⏳ Pending</Badge>
          {aiConfidence != null && (
            <Badge variant="outline" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              {aiConfidence}%
            </Badge>
          )}
        </div>
      );
    }
  };

  const pendingCount = completions.filter(c => c.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Verifikasi Foto</h2>
          {pendingCount > 0 && filter !== 'pending' && (
            <Badge variant="destructive">{pendingCount} pending</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="approved">✅ Approved</SelectItem>
              <SelectItem value="rejected">❌ Rejected</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={fetchCompletions}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peserta</TableHead>
                <TableHead>Misi</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>AI Result</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading...
                  </TableCell>
                </TableRow>
              ) : completions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : completions.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.user_name}</TableCell>
                  <TableCell>{c.mission_title}</TableCell>
                  <TableCell>
                    {c.photo_url && (
                      <button
                        onClick={() => setPreviewUrl(c.photo_url)}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                      >
                        <img src={c.photo_url} alt="Evidence" className="w-full h-full object-cover" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="max-w-48">
                    {c.ai_result ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.ai_result}</p>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">+{c.points_earned}</TableCell>
                  <TableCell>{statusBadge(c.status, c.ai_confidence)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.completed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    {c.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant="default"
                          onClick={() => handleAction(c.id, 'approved')}
                          disabled={actionLoading === c.id}
                          className="gap-1 h-8"
                        >
                          {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm" variant="destructive"
                          onClick={() => handleAction(c.id, 'rejected')}
                          disabled={actionLoading === c.id}
                          className="gap-1 h-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Photo Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Preview Foto</DialogTitle></DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
