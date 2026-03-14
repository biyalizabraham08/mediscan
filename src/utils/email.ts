import emailjs from "@emailjs/browser";

export async function sendOTPEmail(
    email: string,
    otp: string,
    expiresAtISO: string
) {
    // Safely access env
    const serviceId = import.meta.env?.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env?.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env?.VITE_EMAILJS_PUBLIC_KEY;

    const expiryDate = new Date(expiresAtISO);
    const formattedExpiry = expiryDate.toLocaleString("en-IN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    });

    if (!serviceId || !templateId || !publicKey) {
        return;
    }

    try {
        emailjs.init(publicKey);

        const templateParams = {
            to_email: email,
            to_name: email,
            user_email: email,
            recipient: email,
            otp_code: otp,
            expiry_time: formattedExpiry,
            message: `Your MediScan OTP is ${otp}. Valid until ${formattedExpiry}.`
        };

        await emailjs.send(serviceId, templateId, templateParams);

    } catch (error) {
        // Silent fail — OTP send failure is handled by the caller
        void error;
    }
}