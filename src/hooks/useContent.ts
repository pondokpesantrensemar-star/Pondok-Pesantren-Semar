import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { internalAuth } from '../lib/internalAuth';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export function useAdminRole() {
  const [role, setRole] = useState<string | null>(() => {
    const cached = sessionStorage.getItem('pesantren_role');
    return cached || null;
  });
  const [adminData, setAdminData] = useState<any>(() => {
    const cached = sessionStorage.getItem('pesantren_admin_data');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!role);

  useEffect(() => {
    const fetch = async () => {
      const user = internalAuth.getUser();
      if (!user) {
        setRole('none');
        setAdminData(null);
        setLoading(false);
        sessionStorage.removeItem('pesantren_role');
        sessionStorage.removeItem('pesantren_admin_data');
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, 'admins', user.id));
        if (snap.exists()) {
          const data = snap.data();
          const accessRole = data.access || 'all';
          setRole(accessRole);
          setAdminData(data);
          sessionStorage.setItem('pesantren_role', accessRole);
          sessionStorage.setItem('pesantren_admin_data', JSON.stringify(data));
        } else {
          setRole(user.access);
          setAdminData(user);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `admins/${user.id}`);
        setRole(user.access);
        setAdminData(user);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { role, adminData, loading };
}

export function useSettings() {
  const [settings, setSettings] = useState<any>(() => {
    const cached = sessionStorage.getItem('pesantren_settings');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!settings);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'website'));
        if (snap.exists()) {
          const data = snap.data();
          setSettings(data);
          sessionStorage.setItem('pesantren_settings', JSON.stringify(data));
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'settings/website');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { settings, loading };
}

export function usePrograms() {
  const [programs, setPrograms] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('pesantren_programs');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(programs.length === 0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'programs'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPrograms(data);
        sessionStorage.setItem('pesantren_programs', JSON.stringify(data));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'programs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { programs, loading };
}

export function useGallery() {
  const [images, setImages] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('pesantren_gallery');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(images.length === 0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setImages(data);
        sessionStorage.setItem('pesantren_gallery', JSON.stringify(data));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'gallery');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { images, loading };
}

export function useFacilities() {
  const [facilities, setFacilities] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('pesantren_facilities');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(facilities.length === 0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'facilities'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFacilities(data);
        sessionStorage.setItem('pesantren_facilities', JSON.stringify(data));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'facilities');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { facilities, loading };
}

export function useKesantrian() {
  const [activities, setActivities] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('pesantren_kesantrian');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(activities.length === 0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'kesantrian'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setActivities(data);
        sessionStorage.setItem('pesantren_kesantrian', JSON.stringify(data));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'kesantrian');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { activities, loading };
}

export function useStats() {
  const [stats, setStats] = useState(() => {
    const cached = sessionStorage.getItem('stats');
    return cached ? JSON.parse(cached) : {
      programs: 0,
      facilities: 0,
      gallery: 0,
      kesantrian: 0,
      permits: 0,
      students: 0
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const collections = ['programs', 'facilities', 'gallery', 'kesantrian', 'permits', 'students'];
        const results = await Promise.all(collections.map(async (c) => {
          try {
            return await getCountFromServer(collection(db, c));
          } catch (err) {
            handleFirestoreError(err, OperationType.LIST, c);
            throw err;
          }
        }));
        
        const newStats = {
          programs: results[0].data().count,
          facilities: results[1].data().count,
          gallery: results[2].data().count,
          kesantrian: results[3].data().count,
          permits: results[4].data().count,
          students: results[5].data().count
        };
        setStats(newStats);
        sessionStorage.setItem('stats', JSON.stringify(newStats));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (stats.programs === 0 && stats.facilities === 0 && stats.gallery === 0 && stats.kesantrian === 0 && stats.permits === 0 && stats.students === 0) {
      fetch();
    }
  }, []);

  return { stats, loading };
}
