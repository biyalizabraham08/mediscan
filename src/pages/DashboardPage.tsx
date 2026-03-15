import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    User, Edit3, Download, LogOut, Clock, QrCode, Activity,
    Shield, ShieldOff, Siren, MapPin, CheckCircle2, Zap
} from 'lucide-react';
import { getProfile, getAccessLogs, setEmergencyMode, logAccess } from '../lib/mockData';
import { sendEmergencyAlertEmail } from '../utils/email';
import { useAuth } from '../lib/auth';
import type { MedicalProfile, AccessLog } from '../types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

function TierBadge({ tier }: { tier: 'public' | 'extended' }) {
    return (
        <span className={`badge ${tier === 'extended' ? 'badge-red' : 'badge-blue'}`}>
            {tier === 'extended' ? '🔒 Extended' : '👁 Public'}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    if (type === 'doctor_access') return <span className="badge badge-gray">🏥 Doctor</span>;
    if (type === 'simulated_accident') return <span className="badge" style={{ background: 'rgba(255,152,0,.18)', color: '#FF9800' }}>⚡ Simulated</span>;
    return <span className="badge badge-gray">🚨 Emergency</span>;
}

/** Toggle switch component */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            style={{
                position: 'relative', width: 48, height: 26, borderRadius: 13,
                background: checked ? 'var(--red)' : 'var(--border)',
                border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.25s', flexShrink: 0,
            }}
            aria-label={checked ? 'Disable' : 'Enable'}
        >
            <span style={{
                position: 'absolute', top: 3, left: checked ? 25 : 3,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,.25)',
                transition: 'left 0.25s',
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

    // Emergency Mode state
    const [emergencyMode, setEmergencyModeState] = useState(true);
    const [togglingMode, setTogglingMode] = useState(false);

    // Accident Detection state
    const [accidentDetectionEnabled, setAccidentDetectionEnabled] = useState(false);
    const [simulatingAccident, setSimulatingAccident] = useState(false);
    const [accidentAlert, setAccidentAlert] = useState('');
    const accidentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const emergencyUrl = `${window.location.origin}/emergency/${userId}`;

    useEffect(() => {
        Promise.all([getProfile(userId), getAccessLogs(userId)]).then(([p, l]) => {
            setProfile(p);
            if (p) setEmergencyModeState(p.emergencyMode !== false);
            setLogs(l);
            setLoading(false);
        });
    }, [userId]);

    // Motion-based accident detection (DeviceMotionEvent)
    useEffect(() => {
        if (!accidentDetectionEnabled) return;
        let lastAccel = 0;
        const threshold = 25; // m/s²

        const handler = (e: DeviceMotionEvent) => {
            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            const total = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
            if (Math.abs(total - lastAccel) > threshold) {
                triggerAccidentAlert('Motion detected!');
            }
            lastAccel = total;
        };

        window.addEventListener('devicemotion', handler as EventListener);
        return () => window.removeEventListener('devicemotion', handler as EventListener);
    }, [accidentDetectionEnabled]);

    async function triggerAccidentAlert(reason: string) {
        if (simulatingAccident) return;
        setSimulatingAccident(true);
        setAccidentAlert(`🚨 ${reason} Emergency alert triggered!`);

        // Log the event
        await logAccess(userId, 'simulated_accident', 'public');

        // Send email to emergency contact
        if (profile?.emergencyContacts?.[0] && profile.fullName) {
            const contact = profile.emergencyContacts[0];
            const alertMsg = `🚨 URGENT: An accident or sudden impact was detected for ${profile.fullName}.\n\nDetection Method: ${reason}\nTime: ${new Date().toLocaleString()}\n\nPlease attempt to contact them or check their location immediately.`;
            
            await sendEmergencyAlertEmail(
                contact.phone, // best-effort using phone; ideally an email field
                contact.name,
                profile.fullName,
                alertMsg
            );
        }

        // Refresh logs
        const freshLogs = await getAccessLogs(userId);
        setLogs(freshLogs);

        // Auto-clear alert after 8s
        if (accidentTimeout.current) clearTimeout(accidentTimeout.current);
        accidentTimeout.current = setTimeout(() => {
            setSimulatingAccident(false);
            setAccidentAlert('');
        }, 8000);
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

    if (loading) {
        return <div className="page-center"><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
    }

    return (
        <div className="page" style={{ background: 'var(--bg)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <svg className="logo" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#E53935" /><rect x="13" y="6" width="6" height="20" rx="2" fill="white" /><rect x="6" y="13" width="20" height="6" rx="2" fill="white" /></svg>
                    <span>Medi<em>Scan</em></span>
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/profile/edit" className="btn btn-ghost btn-sm"><Edit3 size={14} />Edit Profile</Link>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={14} />Logout</button>
                </div>
            </nav>

            {/* Accident Alert Banner */}
            {accidentAlert && (
                <div style={{
                    background: '#E53935', color: '#fff', padding: '14px 24px',
                    textAlign: 'center', fontWeight: 700, fontSize: '1rem',
                    animation: 'pulse 0.8s ease-in-out infinite alternate',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}>
                    <Siren size={20} />
                    {accidentAlert}
                    <Siren size={20} />
                </div>
            )}

            <div className="container-lg" style={{ padding: '32px 24px 60px' }}>
                <div className="animate-in">
                    {/* Welcome */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} color="var(--red)" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Welcome back, {authState.user?.name?.split(' ')[0]}!</h2>
                                <p style={{ fontSize: '0.875rem', marginTop: 0 }}>{authState.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {/* QR Card */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
                                <QrCode size={18} color="var(--red)" />
                                <h3 style={{ fontSize: '1rem' }}>Your Emergency QR</h3>
                            </div>

                            {profile ? (
                                <>
                                    <div style={{ padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                        <QRCodeSVG value={emergencyUrl} size={160} level="H" fgColor="#0F172A" bgColor="#ffffff" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 2 }}>{profile.fullName}</p>
                                        <span className="badge badge-red" style={{ fontSize: '0.875rem' }}>Blood Group: {profile.bloodGroup}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                        <Link to="/qr-code" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                            <Download size={13} /> Download
                                        </Link>
                                        <Link to="/profile/edit" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                            <Edit3 size={13} /> Edit
                                        </Link>
                                    </div>
                                    <div style={{ width: '100%', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 4 }}>Emergency URL</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{emergencyUrl}</p>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <p style={{ marginBottom: 16 }}>No medical profile yet.</p>
                                    <Link to="/profile/create" className="btn btn-primary">Create Profile</Link>
                                </div>
                            )}
                        </div>

                        {/* Profile Summary */}
                        {profile && (
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <Activity size={18} color="var(--red)" />
                                    <h3 style={{ fontSize: '1rem' }}>Profile Summary</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: 'Blood Group', value: <span className="badge badge-red" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>{profile.bloodGroup}</span> },
                                        { label: 'Allergies', value: `${profile.allergies.length} total (${profile.allergies.filter(a => a.severity !== 'Mild').length} severe)` },
                                        { label: 'Conditions', value: `${profile.conditions.length} listed` },
                                        { label: 'Medications', value: `${profile.medications.length} listed` },
                                        { label: 'Emergency Contacts', value: `${profile.emergencyContacts.length} contacts` },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                                            {typeof value === 'string'
                                                ? <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                                                : value}
                                        </div>
                                    ))}
                                </div>

                                <Link to={`/emergency/${userId}`} className="btn btn-secondary btn-sm" style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }} target="_blank">
                                    Preview Emergency View ↗
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Emergency Mode Toggle ── */}
                    {profile && (
                        <div className="card" style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                        background: emergencyMode ? 'rgba(229,57,53,.12)' : 'var(--surface-2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {emergencyMode
                                            ? <Shield size={20} color="var(--red)" />
                                            : <ShieldOff size={20} color="var(--text-muted)" />}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Emergency Mode</h3>
                                        {emergencyMode ? (
                                            <p style={{ fontSize: '0.875rem', color: '#4CAF50', fontWeight: 600 }}>
                                                <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                                                ON — Full medical information visible to rescuers
                                            </p>
                                        ) : (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                OFF — Only name &amp; emergency contact visible
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                            When ON, anyone who scans your QR code can see your allergies, medications, conditions, and blood group.
                                        </p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={emergencyMode}
                                    onChange={handleEmergencyModeToggle}
                                    disabled={togglingMode}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Accident Detection ── */}
                    {profile && (
                        <div className="card" style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: accidentDetectionEnabled ? 16 : 0 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                        background: accidentDetectionEnabled ? 'rgba(255,152,0,.12)' : 'var(--surface-2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Siren size={20} color={accidentDetectionEnabled ? '#FF9800' : 'var(--text-muted)'} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Accident Detection</h3>
                                        <p style={{ fontSize: '0.875rem', color: accidentDetectionEnabled ? '#FF9800' : 'var(--text-muted)', fontWeight: 600 }}>
                                            {accidentDetectionEnabled ? '⚡ Active — monitoring device motion' : 'Disabled'}
                                        </p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                            Detects sudden device motion and automatically triggers an emergency alert to your contacts.
                                        </p>
                                    </div>
                                </div>
                                <Toggle checked={accidentDetectionEnabled} onChange={setAccidentDetectionEnabled} />
                            </div>

                            {accidentDetectionEnabled && (
                                <div style={{
                                    borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex',
                                    alignItems: 'center', gap: 12, flexWrap: 'wrap'
                                }}>
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => triggerAccidentAlert('Manual simulation triggered.')}
                                        disabled={simulatingAccident}
                                        style={{
                                            background: simulatingAccident ? 'var(--surface-2)' : '#E53935',
                                            color: simulatingAccident ? 'var(--text-muted)' : '#fff',
                                            gap: 8
                                        }}
                                    >
                                        <Zap size={14} />
                                        {simulatingAccident ? 'Alert sent…' : 'Simulate Accident'}
                                    </button>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        For demo purposes. Logs an event and sends an alert email to your emergency contact.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Emergency Access History ── */}
                    <div className="card" style={{ marginTop: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Clock size={18} color="var(--red)" />
                            <h3 style={{ fontSize: '1rem' }}>Emergency Access History</h3>
                            <span className="badge badge-gray" style={{ marginLeft: 4 }}>{logs.length}</span>
                        </div>

                        {logs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                <p>No access events yet.</p>
                                <p style={{ fontSize: '0.875rem', marginTop: 4 }}>When someone scans your QR code, it will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--surface-2)' }}>
                                            {['Date & Time', 'Access Type', 'Tier', 'Location'].map(h => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, i) => (
                                            <tr key={log.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 ? 'var(--surface-2)' : 'transparent' }}>
                                                <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(log.accessedAt)}</td>
                                                <td style={{ padding: '10px 14px' }}><TypeBadge type={log.accessorType} /></td>
                                                <td style={{ padding: '10px 14px' }}><TierBadge tier={log.accessTier} /></td>
                                                <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                                    {log.location ? (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <MapPin size={12} />
                                                            {log.location}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
