import emailjs from "@emailjs/browser";

export async function sendOTPEmail(
    email: string,
    otp: string,
    expiresAtISO: string
) {
    const serviceId = import.meta.env?.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env?.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env?.VITE_EMAILJS_PUBLIC_KEY;

    const expiryDate = new Date(expiresAtISO);
    const formattedExpiry = expiryDate.toLocaleString("en-IN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    });

    if (!serviceId || !templateId || !publicKey) return;

    try {
        emailjs.init(publicKey);
        await emailjs.send(serviceId, templateId, {
            to_email: email,
            to_name: email,
            user_email: email,
            recipient: email,
            otp_code: otp,
            expiry_time: formattedExpiry,
            message: `Your MediScan OTP is ${otp}. Valid until ${formattedExpiry}.`
        });
    } catch (error) {
        void error;
    }
}

/**
 * Sends an emergency alert email to an emergency contact when a patient's QR
 * code is scanned. Requires VITE_EMAILJS_ALERT_TEMPLATE_ID in .env.
 * Template variables: to_email, to_name, patient_name, access_time, message
 */
export async function sendEmergencyAlertEmail(
    contactEmail: string,
    contactName: string,
    patientName: string,
    customMessage?: string,
    location?: string
) {
    const serviceId = import.meta.env?.VITE_EMAILJS_SERVICE_ID;
    const alertTemplateId = import.meta.env?.VITE_EMAILJS_ALERT_TEMPLATE_ID;
    const publicKey = import.meta.env?.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !alertTemplateId || !publicKey) return; // silently skip if not configured

    const accessTime = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const locationNotice = location ? `\n\nApproximate Location: ${location}` : "";
    const defaultMessage = `URGENT: ${patientName}'s emergency medical profile was just accessed via their MediScan QR code at ${accessTime}.${locationNotice}\n\nThey may need immediate assistance. Please check on them right away.`;

    try {
        emailjs.init(publicKey);
        await emailjs.send(serviceId, alertTemplateId, {
            to_email: contactEmail,
            to_name: contactName,
            patient_name: patientName,
            access_time: accessTime,
            message: customMessage || defaultMessage,
            location: location || 'Not provided',
        });
    } catch (error) {
        void error; // silently fail — alert is best-effort
    }
}