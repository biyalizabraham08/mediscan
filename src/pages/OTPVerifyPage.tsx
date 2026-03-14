import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { verifyEmailOTP, resendOTP } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;

export default function OTPVerifyPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const { userId, email } = (location.state as { userId: string; email: string }) || {};
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!userId) { navigate('/signup'); return; }
        inputRefs.current[0]?.focus();
    }, [userId, navigate]);

    useEffect(() => {
        if (timer <= 0) return;
        const t = setTimeout(() => setTimer(p => p - 1), 1000);
        return () => clearTimeout(t);
    }, [timer]);

    function handleChange(idx: number, val: string) {
        if (!/^[0-9]?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    }

    function handleKeyDown(idx: number, e: KeyboardEvent) {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    }

    function handlePaste(e: ClipboardEvent) {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const next = [...Array(OTP_LENGTH).fill('')];
        text.split('').forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    }

    async function handleVerify() {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) { toast.error('Please enter all 6 digits'); return; }
        setLoading(true);
        try {
            const res = await verifyEmailOTP(userId, code);
            if (!res.success) { toast.error(res.message); setLoading(false); return; }
            setSuccess(true);
            login(res.user!, res.token!);
            setTimeout(() => navigate('/profile/create'), 1200);
        } catch {
            toast.error('Verification failed. Please try again.'); setLoading(false);
        }
    }

    async function handleResend() {
        setResending(true);
        await resendOTP(userId);
        setTimer(60);
        setOtp(Array(OTP_LENGTH).fill(''));
        toast.success('OTP resent. Please check your email.');
        inputRefs.current[0]?.focus();
        setResending(false);
    }

    if (success) {
        return (
            <div className="page-center">
                <div style={{ textAlign: 'center' }} className="animate-in">
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={36} color="var(--green)" />
                    </div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Email Verified!</h2>
                    <p>Setting up your profile…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-center" style={{ background: 'linear-gradient(160deg, #fff7f7 0%, #f8f9fc 100%)' }}>
            <div className="container animate-in" style={{ maxWidth: 440 }}>
                <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back
                </Link>

                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#E53935" strokeWidth="2" />
                            <path d="M22 6l-10 7L2 6" stroke="#E53935" strokeWidth="2" />
                        </svg>
                    </div>
                    <h2 style={{ marginBottom: 6 }}>Check your email</h2>
                    <p style={{ fontSize: '0.9375rem' }}>
                        We sent a 6-digit code to<br />
                        <strong style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</strong>
                    </p>
                </div>

                <div className="card">
                    <div className="otp-inputs" onPaste={handlePaste} style={{ marginBottom: 24 }}>
                        {otp.map((val, idx) => (
                            <input
                                key={idx}
                                ref={el => { inputRefs.current[idx] = el; }}
                                className={`otp-input ${val ? 'filled' : ''}`}
                                type="text" inputMode="numeric" maxLength={1}
                                value={val}
                                onChange={e => handleChange(idx, e.target.value)}
                                onKeyDown={e => handleKeyDown(idx, e)}
                            />
                        ))}
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" onClick={handleVerify} disabled={loading}>
                        {loading ? <><span className="spinner" />Verifying…</> : 'Verify Email →'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        {timer > 0 ? (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Resend code in <strong style={{ color: 'var(--text-primary)' }}>{timer}s</strong>
                            </p>
                        ) : (
                            <button className="btn btn-ghost btn-sm" onClick={handleResend} disabled={resending} style={{ margin: '0 auto' }}>
                                <RefreshCw size={14} /> {resending ? 'Resending…' : 'Resend OTP'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
