import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import PredictPage from './pages/PredictPage';
import ResultPage from './pages/ResultPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TreatmentPlanPage from './pages/TreatmentPlanPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <BrowserRouter>
      <div id="stars-container">
        <div className="star-layer stars-small"></div>
        <div className="star-layer stars-medium"></div>
        <div className="star-layer stars-large"></div>
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/treatment-plan" element={<TreatmentPlanPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
