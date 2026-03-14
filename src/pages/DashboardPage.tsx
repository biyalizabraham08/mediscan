import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { User, Edit3, Download, LogOut, Clock, QrCode, Activity } from 'lucide-react';
import { getProfile, getAccessLogs } from '../lib/mockData';
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
    const label = type === 'doctor_access' ? '🏥 Doctor' : '🚨 Emergency';
    return <span className="badge badge-gray">{label}</span>;
}

export default function DashboardPage() {
    const { authState, logout } = useAuth();
    const navigate = useNavigate();
    const userId = authState.user!.id;

    const [profile, setProfile] = useState<MedicalProfile | null>(null);
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);

    const emergencyUrl = `${window.location.origin}/emergency/${userId}`;

    useEffect(() => {
        Promise.all([getProfile(userId), getAccessLogs(userId)]).then(([p, l]) => {
            setProfile(p);
            setLogs(l);
            setLoading(false);
        });
    }, [userId]);

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
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, gridRow: 'span 1' }}>
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

                    {/* Access Logs */}
                    <div className="card" style={{ marginTop: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Clock size={18} color="var(--red)" />
                            <h3 style={{ fontSize: '1rem' }}>Recent Access Log</h3>
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
                                            {['Date & Time', 'Access Type', 'Tier'].map(h => (
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
