/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./lib/firebase";

// Components
import Navbar from "./components/Navbar";
import RunningText from "./components/RunningText";
import ImageTicker from "./components/ImageTicker";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import AboutUs from "./components/AboutUs";
import Gallery from "./components/Gallery";
import Facilities from "./components/Facilities";
import Kesantrian from "./components/Kesantrian";
import Footer from "./components/Footer";
import { motion, useScroll, useSpring } from "motion/react";
import { Phone, Loader2 } from "lucide-react";

// Admin Lazy Imports
const AuthGuard = lazy(() => import("./components/Admin/AuthGuard"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout"));
const DashboardHome = lazy(() => import("./components/Admin/DashboardHome"));
const ProgramManager = lazy(() => import("./components/Admin/ProgramManager"));
const SettingManager = lazy(() => import("./components/Admin/SettingManager"));
const GalleryManager = lazy(() => import("./components/Admin/GalleryManager"));
const FacilityManager = lazy(() => import("./components/Admin/FacilityManager"));
const KesantrianManager = lazy(() => import("./components/Admin/KesantrianManager"));
const PermitManager = lazy(() => import("./components/Admin/PermitManager"));
const RegistrationManager = lazy(() => import("./components/Admin/RegistrationManager"));
const PublicRegistration = lazy(() => import("./components/PublicRegistration"));

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-pesantren-cream">
    <Loader2 className="w-10 h-10 text-pesantren-green animate-spin mb-4" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Pondok Pesantren Semar</p>
  </div>
);

function PublicView() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative public-landing pt-[196px]">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-pesantren-gold z-[100] origin-left"
        style={{ scaleX }}
      />
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <RunningText />
        <Navbar />
        <ImageTicker />
      </div>
      <main>
        <Hero />
        <AboutUs />
        <Programs />
        <Kesantrian />
        <Facilities />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or internet connection.");
        }
      }
    };
    testConnection();
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/daftar" element={<PublicRegistration />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AuthGuard>
              <AdminLayout>
                <DashboardHome />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/programs" element={
            <AuthGuard>
              <AdminLayout>
                <ProgramManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/gallery" element={
            <AuthGuard>
              <AdminLayout>
                <GalleryManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/registrations" element={
            <AuthGuard>
              <AdminLayout>
                <RegistrationManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/facilities" element={
            <AuthGuard>
              <AdminLayout>
                <FacilityManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/kesantrian" element={
            <AuthGuard>
              <AdminLayout>
                <KesantrianManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/permits" element={
            <AuthGuard>
              <AdminLayout>
                <PermitManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/settings" element={
            <AuthGuard>
              <AdminLayout>
                <SettingManager />
              </AdminLayout>
            </AuthGuard>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
