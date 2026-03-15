import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Trash2, Save, Activity } from 'lucide-react';
import { getProfile, saveProfile } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import type { MedicalProfile, Allergy, Condition, Medication, EmergencyContact, BloodGroup, AllergySeverity } from '../types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SEVERITIES: AllergySeverity[] = ['Mild', 'Severe', 'Life-threatening'];

function generateId() { return Math.random().toString(36).slice(2); }

function SectionCard({ color, dot, title, count, children }: { color: string; dot: string; title: string; count?: number; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="section-card">
            <button className="section-header" onClick={() => setOpen(p => !p)} type="button">
                <div className="section-header-left">
                    <span className="section-dot" style={{ background: dot }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{title}</span>
                    {count !== undefined && (
                        <span className="badge badge-gray" style={{ marginLeft: 4 }}>{count}</span>
                    )}
                </div>
                {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </button>
            {open && (
                <div className="section-body" style={{ borderTop: `2px solid ${color}` }}>
                    {children}
                </div>
            )}
        </div>
    );
}

const EMPTY_PROFILE: Omit<MedicalProfile, 'userId' | 'createdAt' | 'updatedAt'> = {
    email: '',
    fullName: '', dateOfBirth: '', bloodGroup: '',
    height: '', weight: '',
    allergies: [], conditions: [], medications: [], emergencyContacts: [],
    emergencyMode: true,
};

export default function MedicalProfilePage() {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const userId = authState.user!.id;
    const [profile, setProfile] = useState<Omit<MedicalProfile, 'userId' | 'createdAt' | 'updatedAt'>>(EMPTY_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getProfile(userId).then(p => {
            if (p) {
                setProfile({
                    email: p.email || authState.user?.email || '',
                    fullName: p.fullName,
                    dateOfBirth: p.dateOfBirth,
                    bloodGroup: p.bloodGroup,
                    height: p.height,
                    weight: p.weight,
                    allergies: p.allergies,
                    conditions: p.conditions,
                    medications: p.medications,
                    emergencyContacts: p.emergencyContacts,
                    emergencyMode: p.emergencyMode !== false,
                });
            } else {
                setProfile(p => ({ ...p, email: authState.user?.email || '' }));
            }
            setLoading(false);
        });
    }, [userId, authState.user?.email]);

    function set<K extends keyof typeof profile>(key: K, val: (typeof profile)[K]) {
        setProfile(p => ({ ...p, [key]: val }));
    }

    // Allergy helpers
    function addAllergy() { set('allergies', [...profile.allergies, { id: generateId(), name: '', severity: 'Mild', reaction: '' }]); }
    function updateAllergy(id: string, field: keyof Allergy, val: string) {
        set('allergies', profile.allergies.map(a => a.id === id ? { ...a, [field]: val } : a));
    }
    function removeAllergy(id: string) { set('allergies', profile.allergies.filter(a => a.id !== id)); }

    // Condition helpers
    function addCondition() { set('conditions', [...profile.conditions, { id: generateId(), name: '', diagnosedYear: '', notes: '' }]); }
    function updateCondition(id: string, field: keyof Condition, val: string) {
        set('conditions', profile.conditions.map(c => c.id === id ? { ...c, [field]: val } : c));
    }
    function removeCondition(id: string) { set('conditions', profile.conditions.filter(c => c.id !== id)); }

    // Medication helpers
    function addMedication() { set('medications', [...profile.medications, { id: generateId(), name: '', dosage: '', frequency: '' }]); }
    function updateMedication(id: string, field: keyof Medication, val: string) {
        set('medications', profile.medications.map(m => m.id === id ? { ...m, [field]: val } : m));
    }
    function removeMedication(id: string) { set('medications', profile.medications.filter(m => m.id !== id)); }

    // Contact helpers
    function addContact() { set('emergencyContacts', [...profile.emergencyContacts, { id: generateId(), name: '', relationship: '', phone: '' }]); }
    function updateContact(id: string, field: keyof EmergencyContact, val: string) {
        set('emergencyContacts', profile.emergencyContacts.map(c => c.id === id ? { ...c, [field]: val } : c));
    }
    function removeContact(id: string) { set('emergencyContacts', profile.emergencyContacts.filter(c => c.id !== id)); }

    async function handleSave() {
        if (!profile.fullName.trim()) { toast.error('Full name is required'); return; }
        if (!profile.dateOfBirth) { toast.error('Date of birth is required'); return; }
        if (!profile.bloodGroup) { toast.error('Please select your blood group'); return; }
        setSaving(true);
        const res = await saveProfile({
            userId, ...profile,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        setSaving(false);
        if (res.success) {
            toast.success('Profile saved!');
            navigate('/qr-code');
        } else {
            toast.error(res.message);
        }
    }

    if (loading) {
        return (
            <div className="page-center">
                <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    return (
        <div className="page">
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <div style={{ background: 'var(--blue)', borderRadius: '10px', padding: '6px', display: 'flex', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>
                        <Activity size={22} color="white" />
                    </div>
                    <span>Medi<span style={{ fontWeight: 800 }}>Scan</span></span>
                </Link>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            </nav>

            <div className="container-lg" style={{ padding: '32px 24px 80px', maxWidth: 700 }}>
                <div className="animate-in">
                    <h2 style={{ marginBottom: 4 }}>Medical Profile</h2>
                    <p style={{ marginBottom: 28 }}>Fill in your information. Only severe allergies and blood group are shown publicly.</p>

                    {/* ── Basic Info ── */}
                    <SectionCard color="#1565C0" dot="#1565C0" title="Basic Information">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Full Name *</label>
                                <input className="input" placeholder="John Smith" value={profile.fullName} onChange={e => set('fullName', e.target.value)} />
                            </div>
                             <div className="form-group">
                                 <label className="form-label">Email (for Doctor OTP) *</label>
                                 <input className="input" value={profile.email} readOnly style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', color: '#aaa' }} />
                                 <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>Used for secure verification</p>
                             </div>
                             <div className="form-group">
                                 <label className="form-label">Date of Birth *</label>
                                 <input className="input" type="date" value={profile.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                             </div>
                            <div className="form-group">
                                <label className="form-label">Blood Group *</label>
                                <select className="input" value={profile.bloodGroup} onChange={e => set('bloodGroup', e.target.value as BloodGroup)}>
                                    <option value="">Select…</option>
                                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Height (cm)</label>
                                <input className="input" type="number" placeholder="175" value={profile.height} onChange={e => set('height', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Weight (kg)</label>
                                <input className="input" type="number" placeholder="72" value={profile.weight} onChange={e => set('weight', e.target.value)} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Allergies ── */}
                    <SectionCard color="#E53935" dot="#E53935" title="Allergies" count={profile.allergies.length}>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {profile.allergies.map(a => (
                                <div key={a.id} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Allergen</label>
                                            <input className="input" placeholder="e.g. Penicillin" value={a.name} onChange={e => updateAllergy(a.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Severity</label>
                                            <select className="input" value={a.severity} onChange={e => updateAllergy(a.id, 'severity', e.target.value as AllergySeverity)}>
                                                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Reaction (optional)</label>
                                            <input className="input" placeholder="e.g. Anaphylaxis" value={a.reaction || ''} onChange={e => updateAllergy(a.id, 'reaction', e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeAllergy(a.id)}>
                                        <Trash2 size={13} /> Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addAllergy} style={{ alignSelf: 'flex-start' }}>
                                <Plus size={14} /> Add Allergy
                            </button>
                        </div>
                    </SectionCard>

                    {/* ── Conditions ── */}
                    <SectionCard color="#E65100" dot="#E65100" title="Medical Conditions" count={profile.conditions.length}>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {profile.conditions.map(c => (
                                <div key={c.id} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Condition Name</label>
                                            <input className="input" placeholder="e.g. Type 2 Diabetes" value={c.name} onChange={e => updateCondition(c.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Year Diagnosed</label>
                                            <input className="input" placeholder="2020" value={c.diagnosedYear || ''} onChange={e => updateCondition(c.id, 'diagnosedYear', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Notes</label>
                                            <input className="input" placeholder="Any relevant details…" value={c.notes || ''} onChange={e => updateCondition(c.id, 'notes', e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeCondition(c.id)}>
                                        <Trash2 size={13} /> Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addCondition} style={{ alignSelf: 'flex-start' }}>
                                <Plus size={14} /> Add Condition
                            </button>
                        </div>
                    </SectionCard>

                    {/* ── Medications ── */}
                    <SectionCard color="#2E7D32" dot="#2E7D32" title="Current Medications" count={profile.medications.length}>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {profile.medications.map(m => (
                                <div key={m.id} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Medication</label>
                                            <input className="input" placeholder="Metformin" value={m.name} onChange={e => updateMedication(m.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Dosage</label>
                                            <input className="input" placeholder="500mg" value={m.dosage} onChange={e => updateMedication(m.id, 'dosage', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Frequency</label>
                                            <input className="input" placeholder="Twice daily" value={m.frequency} onChange={e => updateMedication(m.id, 'frequency', e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeMedication(m.id)}>
                                        <Trash2 size={13} /> Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addMedication} style={{ alignSelf: 'flex-start' }}>
                                <Plus size={14} /> Add Medication
                            </button>
                        </div>
                    </SectionCard>

                    {/* ── Emergency Contacts ── */}
                    <SectionCard color="#7B1FA2" dot="#7B1FA2" title="Emergency Contacts" count={profile.emergencyContacts.length}>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {profile.emergencyContacts.map(c => (
                                <div key={c.id} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Name</label>
                                            <input className="input" placeholder="Jane Smith" value={c.name} onChange={e => updateContact(c.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Relationship</label>
                                            <input className="input" placeholder="Spouse" value={c.relationship} onChange={e => updateContact(c.id, 'relationship', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Phone Number</label>
                                            <input className="input" type="tel" placeholder="+1-555-0100" value={c.phone} onChange={e => updateContact(c.id, 'phone', e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeContact(c.id)}>
                                        <Trash2 size={13} /> Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addContact} style={{ alignSelf: 'flex-start' }}>
                                <Plus size={14} /> Add Contact
                            </button>
                        </div>
                    </SectionCard>

                    <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
                        {saving ? <><span className="spinner" />Saving…</> : <><Save size={18} />Save & Generate QR Code</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
