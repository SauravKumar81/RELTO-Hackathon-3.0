import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MapPage } from '../pages/MapPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { HistoryPage } from '../pages/HistoryPage';
import { Modal } from '../components/ui/Modal';

const AuthModals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginOpen = location.pathname === '/login';
  const isRegisterOpen = location.pathname === '/register';

  const handleClose = () => {
    navigate('/', { replace: true });
  };

  return (
    <>
      <Modal open={isLoginOpen} onClose={handleClose}>
        <div className="w-full max-w-sm mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
                <img src="/favicon.png" alt="Relto Logo" className="h-12 w-12 object-contain rounded-xl shadow-lg border border-white/10" />
                <span className="text-3xl font-bold text-white tracking-tighter text-glow">RELTO</span>
            </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-glow">Welcome Back</h2>
          <p className="text-gray-400 mb-6 text-sm">Sign in to continue your search</p>
          <LoginPage />
        </div>
      </Modal>

      <Modal open={isRegisterOpen} onClose={handleClose}>
        <div className="w-full max-w-sm mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
                <img src="/favicon.png" alt="Relto Logo" className="h-12 w-12 object-contain rounded-xl shadow-lg border border-white/10" />
                <span className="text-3xl font-bold text-white tracking-tighter text-glow">RELTO</span>
            </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-glow">Create Account</h2>
          <p className="text-gray-400 mb-6 text-sm">Join the community to find and return items</p>
          <RegisterPage />
        </div>
      </Modal>
    </>
  );
};

const MainLayout = () => {
  return (
    <>
      <MapPage />
      <AuthModals />
    </>
  );
};

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/login" element={<MainLayout />} />
        <Route path="/register" element={<MainLayout />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
