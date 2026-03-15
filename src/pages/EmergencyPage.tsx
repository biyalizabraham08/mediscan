import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, AlertTriangle, Shield, Loader, Pill, Activity, Info, CheckCircle2, MapPin, Eye, EyeOff } from 'lucide-react';
import { getEmergencyData } from '../lib/mockData';
import { sendEmergencyAlertEmail } from '../utils/email';
import type { EmergencyFullData, Allergy, Medication, Condition } from '../types';

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
    const [hospitalMode, setHospitalMode] = useState(false);
    const [location, setLocation] = useState<string>('');
    const alertSent = useRef(false);

    // Geolocation detection
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
                    const json = await res.json();
                    const addr = json.address;
                    const city = addr.city || addr.town || addr.village || addr.suburb || '';
                    const country = addr.country || '';
                    const locStr = city ? `${city}, ${country}` : country;
                    if (locStr) setLocation(locStr);
                } catch (err) {
                    console.error("Location detection failed:", err);
                }
            },
            null,
            { timeout: 5000 }
        );
    }, []);

    useEffect(() => {
        if (!userId) { setError('Invalid emergency link.'); setLoading(false); return; }
        getEmergencyData(userId).then(res => {
            if (!res.success || !res.data) { setError(res.message || 'No medical profile found.'); }
            else {
                setData(res.data);
                // Fire-and-forget emergency contact alert (once per page load)
                if (!alertSent.current && (res.data.primaryEmergencyContact?.email || res.data.primaryEmergencyContact?.phone)) {
                    alertSent.current = true;
                    
                    sendEmergencyAlertEmail(
                        res.data.primaryEmergencyContact.email || res.data.primaryEmergencyContact.phone,
                        res.data.primaryEmergencyContact.name,
                        res.data.fullName,
                        undefined,
                        location || 'Detecting...'
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
    const criticalAllergies = (data.allAllergies || []).filter((a: Allergy) => a.severity === 'Life-threatening');
    const severeAllergies = (data.allAllergies || []).filter((a: Allergy) => a.severity === 'Severe');
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
                <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {data.fullName}
                </h1>
                <p style={{ color: 'rgba(255,255,255,.9)', fontSize: '1.125rem', fontWeight: 500 }}>
                    {data.age ? `Age: ${data.age} years` : 'Age: Unknown'}
                </p>

                {/* Hospital Mode Toggle */}
                <button 
                    onClick={() => setHospitalMode(!hospitalMode)}
                    style={{
                        marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                        background: hospitalMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                        padding: '6px 12px', color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {hospitalMode ? <Eye size={16} /> : <EyeOff size={16} />}
                    {hospitalMode ? 'Standard View' : 'Hospital Mode (Triage)'}
                </button>
            </div>

            <div style={{ padding: '24px 20px 80px', maxWidth: 650, margin: '0 auto' }}>

                {/* ── 1. ALLERGY ALERT BANNER (Critical Priority) ── */}
                <div style={{ marginBottom: 24 }}>
                    {criticalAllergies.length > 0 ? (
                        <div style={{
                            background: 'rgba(229,57,53,.15)', border: '3px solid #E53935',
                            borderRadius: 16, padding: '20px', boxShadow: '0 4px 30px rgba(229,57,53,0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <AlertTriangle size={28} color="#E53935" />
                                <p style={{ color: '#E53935', fontWeight: 900, fontSize: '1.125rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    CRITICAL ALLERGY ALERT
                                </p>
                            </div>
                            {criticalAllergies.map((a: Allergy) => (
                                <div key={a.id} style={{ display: 'flex', gap: 14, marginBottom: 12, paddingLeft: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53935', marginTop: 10, flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', lineHeight: 1.2 }}>{a.name}</p>
                                        {a.reaction && <p style={{ color: '#ffcdd2', fontSize: '1rem', marginTop: 4, fontWeight: 500 }}>Reaction: {a.reaction}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : severeAllergies.length > 0 ? (
                        <div style={{
                            background: 'rgba(255,152,0,.15)', border: '2px solid #FF9800',
                            borderRadius: 16, padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <AlertTriangle size={24} color="#FF9800" />
                                <p style={{ color: '#FF9800', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase' }}>
                                    Severe Allergy Warning
                                </p>
                            </div>
                            {severeAllergies.map((a: Allergy) => (
                                <div key={a.id} style={{ marginBottom: 8 }}>
                                    <p style={{ fontWeight: 900, fontSize: '1.25rem', color: '#fff' }}>{a.name}</p>
                                    {a.reaction && <p style={{ color: '#FFE0B2', fontSize: '0.9375rem', marginTop: 2 }}>Reaction: {a.reaction}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(46,125,50,0.1)', border: '1.5px solid rgba(46,125,50,0.3)',
                            borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12
                        }}>
                            <CheckCircle2 size={24} color="#4CAF50" />
                            <p style={{ color: '#81C784', fontWeight: 700, fontSize: '1.125rem' }}>No known life-threatening allergies.</p>
                        </div>
                    )}
                </div>

                {/* ── 2. BLOOD GROUP (Vital Info) ── */}
                <div style={{ 
                    textAlign: 'center', padding: '32px 20px', 
                    background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.1)', 
                    borderRadius: 24, marginBottom: 24
                }}>
                    <p style={{ color: '#aaa', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: 12, textTransform: 'uppercase' }}>Blood Group</p>
                    <div style={{ 
                        fontSize: '4.5rem', fontWeight: 950, color: '#fff', lineHeight: 1,
                        textShadow: '0 0 30px rgba(255,255,255,0.15)'
                    }} className="animate-pulse">
                        {data.bloodGroup || 'UNK'}
                    </div>
                </div>

                {/* ── 3. EMERGENCY CONTACT CALL BUTTON (Immediate Action) ── */}
                {data.primaryEmergencyContact ? (
                    <div style={{ marginBottom: 40 }}>
                        <div style={{ background: 'rgba(76,175,80,.12)', border: '2px solid rgba(76,175,80,.3)', borderRadius: 20, padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(76,175,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Activity size={26} color="#4CAF50" />
                                </div>
                                <div>
                                    <p style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem' }}>{data.primaryEmergencyContact.name}</p>
                                    <p style={{ color: '#aaa', fontSize: '1rem' }}>{data.primaryEmergencyContact.relationship} • Emergency Contact</p>
                                </div>
                            </div>
                            <a
                                href={`tel:${data.primaryEmergencyContact.phone}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                                    width: '100%', padding: '20px 24px', borderRadius: 16,
                                    background: '#4CAF50', color: '#fff', fontWeight: 900,
                                    fontSize: '1.5rem', textDecoration: 'none',
                                    boxShadow: '0 12px 32px rgba(76,175,80,.4)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(76,175,80,.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(76,175,80,.4)';
                                }}
                            >
                                <Phone size={28} />
                                CALL CONTACT
                            </a>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 20, textAlign: 'center', marginBottom: 40 }}>
                        <p style={{ color: '#888', fontSize: '1.125rem' }}>No emergency contact registered.</p>
                    </div>
                )}

                {/* ── 4. AI MEDICAL SUMMARY (Quick Context) ── */}
                {!hospitalMode && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(33,150,243,.1) 0%, rgba(33,150,243,0.03) 100%)',
                        border: '2px solid rgba(33,150,243,.3)',
                        borderRadius: 20, padding: '24px', marginBottom: 40
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(33,150,243,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Info size={18} color="#2196F3" />
                            </div>
                            <p style={{ color: '#2196F3', fontWeight: 900, fontSize: '0.9375rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Triage Summary
                            </p>
                        </div>
                        <p style={{ color: '#fff', fontSize: '1.25rem', lineHeight: 1.5, fontWeight: 600 }}>
                            "{aiSummary}"
                        </p>
                    </div>
                )}

                {/* Location Detection Banner */}
                {location && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 20px',
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <MapPin size={18} color="#aaa" />
                        <p style={{ color: '#aaa', fontSize: '0.9375rem', fontWeight: 500 }}>
                            Detected Location: <span style={{ color: '#fff' }}>{location}</span>
                        </p>
                    </div>
                )}

                {/* ── MODE NOTICE ── */}
                {!isFullMode && !hospitalMode && (
                    <div style={{
                        background: 'rgba(33,150,243,.12)', border: '1.5px solid rgba(33,150,243,0.3)',
                        borderRadius: 16, padding: '18px 24px', marginBottom: 40,
                        display: 'flex', gap: 16, alignItems: 'center'
                    }}>
                        <Shield size={24} color="#2196F3" style={{ flexShrink: 0 }} />
                        <p style={{ color: '#90CAF9', fontSize: '1.0625rem', lineHeight: 1.5, fontWeight: 500 }}>
                            <strong>Limited Visibility:</strong> Only public emergency data is shown. Full records are locked by the patient.
                        </p>
                    </div>
                )}

                {/* ── 5 & 6. MEDICATIONS & CONDITIONS (Detailed Clinical Data) ── */}
                {isFullMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 48 }}>
                        {/* Medications */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <Pill size={22} color="#aaa" />
                                <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Medications</h3>
                            </div>
                            {data.medications && data.medications.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                    {data.medications.map((m: Medication) => (
                                        <div key={m.id} style={{
                                            background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.1)',
                                            borderRadius: 16, padding: '20px'
                                        }}>
                                            <p style={{ fontWeight: 900, color: '#fff', fontSize: '1.25rem', marginBottom: 6 }}>{m.name}</p>
                                            <div style={{ display: 'flex', gap: 12, color: '#ccc', fontSize: '1rem', fontWeight: 500 }}>
                                                <span>{m.dosage}</span>
                                                <span style={{ color: '#444' }}>•</span>
                                                <span>{m.frequency}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ color: '#777', fontSize: '1.0625rem', fontWeight: 500 }}>No active medications reported.</p>
                                </div>
                            )}
                        </div>

                        {/* Conditions */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <Activity size={22} color="#aaa" />
                                <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medical Conditions</h3>
                            </div>
                            {data.conditions && data.conditions.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                    {data.conditions.map((c: Condition) => (
                                        <div key={c.id} style={{
                                            background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.1)',
                                            borderRadius: 16, padding: '20px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <p style={{ fontWeight: 900, color: '#fff', fontSize: '1.25rem' }}>{c.name}</p>
                                                {c.diagnosedYear && <span style={{ fontSize: '0.8125rem', color: '#999', fontWeight: 800, background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6 }}>EST. {c.diagnosedYear}</span>}
                                            </div>
                                            {c.notes && <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>{c.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ color: '#777', fontSize: '1.0625rem', fontWeight: 500 }}>No known medical conditions reported.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', opacity: 0.6 }}>
                    <p style={{ color: '#aaa', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
                        This emergency medical ID profile was created by the patient. MediScan verifies identity but does not clinically audit medical data. Always use clinical judgment.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: '#fff', fontSize: '0.8125rem' }}>Patient Login</Link>
                        <span style={{ color: '#333' }}>|</span>
                        <Link to={`/doctor-access/${userId}`} className="btn btn-ghost btn-sm" style={{ color: '#fff', fontSize: '0.8125rem' }}>Professional Access</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
