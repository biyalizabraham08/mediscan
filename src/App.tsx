import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import OTPVerifyPage from './pages/OTPVerifyPage';
import MedicalProfilePage from './pages/MedicalProfilePage';
import QRCodePage from './pages/QRCodePage';
import DashboardPage from './pages/DashboardPage';
import EmergencyPage from './pages/EmergencyPage';
import DoctorAccessPage from './pages/DoctorAccessPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState, isLoading } = useAuth();
  if (isLoading) return null;
  if (!authState.isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isLoading } = useAuth();
  const hasSupabaseKeys = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!hasSupabaseKeys) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff1f1', padding: 24, textAlign: 'center' }}>
        <div style={{ background: 'var(--red)', color: 'white', padding: '12px 24px', borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>Configuration Required</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Supabase Keys are Missing</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 24 }}>
          Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file to continue.
        </p>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Check the <code>supabase_schema.sql</code> file for setup instructions.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OTPVerifyPage />} />
        <Route path="/profile/create" element={
          <ProtectedRoute><MedicalProfilePage /></ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute><MedicalProfilePage /></ProtectedRoute>
        } />
        <Route path="/qr-code" element={
          <ProtectedRoute><QRCodePage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/emergency/:userId" element={<EmergencyPage />} />
        <Route path="/doctor-access/:userId" element={<DoctorAccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
