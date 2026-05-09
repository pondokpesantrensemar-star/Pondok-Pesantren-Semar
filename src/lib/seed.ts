import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreUtils';

export async function seedInitialData() {
  // Optimization: Don't check for seeding if we've already done it in this browser session
  if (localStorage.getItem('pesantren_seeded')) {
    return;
  }

  try {
    // Check if admins collection is empty
    let adminSnap;
    try {
      const adminQuery = query(collection(db, 'admins'), limit(1));
      adminSnap = await getDocs(adminQuery);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'admins');
      return; // Stop seeding if permission denied
    }

    if (adminSnap.empty) {
      // Default admin: admin / admin123
      const adminId = 'admin@pesantren.local';
      try {
        await setDoc(doc(db, 'admins', adminId), {
          username: 'admin',
          password: 'admin123',
          access: 'all',
          addedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `admins/${adminId}`);
      }
    }

    // Check if hero settings exist
    let settingsDoc;
    try {
      settingsDoc = await getDoc(doc(db, 'settings', 'website'));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/website');
      return;
    }

    if (!settingsDoc.exists()) {
      try {
        await setDoc(doc(db, 'settings', 'website'), {
          aboutText: 'Pondok Pesantren Semar adalah lembaga pendidikan Islam yang fokus pada pembentukan karakter dan ilmu pengetahuan.',
          vision: 'Menjadi pusat keunggulan pendidikan Islam yang moderat and inovatif.',
          mission: '1. Menyelenggarakan pendidikan berkualitas. 2. Membentuk santri berakhlakul karimah.',
          footerAddress: 'Alamat Pondok Pesantren Semar, Jawa Tengah, Indonesia'
        });
        
        await setDoc(doc(db, 'website_config', 'main'), {
          heroTitle: 'Pondok Pesantren Semar',
          heroSubtitle: 'Membentuk Generasi Qurani yang Berakhlak Mulia dan Berwawasan Luas',
          contactEmail: 'info@pesantrensemar.id',
          contactPhone: '+62 812 3456 7890',
          address: 'Jl. Pesantren No. 1, Semarang'
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'multi-settings');
      }
    }
    
    // Mark as seeded to avoid redundant checks
    localStorage.setItem('pesantren_seeded', 'true');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}
