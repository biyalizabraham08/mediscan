import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, AlertTriangle, Heart, Shield, ChevronRight, Loader, Pill, Activity, Info } from 'lucide-react';
import { getEmergencyData } from '../lib/mockData';
import { sendEmergencyAlertEmail } from '../utils/email';
import type { EmergencyFullData } from '../types';

// ─── AI Medical Summary ───────────────────────────────────────────────────────

function generateMedicalSummary(data: EmergencyFullData): string {
    const parts: string[] = [];

    // Age
    const agePart = data.age ? `${data.age}-year-old patient` : 'Patient';
    parts.push(agePart);

    // Conditions
    const condNames = data.conditions?.map(c => c.name).filter(Boolean) ?? [];
    if (condNames.length === 1) parts[parts.length - 1] += ` with ${condNames[0]}`;
    else if (condNames.length > 1) parts[parts.length - 1] += ` with ${condNames.slice(0, -1).join(', ')} and ${condNames[condNames.length - 1]}`;

    // Blood group
    if (data.bloodGroup) parts.push(`Blood group ${data.bloodGroup}`);

    // Severe allergies
    const severeAllergyNames = data.allAllergies
        ?.filter(a => a.severity === 'Life-threatening' || a.severity === 'Severe')
        .map(a => a.name) ?? [];
    if (severeAllergyNames.length === 1) parts.push(`known ${data.allAllergies?.find(a => a.name === severeAllergyNames[0])?.severity === 'Life-threatening' ? 'life-threatening' : 'severe'} allergy to ${severeAllergyNames[0]}`);
    else if (severeAllergyNames.length > 1) parts.push(`multiple severe allergies (${severeAllergyNames.join(', ')})`);

    // Medications
    const medNames = data.medications?.map(m => m.name).filter(Boolean) ?? [];
    if (medNames.length === 1) parts.push(`currently on ${medNames[0]}`);
    else if (medNames.length > 1) parts.push(`on ${medNames.slice(0, -1).join(', ')} and ${medNames[medNames.length - 1]}`);

    if (parts.length === 1) return `${agePart}. No conditions, allergies, or medications on record.`;

    // Capitalise first letter, join with ". ", end with "."
    return parts.map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join('. ') + '.';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmergencyPage() {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<EmergencyFullData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const alertSent = useRef(false);

    useEffect(() => {
        if (!userId) { setError('Invalid emergency link.'); setLoading(false); return; }
        getEmergencyData(userId).then(res => {
            if (!res.success || !res.data) { setError(res.message || 'No medical profile found.'); }
            else {
                setData(res.data);
                // Fire-and-forget emergency contact alert (once per page load)
                if (!alertSent.current && res.data.primaryEmergencyContact) {
                    alertSent.current = true;
                    const accessTime = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                    const alertMsg = `⚠️ URGENT: ${res.data.fullName}'s emergency medical ID was just accessed via a QR code scan at ${accessTime}.\n\nThis usually means someone is providing them with emergency assistance. Please check on them immediately.`;
                    
                    sendEmergencyAlertEmail(
                        res.data.primaryEmergencyContact.phone, // best-effort using phone; ideally an email field
                        res.data.primaryEmergencyContact.name,
                        res.data.fullName,
                        alertMsg
                    );
                }
            }
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

    const isFullMode = data.emergencyMode;
    const criticalAllergies = data.severeAllergies.filter(a => a.severity === 'Life-threatening');
    const severeAllergies = data.severeAllergies.filter(a => a.severity === 'Severe');
    const aiSummary = generateMedicalSummary(data);

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

                {/* ── AI Medical Summary ── */}
                <div style={{
                    background: 'rgba(33,150,243,.12)', border: '1.5px solid rgba(33,150,243,.3)',
                    borderRadius: 12, padding: '14px 16px', marginBottom: 20,
                    display: 'flex', gap: 10, alignItems: 'flex-start'
                }}>
                    <Info size={18} color="#64B5F6" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ color: '#64B5F6', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                            AI Medical Summary
                        </p>
                        <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.6 }}>{aiSummary}</p>
                    </div>
                </div>

                {/* ── Emergency Mode OFF Notice ── */}
                {!isFullMode && (
                    <div style={{
                        background: 'rgba(100,181,246,.08)', border: '1px solid rgba(100,181,246,.25)',
                        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                        display: 'flex', gap: 10, alignItems: 'center'
                    }}>
                        <Shield size={16} color="#64B5F6" style={{ flexShrink: 0 }} />
                        <p style={{ color: '#90CAF9', fontSize: '0.875rem' }}>
                            ℹ️ Only basic information is shown. The patient has disabled full emergency mode.
                        </p>
                    </div>
                )}

                {/* ── Life-Threatening Allergy Red Banner ── */}
                {criticalAllergies.length > 0 && (
                    <div style={{
                        background: 'rgba(229,57,53,.18)', border: '2px solid #E53935',
                        borderRadius: 12, padding: '14px 16px', marginBottom: 16
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <AlertTriangle size={18} color="#E53935" />
                            <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                ⚠️ LIFE-THREATENING ALLERGIES — DO NOT ADMINISTER
                            </p>
                        </div>
                        {criticalAllergies.map(a => (
                            <div key={a.id} className="allergy-alert" style={{ marginBottom: 6 }}>
                                <AlertTriangle size={18} color="#E53935" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <p style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#fff', marginBottom: 2 }}>{a.name}</p>
                                    {a.reaction && <p style={{ color: '#ccc', fontSize: '0.875rem' }}>Reaction: {a.reaction}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Severe Allergies ── */}
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

                {/* ── Blood Group ── (large prominent display) */}
                <div style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.1)', borderRadius: 16, marginBottom: 20 }}>
                    <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>Blood Group</p>
                    <div className="blood-group-display animate-pulse">{data.bloodGroup || '?'}</div>
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: 8 }}>For transfusion use</p>
                </div>

                {/* ── Prominent Call Emergency Contact Button ── */}
                {data.primaryEmergencyContact && (
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Emergency Contact</p>
                        <div style={{ background: 'rgba(76,175,80,.12)', border: '1.5px solid rgba(76,175,80,.35)', borderRadius: 12, padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 2 }}>{data.primaryEmergencyContact.name}</p>
                                    <p style={{ color: '#aaa', fontSize: '0.875rem' }}>{data.primaryEmergencyContact.relationship}</p>
                                </div>
                            </div>
                            <a
                                href={`tel:${data.primaryEmergencyContact.phone}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    width: '100%', padding: '14px 20px', borderRadius: 10,
                                    background: '#4CAF50', color: '#fff', fontWeight: 800,
                                    fontSize: '1.0625rem', textDecoration: 'none',
                                    boxShadow: '0 4px 18px rgba(76,175,80,.45)',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                <Phone size={20} />
                                Call {data.primaryEmergencyContact.name} — {data.primaryEmergencyContact.phone}
                            </a>
                        </div>
                    </div>
                )}

                {/* ── Full Mode: Conditions & Medications ── */}
                {isFullMode && (
                    <>
                        {/* Conditions */}
                        {data.conditions?.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Activity size={15} color="#888" />
                                    <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        Medical Conditions
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                                    {data.conditions.map(c => (
                                        <div key={c.id} style={{
                                            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                                            borderRadius: 10, padding: '12px 14px'
                                        }}>
                                            <p style={{ fontWeight: 700, color: '#fff', marginBottom: c.diagnosedYear ? 4 : 0 }}>{c.name}</p>
                                            {c.diagnosedYear && <p style={{ color: '#777', fontSize: '0.8125rem' }}>Since {c.diagnosedYear}</p>}
                                            {c.notes && <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: 4 }}>{c.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Medications */}
                        {data.medications?.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Pill size={15} color="#888" />
                                    <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        Current Medications
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                                    {data.medications.map(m => (
                                        <div key={m.id} style={{
                                            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                                            borderRadius: 10, padding: '12px 14px'
                                        }}>
                                            <p style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{m.name}</p>
                                            <p style={{ color: '#aaa', fontSize: '0.8125rem' }}>{m.dosage}</p>
                                            <p style={{ color: '#777', fontSize: '0.8125rem' }}>{m.frequency}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── Extended Access CTA ── */}
                <div style={{ background: 'rgba(21,101,192,.15)', border: '1.5px solid rgba(21,101,192,.4)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Shield size={20} color="#64B5F6" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>Need Full Medical History?</p>
                            <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: 12 }}>
                                Request an OTP to access complete records including all contacts and detailed history.
                            </p>
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
