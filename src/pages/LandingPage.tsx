import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, QrCode, Activity,
    UserPlus, Smartphone, Siren,
    Zap, ArrowRight, CheckCircle2
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
        <div className="page">

            {/* ── Navbar ── */}
            <nav className="navbar">
                <Link className="navbar-brand" to="/">
                    <div style={{ background: 'var(--blue)', borderRadius: 8, padding: 6, display: 'flex' }}>
                        <Activity size={20} color="white" />
                    </div>
                    <span>Medi<em>Scan</em></span>
                </Link>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {authState.isAuthenticated ? (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                            <button onClick={() => logout()} className="btn btn-ghost btn-sm">Sign Out</button>
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

                {/* ── Hero Section ── */}
                <section style={{ padding: '80px 24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(30, 64, 175, 0.03)', pointerEvents: 'none' }} />
                    
                    <div className="container-lg" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
                        <div className="animate-in">
                            <div className="badge badge-blue" style={{ marginBottom: 20 }}>
                                <Shield size={14} style={{ marginRight: 6 }} />
                                Trusted by Professional Responders
                            </div>
                            <h1 style={{ marginBottom: 20 }}>
                                Scan. Save.<br />
                                <span style={{ color: 'var(--blue)' }}>Survive.</span>
                            </h1>
                            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 520 }}>
                                Instant access to critical medical information when every second counts. MediScan bridges the gap between patient and responder.
                            </p>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Create Medical ID <ArrowRight size={20} />
                                </Link>
                                <a href="#demo" className="btn btn-secondary btn-lg">
                                    Try Demo Scan
                                </a>
                            </div>
                            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ display: 'flex' }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid white', background: `hsl(${i * 40}, 70%, 50%)`, marginLeft: i === 1 ? 0 : -10 }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    Joined by <span style={{ color: 'var(--text-header)' }}>2,400+</span> individuals
                                </p>
                            </div>
                        </div>

                        {/* Lock Screen Illustration */}
                        <div className="animate-in" style={{ animationDelay: '0.1s', position: 'relative' }}>
                            <div style={{ 
                                width: '100%', maxWidth: 300, 
                                margin: '0 auto', background: '#000', 
                                padding: 12, borderRadius: 48, 
                                boxShadow: '0 50px 100px -20px rgba(15, 23, 42, 0.25)',
                                border: '8px solid #1e293b'
                            }}>
                                <div style={{ 
                                    aspectRatio: '9/19.5', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                                    borderRadius: 38, overflow: 'hidden', position: 'relative' 
                                }}>
                                    {/* Phone UI elements */}
                                    <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: '#fff' }}>
                                        <p style={{ fontSize: '3rem', fontWeight: 300 }}>12:45</p>
                                        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Sunday, March 15</p>
                                    </div>

                                    {/* The QR Widget */}
                                    <div style={{ 
                                        position: 'absolute', bottom: 40, left: 20, right: 20, 
                                        background: 'rgba(255,255,255,0.95)', padding: 20, 
                                        borderRadius: 20, backdropFilter: 'blur(10px)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ background: '#000', padding: 10, borderRadius: 12, display: 'inline-block', marginBottom: 10 }}>
                                            <QrCode size={120} color="#fff" />
                                        </div>
                                        <p style={{ fontWeight: 800, color: '#000', fontSize: '0.875rem', marginBottom: 2 }}>ALEX JOHNSON</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 800 }}>🚨 EMERGENCY MEDICAL ID</p>
                                    </div>
                                </div>
                            </div>
                            {/* Accent elements */}
                            <div style={{ position: 'absolute', bottom: -20, left: -20, padding: '12px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <CheckCircle2 size={18} color="var(--green)" />
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Profile Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Demo QR Section ── */}
                <section id="demo" style={{ padding: '100px 24px', background: 'var(--surface-2)' }}>
                    <div className="container-lg" style={{ textAlign: 'center' }}>
                        <div className="badge badge-gray" style={{ marginBottom: 16 }}>Live Demonstration</div>
                        <h2>Try the Experience</h2>
                        <p style={{ maxWidth: 600, margin: '0 auto 52px', color: 'var(--text-secondary)' }}>
                            No account needed. Scan the demo QR code below with your phone camera to see exactly how a first responder sees your profile.
                        </p>

                        <div style={{ 
                            display: 'inline-block', background: 'white', padding: '40px', 
                            borderRadius: '32px', border: '1.5px solid var(--border)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <div style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '20px', marginBottom: 24 }}>
                                <QrCode size={200} />
                            </div>
                            <h3 style={{ marginBottom: 12 }}>Sample Profile: Alex Johnson</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                                Scan with your phone's camera app
                            </p>
                            <button onClick={handleDemo} className="btn btn-secondary btn-full">
                                View Demo on This Device
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── How It Works (4 Steps) ── */}
                <section style={{ padding: '100px 24px', background: 'white' }}>
                    <div className="container-lg">
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <div className="badge badge-blue" style={{ marginBottom: 16 }}>Modern Emergency System</div>
                            <h2>How MediScan Saves Lives</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
                            {[
                                {
                                    icon: <UserPlus size={32} color="var(--blue)" />,
                                    title: "1. Build Profile",
                                    desc: "Securely input blood group, allergies, conditions, and emergency contacts."
                                },
                                {
                                    icon: <Smartphone size={32} color="var(--blue)" />,
                                    title: "2. Set Lockscreen",
                                    desc: "Download your unique QR ID and set it as your phone's lockscreen wallpaper."
                                },
                                {
                                    icon: <Zap size={32} color="var(--blue)" />,
                                    title: "3. Instant Access",
                                    desc: "In an emergency, someone scans the QR to notify your emergency contacts."
                                },
                                {
                                    icon: <Shield size={32} color="var(--blue)" />,
                                    title: "4. Professional Care",
                                    desc: "Doctors access your full history via OTP, ensuring safe and accurate treatment."
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="card card-sm" style={{ border: 'none', background: 'var(--surface-2)', textAlign: 'center' }}>
                                    <div style={{ width: 64, height: 64, background: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--shadow)' }}>
                                        {step.icon}
                                    </div>
                                    <h3 style={{ marginBottom: 12, fontSize: '1.125rem' }}>{step.title}</h3>
                                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Dashboard Feature Grid ── */}
                <section style={{ padding: '100px 24px', background: 'var(--navy)', color: 'white' }}>
                    <div className="container-lg">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
                            <div>
                                <h2 style={{ color: 'white', marginBottom: 24 }}>Everything you need in one secure portal.</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', marginBottom: 40 }}>
                                    Our dashboard gives you full control over your emergency identity and privacy settings.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {[
                                        { icon: <Shield size={20} color="var(--blue-info)" />, title: "Emergency Mode Toggle", desc: "Instantly hide or show sensitive medical data." },
                                        { icon: <Siren size={20} color="var(--red-mid)" />, title: "Accident Detection", desc: "Simulate emergency scenarios for peace of mind." },
                                        { icon: <Activity size={20} color="var(--green-light)" />, title: "Access History", desc: "Track every time your QR code is scanned." }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ flexShrink: 0, marginTop: 4 }}>{item.icon}</div>
                                            <div>
                                                <p style={{ color: 'white', fontWeight: 800, marginBottom: 4 }}>{item.title}</p>
                                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="animate-in" style={{ padding: 40, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32 }}>
                                <div className="card" style={{ background: 'white', border: 'none', padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CONTROL PANEL</p>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)' }} />
                                    </div>
                                    <div style={{ background: 'var(--surface-2)', height: 8, borderRadius: 4, width: '100%', marginBottom: 12 }} />
                                    <div style={{ background: 'var(--surface-2)', height: 8, borderRadius: 4, width: '80%', marginBottom: 32 }} />
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ background: 'var(--blue)', height: 80, borderRadius: 12 }} />
                                        <div style={{ background: 'var(--surface-2)', height: 80, borderRadius: 12 }} />
                                        <div style={{ background: 'var(--surface-2)', height: 80, borderRadius: 12 }} />
                                        <div style={{ background: 'var(--red)', height: 80, borderRadius: 12 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer CTA ── */}
                <section style={{ padding: '80px 24px', textAlign: 'center', background: 'white' }}>
                    <div className="container">
                        <h2 style={{ marginBottom: 16 }}>Ready to be prepared?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
                            Join thousands who trust MediScan for their emergency medical safety. It's free and always will be.
                        </p>
                        <Link to="/signup" className="btn btn-primary btn-lg btn-full">
                            Get Started Free
                        </Link>
                    </div>
                </section>

            </main>

            {/* ── Footer ── */}
            <footer style={{ padding: '48px 24px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                <div className="container-lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
                        <div style={{ maxWidth: 280 }}>
                            <Link className="navbar-brand" to="/" style={{ marginBottom: 20 }}>
                                <div style={{ background: 'var(--blue)', borderRadius: 8, padding: 6, display: 'flex' }}>
                                    <Activity size={18} color="white" />
                                </div>
                                <span>Medi<em>Scan</em></span>
                            </Link>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                Modern emergency medical identification system providing peace of mind to individuals and clarity to responders.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: '0.8125rem', marginBottom: 20, color: 'var(--text-header)' }}>PRODUCT</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Link to="/signup" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Get Started</Link>
                                    <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Login</Link>
                                    <a href="#demo" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View Demo</a>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: '0.8125rem', marginBottom: 20, color: 'var(--text-header)' }}>LEGAL</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Privacy Policy</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Terms of Service</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 60, borderTop: '1px solid var(--border)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>© 2026 MediScan Healthcare. All rights reserved.</p>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.2 }} />
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.2 }} />
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.2 }} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
