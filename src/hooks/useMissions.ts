import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MissionWithStatus {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'energy' | 'waste' | 'commute' | 'food';
  type: 'check-in' | 'photo' | 'qr';
  icon: string;
  completed: boolean;
  pending: boolean;
  is_sponsored: boolean;
  sponsor_name: string | null;
  redirect_url: string | null;
  sort_order: number;
}

export function useMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    const { data: missionsData } = await supabase
      .from('missions')
      .select('*')
      .eq('active', true);

    if (!missionsData) { setLoading(false); return; }

    let completedIds: string[] = [];
    let pendingIds: string[] = [];
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('mission_completions')
        .select('mission_id, status')
        .eq('user_id', user.id)
        .eq('completion_date', today);
      completedIds = (completions || []).filter(c => (c as any).status === 'approved').map(c => c.mission_id);
      pendingIds = (completions || []).filter(c => (c as any).status === 'pending').map(c => c.mission_id);
    }

    const mapped = missionsData.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      points: m.points,
      category: m.category as MissionWithStatus['category'],
      type: m.type as MissionWithStatus['type'],
      icon: m.icon,
      completed: completedIds.includes(m.id),
      pending: pendingIds.includes(m.id),
      is_sponsored: m.is_sponsored ?? false,
      sponsor_name: m.sponsor_name ?? null,
      redirect_url: m.redirect_url ?? null,
      sort_order: m.sort_order ?? 0,
    }));
    mapped.sort((a, b) => a.sort_order - b.sort_order);
    setMissions(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchMissions(); }, [user]);

  const completeMission = async (missionId: string, options?: { photoFile?: File; qrCode?: string }) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return false;
    }

    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed || mission.pending) return false;

    let photoUrl: string | null = null;

    // Upload photo if provided
    if (options?.photoFile) {
      const ext = options.photoFile.name.split('.').pop();
      const path = `${user.id}/${missionId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('mission-photos')
        .upload(path, options.photoFile);

      if (uploadError) {
        toast.error('Gagal mengupload foto');
        return false;
      }

      const { data: urlData } = supabase.storage
        .from('mission-photos')
        .getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }

    // For photo missions, status starts as 'pending'; for others, auto-approve
    const isPhotoMission = mission.type === 'photo' && options?.photoFile;
    const status = isPhotoMission ? 'pending' : 'approved';

    const { data: insertedData, error } = await supabase
      .from('mission_completions')
      .insert({
        user_id: user.id,
        mission_id: missionId,
        points_earned: mission.points,
        photo_url: photoUrl,
        qr_code: options?.qrCode || null,
        status,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('Misi ini sudah diselesaikan hari ini');
      } else {
        toast.error('Gagal menyelesaikan misi');
      }
      return false;
    }

    if (isPhotoMission && insertedData) {
      // Trigger AI verification in background
      toast.info('📸 Foto sedang diverifikasi AI...');
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, pending: true } : m));

      try {
        const resp = await supabase.functions.invoke('verify-photo', {
          body: {
            completion_id: insertedData.id,
            photo_url: photoUrl,
            mission_title: mission.title,
            mission_description: mission.description,
          },
        });

        if (resp.data?.status === 'approved') {
          toast.success(`+${mission.points} poin! 🎉 Foto terverifikasi AI!`);
          setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true, pending: false } : m));
        } else {
          toast.info('📋 Foto menunggu verifikasi manual admin');
        }
      } catch {
        toast.info('📋 Foto akan diverifikasi oleh admin');
      }
    } else {
      toast.success(`+${mission.points} poin! 🎉 ${mission.title} selesai!`);
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m));
    }

    return true;
  };

  return { missions, loading, completeMission, refetch: fetchMissions };
}
