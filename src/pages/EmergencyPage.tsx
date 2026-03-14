import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, AlertTriangle, Heart, Shield, ChevronRight, Loader } from 'lucide-react';
import { getPublicEmergencyInfo } from '../lib/mockData';
import type { PublicEmergencyInfo } from '../types';

export default function EmergencyPage() {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<PublicEmergencyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) { setError('Invalid emergency link.'); setLoading(false); return; }
        getPublicEmergencyInfo(userId).then(res => {
            if (!res.success || !res.data) { setError(res.message || 'No medical profile found.'); }
            else setData(res.data);
            setLoading(false);
        });
    }, [userId]);

    if (loading) {
        return (
            <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <Loader size={36} color="#E53935" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#888' }}>Loading emergency info…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ textAlign: 'center', maxWidth: 360 }}>
                    <AlertTriangle size={48} color="#E53935" style={{ marginBottom: 16 }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Profile Not Found</h1>
                    <p style={{ color: '#888', marginBottom: 24 }}>{error}</p>
                    <Link to="/" className="btn btn-primary">Go to MediScan</Link>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const criticalAllergies = data.severeAllergies.filter(a => a.severity === 'Life-threatening');
    const severeAllergies = data.severeAllergies.filter(a => a.severity === 'Severe');

    return (
        <div className="emergency-page">
            {/* Emergency Header */}
            <div className="emergency-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 6, padding: '4px 10px' }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.8125rem', letterSpacing: '0.1em' }}>🚨 EMERGENCY MEDICAL ID</span>
                    </div>
                </div>
                <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {data.fullName}
                </h1>
                <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '0.9375rem' }}>Age: {data.age} years</p>
            </div>

            <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>

                {/* Blood Group - prominent */}
                <div style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.1)', borderRadius: 16, marginBottom: 20 }}>
                    <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>Blood Group</p>
                    <div className="blood-group-display animate-pulse">{data.bloodGroup || '?'}</div>
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: 8 }}>For transfusion use</p>
                </div>

                {/* Critical Allergies */}
                {criticalAllergies.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <AlertTriangle size={16} color="#E53935" />
                            <p style={{ color: '#E53935', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>⚠️ Life-Threatening Allergies</p>
                        </div>
                        {criticalAllergies.map(a => (
                            <div key={a.id} className="allergy-alert" style={{ marginBottom: 8 }}>
                                <AlertTriangle size={18} color="#E53935" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <p style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#fff', marginBottom: 2 }}>{a.name}</p>
                                    {a.reaction && <p style={{ color: '#ccc', fontSize: '0.875rem' }}>Reaction: {a.reaction}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Severe Allergies */}
                {severeAllergies.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ color: '#E65100', fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>⚡ Severe Allergies</p>
                        {severeAllergies.map(a => (
                            <div key={a.id} style={{ background: 'rgba(230,81,0,.12)', border: '1px solid rgba(230,81,0,.35)', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                                <p style={{ fontWeight: 700, color: '#fff', marginBottom: a.reaction ? 2 : 0 }}>{a.name}</p>
                                {a.reaction && <p style={{ color: '#aaa', fontSize: '0.8125rem' }}>{a.reaction}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {criticalAllergies.length === 0 && severeAllergies.length === 0 && (
                    <div style={{ background: 'rgba(46,125,50,.12)', border: '1px solid rgba(46,125,50,.35)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Heart size={18} color="#4CAF50" />
                        <p style={{ color: '#81C784', fontWeight: 600 }}>No severe allergies on record</p>
                    </div>
                )}

                {/* Emergency Contact */}
                {data.primaryEmergencyContact && (
                    <div style={{ background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
                        <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Emergency Contact</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 2 }}>{data.primaryEmergencyContact.name}</p>
                                <p style={{ color: '#aaa', fontSize: '0.875rem' }}>{data.primaryEmergencyContact.relationship}</p>
                            </div>
                            <a
                                href={`tel:${data.primaryEmergencyContact.phone}`}
                                className="btn btn-primary"
                                style={{ background: '#4CAF50', boxShadow: '0 4px 14px rgba(76,175,80,.4)' }}
                            >
                                <Phone size={16} /> {data.primaryEmergencyContact.phone}
                            </a>
                        </div>
                    </div>
                )}

                {/* Extended Access CTA */}
                <div style={{ background: 'rgba(21,101,192,.15)', border: '1.5px solid rgba(21,101,192,.4)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Shield size={20} color="#64B5F6" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>Need Full Medical History?</p>
                            <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: 12 }}>Request an OTP to access complete records including conditions, medications, and all contacts.</p>
                            <Link to={`/doctor-access/${userId}`} className="btn btn-sm" style={{ background: '#1565C0', color: '#fff', gap: 8 }}>
                                Request Extended Access <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <p style={{ color: '#555', fontSize: '0.8125rem', textAlign: 'center', lineHeight: 1.6 }}>
                    This information was provided by the patient. Always confirm with medical professionals.<br />
                    Powered by <span style={{ color: 'var(--red)' }}>MediScan</span>
                </p>

                <div style={{ marginTop: 48, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
                    <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: 12 }}>Is this your profile?</p>
                    <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: '#ccc' }}>
                        Patient Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
