import { supabase } from './supabase';
import type { User, MedicalProfile, AccessLog, AuthState, PublicEmergencyInfo, ExtendedEmergencyInfo, EmergencyFullData } from '../types';
import { sendOTPEmail } from '../utils/email';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User; token?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { success: false, message: error.message };

    if (data.user.user_metadata.custom_email_verified === false) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await supabase.from('otps').delete().eq('user_id', data.user.id).eq('type', 'email_verify');
        await supabase.from('otps').insert({ user_id: data.user.id, otp, type: 'email_verify', expires_at: expiresAt });
        try { await sendOTPEmail(email, otp, expiresAt); } catch(err) {}

        return {
            success: false,
            message: 'Please verify your email to continue. A new OTP has been sent.',
            user: { id: data.user.id, email: data.user.email || '', name: data.user.user_metadata.full_name || 'User', createdAt: data.user.created_at }
        };
    }

    const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata.full_name || 'User',
        createdAt: data.user.created_at,
    };

    return { success: true, message: 'Login successful!', user, token: data.session?.access_token };
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; message: string; userId?: string }> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, custom_email_verified: false } },
    });

    if (error) {
        if (error.status === 429) {
            return { success: false, message: 'Too many sign-up attempts. Please wait a few minutes or increase the rate limit in Supabase Dashboard.' };
        }
        if (error.message.includes('already registered') || (error.status === 400 && error.message.includes('User already registered'))) {
            return { success: false, message: 'An account with this email already exists. Please log in instead.' };
        }
        return { success: false, message: error.message };
    }

    const userId = data.user?.id;
    if (!userId) return { success: false, message: 'Registration failed.' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('otps').insert({ user_id: userId, otp, type: 'email_verify', expires_at: expiresAt });

    try {
        await sendOTPEmail(email, otp, expiresAt);
    } catch (err) {
        console.error("Failed to send email, but continuing:", err);
    }

    return { success: true, message: `OTP sent to ${email}.`, userId };
}

export async function verifyEmailOTP(userId: string, otp: string): Promise<{ success: boolean; message: string; token?: string; user?: User }> {
    const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('user_id', userId)
        .eq('otp', otp)
        .eq('type', 'email_verify');

    if (error) return { success: false, message: `Database error: ${error.message}` };

    const entry = data && data[0];
    if (!entry) return { success: false, message: 'Invalid OTP. Please check the code and try again.' };
    if (new Date() > new Date(entry.expires_at)) return { success: false, message: 'OTP has expired.' };

    await supabase.from('otps').delete().eq('id', entry.id);

    const { data: { user: sbUser }, error: userError } = await supabase.auth.getUser();

    if (!sbUser) {
        console.error("Supabase Session Error:", userError);
        return {
            success: false,
            message: 'OTP is valid, but no active session was found. Please make sure "Confirm Email" is DISABLED in your Supabase Auth settings.'
        };
    }

    await supabase.auth.updateUser({ data: { custom_email_verified: true } });

    const { data: sessionData } = await supabase.auth.getSession();

    return {
        success: true,
        message: 'Email verified!',
        token: sessionData.session?.access_token,
        user: {
            id: sbUser.id,
            email: sbUser.email || '',
            name: sbUser.user_metadata.full_name || 'User',
            createdAt: sbUser.created_at,
        }
    };
}

export async function resendOTP(userId: string): Promise<{ success: boolean; message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('otps').delete().eq('user_id', userId).eq('type', 'email_verify');
    await supabase.from('otps').insert({ user_id: userId, otp, type: 'email_verify', expires_at: expiresAt });

    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email) {
        try { await sendOTPEmail(user.email, otp, expiresAt); } catch (err) {}
    }
    return { success: true, message: 'OTP resent.' };
}

export function getAuthState(): AuthState {
    return { user: null, token: null, isAuthenticated: false };
}

export async function logout(): Promise<void> {
    await supabase.auth.signOut();
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function saveProfile(profile: MedicalProfile): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('profiles').upsert({
        id: profile.userId,
        user_id: profile.userId,
        email: profile.email,
        full_name: profile.fullName,
        date_of_birth: profile.dateOfBirth,
        blood_group: profile.bloodGroup,
        height: profile.height,
        weight: profile.weight,
        allergies: profile.allergies,
        conditions: profile.conditions,
        medications: profile.medications,
        emergency_contacts: profile.emergencyContacts,
        emergency_mode: profile.emergencyMode ?? true,
        accident_detection_enabled: profile.accidentDetectionEnabled ?? false,
        updated_at: new Date().toISOString()
    });

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Profile saved successfully.' };
}

export async function getProfile(userId: string): Promise<MedicalProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

    const profile = data && data[0];
    if (error || !profile) return null;

    return {
        userId: profile.id,
        email: profile.email || '',
        fullName: profile.full_name,
        dateOfBirth: profile.date_of_birth,
        bloodGroup: profile.blood_group,
        height: profile.height,
        weight: profile.weight,
        allergies: profile.allergies,
        conditions: profile.conditions,
        medications: profile.medications,
        emergencyContacts: profile.emergency_contacts,
        emergencyMode: profile.emergency_mode !== false, // default true
        accidentDetectionEnabled: !!profile.accident_detection_enabled,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    };
}

export async function setEmergencyMode(userId: string, enabled: boolean): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
        .from('profiles')
        .update({ emergency_mode: enabled, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: `Emergency mode ${enabled ? 'enabled' : 'disabled'}.` };
}

// ─── EMERGENCY ACCESS ─────────────────────────────────────────────────────────

function calculateAge(dob: string): number {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
}

