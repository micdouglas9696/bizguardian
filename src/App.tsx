import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InternationalizationPage from './pages/InternationalizationPage';
import FranchiseLandingPage from './pages/FranchiseLandingPage';
import FranchiseLessonsPage from './pages/FranchiseLessonsPage';
import FranchiseCRMPage from './pages/FranchiseCRMPage';
import EbookLandingPage from './pages/EbookLandingPage';
import EbookSuccessPage from './pages/EbookSuccessPage';
import MemberActivatePage from './pages/MemberActivatePage';
import MemberLoginPage from './pages/MemberLoginPage';
import MemberForgotPasswordPage from './pages/MemberForgotPasswordPage';
import MemberDashboardPage from './pages/MemberDashboardPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
      </Routes>
    </Router>
  );
}
