import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, AlertTriangle, Shield, Loader, Pill, Activity, Info, CheckCircle2, User } from 'lucide-react';
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
    if (severeAllergyNames.length === 1) {
        const allergy = data.allAllergies?.find(a => a.name === severeAllergyNames[0]);
        parts.push(`known ${allergy?.severity === 'Life-threatening' ? 'life-threatening' : 'severe'} allergy to ${severeAllergyNames[0]}`);
    } else if (severeAllergyNames.length > 1) {
        parts.push(`multiple severe allergies (${severeAllergyNames.join(', ')})`);
    }

    // Medications
    const medNames = data.medications?.map(m => m.name).filter(Boolean) ?? [];
    if (medNames.length === 1) parts.push(`currently on ${medNames[0]}`);
    else if (medNames.length > 1) parts.push(`on ${medNames.slice(0, -1).join(', ')} and ${medNames[medNames.length - 1]}`);

    if (parts.length === 1) return `${agePart}. No major medical conditions, allergies, or medications on record.`;

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
                        res.data.primaryEmergencyContact.phone, // best-effort using phone
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
    const criticalAllergies = (data.allAllergies || []).filter(a => a.severity === 'Life-threatening');
    const severeAllergies = (data.allAllergies || []).filter(a => a.severity === 'Severe');
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
                <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {data.fullName}
                </h1>
                <p style={{ color: 'rgba(255,255,255,.9)', fontSize: '1rem', fontWeight: 500 }}>
                    {data.age ? `Age: ${data.age} years` : 'Age: Unknown'}
                </p>
            </div>

            <div style={{ padding: '24px 20px 80px', maxWidth: 650, margin: '0 auto' }}>

                {/* ── 1. ALLERGY ALERT BANNER (High Priority) ── */}
                <div style={{ marginBottom: 20 }}>
                    {criticalAllergies.length > 0 ? (
                        <div style={{
                            background: 'rgba(229,57,53,.15)', border: '2px solid #E53935',
                            borderRadius: 14, padding: '16px', boxShadow: '0 4px 20px rgba(229,57,53,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <AlertTriangle size={22} color="#E53935" />
                                <p style={{ color: '#E53935', fontWeight: 900, fontSize: '0.9375rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    CRITICAL ALLergy ALERT
                                </p>
                            </div>
                            {criticalAllergies.map(a => (
                                <div key={a.id} style={{ display: 'flex', gap: 12, marginBottom: 8, paddingLeft: 4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E53935', marginTop: 9, flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', lineHeight: 1.2 }}>{a.name}</p>
                                        {a.reaction && <p style={{ color: '#ffcdd2', fontSize: '0.9375rem', marginTop: 2 }}>{a.reaction}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : severeAllergies.length > 0 ? (
                        <div style={{
                            background: 'rgba(255,152,0,.12)', border: '1.5px solid #FF9800',
                            borderRadius: 14, padding: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <AlertTriangle size={20} color="#FF9800" />
                                <p style={{ color: '#FF9800', fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase' }}>
                                    Severe Allergy Warning
                                </p>
                            </div>
                            {severeAllergies.map(a => (
                                <div key={a.id} style={{ marginBottom: 6 }}>
                                    <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff' }}>{a.name}</p>
                                    {a.reaction && <p style={{ color: '#FFE0B2', fontSize: '0.875rem' }}>{a.reaction}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(46,125,50,.1)', border: '1px solid rgba(46,125,50,0.3)',
                            borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12
                        }}>
                            <CheckCircle2 size={20} color="#4CAF50" />
                            <p style={{ color: '#81C784', fontWeight: 600, fontSize: '1rem' }}>No known severe allergies reported.</p>
                        </div>
                    )}
                </div>

                {/* ── 2. BLOOD GROUP ── */}
                <div style={{ 
                    textAlign: 'center', padding: '24px 20px', 
                    background: 'rgba(255,255,255,.03)', border: '1.5px solid rgba(255,255,255,.08)', 
                    borderRadius: 20, marginBottom: 20 
                }}>
                    <p style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>Patient Blood Group</p>
                    <div style={{ 
                        fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1,
                        textShadow: '0 0 20px rgba(255,255,255,0.1)'
                    }} className="animate-pulse">
                        {data.bloodGroup || '—'}
                    </div>
                </div>

                {/* ── 3. EMERGENCY CONTACT CALL BUTTON ── */}
                {data.primaryEmergencyContact ? (
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ background: 'rgba(76,175,80,.1)', border: '1.5px solid rgba(76,175,80,.25)', borderRadius: 16, padding: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={22} color="#4CAF50" />
                                </div>
                                <div>
                                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.0625rem' }}>{data.primaryEmergencyContact.name}</p>
                                    <p style={{ color: '#888', fontSize: '0.875rem' }}>{data.primaryEmergencyContact.relationship} • Emergency Contact</p>
                                </div>
                            </div>
                            <a
                                href={`tel:${data.primaryEmergencyContact.phone}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                    width: '100%', padding: '16px 24px', borderRadius: 12,
                                    background: '#4CAF50', color: '#fff', fontWeight: 800,
                                    fontSize: '1.125rem', textDecoration: 'none',
                                    boxShadow: '0 8px 24px rgba(76,175,80,.35)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Phone size={22} />
                                CALL NOW: {data.primaryEmergencyContact.phone}
                            </a>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center', marginBottom: 32 }}>
                        <p style={{ color: '#666', fontSize: '0.9375rem' }}>No emergency contact information provided.</p>
                    </div>
                )}

                {/* ── MODE NOTICE ── */}
                {!isFullMode && (
                    <div style={{
                        background: 'rgba(33,150,243,.12)', border: '1px solid rgba(33,150,243,0.3)',
                        borderRadius: 12, padding: '14px 16px', marginBottom: 32,
                        display: 'flex', gap: 12, alignItems: 'center'
                    }}>
                        <Shield size={18} color="#2196F3" style={{ flexShrink: 0 }} />
                        <p style={{ color: '#90CAF9', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                            <strong>Private Profile:</strong> Patient has restricted access to full medical records. Contact their emergency contact for more details.
                        </p>
                    </div>
                )}

                {/* ── 4 & 5. MEDICATIONS & CONDITIONS (Full Mode Only) ── */}
                {isFullMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 32 }}>
                        {/* Medications */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Pill size={18} color="#888" />
                                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Medications</h3>
                            </div>
                            {data.medications && data.medications.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                                    {data.medications.map(m => (
                                        <div key={m.id} style={{
                                            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                                            borderRadius: 12, padding: '16px'
                                        }}>
                                            <p style={{ fontWeight: 800, color: '#fff', fontSize: '1.0625rem', marginBottom: 4 }}>{m.name}</p>
                                            <div style={{ display: 'flex', gap: 12, color: '#aaa', fontSize: '0.875rem' }}>
                                                <span>{m.dosage}</span>
                                                <span style={{ color: '#444' }}>•</span>
                                                <span>{m.frequency}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#555', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    No active medications reported.
                                </p>
                            )}
                        </div>

                        {/* Conditions */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Activity size={18} color="#888" />
                                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medical Conditions</h3>
                            </div>
                            {data.conditions && data.conditions.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                                    {data.conditions.map(c => (
                                        <div key={c.id} style={{
                                            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                                            borderRadius: 12, padding: '16px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                                <p style={{ fontWeight: 800, color: '#fff', fontSize: '1.0625rem' }}>{c.name}</p>
                                                {c.diagnosedYear && <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>SINCE {c.diagnosedYear}</span>}
                                            </div>
                                            {c.notes && <p style={{ color: '#888', fontSize: '0.875rem', lineHeight: 1.5 }}>{c.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#555', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    No known medical conditions reported.
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* ── 6. AI MEDICAL SUMMARY ── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(33,150,243,.08) 0%, rgba(33,150,243,0.02) 100%)',
                    border: '1.5px solid rgba(33,150,243,.2)',
                    borderRadius: 16, padding: '20px', marginBottom: 40
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(33,150,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Info size={16} color="#2196F3" />
                        </div>
                        <p style={{ color: '#2196F3', fontWeight: 800, fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Clinical Summary (AI Generated)
                        </p>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '1.0625rem', lineHeight: 1.6, fontWeight: 500 }}>
                        "{aiSummary}"
                    </p>
                </div>

                {/* Disclaimer */}
                <div style={{ textAlign: 'center', maxWidth: 450, margin: '0 auto' }}>
                    <p style={{ color: '#444', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: 24 }}>
                        This emergency medical ID profile was created by the patient. MediScan verifies identity but does not clinically audit medical data. Always use clinical judgment.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: '#666' }}>Patient Login</Link>
                        <span style={{ color: '#222' }}>•</span>
                        <Link to={`/doctor-access/${userId}`} className="btn btn-ghost btn-sm" style={{ color: '#666' }}>Request Extended Access</Link>
                    </div>
                    <p style={{ color: '#333', fontSize: '0.75rem', marginTop: 32, fontWeight: 700, letterSpacing: '0.05em' }}>POWERED BY MEDISCAN EMERGENCY SERVICES</p>
                </div>
            </div>
        </div>
    );
}
