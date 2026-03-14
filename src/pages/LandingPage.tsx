import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, Zap, Heart, QrCode, ChevronRight, Activity,
    UserPlus, Smartphone, Siren, Lock, Phone, AlertTriangle,
    Pill, Eye, BadgeCheck
} from 'lucide-react';
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
        <div className="page" style={{ background: '#fff' }}>

            {/* ── Navbar ── */}
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

            <main style={{ flex: 1 }}>

                {/* ── Hero ── */}
                <section className="landing-hero">
                    <div className="landing-hero-glow" />
                    <div className="animate-in" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>

                        <div className="landing-pill">
                            <Activity size={14} color="#E53935" />
                            <span>Emergency-Ready Medical ID</span>
                        </div>

                        <h1 className="landing-headline">
                            Scan.&nbsp;<span style={{ color: 'var(--red)' }}>Save.</span>&nbsp;Survive.
                        </h1>
                        <p className="landing-subtext">
                            MediScan stores your critical medical data — allergies, blood group, medications &amp; emergency contacts — in a secure QR code. First responders get instant access when every second counts.
                        </p>

                        <div className="landing-cta-group">
                            <Link to="/signup" className="btn btn-primary btn-lg" style={{ minWidth: 200 }}>
                                Create Your Profile <ChevronRight size={18} />
                            </Link>
                            <button onClick={handleDemo} className="btn btn-secondary btn-lg" style={{ minWidth: 160 }}>
                                View Demo
                            </button>
                        </div>

                        {!authState.isAuthenticated && (
                            <p style={{ marginTop: 20, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                            </p>
                        )}
                    </div>

                    {/* QR Code mockup */}
                    <div className="animate-in" style={{ marginTop: 56, display: 'flex', justifyContent: 'center', animationDelay: '0.15s' }}>
                        <div className="landing-qr-card">
                            <div style={{ position: 'relative', width: 160, height: 160 }}>
                                <svg viewBox="0 0 160 160" width="160" height="160">
                                    <rect x="8" y="8" width="44" height="44" rx="4" fill="none" stroke="#0F172A" strokeWidth="7" />
                                    <rect x="17" y="17" width="26" height="26" rx="2" fill="#0F172A" />
                                    <rect x="108" y="8" width="44" height="44" rx="4" fill="none" stroke="#0F172A" strokeWidth="7" />
                                    <rect x="117" y="17" width="26" height="26" rx="2" fill="#0F172A" />
                                    <rect x="8" y="108" width="44" height="44" rx="4" fill="none" stroke="#0F172A" strokeWidth="7" />
                                    <rect x="17" y="117" width="26" height="26" rx="2" fill="#0F172A" />
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
                                    <rect x="73" y="64" width="14" height="32" rx="3" fill="#E53935" />
                                    <rect x="64" y="73" width="32" height="14" rx="3" fill="#E53935" />
                                </svg>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Alex Johnson</p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Blood Group: O+ · Emergency Medical ID</p>
                            </div>
                            <div className="landing-qr-badge">
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s ease-in-out infinite' }} />
                                Emergency Ready
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── How It Works ── */}
                <section className="landing-section" style={{ background: '#fff' }}>
                    <div className="container-lg">
                        <div className="landing-section-label">Simple Process</div>
                        <h2 className="landing-section-title">How It Works</h2>
                        <p className="landing-section-sub">Set up your emergency profile in under 5 minutes.</p>

                        <div className="landing-steps">
                            {[
                                {
                                    icon: <UserPlus size={26} color="#E53935" />,
                                    num: '01',
                                    label: 'Create Medical Profile',
                                    desc: 'Enter your blood group, allergies, medications, medical conditions, and emergency contacts in our guided form.',
                                    color: 'var(--red-light)',
                                },
                                {
                                    icon: <QrCode size={26} color="#1565C0" />,
                                    num: '02',
                                    label: 'Generate QR Code',
                                    desc: 'Get a unique, secure QR code tied to your profile. Download it and set it as your phone lockscreen wallpaper.',
                                    color: 'var(--blue-light)',
                                },
                                {
                                    icon: <Siren size={26} color="#E65100" />,
                                    num: '03',
                                    label: 'Scan During Emergency',
                                    desc: 'First responders scan your QR code to instantly access your critical data — no app, no login, no delay required.',
                                    color: 'var(--orange-light)',
                                },
                            ].map((step, i) => (
                                <div key={i} className="landing-step-wrapper">
                                    <div className="landing-step-card">
                                        <div className="landing-step-num">{step.num}</div>
                                        <div className="landing-step-icon" style={{ background: step.color }}>
                                            {step.icon}
                                        </div>
                                        <h3 style={{ marginBottom: 10, fontSize: '1.0625rem' }}>{step.label}</h3>
                                        <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{step.desc}</p>
                                    </div>
                                    {i < 2 && <div className="landing-step-arrow"><ChevronRight size={22} color="#CBD5E1" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section className="landing-section" style={{ background: 'var(--surface-2)' }}>
                    <div className="container-lg">
                        <div className="landing-section-label">What You Get</div>
                        <h2 className="landing-section-title">Built for Real Emergencies</h2>
                        <p className="landing-section-sub">Every feature is designed with one goal: getting the right medical info to first responders, instantly.</p>

                        <div className="landing-features-grid">
                            {[
                                {
                                    icon: <AlertTriangle size={22} color="#E53935" />,
                                    bg: 'var(--red-light)',
                                    title: 'Critical Allergy Alerts',
                                    desc: 'Life-threatening and severe allergies are displayed prominently in high-contrast red — impossible to miss.',
                                },
                                {
                                    icon: <Phone size={22} color="#1565C0" />,
                                    bg: 'var(--blue-light)',
                                    title: 'Emergency Contact Access',
                                    desc: 'One-tap call buttons for emergency contacts, visible immediately on QR scan — no login required.',
                                },
                                {
                                    icon: <Lock size={22} color="#2E7D32" />,
                                    bg: 'var(--green-light)',
                                    title: 'Secure OTP Medical Records',
                                    desc: 'Full medical history unlocked only with an OTP sent to the patient. Verified doctors get complete access.',
                                },
                                {
                                    icon: <Smartphone size={22} color="#E65100" />,
                                    bg: 'var(--orange-light)',
                                    title: 'QR Emergency Identification',
                                    desc: 'Your unique QR works as a lockscreen wallpaper. Accessible even when the phone is locked, offline.',
                                },
                                {
                                    icon: <Shield size={22} color="#6A1B9A" />,
                                    bg: '#F3E5F5',
                                    title: 'Privacy Protected Data',
                                    desc: 'Two-tier access keeps sensitive data private. Public info is minimal; extended records need OTP verification.',
                                },
                                {
                                    icon: <Pill size={22} color="#00695C" />,
                                    bg: '#E0F2F1',
                                    title: 'Medication & Condition Log',
                                    desc: 'Current medications, dosages, and chronic conditions stored securely — shareable with treating physicians.',
                                },
                            ].map((f, i) => (
                                <div key={i} className="landing-feature-card">
                                    <div className="landing-feature-icon" style={{ background: f.bg }}>
                                        {f.icon}
                                    </div>
                                    <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
                                    <p style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Emergency Scenario ── */}
                <section className="landing-section" style={{ background: '#0D0D0D', padding: '72px 24px' }}>
                    <div className="container-lg">
                        <div className="landing-section-label" style={{ color: '#E53935', borderColor: 'rgba(229,57,53,.3)', background: 'rgba(229,57,53,.1)' }}>
                            Live Scenario
                        </div>
                        <h2 className="landing-section-title" style={{ color: '#fff' }}>Emergency Dashboard Preview</h2>
                        <p className="landing-section-sub" style={{ color: '#888' }}>
                            This is what a first responder sees when they scan your QR code.
                        </p>

                        <div className="landing-emergency-mock">
                            {/* Mock Header */}
                            <div className="mock-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: '1.25rem' }}>🚨</span>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase' }}>Emergency Medical ID</p>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Alex Johnson · Age 34</p>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(76,175,80,.2)', border: '1px solid rgba(76,175,80,.4)', borderRadius: 999, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#81C784' }}>
                                    ● Live
                                </div>
                            </div>

                            {/* Mock Body */}
                            <div className="mock-body">
                                {/* Blood Group */}
                                <div className="mock-blood-card">
                                    <p className="mock-label">Blood Group</p>
                                    <div className="mock-blood-type">O+</div>
                                    <p style={{ color: '#666', fontSize: '0.8125rem' }}>For transfusion use</p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    {/* Critical Allergy */}
                                    <div className="mock-allergy-alert">
                                        <AlertTriangle size={16} color="#E53935" style={{ flexShrink: 0 }} />
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E53935', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>⚠ Life-Threatening Allergy</p>
                                            <p style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Penicillin</p>
                                            <p style={{ color: '#aaa', fontSize: '0.8125rem' }}>Reaction: Anaphylaxis</p>
                                        </div>
                                    </div>

                                    {/* Medications */}
                                    <div className="mock-info-row">
                                        <Pill size={15} color="#90CAF9" style={{ flexShrink: 0 }} />
                                        <div>
                                            <p className="mock-label" style={{ marginBottom: 4 }}>Current Medications</p>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {['Metformin 500mg', 'Atorvastatin 10mg'].map(m => (
                                                    <span key={m} className="mock-tag">{m}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="mock-contact-row">
                                        <div>
                                            <p className="mock-label" style={{ marginBottom: 2 }}>Emergency Contact</p>
                                            <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9375rem' }}>Sarah Johnson</p>
                                            <p style={{ color: '#888', fontSize: '0.8125rem' }}>Spouse</p>
                                        </div>
                                        <a href="tel:+15550001234" className="btn btn-sm" style={{ background: '#4CAF50', color: '#fff', boxShadow: '0 4px 14px rgba(76,175,80,.35)', textDecoration: 'none' }}>
                                            <Phone size={14} /> Call Now
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="mock-footer">
                                <Zap size={13} color="#888" />
                                <span>Public data · No login required · Powered by MediScan</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Security & Privacy ── */}
                <section className="landing-section" style={{ background: '#fff' }}>
                    <div className="container-lg">
                        <div className="landing-section-label" style={{ color: '#1565C0', borderColor: '#BBDEFB', background: 'var(--blue-light)' }}>
                            Your Privacy Matters
                        </div>
                        <h2 className="landing-section-title">Security &amp; Privacy</h2>
                        <p className="landing-section-sub">Your full medical record is never exposed publicly. A strict two-tier system keeps sensitive data protected.</p>

                        <div className="landing-security-grid">
                            <div className="landing-security-card" style={{ borderColor: 'rgba(229,57,53,.3)', background: 'linear-gradient(135deg, #fff5f5, #fff)' }}>
                                <div className="landing-security-icon" style={{ background: 'var(--red-light)' }}>
                                    <Eye size={22} color="#E53935" />
                                </div>
                                <h3 style={{ marginBottom: 10 }}>Public Tier — Instant Access</h3>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                                    When a QR code is scanned, only critical emergency data is shown — blood group, life-threatening allergies, and a primary emergency contact. <strong>No login required.</strong>
                                </p>
                                <ul className="landing-security-list">
                                    <li><BadgeCheck size={14} color="#E53935" /> Blood group &amp; age</li>
                                    <li><BadgeCheck size={14} color="#E53935" /> Life-threatening allergies</li>
                                    <li><BadgeCheck size={14} color="#E53935" /> Emergency contact name &amp; phone</li>
                                </ul>
                            </div>

                            <div className="landing-security-card" style={{ borderColor: 'rgba(21,101,192,.3)', background: 'linear-gradient(135deg, #f0f7ff, #fff)' }}>
                                <div className="landing-security-icon" style={{ background: 'var(--blue-light)' }}>
                                    <Lock size={22} color="#1565C0" />
                                </div>
                                <h3 style={{ marginBottom: 10 }}>OTP-Protected — Extended Access</h3>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                                    For full medical history, a one-time password (OTP) is sent to the patient's registered phone. Only verified medical personnel with OTP access can view complete records.
                                </p>
                                <ul className="landing-security-list">
                                    <li><BadgeCheck size={14} color="#1565C0" /> Full medication list &amp; dosages</li>
                                    <li><BadgeCheck size={14} color="#1565C0" /> Chronic conditions &amp; medical history</li>
                                    <li><BadgeCheck size={14} color="#1565C0" /> All emergency contacts</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: '72px 24px 88px', textAlign: 'center', background: 'linear-gradient(135deg, #E53935 0%, #b71c1c 100%)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
                            <Heart size={13} color="#fff" />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>Free Forever · No Credit Card</span>
                        </div>
                        <h2 style={{ color: '#fff', marginBottom: 14, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
                            Be prepared for any emergency
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: 36, fontSize: '1.0625rem' }}>
                            It takes 5 minutes to set up. It could save your life.
                        </p>
                        <Link to="/signup" className="btn btn-lg" style={{ background: '#fff', color: 'var(--red)', fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,.2)' }}>
                            Create Free Account <ChevronRight size={18} />
                        </Link>
                    </div>
                </section>

            </main>

            {/* ── Footer ── */}
            <footer style={{ padding: '24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <div className="container-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <a className="navbar-brand" href="/" style={{ textDecoration: 'none' }}>
                        <svg className="logo" viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
                            <rect width="32" height="32" rx="8" fill="#E53935" />
                            <rect x="13" y="6" width="6" height="20" rx="2" fill="white" />
                            <rect x="6" y="13" width="20" height="6" rx="2" fill="white" />
                        </svg>
                        <span style={{ fontSize: '0.9375rem' }}>Medi<em>Scan</em></span>
                    </a>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>© 2026 MediScan · Emergency Medical QR System</p>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Link to="/signup" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Get Started</Link>
                        <Link to="/login" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Sign In</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
