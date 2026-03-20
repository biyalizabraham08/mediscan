import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, Activity } from 'lucide-react';
import { getProfile, saveProfile } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import type { MedicalProfile, Allergy, Condition, Medication, EmergencyContact, BloodGroup, AllergySeverity } from '../types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SEVERITIES: AllergySeverity[] = ['Mild', 'Severe', 'Life-threatening'];

function generateId() { return Math.random().toString(36).slice(2); }

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

    // Helpers omitted for brevity in summary but preserved in actual code
    function addAllergy() { set('allergies', [...profile.allergies, { id: generateId(), name: '', severity: 'Mild', reaction: '' }]); }
    function updateAllergy(id: string, field: keyof Allergy, val: string) { set('allergies', profile.allergies.map(a => a.id === id ? { ...a, [field]: val } : a)); }
    function removeAllergy(id: string) { set('allergies', profile.allergies.filter(a => a.id !== id)); }
    function addCondition() { set('conditions', [...profile.conditions, { id: generateId(), name: '', diagnosedYear: '', notes: '' }]); }
    function updateCondition(id: string, field: keyof Condition, val: string) { set('conditions', profile.conditions.map(c => c.id === id ? { ...c, [field]: val } : c)); }
    function removeCondition(id: string) { set('conditions', profile.conditions.filter(c => c.id !== id)); }
    function addMedication() { set('medications', [...profile.medications, { id: generateId(), name: '', dosage: '', frequency: '' }]); }
    function updateMedication(id: string, field: keyof Medication, val: string) { set('medications', profile.medications.map(m => m.id === id ? { ...m, [field]: val } : m)); }
    function removeMedication(id: string) { set('medications', profile.medications.filter(m => m.id !== id)); }
    function addContact() { set('emergencyContacts', [...profile.emergencyContacts, { id: generateId(), name: '', relationship: '', phone: '', email: '' }]); }
    function updateContact(id: string, field: keyof EmergencyContact, val: string) { set('emergencyContacts', profile.emergencyContacts.map(c => c.id === id ? { ...c, [field]: val } : c)); }
    function removeContact(id: string) { set('emergencyContacts', profile.emergencyContacts.filter(c => c.id !== id)); }

    async function handleSave() {
        if (!profile.fullName.trim()) { toast.error('Full name is required'); return; }
        if (!profile.dateOfBirth) { toast.error('Date of birth is required'); return; }
        if (!profile.bloodGroup) { toast.error('Please select your blood group'); return; }
        setSaving(true);
        const res = await saveProfile({ userId, ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setSaving(false);
        if (res.success) { toast.success('Profile saved!'); navigate('/qr-code'); } else { toast.error(res.message); }
    }

    if (loading) return <div className="page-center"><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;

    return (
        <div className="page">
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <div style={{ background: 'var(--blue)', borderRadius: '10px', padding: '6px', display: 'flex', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>
                        <Activity size={22} color="white" />
                    </div>
                    <span>MediScan</span>
                </Link>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </nav>

            <div className="container-lg" style={{ padding: '40px 24px 100px', maxWidth: 800 }}>
                <div className="animate-in">
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Medical Profile</h1>
                        <p>Complete your emergency profile to ensure first responders have the data they need.</p>
                    </div>

                    {/* ── 1. Personal Information ── */}
                    <div className="profile-section">
                        <div className="profile-section-title">
                            <Activity size={20} color="var(--blue)" /> Personal Information
                        </div>
                        <div className="profile-grid">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Full Name *</label>
                                <input className="input" placeholder="e.g. Johnathan Smith" value={profile.fullName} onChange={e => set('fullName', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth *</label>
                                <input className="input" type="date" value={profile.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Blood Group *</label>
                                <select className="input" value={profile.bloodGroup} onChange={e => set('bloodGroup', e.target.value as BloodGroup)}>
                                    <option value="">Select Group</option>
                                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Height (cm)</label>
                                <input className="input" type="number" placeholder="175" value={profile.height} onChange={e => set('height', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Weight (kg)</label>
                                <input className="input" type="number" placeholder="70" value={profile.weight} onChange={e => set('weight', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* ── 2. Emergency Contacts ── */}
                    <div className="profile-section">
                        <div className="profile-section-title">
                            <Plus size={20} color="var(--blue)" /> Emergency Contacts
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {profile.emergencyContacts.map((c, i) => (
                                <div key={c.id} className="profile-item-card" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Contact #{i + 1}</h4>
                                    <div className="profile-grid">
                                        <div className="form-group">
                                            <label className="form-label">Name</label>
                                            <input className="input" placeholder="Jane Doe" value={c.name} onChange={e => updateContact(c.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Relationship</label>
                                            <input className="input" placeholder="Spouse / Parent / Friend" value={c.relationship} onChange={e => updateContact(c.id, 'relationship', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input className="input" type="tel" placeholder="+1 (555) 000-0000" value={c.phone} onChange={e => updateContact(c.id, 'phone', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input className="input" type="email" placeholder="jane@example.com" value={c.email || ''} onChange={e => updateContact(c.id, 'email', e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 12, color: 'var(--red)' }} onClick={() => removeContact(c.id)}>
                                        <Trash2 size={14} /> Remove Contact
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary btn-full" onClick={addContact}>
                                <Plus size={16} /> Add Emergency Contact
                            </button>
                        </div>
                    </div>

                    {/* ── 3. Medical Information ── */}
                    <div className="profile-section">
                        <div className="profile-section-title">
                            <Activity size={20} color="var(--red)" /> Medical Information
                        </div>
                        
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 12 }}>Allergies</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {profile.allergies.map(a => (
                                    <div key={a.id} className="profile-item-card">
                                        <div className="profile-grid">
                                            <div className="form-group">
                                                <label className="form-label">Allergen</label>
                                                <input className="input" placeholder="e.g. Peanuts" value={a.name} onChange={e => updateAllergy(a.id, 'name', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Severity</label>
                                                <select className="input" value={a.severity} onChange={e => updateAllergy(a.id, 'severity', e.target.value as AllergySeverity)}>
                                                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label">Reaction</label>
                                                <input className="input" placeholder="e.g. Swelling, difficulty breathing" value={a.reaction || ''} onChange={e => updateAllergy(a.id, 'reaction', e.target.value)} />
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--red)' }} onClick={() => removeAllergy(a.id)}>
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary btn-sm" onClick={addAllergy} style={{ alignSelf: 'flex-start' }}>
                                    <Plus size={14} /> Add Allergy
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 12 }}>Medical Conditions</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {profile.conditions.map(c => (
                                    <div key={c.id} className="profile-item-card">
                                        <div className="profile-grid">
                                            <div className="form-group">
                                                <label className="form-label">Condition Name</label>
                                                <input className="input" placeholder="e.g. Asthma / Hypertension" value={c.name} onChange={e => updateCondition(c.id, 'name', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Year Diagnosed</label>
                                                <input className="input" placeholder="e.g. 2018" value={c.diagnosedYear || ''} onChange={e => updateCondition(c.id, 'diagnosedYear', e.target.value)} />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label">Important Notes</label>
                                                <input className="input" placeholder="Any details for medics..." value={c.notes || ''} onChange={e => updateCondition(c.id, 'notes', e.target.value)} />
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--red)' }} onClick={() => removeCondition(c.id)}>
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary btn-sm" onClick={addCondition} style={{ alignSelf: 'flex-start' }}>
                                    <Plus size={14} /> Add Condition
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 12 }}>Current Medications</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {profile.medications.map(m => (
                                    <div key={m.id} className="profile-item-card">
                                        <div className="profile-grid">
                                            <div className="form-group">
                                                <label className="form-label">Medication Name</label>
                                                <input className="input" placeholder="e.g. Advair" value={m.name} onChange={e => updateMedication(m.id, 'name', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Dosage</label>
                                                <input className="input" placeholder="e.g. 250mcg" value={m.dosage} onChange={e => updateMedication(m.id, 'dosage', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Frequency</label>
                                                <input className="input" placeholder="e.g. Twice Daily" value={m.frequency} onChange={e => updateMedication(m.id, 'frequency', e.target.value)} />
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--red)' }} onClick={() => removeMedication(m.id)}>
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary btn-sm" onClick={addMedication} style={{ alignSelf: 'flex-start' }}>
                                    <Plus size={14} /> Add Medication
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 40, background: '#fff', padding: 24, borderRadius: 'var(--radius-lg)', border: '2px solid var(--blue)', display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: 4 }}>Ready to finalize?</h3>
                            <p style={{ fontSize: '0.875rem' }}>Your QR code will be updated with these new details immediately.</p>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner" /> Saving...</> : <><Save size={20} /> Save & Generate QR</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
