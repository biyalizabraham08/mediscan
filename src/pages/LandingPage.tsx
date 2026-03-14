import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, Heart, QrCode, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { seedDemoData } from '../lib/mockData';
import toast from 'react-hot-toast';

export default function LandingPage() {
    const { authState, login, logout } = useAuth();
    const navigate = useNavigate();

    function handleDemo() {
        const { userId, token } = seedDemoData();
        login({ id: userId, email: 'demo@mediscan.app', name: 'Alex Johnson', createdAt: new Date().toISOString() }, token);
        toast.success('Demo account loaded!');
        navigate('/dashboard');
    }

    return (
        <div className="page" style={{ background: 'linear-gradient(160deg, #fff7f7 0%, #f8f9fc 50%, #f0f4ff 100%)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <a className="navbar-brand" href="/">
                    <svg className="logo" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="#E53935" />
                        <rect x="13" y="6" width="6" height="20" rx="2" fill="white" />
                        <rect x="6" y="13" width="20" height="6" rx="2" fill="white" />
                    </svg>
                    <span>Medi<em>Scan</em></span>
                </a>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {authState.isAuthenticated ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                            <button onClick={() => logout()} className="btn btn-ghost btn-sm">Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <main style={{ flex: 1 }}>
                <section style={{ padding: '72px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Background decor */}
                    <div style={{
                        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
                        width: 600, height: 600, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(229,57,53,.07) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto' }}>
                        {/* Pill badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1.5px solid #fecdd3', borderRadius: 999, padding: '6px 14px', marginBottom: 24 }}>
                            <Activity size={14} color="#E53935" />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E53935' }}>Emergency-Ready Medical ID</span>
                        </div>

                        <h1 style={{ marginBottom: 20 }}>
                            Your medical info,<br />
                            <span style={{ color: 'var(--red)' }}>when it matters most.</span>
                        </h1>
                        <p style={{ fontSize: '1.125rem', maxWidth: 480, margin: '0 auto 36px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            Generate a secure QR code for your medical profile. First responders can access critical info instantly — even without internet.
                        </p>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                             <Link to="/signup" className="btn btn-primary btn-lg" style={{ minWidth: 180 }}>
                                 Create Your Profile <ChevronRight size={18} />
                             </Link>
                             <button onClick={handleDemo} className="btn btn-secondary btn-lg" style={{ minWidth: 160 }}>
                                 View Demo
                             </button>
                         </div>
                         {!authState.isAuthenticated && (
                             <p style={{ marginTop: 20, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                                 Already have an account? <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                             </p>
                         )}
                     </div>

                    {/* QR Code mockup */}
                    <div className="animate-in" style={{ marginTop: 56, display: 'flex', justifyContent: 'center', animationDelay: '0.15s' }}>
                        <div style={{
                            background: '#fff', border: '1.5px solid var(--border)', borderRadius: 20,
                            padding: 24, boxShadow: 'var(--shadow-lg)',
                            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                        }}>
                            {/* SVG QR placeholder that looks convincing */}
                            <div style={{ position: 'relative', width: 160, height: 160 }}>
                                <svg viewBox="0 0 160 160" width="160" height="160">
                                    {/* Corner squares */}
                                    <rect x="8" y="8" width="44" height="44" rx="4" fill="none" stroke="#0F172A" strokeWidth="7" />
                                    <rect x="17" y="17" width="26" height="26" rx="2" fill="#0F172A" />
                                    <rect x="108" y="8" width="44" height="44" rx="4" fill="none" stroke="#0F172A" strokeWidth="7" />
                                    <rect x="117" y="17" width="26" height="26" rx="2" fill="#0F172A" />
                                    <rect x="8" y="108" width="44" height="44" rx="4" fill="none" stroke="#0F172A" strokeWidth="7" />
                                    <rect x="17" y="117" width="26" height="26" rx="2" fill="#0F172A" />
                                    {/* Data blocks */}
                                    {[66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138].map((y, i) =>
                                        [66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138].map((x, j) =>
                                            ((i + j) % 3 !== 0) ? <rect key={`${i}-${j}`} x={x} y={y} width="5" height="5" fill="#0F172A" /> : null
                                        )
                                    )}
                                    {[8, 14, 20, 26, 32, 38, 44].map((y, i) =>
                                        [66, 72, 78, 84, 90, 96, 102, 108].map((x, j) =>
                                            ((i * 3 + j) % 2 === 0) ? <rect key={`m-${i}-${j}`} x={x} y={y} width="5" height="5" fill="#0F172A" /> : null
                                        )
                                    )}
                                    {[66, 72, 78, 84, 90, 96, 102, 108].map((y, i) =>
                                        [8, 14, 20, 26, 32, 38, 44].map((x, j) =>
                                            ((i + j * 2) % 3 !== 1) ? <rect key={`l-${i}-${j}`} x={x} y={y} width="5" height="5" fill="#0F172A" /> : null
                                        )
                                    )}
                                    {/* Red cross in center */}
                                    <rect x="73" y="64" width="14" height="32" rx="3" fill="#E53935" />
                                    <rect x="64" y="73" width="32" height="14" rx="3" fill="#E53935" />
                                </svg>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Alex Johnson</p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Blood Group: O+ • Emergency Medical ID</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section style={{ padding: '56px 24px', background: 'var(--surface)' }}>
                    <div className="container-lg">
                        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Built for real emergencies</h2>
                        <p style={{ textAlign: 'center', marginBottom: 48 }}>Two-tier access ensures privacy while giving responders what they need.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                            {[
                                { icon: <Zap size={22} color="#E53935" />, title: 'Instant Public Access', color: 'var(--red-light)', desc: 'Blood group, severe allergies, and emergency contact visible immediately — no login, no delay.' },
                                { icon: <Shield size={22} color="#1565C0" />, title: 'OTP-Protected Extended', color: 'var(--blue-light)', desc: 'Full medical history unlocked only with a one-time password, keeping your data private.' },
                                { icon: <Heart size={22} color="#2E7D32" />, title: 'Critical Allergy Alerts', color: 'var(--green-light)', desc: 'Life-threatening allergies displayed prominently so responders never miss them.' },
                                { icon: <QrCode size={22} color="#E65100" />, title: 'Lockscreen QR', color: 'var(--orange-light)', desc: 'Download and set as your phone wallpaper — accessible even when the phone is locked.' },
                            ].map((f, i) => (
                                <div key={i} className="card card-sm" style={{ animationDelay: `${i * 0.08}s` }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                        {f.icon}
                                    </div>
                                    <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section style={{ padding: '56px 24px' }}>
                    <div className="container-lg">
                        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>How it works</h2>
                        <p style={{ textAlign: 'center', marginBottom: 48 }}>Set up in under 5 minutes.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, justifyContent: 'center', position: 'relative' }}>
                            {[
                                { step: '1', label: 'Sign Up', desc: 'Create your account with email verification' },
                                { step: '2', label: 'Fill Profile', desc: 'Add your medical info in guided sections' },
                                { step: '3', label: 'Get QR Code', desc: 'Download your unique emergency QR code' },
                                { step: '4', label: 'Stay Safe', desc: 'Put it on your phone lockscreen or wallet' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                    <div style={{ textAlign: 'center', padding: '0 20px', minWidth: 140 }}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: '50%',
                                            background: i === 0 ? 'var(--red)' : 'var(--surface)',
                                            border: `2px solid ${i === 0 ? 'var(--red)' : 'var(--border)'}`,
                                            color: i === 0 ? '#fff' : 'var(--text-secondary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '1.125rem', margin: '0 auto 12px',
                                        }}>{s.step}</div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>{s.label}</p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
                                    </div>
                                    {i < 3 && <div style={{ width: 40, height: 2, background: 'var(--border)', flexShrink: 0, marginBottom: 36 }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '56px 24px 80px', textAlign: 'center', background: 'linear-gradient(135deg, #E53935 0%, #b71c1c 100%)' }}>
                    <h2 style={{ color: '#fff', marginBottom: 12 }}>Be prepared for any emergency</h2>
                    <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: 32, fontSize: '1.0625rem' }}>It takes 5 minutes. It could save your life.</p>
                    <Link to="/signup" className="btn btn-lg" style={{ background: '#fff', color: 'var(--red)', fontWeight: 700 }}>
                        Create Free Account
                    </Link>
                </section>
            </main>

            <footer style={{ padding: '20px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>© 2026 MediScan · Emergency Medical QR System</p>
            </footer>
        </div>
    );
}
