import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, Phone, Heart, Pill, User, ArrowLeft, Loader } from 'lucide-react';
import { requestDoctorOTP, verifyDoctorOTP } from '../lib/mockData';
import type { ExtendedEmergencyInfo } from '../types';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ color: '#888', fontSize: '0.875rem' }}>{label}</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem', maxWidth: '60%', textAlign: 'right' }}>{value}</span>
        </div>
    );
}

export default function DoctorAccessPage() {
    const { userId } = useParams<{ userId: string }>();
    const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [data, setData] = useState<ExtendedEmergencyInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    async function handleRequestOTP() {
        if (!userId) return;
        setLoading(true);
        const res = await requestDoctorOTP(userId);
        setLoading(false);
        if (res.success) {
            toast.success('OTP sent! Please check the patient\'s email.');
            setStep('verify');
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } else {
            toast.error(res.message);
        }
    }

    function handleOtpChange(idx: number, val: string) {
        if (!/^[0-9]?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    }

    function handleOtpKeyDown(idx: number, e: KeyboardEvent) {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    }

    function handlePaste(e: ClipboardEvent) {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const next = Array(OTP_LENGTH).fill('');
        text.split('').forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    }

    async function handleVerify() {
        if (!userId) return;
        const code = otp.join('');
        if (code.length < OTP_LENGTH) { toast.error('Enter all 6 digits'); return; }
        setLoading(true);
        const res = await verifyDoctorOTP(userId, code);
        setLoading(false);
        if (!res.success) { toast.error(res.message!); return; }
        setData(res.data!);
        setStep('success');
    }

    return (
        <div className="emergency-page" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: 'var(--blue)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow)' }}>
                <Link to={`/emergency/${userId}`} style={{ color: 'rgba(255,255,255,.7)', display: 'flex' }}>
                    <ArrowLeft size={20} />
                </Link>
                <Shield size={20} color="#fff" />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Extended Medical Access</span>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 20px' }}>

                {/* STEP 1: Request OTP */}
                {step === 'request' && (
                    <div className="animate-in">
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 16px rgba(30,64,175,0.2)' }}>
                                <Shield size={28} color="white" />
                            </div>
                            <h2 style={{ color: '#fff', marginBottom: 8 }}>Request Extended Access</h2>
                            <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                                Extended access requires a one-time password sent to the patient's registered contact. This access is logged.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
                            <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: 8 }}>Extended access reveals:</p>
                            {[
                                '✅ Full allergy list (all severities)',
                                '✅ All medical conditions & diagnoses',
                                '✅ Current medications & dosages',
                                '✅ All emergency contacts',
                                '✅ Height, weight, date of birth',
                            ].map(item => (
                                <p key={item} style={{ color: '#ccc', fontSize: '0.875rem', marginBottom: 4 }}>{item}</p>
                            ))}
                        </div>


                        <button className="btn btn-primary btn-lg btn-full" onClick={handleRequestOTP} disabled={loading}>
                            {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</> : 'Send OTP to Patient →'}
                        </button>
                    </div>
                )}

                {/* STEP 2: Verify OTP */}
                {step === 'verify' && (
                    <div className="animate-in">
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h2 style={{ color: '#fff', marginBottom: 6 }}>Enter OTP</h2>
                            <p style={{ color: '#888' }}>Enter the 6-digit code sent to the patient's registered email</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: '28px 20px' }}>
                            <div className="otp-inputs" onPaste={handlePaste} style={{ marginBottom: 24 }}>
                                {otp.map((val, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => { inputRefs.current[idx] = el; }}
                                        className={`otp-input ${val ? 'filled' : ''}`}
                                        style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: val ? 'var(--blue)' : 'rgba(255,255,255,.2)' }}
                                        type="text" inputMode="numeric" maxLength={1}
                                        value={val}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                                    />
                                ))}
                            </div>
                            <button className="btn btn-full btn-lg" onClick={handleVerify} disabled={loading}
                                style={{ background: 'var(--blue)', color: '#fff', boxShadow: '0 4px 14px rgba(30,64,175,0.4)' }}>
                                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</> : 'Verify & Access Records →'}
                            </button>
                        </div>

                        <button className="btn btn-ghost btn-sm" onClick={handleRequestOTP} style={{ margin: '12px auto 0', display: 'flex', color: '#888' }}>
                            Resend OTP
                        </button>
                    </div>
                )}

                {/* STEP 3: Extended Data Display */}
                {step === 'success' && data && (
                    <div className="animate-in">
                        {/* Access granted banner */}
                        <div style={{ background: 'rgba(46,125,50,.2)', border: '1.5px solid rgba(46,125,50,.5)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CheckCircle size={20} color="#4CAF50" />
                            <p style={{ color: '#81C784', fontWeight: 600 }}>Access Verified – Full Medical Record</p>
                        </div>

                        {/* Patient Info */}
                        <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '18px 18px', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <User size={16} color="#888" />
                                <p style={{ color: '#aaa', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Patient Information</p>
                            </div>
                            <InfoRow label="Full Name" value={data.fullName} />
                            <InfoRow label="Date of Birth" value={new Date(data.dateOfBirth).toLocaleDateString('en-IN')} />
                            <InfoRow label="Age" value={`${data.age} years`} />
                            <InfoRow label="Blood Group" value={data.bloodGroup || 'N/A'} />
                            <InfoRow label="Height" value={data.height ? `${data.height} cm` : 'N/A'} />
                            <InfoRow label="Weight" value={data.weight ? `${data.weight} kg` : 'N/A'} />
                        </div>

                        {/* All Allergies */}
                        {data.allAllergies.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '18px', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <AlertTriangle size={16} color="#B91C1C" />
                                    <p style={{ color: '#aaa', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>All Allergies</p>
                                </div>
                                {data.allAllergies.map(a => (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                        <div>
                                            <p style={{ color: '#fff', fontWeight: 600 }}>{a.name}</p>
                                            {a.reaction && <p style={{ color: '#888', fontSize: '0.8125rem' }}>{a.reaction}</p>}
                                        </div>
                                        <span className={`badge ${a.severity === 'Life-threatening' ? 'badge-red' : a.severity === 'Severe' ? 'badge-orange' : 'badge-green'}`}>
                                            {a.severity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Conditions */}
                        {data.conditions.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '18px', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <Heart size={16} color="#B91C1C" />
                                    <p style={{ color: '#aaa', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medical Conditions</p>
                                </div>
                                {data.conditions.map(c => (
                                    <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <p style={{ color: '#fff', fontWeight: 600 }}>{c.name}</p>
                                            {c.diagnosedYear && <p style={{ color: '#888', fontSize: '0.8125rem' }}>Since {c.diagnosedYear}</p>}
                                        </div>
                                        {c.notes && <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: 2 }}>{c.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Medications */}
                        {data.medications.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '18px', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <Pill size={16} color="#4CAF50" />
                                    <p style={{ color: '#aaa', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Medications</p>
                                </div>
                                {data.medications.map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                        <p style={{ color: '#fff', fontWeight: 600 }}>{m.name}</p>
                                        <p style={{ color: '#aaa', fontSize: '0.875rem' }}>{m.dosage} · {m.frequency}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* All Emergency Contacts */}
                        {data.allEmergencyContacts.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '18px', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <Phone size={16} color="#64B5F6" />
                                    <p style={{ color: '#aaa', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emergency Contacts</p>
                                </div>
                                {data.allEmergencyContacts.map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                        <div>
                                            <p style={{ color: '#fff', fontWeight: 600 }}>{c.name}</p>
                                            <p style={{ color: '#888', fontSize: '0.8125rem' }}>{c.relationship}</p>
                                        </div>
                                        <a href={`tel:${c.phone}`} className="btn btn-sm" style={{ background: '#1B5E20', color: '#81C784', border: '1px solid #2E7D32' }}>
                                            <Phone size={13} /> {c.phone}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p style={{ color: '#555', fontSize: '0.8125rem', textAlign: 'center', lineHeight: 1.6 }}>
                            This access has been logged. Information is self-reported by the patient.<br />
                            Powered by <span style={{ color: 'var(--red)' }}>MediScan</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
