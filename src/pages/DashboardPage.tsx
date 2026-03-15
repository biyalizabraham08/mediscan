import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    Edit3, Download, LogOut, Clock, QrCode, Activity,
    Shield, ShieldOff, Siren, MapPin, Bell, ExternalLink, Zap, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, getAccessLogs, setEmergencyMode, logAccess, saveProfile } from '../lib/mockData';
import { sendAccidentAlertEmail } from '../utils/email';
import { useAuth } from '../lib/auth';
import type { MedicalProfile, AccessLog } from '../types';
import AccidentCountdown from '../components/AccidentCountdown';

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

function TierBadge({ tier }: { tier: 'public' | 'extended' }) {
    return (
        <span className={`badge ${tier === 'extended' ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
            {tier === 'extended' ? '🔒 Extended' : '👁 Public'}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    if (type === 'doctor_access') return <span className="badge badge-gray" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>🏥 Doctor</span>;
    if (type === 'simulated_accident') return <span className="badge" style={{ background: 'rgba(255,152,0,.1)', color: '#FF9800', border: '1px solid rgba(255,152,0,.2)', fontSize: '0.75rem', padding: '2px 8px' }}>⚡ Simulated</span>;
    return <span className="badge" style={{ background: 'rgba(229,57,53,.1)', color: 'var(--red)', border: '1px solid rgba(229,57,53,.2)', fontSize: '0.75rem', padding: '2px 8px' }}>🚨 Emergency</span>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className="toggle-switch"
            style={{
                position: 'relative', width: 44, height: 24, borderRadius: 12,
                background: checked ? 'var(--blue)' : 'var(--border)',
                border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', flexShrink: 0,
            }}
            aria-label={checked ? 'Disable' : 'Enable'}
        >
            <span style={{
                position: 'absolute', top: 3, left: checked ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
        </button>
    );
}

export default function DashboardPage() {
    const { authState, logout } = useAuth();
    const navigate = useNavigate();
    const userId = authState.user!.id;

    const [profile, setProfile] = useState<MedicalProfile | null>(null);
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const qrRef = useRef<HTMLDivElement>(null);

    const [emergencyMode, setEmergencyModeState] = useState(true);
    const [togglingMode, setTogglingMode] = useState(false);

    const [accidentDetectionEnabled, setAccidentDetectionEnabled] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [accidentAlert, setAccidentAlert] = useState('');
    const cooldownRef = useRef<number>(0);

    const emergencyUrl = `${window.location.origin}/emergency/${userId}`;

    useEffect(() => {
        Promise.all([getProfile(userId), getAccessLogs(userId)]).then(([p, l]) => {
            setProfile(p);
            if (p) setEmergencyModeState(p.emergencyMode !== false);
            setLogs(l);
            setLoading(false);
        });
    }, [userId]);

    useEffect(() => {
        if (!accidentDetectionEnabled) return;
        
        let lastAccelTotal = 0;
        const threshold = 28; // High threshold for crash/impact

        const handler = (e: DeviceMotionEvent) => {
            const now = Date.now();
            if (now - cooldownRef.current < 120000) return; // 2 minute cooldown

            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            
            const total = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
            
            // Look for sudden delta
            if (Math.abs(total - lastAccelTotal) > threshold) {
                setShowCountdown(true);
            }
            lastAccelTotal = total;
        };

        window.addEventListener('devicemotion', handler as EventListener);
        return () => window.removeEventListener('devicemotion', handler as EventListener);
    }, [accidentDetectionEnabled]);

    async function handleAccidentConfirm() {
        setShowCountdown(false);
        setAccidentAlert('🚨 Emergency alert sent to your contact!');
        cooldownRef.current = Date.now(); // Start cooldown

        await logAccess(userId, 'accident_detected', 'public');

        if (profile?.emergencyContacts?.[0] && profile.fullName) {
            const contact = profile.emergencyContacts[0];
            if (contact.email) {
                await sendAccidentAlertEmail(
                    contact.email,
                    contact.name,
                    profile.fullName
                );
            }
        }

        const freshLogs = await getAccessLogs(userId);
        setLogs(freshLogs);

        setTimeout(() => setAccidentAlert(''), 8000);
    }

    async function toggleAccidentDetection(enabled: boolean) {
        if (!profile) return;
        setAccidentDetectionEnabled(enabled);
        await saveProfile({ ...profile, accidentDetectionEnabled: enabled });
        toast.success(`Accident detection ${enabled ? 'enabled' : 'disabled'}`);
    }

    async function handleEmergencyModeToggle(enabled: boolean) {
        setTogglingMode(true);
        const res = await setEmergencyMode(userId, enabled);
        if (res.success) setEmergencyModeState(enabled);
        setTogglingMode(false);
    }

    function handleLogout() {
        logout();
        navigate('/');
    }

    function downloadWallpaper() {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const canvas = document.createElement('canvas');
        // Standard phone aspect ratio 1080x1920
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;

        // 1. Dark Medical Gradient Background
        const grad = ctx.createRadialGradient(540, 540, 0, 540, 540, 1500);
        grad.addColorStop(0, '#1E40AF'); // Medical Blue
        grad.addColorStop(1, '#0F172A'); // Dark Navy
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Suble medical grid/dots pattern
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x < canvas.width; x += 100) {
            for (let y = 0; y < canvas.height; y += 100) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 2. MEDICAL EMERGENCY Text (Top)
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '900 96px Inter, system-ui, sans-serif';
        ctx.fillText('MEDICAL EMERGENCY', canvas.width / 2, 280);

        ctx.fillStyle = '#93C5FD'; // Light blue accent
        ctx.font = '700 48px Inter, system-ui, sans-serif';
        ctx.fillText('Scan for medical information', canvas.width / 2, 360);

        // Accent line below top text
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(canvas.width / 2 - 400, 420, 800, 6);

        // 3. QR Code Container (Rounded White Box)
        const qrSize = 650;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 600;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        const radius = 60;
        ctx.moveTo(qrX + radius, qrY);
        ctx.lineTo(qrX + qrSize - radius, qrY);
        ctx.quadraticCurveTo(qrX + qrSize, qrY, qrX + qrSize, qrY + radius);
        ctx.lineTo(qrX + qrSize, qrY + qrSize - radius);
        ctx.quadraticCurveTo(qrX + qrSize, qrY + qrSize, qrX + qrSize - radius, qrY + qrSize);
        ctx.lineTo(qrX + radius, qrY + qrSize);
        ctx.quadraticCurveTo(qrX, qrY + qrSize, qrX, qrY + qrSize - radius);
        ctx.lineTo(qrX, qrY + radius);
        ctx.quadraticCurveTo(qrX, qrY, qrX + radius, qrY);
        ctx.closePath();
        ctx.fill();

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, qrX + 50, qrY + 50, qrSize - 100, qrSize - 100);

            // 5. Branding at bottom
            ctx.fillStyle = 'white';
            ctx.font = '900 84px Inter, system-ui, sans-serif';
            ctx.fillText('Powered by MediScan', canvas.width / 2, 1480);
            
            ctx.fillStyle = '#93C5FD'; // Light blue accent
            ctx.font = '700 48px Inter, system-ui, sans-serif';
            ctx.fillText('Emergency Medical ID', canvas.width / 2, 1560);

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '500 36px Inter, system-ui, sans-serif';
            ctx.fillText(profile?.fullName || '', canvas.width / 2, 1630);
            
            // Decorative line at footer
            ctx.fillStyle = '#1E40AF';
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

            const link = document.createElement('a');
            link.download = `mediscan-wallpaper-${(profile?.fullName || 'user').replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Wallaper generated in Medical Blue Theme!');
            toast('💡 Set this as your phone lock-screen wallpaper so emergency responders can scan it if you are unconscious.', {
                duration: 6000,
                icon: '📱',
            });
        };
        img.src = url;
    }

    if (loading) {
        return <div className="page-center"><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
    }

    return (
        <div className="page" style={{ background: 'var(--surface-2)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <div style={{ background: 'var(--blue)', borderRadius: '10px', padding: '6px', display: 'flex', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>
                        <Activity size={22} color="white" />
                    </div>
                    <span>Medi<span style={{ fontWeight: 800 }}>Scan</span></span>
                </Link>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="badge badge-gray" style={{ background: 'white', border: '1.5px solid var(--border)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', marginRight: 6 }} />
                        System Active
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'var(--red)' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </nav>

            {/* Emergency Alert Banner */}
            {accidentAlert && (
                <div style={{
                    background: 'var(--red)', color: '#fff', padding: '16px 24px',
                    textAlign: 'center', fontWeight: 800, fontSize: '1rem',
                    animation: 'pulse 0.8s ease-in-out infinite alternate',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    boxShadow: '0 4px 20px rgba(229, 57, 53, 0.3)', position: 'relative', zIndex: 100
                }}>
                    <Siren size={24} />
                    {accidentAlert}
                    <button onClick={() => setAccidentAlert('')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, marginLeft: 16 }}>DISMISS</button>
                </div>
            )}

            {showCountdown && (
                <AccidentCountdown 
                    onCancel={() => setShowCountdown(false)}
                    onConfirm={handleAccidentConfirm}
                />
            )}

            <main className="container-lg" style={{ padding: '40px 24px 80px' }}>
                
                {/* ── Header Section ── */}
                <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
                    <div className="animate-in">
                        <p style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Emergency Control Panel</p>
                        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Hello, {authState.user?.name?.split(' ')[0]}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Review your medical visibility and access logs.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Link to="/profile/edit" className="btn btn-secondary">
                            <Edit3 size={18} /> Edit Profile
                        </Link>
                        <Link to="/qr-code" className="btn btn-primary">
                            <Download size={18} /> Get QR Code
                        </Link>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                    
                    {/* ── Column 1: QR & Summary ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* QR Card */}
                        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <QrCode size={20} color="var(--blue)" />
                                    <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>Your Medical ID</span>
                                </div>
                                <div className="badge badge-blue">Verified</div>
                            </div>

                            {profile ? (
                                <>
                                    <div 
                                        ref={qrRef}
                                        style={{ 
                                            padding: 24, background: 'var(--surface-2)', 
                                            borderRadius: 24, display: 'inline-block', 
                                            marginBottom: 24, border: '1.5px solid var(--border)' 
                                        }}
                                    >
                                        <QRCodeSVG value={emergencyUrl} size={180} level="H" fgColor="var(--navy)" bgColor="transparent" />
                                    </div>
                                    <h3 style={{ marginBottom: 4 }}>{profile.fullName}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Blood Group: <span style={{ color: 'var(--red)', fontWeight: 800 }}>{profile.bloodGroup}</span></p>
                                    
                                    <button 
                                        className="btn btn-secondary btn-full" 
                                        style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#0F172A', color: '#fff', borderColor: '#1e293b' }}
                                        onClick={downloadWallpaper}
                                    >
                                        <Smartphone size={18} /> Download Lock-Screen QR Wallpaper
                                    </button>
                                    
                                    <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: 16, textAlign: 'left', border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>EMERGENCY LINK</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emergencyUrl}</span>
                                            <ExternalLink size={14} color="var(--text-muted)" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '40px 0' }}>
                                    <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>You haven't created your medical profile yet. Responders won't see any life-saving data.</p>
                                    <Link to="/profile/create" className="btn btn-primary btn-full">Create Profile Now</Link>
                                </div>
                            )}
                        </div>

                        {/* Profile Quick Stats */}
                        {profile && (
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                    <Activity size={20} color="var(--blue)" />
                                    <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>Profile Health</span>
                                </div>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {[
                                        { label: 'Blood Group', value: profile.bloodGroup, color: 'var(--red)' },
                                        { label: 'Allergies', value: `${profile.allergies.length} reported` },
                                        { label: 'Medications', value: `${profile.medications.length} active` },
                                        { label: 'Contacts', value: `${profile.emergencyContacts.length} numbers` },
                                    ].map((stat, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: stat.color || 'inherit' }}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                    <Link to={`/emergency/${userId}`} target="_blank" className="btn btn-ghost btn-full" style={{ fontSize: '0.875rem' }}>
                                        View Emergency Page <ExternalLink size={14} style={{ marginLeft: 8 }} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Column 2: Controls & History ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Emergency Controls Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                            {/* Emergency Mode Toggle */}
                            <div className="card" style={{ borderLeft: `4px solid ${emergencyMode ? 'var(--blue)' : 'var(--border)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: emergencyMode ? 'rgba(30, 64, 175, 0.1)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {emergencyMode ? <Shield size={20} color="var(--blue)" /> : <ShieldOff size={20} color="var(--text-muted)" />}
                                    </div>
                                    <Toggle checked={emergencyMode} onChange={handleEmergencyModeToggle} disabled={togglingMode} />
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Emergency Mode</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {emergencyMode 
                                        ? 'Full clinical data is currently visible to responders.' 
                                        : 'Only minimal identification is visible to the public.'}
                                </p>
                            </div>

                            {/* Accident Detection Toggle */}
                            <div className="card" style={{ borderLeft: `4px solid ${accidentDetectionEnabled ? '#FF9800' : 'var(--border)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: accidentDetectionEnabled ? 'rgba(255, 152, 0, 0.1)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bell size={20} color={accidentDetectionEnabled ? '#FF9800' : 'var(--text-muted)'} />
                                    </div>
                                    <Toggle checked={accidentDetectionEnabled} onChange={toggleAccidentDetection} />
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Auto-Alert</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {accidentDetectionEnabled 
                                        ? 'Monitoring motion sensors for sudden impact.' 
                                        : 'Automatic impact detection is currently disabled.'}
                                </p>
                            </div>
                        </div>

                        {/* Simulated Accident Action */}
                        {accidentDetectionEnabled && (
                            <div className="card" style={{ background: 'linear-gradient(135deg, white 0%, #FFF9F2 100%)', border: '1.5px dashed #FF9800' }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Zap size={16} color="#FF9800" /> Test System
                                        </h4>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Trigger a mock emergency to verify your email alerts are working.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowCountdown(true)}
                                        disabled={showCountdown}
                                        className="btn btn-secondary btn-sm"
                                        style={{ borderColor: '#FF9800', color: '#E65100' }}
                                    >
                                        {showCountdown ? 'Countdown Active' : 'Test Alert'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Recent Access Log */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Clock size={20} color="var(--blue)" />
                                    <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>Access Logs</span>
                                </div>
                                <div className="badge badge-gray">{logs.length} Total</div>
                            </div>
                            
                            {logs.length === 0 ? (
                                <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No access events recorded yet.</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    {logs.map((log, i) => (
                                        <div key={log.id} style={{ 
                                            padding: '16px 24px', 
                                            borderBottom: i === logs.length - 1 ? 'none' : '1px solid var(--border)',
                                            background: i === 0 ? 'rgba(30, 64, 175, 0.02)' : 'transparent',
                                            display: 'grid', gridTemplateColumns: '1fr auto', gap: 12
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                                    <TypeBadge type={log.accessorType} />
                                                    <TierBadge tier={log.accessTier} />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    <MapPin size={10} />
                                                    {log.location || 'Unknown Location'}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(log.accessedAt).split(',')[1]}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(log.accessedAt).split(',')[0]}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
