import { Navigate, Route, Routes } from 'react-router'
import { lazy, Suspense } from 'react'
import { Layout } from './components/Layout'
import { MaintenancePage } from './pages/MaintenancePage'

const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })))
const DeliveryPage = lazy(() => import('./pages/DeliveryPage').then((module) => ({ default: module.DeliveryPage })))
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const InventoryPage = lazy(() => import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then((module) => ({ default: module.TermsPage })))
const TeamPage = lazy(() => import('./pages/TeamPage').then((module) => ({ default: module.TeamPage })))
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage').then((module) => ({ default: module.VehicleDetailPage })))
const WarrantyPage = lazy(() => import('./pages/WarrantyPage').then((module) => ({ default: module.WarrantyPage })))

const RouteFallback = () => <div className="min-h-[70vh] bg-[var(--color-warm-white)]" role="status" aria-live="polite"><span className="sr-only">Loading page</span></div>

const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

const App = () => (
  <Routes>
    <Route element={<Layout />}>
    {maintenanceMode ? (
      <Route path="*" element={<MaintenancePage />} />
    ) : (
      <>
        <Route index element={<Suspense fallback={<RouteFallback />}><HomePage /></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={<RouteFallback />}><InventoryPage /></Suspense>} />
        <Route path="inventory/:slug" element={<Suspense fallback={<RouteFallback />}><VehicleDetailPage /></Suspense>} />
        <Route path="delivery" element={<Suspense fallback={<RouteFallback />}><DeliveryPage /></Suspense>} />
        <Route path="warranty" element={<Suspense fallback={<RouteFallback />}><WarrantyPage /></Suspense>} />
        <Route path="about" element={<Suspense fallback={<RouteFallback />}><AboutPage /></Suspense>} />
        <Route path="team" element={<Suspense fallback={<RouteFallback />}><TeamPage /></Suspense>} />
        <Route path="contact" element={<Suspense fallback={<RouteFallback />}><ContactPage /></Suspense>} />
        <Route path="privacy-policy" element={<Suspense fallback={<RouteFallback />}><PrivacyPage /></Suspense>} />
        <Route path="terms" element={<Suspense fallback={<RouteFallback />}><TermsPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    )}
    </Route>
  </Routes>
)

export default App