/** Returns all emergency data. The caller (EmergencyPage) decides what to display based on emergencyMode. */
export async function getEmergencyData(userId: string): Promise<{ success: boolean; data?: EmergencyFullData; message?: string }> {
    const { data: results, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

    const profile = results && results[0];
    if (error || !profile) return { success: false, message: 'No medical profile found.' };

    // Fire-and-forget access log + optional geolocation capture
    logAccess(userId, 'emergency_scan', 'public').catch(() => {});

    return {
        success: true,
        data: {
            fullName: profile.full_name,
            age: calculateAge(profile.date_of_birth),
            bloodGroup: profile.blood_group,
            severeAllergies: (profile.allergies as any[]).filter(a => a.severity !== 'Mild'),
            primaryEmergencyContact: (profile.emergency_contacts as any[])[0] || null,
            emergencyMode: profile.emergency_mode !== false,
            dateOfBirth: profile.date_of_birth,
            height: profile.height,
            weight: profile.weight,
            allAllergies: profile.allergies,
            conditions: profile.conditions,
            medications: profile.medications,
            allEmergencyContacts: profile.emergency_contacts,
        },
    };
}

/** Legacy — kept for backward compatibility with DoctorAccessPage */
export async function getPublicEmergencyInfo(userId: string): Promise<{ success: boolean; data?: PublicEmergencyInfo; message?: string }> {
    const result = await getEmergencyData(userId);
    if (!result.success || !result.data) return { success: false, message: result.message };

    return {
        success: true,
        data: {
            fullName: result.data.fullName,
            age: result.data.age,
            bloodGroup: result.data.bloodGroup,
            severeAllergies: result.data.severeAllergies,
            primaryEmergencyContact: result.data.primaryEmergencyContact,
        }
    };
}

export async function requestDoctorOTP(userId: string): Promise<{ success: boolean; message: string }> {
    const profile = await getProfile(userId);
    if (!profile) return { success: false, message: 'User not found.' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabase.from('otps').delete().eq('user_id', userId).eq('type', 'doctor_access');
    await supabase.from('otps').insert({ user_id: userId, otp, type: 'doctor_access', expires_at: expiresAt });

    if (!profile.email) {
        return {
            success: false,
            message: "Patient's email is not yet linked. THE PATIENT MUST go to their Medical Profile and click 'Save' to fix this."
        };
    }

    try {
        await sendOTPEmail(profile.email, otp, expiresAt);
        return { success: true, message: `OTP sent to patient's registered email.` };
    } catch (err) {
        return { success: false, message: 'Failed to send OTP email.' };
    }
}

export async function verifyDoctorOTP(userId: string, otp: string): Promise<{ success: boolean; data?: ExtendedEmergencyInfo; message?: string }> {
    const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('user_id', userId)
        .eq('otp', otp)
        .eq('type', 'doctor_access');

    const entry = data && data[0];
    if (error || !entry) return { success: false, message: 'Invalid OTP. Please try again.' };
    if (new Date() > new Date(entry.expires_at)) return { success: false, message: 'OTP expired.' };

    await supabase.from('otps').delete().eq('id', entry.id);

    const profile = await getProfile(userId);
    if (!profile) return { success: false, message: 'Profile not found.' };

    await logAccess(userId, 'doctor_access', 'extended');

    return {
        success: true,
        data: {
            fullName: profile.fullName,
            age: calculateAge(profile.dateOfBirth),
            bloodGroup: profile.bloodGroup,
            severeAllergies: profile.allergies.filter(a => a.severity !== 'Mild'),
            primaryEmergencyContact: profile.emergencyContacts[0] || null,
            dateOfBirth: profile.dateOfBirth,
            height: profile.height,
            weight: profile.weight,
            allAllergies: profile.allergies,
            conditions: profile.conditions,
            medications: profile.medications,
            allEmergencyContacts: profile.emergencyContacts,
        },
    };
}

// ─── ACCESS LOGS ──────────────────────────────────────────────────────────────

/** Attempts to get the user's approximate city via Geolocation + reverse geocoding */
async function getApproxLocation(): Promise<string | undefined> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(undefined); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const json = await res.json();
                    const city = json.address?.city || json.address?.town || json.address?.village || json.address?.county || '';
                    const country = json.address?.country_code?.toUpperCase() || '';
                    resolve(city ? `${city}, ${country}` : country || undefined);
                } catch {
                    resolve(undefined);
                }
            },
            () => resolve(undefined),
            { timeout: 4000 }
        );
    });
}

export async function logAccess(userId: string, accessorType: string, tier: 'public' | 'extended'): Promise<void> {
    const location = await getApproxLocation();

    // Prepare data
    const insertData: any = {
        user_id: userId,
        accessor_type: accessorType,
        access_tier: tier,
    };

    // Attempt insert with location
    const { error: firstError } = await supabase.from('access_logs').insert({
        ...insertData,
        ...(location ? { location } : {}),
    });

    // If it fails because of missing column, retry without location
    if (firstError?.message?.includes('location')) {
        const { error: secondError } = await supabase.from('access_logs').insert(insertData);
        if (secondError) {
            console.error("Supabase LogAccess Final Error:", secondError.message);
        }
        return;
    }

    if (firstError) {
        console.error("Supabase LogAccess Error:", firstError.message);
    }
}

export async function getAccessLogs(userId: string): Promise<AccessLog[]> {
    const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .eq('user_id', userId)
        .order('accessed_at', { ascending: false })
        .limit(50);

    if (error) return [];

    return data.map(l => ({
        id: l.id,
        accessedAt: l.accessed_at,
        accessorType: l.accessor_type,
        accessTier: l.access_tier,
        location: l.location || undefined,
    }));
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
export function seedDemoData() {
    console.warn("Demo seeding is now handled via Supabase scripts.");
    return { userId: 'demo', token: 'demo' };
}
