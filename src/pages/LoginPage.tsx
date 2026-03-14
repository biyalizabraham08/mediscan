import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { loginUser } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await loginUser(email, password);
            if (res.success) {
                login(res.user!, res.token!);
                toast.success('Welcome back to MediScan!');
                navigate('/dashboard');
            } else {
                toast.error(res.message);
                if (res.user && res.message.includes('verify your email')) {
                     // The user exists but hasn't verified OTP yet
                     navigate('/verify-otp', { state: { userId: res.user.id, email: email } });
                }
            }
        } catch (error) {
            toast.error('An error occurred during sign in');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page" style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top left, #fff1f1 0%, #f8f9fc 40%, #eef2ff 100%)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background blobs */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-5%',
                width: '40vw', height: '40vw', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(229,57,53,0.08) 0%, transparent 70%)',
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
            }} className="animate-pulse" />
            <div style={{
                position: 'absolute', bottom: '-10%', left: '-5%',
                width: '35vw', height: '35vw', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
            }} />

            <div className="page-center" style={{ position: 'relative', zIndex: 1 }}>
                <div className="container animate-in" style={{ maxWidth: 460 }}>
                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: 'var(--text-secondary)',
                        fontSize: '0.9375rem',
                        textDecoration: 'none',
                        marginBottom: 32,
                        fontWeight: 600,
                        transition: 'color 0.2s'
                    }} className="btn-ghost">
                        <ArrowLeft size={18} /> Back to safety
                    </Link>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '28px',
                        padding: '40px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '22px',
                            background: 'linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 12px 24px rgba(229,57,53,0.25)',
                            transform: 'rotate(-3deg)'
                        }}>
                            <ShieldCheck size={36} color="white" />
                        </div>

                        <h1 style={{ fontSize: '2rem', marginBottom: 12, letterSpacing: '-0.02em' }}>Welcome back</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1rem' }}>
                            Securely access your medical profile
                        </p>

                        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ marginLeft: 4, marginBottom: 8 }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        className="input"
                                        style={{
                                            paddingLeft: 48,
                                            height: 54,
                                            borderRadius: '14px',
                                            background: 'rgba(255,255,255,0.8)',
                                            border: '1.5px solid var(--border)'
                                        }}
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginLeft: 4 }}>
                                    <label className="form-label">Password</label>
                                    <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>Forgot?</a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input"
                                        style={{
                                            paddingLeft: 48,
                                            paddingRight: 48,
                                            height: 54,
                                            borderRadius: '14px',
                                            background: 'rgba(255,255,255,0.8)',
                                            border: '1.5px solid var(--border)'
                                        }}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, display: 'flex' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                style={{
                                    height: 56,
                                    fontSize: '1.0625rem',
                                    borderRadius: '16px',
                                    marginTop: 8
                                }}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : 'Sign In'}
                            </button>
                        </form>

                        <div style={{
                            marginTop: 32,
                            paddingTop: 24,
                            borderTop: '1px solid rgba(0,0,0,0.05)',
                            fontSize: '0.9375rem',
                            color: 'var(--text-secondary)'
                        }}>
                            New to MediScan?{' '}
                            <Link to="/signup" style={{ color: 'var(--red)', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            End-to-end encrypted medical data storage
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
