/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from "react";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import AboutUs from "./components/AboutUs";
import Gallery from "./components/Gallery";
import News from "./components/News";
import Facilities from "./components/Facilities";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import { motion, useScroll, useSpring } from "motion/react";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Admin Lazy Imports
const AuthGuard = lazy(() => import("./components/Admin/AuthGuard"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout"));
const DashboardHome = lazy(() => import("./components/Admin/DashboardHome"));
const ProgramManager = lazy(() => import("./components/Admin/ProgramManager"));
const NewsManager = lazy(() => import("./components/Admin/NewsManager"));
const SettingManager = lazy(() => import("./components/Admin/SettingManager"));
const GalleryManager = lazy(() => import("./components/Admin/GalleryManager"));
const FacilityManager = lazy(() => import("./components/Admin/FacilityManager"));
const KesantrianManager = lazy(() => import("./components/Admin/KesantrianManager"));
const ActivityManager = lazy(() => import("./components/Admin/ActivityManager"));
const ViolationManager = lazy(() => import("./components/Admin/ViolationManager"));
const FinancialManager = lazy(() => import("./components/Admin/FinancialManager"));
const PermitManager = lazy(() => import("./components/Admin/PermitManager"));
const StaffManager = lazy(() => import("./components/Admin/StaffManager"));

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
    <div className="relative public-landing">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-pesantren-gold z-[100] origin-left"
        style={{ scaleX }}
      />
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <Programs />
        <Facilities />
        <News />
        <Gallery />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // seedInitialData(); Removed Firebase seeding
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A3C34',
            color: '#fff',
            borderRadius: '1.5rem',
            padding: '16px 24px',
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<PublicView />} />
          
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
          <Route path="/admin/news" element={
            <AuthGuard>
              <AdminLayout>
                <NewsManager />
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
          <Route path="/admin/activities" element={
            <AuthGuard>
              <AdminLayout>
                <ActivityManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/prayer" element={
            <AuthGuard>
              <AdminLayout>
                <ViolationManager />
              </AdminLayout>
            </AuthGuard>
          } />
          <Route path="/admin/financial" element={
            <AuthGuard>
              <AdminLayout>
                <FinancialManager />
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
          <Route path="/admin/staff" element={
            <AuthGuard>
              <AdminLayout>
                <StaffManager />
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
