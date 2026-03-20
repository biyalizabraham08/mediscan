import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Activity } from 'lucide-react';
import { registerUser } from '../lib/mockData';
import toast from 'react-hot-toast';

export default function SignUpPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate() {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Full name is required';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
        if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
        return e;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const res = await registerUser(form.name.trim(), form.email.trim(), form.password);
            if (!res.success) { toast.error(res.message); setLoading(false); return; }
            toast.success('Account created! Please check your email for the OTP.');
            navigate('/verify-otp', { state: { userId: res.userId, email: form.email } });
        } catch {
            toast.error('Something went wrong. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div className="page-center" style={{ background: 'linear-gradient(160deg, #f8f9fc 0%, #eef2ff 100%)' }}>
            <div className="container" style={{ maxWidth: 440 }}>

                <div className="animate-in">
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}>
                        <ArrowLeft size={16} /> Back
                    </Link>

                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <div style={{ background: 'var(--blue)', borderRadius: '10px', padding: '6px', display: 'flex', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>
                                <Activity size={24} color="white" />
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                                MediScan
                            </span>
                        </div>
                        <h2 style={{ marginBottom: 6 }}>Create your account</h2>
                        <p style={{ fontSize: '0.9375rem' }}>Join thousands who are emergency-ready</p>
                    </div>

                    <div className="card">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                    type="text" placeholder="John Smith"
                                    value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                                    autoFocus
                                />
                                {errors.name && <p style={{ color: 'var(--blue)', fontSize: '0.8125rem' }}>{errors.name}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    className={`input ${errors.email ? 'input-error' : ''}`}
                                    type="email" placeholder="john@example.com"
                                    value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                                />
                                {errors.email && <p style={{ color: 'var(--blue)', fontSize: '0.8125rem' }}>{errors.email}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className={`input ${errors.password ? 'input-error' : ''}`}
                                        type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                                        value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                                        style={{ paddingRight: 44 }}
                                    />
                                    <button type="button" onClick={() => setShowPw(p => !p)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p style={{ color: 'var(--blue)', fontSize: '0.8125rem' }}>{errors.password}</p>}
                            </div>

                            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }} disabled={loading}>
                                {loading ? <><span className="spinner" /> Creating Account…</> : 'Create Account →'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
