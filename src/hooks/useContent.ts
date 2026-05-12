import { useState, useEffect } from 'react';
import { internalAuth } from '../lib/internalAuth';

export function useAdminRole() {
  const [role, setRole] = useState<string | null>(() => {
    const cached = localStorage.getItem('pesantren_role');
    return cached || null;
  });
  const [adminData, setAdminData] = useState<any>(() => {
    const cached = localStorage.getItem('pesantren_admin_data');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!role);

  useEffect(() => {
    const fetchRole = async () => {
      const user = internalAuth.getUser();
      if (!user) {
        setRole('none');
        setAdminData(null);
        setLoading(false);
        localStorage.removeItem('pesantren_role');
        localStorage.removeItem('pesantren_admin_data');
        return;
      }
      
      try {
        const response = await fetch(`/api/admins/${user.id}`);
        if(response.ok) {
            const data = await response.json();
            const accessRole = data.access || 'all';
            setRole(accessRole);
            setAdminData(data);
            localStorage.setItem('pesantren_role', accessRole);
            localStorage.setItem('pesantren_admin_data', JSON.stringify(data));
        } else {
            setRole(user.access);
            setAdminData(user);
        }
      } catch (e) {
        console.error('Error fetching admin role:', e);
        setRole(user.access);
        setAdminData(user);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  return { role, adminData, loading };
}

export function useSettings() {
  const [settings, setSettings] = useState<any>(() => {
    const cached = localStorage.getItem('pesantren_settings');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!settings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if(!response.ok) throw new Error('Failed');
        const data = await response.json();
        setSettings(data);
        localStorage.setItem('pesantren_settings', JSON.stringify(data));
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { settings, loading };
}

export function usePrograms() {
  const [programs, setPrograms] = useState<any[]>(() => {
    const cached = localStorage.getItem('pesantren_programs');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(programs.length === 0);
  const [error, setError] = useState<boolean>(() => {
    return localStorage.getItem('error_pesantren_programs') === 'true';
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setPrograms(data);
        localStorage.setItem('pesantren_programs', JSON.stringify(data));
        setError(false);
        localStorage.removeItem('error_pesantren_programs');
      } catch (e) {
        console.error('Error fetching programs:', e);
        setError(true);
        localStorage.setItem('error_pesantren_programs', 'true');
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  return { programs, loading, error };
}

export function useGallery() {
  const [images, setImages] = useState<any[]>(() => {
    const cached = localStorage.getItem('pesantren_gallery');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(images.length === 0);
  const [error, setError] = useState<boolean>(() => {
    return localStorage.getItem('error_pesantren_gallery') === 'true';
  });

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setImages(data);
        localStorage.setItem('pesantren_gallery', JSON.stringify(data));
        setError(false);
        localStorage.removeItem('error_pesantren_gallery');
      } catch (e) {
        console.error('Error fetching gallery:', e);
        setError(true);
        localStorage.setItem('error_pesantren_gallery', 'true');
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return { images, loading, error };
}

export function useFacilities() {
  const [facilities, setFacilities] = useState<any[]>(() => {
    const cached = localStorage.getItem('pesantren_facilities');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(facilities.length === 0);
  const [error, setError] = useState<boolean>(() => {
    return localStorage.getItem('error_pesantren_facilities') === 'true';
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('/api/facilities');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setFacilities(data);
        localStorage.setItem('pesantren_facilities', JSON.stringify(data));
        setError(false);
        localStorage.removeItem('error_pesantren_facilities');
      } catch (e) {
        console.error('Error fetching facilities:', e);
        setError(true);
        localStorage.setItem('error_pesantren_facilities', 'true');
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return { facilities, loading, error };
}

export function useKesantrian() {
  const [activities, setActivities] = useState<any[]>(() => {
    const cached = localStorage.getItem('pesantren_kesantrian');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(activities.length === 0);
  const [error, setError] = useState<boolean>(() => {
    return localStorage.getItem('error_pesantren_kesantrian') === 'true';
  });

  useEffect(() => {
    const fetchKesantrian = async () => {
      try {
        const response = await fetch('/api/kesantrian');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setActivities(data);
        localStorage.setItem('pesantren_kesantrian', JSON.stringify(data));
        setError(false);
        localStorage.removeItem('error_pesantren_kesantrian');
      } catch (e) {
        console.error('Error fetching kesantrian:', e);
        setError(true);
        localStorage.setItem('error_pesantren_kesantrian', 'true');
      } finally {
        setLoading(false);
      }
    };
    fetchKesantrian();
  }, []);

  return { activities, loading, error };
}

export function useDailySchedules() {
  const [schedules, setSchedules] = useState<any[]>(() => {
    const cached = localStorage.getItem('pesantren_daily_schedules');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(schedules.length === 0);
  const [error, setError] = useState<boolean>(() => {
    return localStorage.getItem('error_pesantren_daily_schedules') === 'true';
  });

  useEffect(() => {
    const fetchDailySchedules = async () => {
      try {
        const response = await fetch('/api/daily_schedules');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSchedules(data);
        localStorage.setItem('pesantren_daily_schedules', JSON.stringify(data));
        setError(false);
        localStorage.removeItem('error_pesantren_daily_schedules');
      } catch (e) {
        console.error('Error fetching daily_schedules:', e);
        setError(true);
        localStorage.setItem('error_pesantren_daily_schedules', 'true');
      } finally {
        setLoading(false);
      }
    };
    fetchDailySchedules();
  }, []);

  return { schedules, loading, error };
}

export function useStats() {
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem('stats');
    return cached ? JSON.parse(cached) : {
      programs: 0,
      facilities: 0,
      gallery: 0,
      kesantrian: 0,
      permits: 0,
      students: 0,
      prayerViolations: 0
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        localStorage.setItem('stats', JSON.stringify(data));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  return { stats, loading };
}
