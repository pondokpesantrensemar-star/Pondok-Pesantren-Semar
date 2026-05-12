import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Firebase
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const getList = (tableName: string) => async (req: express.Request, res: express.Response) => {
  try {
    const snapshot = await getDocs(collection(db, tableName));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch(e) {
    console.error(`Error getList ${tableName}:`, e);
    res.status(500).json({ error: e });
  }
}

const deleteItem = (tableName: string) => async (req: express.Request, res: express.Response) => {
  try {
    await deleteDoc(doc(db, tableName, req.params.id as string));
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e });
  }
}

app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body; // base64
    const docRef = doc(collection(db, 'images'));
    await setDoc(docRef, { data: image, createdAt: new Date().toISOString() });
    res.json({ url: `/api/images/${docRef.id}` });
  } catch(e) {
    res.status(500).json({ error: e });
  }
});

app.get('/api/images/:id', async (req, res) => {
  try {
    const docSnap = await getDoc(doc(db, 'images', req.params.id as string));
    if (docSnap.exists()) {
      const data = docSnap.data().data;
      if (typeof data === 'string') {
          const match = data.match(/^data:(image\/\w+);base64,(.*)$/);
          if (match) {
            const img = Buffer.from(match[2], 'base64');
            res.writeHead(200, {
              'Content-Type': match[1],
              'Content-Length': img.length,
              'Cache-Control': 'public, max-age=31536000'
            });
            res.end(img);
            return;
          }
      }
    }
    res.status(404).end();
  } catch(e) {
    res.status(500).end();
  }
});
app.get('/api/programs', getList('programs'));
app.post('/api/programs', async (req, res) => {
  try {
    const { title, description, imageUrl, order } = req.body;
    const docRef = doc(collection(db, 'programs'));
    await setDoc(docRef, { title, description, imageUrl, order: order || 0 });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/programs/:id', async (req, res) => {
  try {
    const { title, description, imageUrl, order } = req.body;
    await updateDoc(doc(db, 'programs', req.params.id as string), { title, description, imageUrl, order: order || 0 });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/programs/:id', deleteItem('programs'));

app.get('/api/gallery', getList('gallery'));
app.post('/api/gallery', async (req, res) => {
  try {
    const { url, title, imageUrl, category, date, order, rotation, brightness, contrast, grayscale } = req.body;
    const resolvedUrl = url || imageUrl;
    const docRef = doc(collection(db, 'gallery'));
    await setDoc(docRef, { 
      url: resolvedUrl, title, category, order: order || 0, rotation: rotation || 0, 
      brightness: brightness || 100, contrast: contrast || 100, grayscale: grayscale ? 1 : 0, date 
    });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/gallery/:id', async (req, res) => {
  try {
    const { url, title, imageUrl, category, date, order, rotation, brightness, contrast, grayscale } = req.body;
    const resolvedUrl = url || imageUrl;
    await updateDoc(doc(db, 'gallery', req.params.id as string), { 
      url: resolvedUrl, title, category, order: order || 0, rotation: rotation || 0, 
      brightness: brightness || 100, contrast: contrast || 100, grayscale: grayscale ? 1 : 0, date 
    });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/gallery/:id', deleteItem('gallery'));

app.get('/api/facilities', getList('facilities'));
app.post('/api/facilities', async (req, res) => {
  try {
    const { name, description, imageUrl, icon } = req.body;
    const docRef = doc(collection(db, 'facilities'));
    await setDoc(docRef, { name, description, imageUrl, icon });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/facilities/:id', async (req, res) => {
  try {
    const { name, description, imageUrl, icon } = req.body;
    await updateDoc(doc(db, 'facilities', req.params.id as string), { name, description, imageUrl, icon });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/facilities/:id', deleteItem('facilities'));

app.get('/api/kesantrian', getList('kesantrian'));
app.post('/api/kesantrian', async (req, res) => {
  try {
    const { title, description, imageUrl, schedule, date, category } = req.body;
    const docRef = doc(collection(db, 'kesantrian'));
    await setDoc(docRef, { title, description, imageUrl, schedule, date, category });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/kesantrian/:id', async (req, res) => {
  try {
    const { title, description, imageUrl, schedule, date, category } = req.body;
    await updateDoc(doc(db, 'kesantrian', req.params.id as string), { title, description, imageUrl, schedule, date, category });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/kesantrian/:id', deleteItem('kesantrian'));

app.get('/api/news', getList('news'));
app.post('/api/news', async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, date } = req.body;
    const docRef = doc(collection(db, 'news'));
    await setDoc(docRef, { title, excerpt, content, imageUrl, date, createdAt: Date.now() });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/news/:id', async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, date } = req.body;
    await updateDoc(doc(db, 'news', req.params.id as string), { title, excerpt, content, imageUrl, date });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/news/:id', deleteItem('news'));

app.get('/api/daily_schedules', getList('daily_schedules'));
app.post('/api/daily_schedules', async (req, res) => {
  try {
    const { time, activity, description, gender, order } = req.body;
    const docRef = doc(collection(db, 'daily_schedules'));
    await setDoc(docRef, { time, activity, description, gender, order: order || 0 });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/daily_schedules/:id', async (req, res) => {
  try {
    const { time, activity, description, gender, order } = req.body;
    await updateDoc(doc(db, 'daily_schedules', req.params.id as string), { time, activity, description, gender, order: order || 0 });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/daily_schedules/:id', deleteItem('daily_schedules'));

app.get('/api/students', getList('students'));
app.post('/api/students', async (req, res) => {
  try {
    const { name, gender, nis, photoUrl, imageUrl, birthPlace, birthDate, phone, address, parentName, parentPhone, status, entryYear, class: studentClass, room } = req.body;
    const resolvedUrl = photoUrl || imageUrl;
    const docRef = doc(collection(db, 'students'));
    await setDoc(docRef, { name, gender, nis, photoUrl: resolvedUrl, birthPlace, birthDate, phone, address, parentName, parentPhone, status, entryYear, class: studentClass, room, imageUrl: resolvedUrl });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/students/:id', async (req, res) => {
  try {
    const { name, gender, nis, photoUrl, imageUrl, birthPlace, birthDate, phone, address, parentName, parentPhone, status, entryYear, class: studentClass, room } = req.body;
    const resolvedUrl = photoUrl || imageUrl;
    await updateDoc(doc(db, 'students', req.params.id as string), { name, gender, nis, photoUrl: resolvedUrl, birthPlace, birthDate, phone, address, parentName, parentPhone, status, entryYear, class: studentClass, room, imageUrl: resolvedUrl });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/students/:id', deleteItem('students'));

app.get('/api/admins', getList('admins'));
app.post('/api/admins', async (req, res) => {
  try {
    const { username, password, access, type, addedBy } = req.body;
    const docRef = doc(collection(db, 'admins'));
    await setDoc(docRef, { username, password, access: access || 'kesantrian', type: type || 'credential', addedAt: new Date().toISOString(), addedBy: addedBy || 'Admin' });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/admins/:id', async (req, res) => {
  try {
    const { username, password, access } = req.body;
    await updateDoc(doc(db, 'admins', req.params.id as string), { username, password, access });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/admins/:id', deleteItem('admins'));

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const snapshot = await getDocs(query(collection(db, 'admins'), where('username', '==', username), where('password', '==', password)));
    if (!snapshot.empty) {
      res.json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    } else {
      res.status(401).json({ error: 'Username atau password salah' });
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

app.get('/api/admins/count', async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'admins'));
    res.json({ count: snapshot.docs.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

app.post('/api/admins/setup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const snapshot = await getDocs(collection(db, 'admins'));
    if (snapshot.docs.length > 0) {
      return res.status(403).json({ error: 'Sistem sudah setup.' });
    }
    await setDoc(doc(db, 'admins', 'admin-1'), { username, password, access: 'all', type: 'credential', addedAt: new Date().toISOString(), addedBy: 'Setup' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

app.get('/api/permits', async (req, res) => {
  try {
    const { studentName } = req.query;
    let snapshot;
    if (studentName) {
      snapshot = await getDocs(query(collection(db, 'permits'), where('studentName', '==', studentName)));
    } else {
      snapshot = await getDocs(collection(db, 'permits'));
    }
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch(e) { res.status(500).json({ error: e }); }
});
app.post('/api/permits', async (req, res) => {
  try {
    const { studentName, gender, type, reason, startDate, endDate, authorizedBy } = req.body;
    const docRef = doc(collection(db, 'permits'));
    await setDoc(docRef, { studentName, gender, type, reason, startDate, endDate, status: 'Approved', createdAt: new Date().toISOString(), authorizedBy: authorizedBy || 'Admin' });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.put('/api/permits/:id', async (req, res) => {
  try {
    const { endDate } = req.body;
    await updateDoc(doc(db, 'permits', req.params.id as string), { endDate });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/permits/:id', deleteItem('permits'));

app.get('/api/expenses', getList('expenses'));
app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, date, category, notes, recordedBy } = req.body;
    const docRef = doc(collection(db, 'expenses'));
    await setDoc(docRef, { title, amount, date, category, notes, recordedBy: recordedBy || 'Admin', createdAt: new Date().toISOString() });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/expenses/:id', deleteItem('expenses'));

app.get('/api/financial_records', async (req, res) => {
  try {
    const { studentId } = req.query;
    let snapshot;
    if (studentId) {
      snapshot = await getDocs(query(collection(db, 'financial_records'), where('studentId', '==', studentId)));
    } else {
      snapshot = await getDocs(collection(db, 'financial_records'));
    }
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch(e) { res.status(500).json({ error: e }); }
});
app.post('/api/financial_records', async (req, res) => {
  try {
    const { studentId, studentName, amount, category, month, year, status, notes } = req.body;
    const docRef = doc(collection(db, 'financial_records'));
    await setDoc(docRef, { studentId, studentName, amount, category, month, year, status, paymentDate: status === 'Lunas' ? new Date().toISOString(): null, notes, createdAt: new Date().toISOString() });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/financial_records/:id', deleteItem('financial_records'));

app.get('/api/student_violations', getList('student_violations'));
app.post('/api/student_violations', async (req, res) => {
  try {
    const { studentId, studentName, studentClass, violationType, prayerName, date, reason, actionTaken, isNotified } = req.body;
    const docRef = doc(collection(db, 'student_violations'));
    await setDoc(docRef, { studentId, studentName, studentClass, violationType, prayerName, date, reason, actionTaken, isNotified: isNotified ? 1 : 0, reportedBy: 'Admin', createdAt: new Date().toISOString() });
    res.json({ id: docRef.id });
  } catch(e) { res.status(500).json({ error: e }); }
});
app.delete('/api/student_violations/:id', deleteItem('student_violations'));

app.get('/api/settings', async (req, res) => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'site_settings'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Migration: if data only contains a 'config' string, unpack it
      if (data.config && typeof data.config === 'string' && Object.keys(data).length === 1) {
        try {
          return res.json(JSON.parse(data.config));
        } catch (e) {
          // Fallback if parse fails
        }
      }
      res.json(data);
    } else {
      res.json({});
    }
  } catch (e) {
    console.error('Error fetching settings:', e);
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});
app.post('/api/settings', async (req, res) => {
  try {
    const settingsData = req.body;
    if (!settingsData || typeof settingsData !== 'object') {
        return res.status(400).json({ error: 'Invalid settings data' });
    }
    // Ensure we don't save excessive data and exclude non-serializable stuff
    await setDoc(doc(db, 'settings', 'site_settings'), {
      ...settingsData,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (e) {
    console.error('Error saving settings:', e);
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const students = await getDocs(collection(db, 'students'));
    const permits = await getDocs(query(collection(db, 'permits'), where('status', '==', 'Approved')));
    const violations = await getDocs(collection(db, 'student_violations'));
    const programs = await getDocs(collection(db, 'programs'));
    const facilities = await getDocs(collection(db, 'facilities'));
    const gallery = await getDocs(collection(db, 'gallery'));
    const kesantrian = await getDocs(collection(db, 'kesantrian'));
    
    res.json({
      students: students.docs.length,
      permits: permits.docs.length,
      prayerViolations: violations.docs.length,
      programs: programs.docs.length,
      facilities: facilities.docs.length,
      gallery: gallery.docs.length,
      kesantrian: kesantrian.docs.length
    });
  } catch(e) { res.status(500).json({ error: e }); }
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
