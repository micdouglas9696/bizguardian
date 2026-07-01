import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ScrollToTop from './components/ScrollToTop';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const InternationalizationPage = lazy(() => import('./pages/InternationalizationPage'));
const FranchiseLandingPage = lazy(() => import('./pages/FranchiseLandingPage'));
const FranchiseLessonsPage = lazy(() => import('./pages/FranchiseLessonsPage'));
const FranchiseCRMPage = lazy(() => import('./pages/FranchiseCRMPage'));
const EbookLandingPage = lazy(() => import('./pages/EbookLandingPage'));
const EbookSuccessPage = lazy(() => import('./pages/EbookSuccessPage'));
const MemberActivatePage = lazy(() => import('./pages/MemberActivatePage'));
const MemberLoginPage = lazy(() => import('./pages/MemberLoginPage'));
const MemberForgotPasswordPage = lazy(() => import('./pages/MemberForgotPasswordPage'));
const MemberDashboardPage = lazy(() => import('./pages/MemberDashboardPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminAutomacoes = lazy(() => import('./pages/AdminAutomacoes'));
const LinkCommercePage = lazy(() => import('./pages/LinkCommercePage'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/link" element={<LinkCommercePage />} />
        <Route path="/internationalization" element={<InternationalizationPage />} />
        <Route path="/franquia" element={<FranchiseLandingPage />} />
        <Route path="/franquia/aulas" element={<FranchiseLessonsPage />} />
        <Route path="/franquia/crm" element={<FranchiseCRMPage />} />

        {/* Ebook Sales Funnel */}
        <Route path="/ebook" element={<EbookLandingPage />} />
        <Route path="/ebook/sucesso" element={<EbookSuccessPage />} />

        {/* Member Area · Biblioteca multi-produto */}
        <Route path="/membro/ativar" element={<MemberActivatePage />} />
        <Route path="/membro/redefinir" element={<MemberActivatePage />} />
        <Route path="/membro/login" element={<MemberLoginPage />} />
        <Route path="/membro/esqueci-senha" element={<MemberForgotPasswordPage />} />
        <Route path="/membro" element={<MemberDashboardPage />} />

        {/* Admin CRM Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/automacoes" element={<AdminAutomacoes />} />
      </Routes>
      </Suspense>
    </Router>
  );
}
