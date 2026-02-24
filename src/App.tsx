import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InternationalizationPage from './pages/InternationalizationPage';
import FranchiseLandingPage from './pages/FranchiseLandingPage';
import FranchiseLessonsPage from './pages/FranchiseLessonsPage';
import FranchiseCRMPage from './pages/FranchiseCRMPage';
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
      </Routes>
    </Router>
  );
}
