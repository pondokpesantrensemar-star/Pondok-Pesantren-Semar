import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export function useAdminRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      
      const email = auth.currentUser.email?.toLowerCase();
      if (email === 'pondokpesantrensemar@gmail.com') {
        setRole('all');
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'admins', email || ''));
        if (snap.exists()) {
          setRole(snap.data().access || 'all');
        } else {
          setRole('all'); // Default to all if not found (might be legacy admin)
        }
      } catch (e) {
        console.error(e);
        setRole('all');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [auth.currentUser]);

  return { role, loading };
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

export function useRecentRegistrations() {
  const { role, loading: roleLoading } = useAdminRole();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;

    const fetch = async () => {
      try {
        const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (role === 'putra') {
          data = data.filter((r: any) => r.gender === 'Laki-laki');
        } else if (role === 'putri') {
          data = data.filter((r: any) => r.gender === 'Perempuan');
        }

        setRegistrations(data.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [role, roleLoading]);

  return { registrations, loading };
}
export function useStats() {
  const { role, loading: roleLoading } = useAdminRole();
  const [stats, setStats] = useState({
    programs: 0,
    facilities: 0,
    gallery: 0,
    registrations: 0,
    kesantrian: 0,
    permits: 0,
    putra: 0,
    putri: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;

    const fetch = async () => {
      try {
        const collections = ['programs', 'facilities', 'gallery', 'registrations', 'kesantrian', 'permits'];
        const results = await Promise.all(collections.map(c => getDocs(collection(db, c))));
        
        // Calculate gender distribution from registrations (results[3])
        const registrationDocs = results[3].docs;
        let filteredRegs = registrationDocs;
        
        if (role === 'putra') {
          filteredRegs = registrationDocs.filter(doc => doc.data().gender === 'Laki-laki');
        } else if (role === 'putri') {
          filteredRegs = registrationDocs.filter(doc => doc.data().gender === 'Perempuan');
        }

        const putra = registrationDocs.filter(doc => doc.data().gender === 'Laki-laki').length;
        const putri = registrationDocs.filter(doc => doc.data().gender === 'Perempuan').length;

        setStats({
          programs: results[0].size,
          facilities: results[1].size,
          gallery: results[2].size,
          registrations: filteredRegs.length,
          kesantrian: results[4].size,
          permits: results[5].size,
          putra,
          putri
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [role, roleLoading]);

  return { stats, loading };
}
