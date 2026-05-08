import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { internalAuth } from '../lib/internalAuth';

export function useAdminRole() {
  const [role, setRole] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const user = internalAuth.getUser();
      if (!user) {
        setRole('none');
        setAdminData(null);
        setLoading(false);
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, 'admins', user.id));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.access || 'all');
          setAdminData(data);
        } else {
          // Fallback to local session data if doc is missing but session exists
          setRole(user.access);
          setAdminData(user);
        }
      } catch (e) {
        console.error("Role Check Error:", e);
        // Fallback to local session data
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
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'website'));
        if (snap.exists()) setSettings(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { settings, loading };
}

export function usePrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'programs'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { programs, loading };
}

export function useGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { images, loading };
}

export function useFacilities() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'facilities'));
        const snap = await getDocs(q);
        setFacilities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { facilities, loading };
}

export function useKesantrian() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'kesantrian'));
        const snap = await getDocs(q);
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { activities, loading };
}

export function useStats() {
  const [stats, setStats] = useState({
    programs: 0,
    facilities: 0,
    gallery: 0,
    kesantrian: 0,
    permits: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const collections = ['programs', 'facilities', 'gallery', 'kesantrian', 'permits', 'students'];
        const results = await Promise.all(collections.map(c => getDocs(collection(db, c))));
        
        setStats({
          programs: results[0].size,
          facilities: results[1].size,
          gallery: results[2].size,
          kesantrian: results[3].size,
          permits: results[4].size,
          students: results[5].size
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading };
}
