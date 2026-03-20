const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
const privateKey = process.env.EXPO_PUBLIC_EMAILJS_PRIVATE_KEY; // Optional for non-strict mode
const alertTemplateId = process.env.EXPO_PUBLIC_EMAILJS_ALERT_TEMPLATE_ID;

async function sendViaRest(tid: string, params: any) {
    if (!serviceId || !tid || !publicKey) {
        console.error("EmailJS Configuration Missing");
        return;
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: tid,
                user_id: publicKey,
                accessToken: privateKey, // This is the private key for strict mode
                template_params: params,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`EmailJS Error: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error("EmailJS REST API Error:", error);
        throw error;
    }
}

export async function sendOTPEmail(
    email: string,
    otp: string,
    expiresAtISO: string
) {
    const expiryDate = new Date(expiresAtISO);
    const formattedExpiry = expiryDate.toLocaleString("en-IN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    });

    await sendViaRest(templateId!, {
        email: email,
        to_email: email,
        otp_code: otp,
        expiry_time: formattedExpiry,
        message: `Your MediScan OTP is ${otp}. Valid until ${formattedExpiry}.`
    });
}

export async function sendEmergencyAlertEmail(
    contactEmail: string,
    contactName: string,
    patientName: string,
    customMessage?: string,
    location?: string
) {
    const accessTime = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const locationNotice = location ? `\n\nApproximate Location: ${location}` : "";
    const defaultMessage = `URGENT: ${patientName}'s emergency medical profile was just accessed via their MediScan QR code at ${accessTime}.${locationNotice}\n\nThey may need immediate assistance. Please check on them right away.`;

    await sendViaRest(alertTemplateId!, {
        email: contactEmail,
        to_email: contactEmail,
        to_name: contactName,
        patient_name: patientName,
        access_time: accessTime,
        message: customMessage || defaultMessage,
        location: location || 'Not provided',
    });
}

export async function sendAccidentAlertEmail(
    contactEmail: string,
    contactName: string,
    patientName: string,
    location?: string
) {
    const accessTime = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const locationNotice = location ? `\n\nApproximate Location: ${location}` : "";
    const message = `URGENT: An accident may have been detected involving ${patientName}.\n\nThe MediScan accident detection system was triggered from their device at ${accessTime}.${locationNotice}\n\nPlease try contacting them immediately.`;

    await sendViaRest(alertTemplateId!, {
        email: contactEmail,
        to_email: contactEmail,
        to_name: contactName,
        patient_name: patientName,
        access_time: accessTime,
        message: message,
        location: location || 'Detecting...',
    });
}
