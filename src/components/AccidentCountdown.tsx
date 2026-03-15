import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Siren } from 'lucide-react';

interface AccidentCountdownProps {
    onCancel: () => void;
    onConfirm: () => void;
    countdownTime?: number;
}

export default function AccidentCountdown({ 
    onCancel, 
    onConfirm, 
    countdownTime = 15 
}: AccidentCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(countdownTime);

    useEffect(() => {
        if (timeLeft <= 0) {
            onConfirm();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onConfirm]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--red)', color: 'white',
            zIndex: 9999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 24, textAlign: 'center'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%', padding: 40, marginBottom: 32,
                animation: 'pulse 1s infinite alternate'
            }}>
                <AlertTriangle size={80} />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>
                ⚠ Possible Accident Detected
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: 40, maxWidth: 500, lineHeight: 1.5 }}>
                MediScan detected a sudden impact from your device. <br/>
                If you are safe, cancel the alert. Otherwise, an emergency notification will be sent to your contact.
            </p>

            <div style={{
                fontSize: '8rem', fontWeight: 900, marginBottom: 48,
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                {timeLeft}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 400 }}>
                <button 
                    onClick={onCancel}
                    className="btn"
                    style={{ 
                        background: 'white', color: 'var(--red)', 
                        height: 64, fontSize: '1.25rem', fontWeight: 800,
                        border: 'none', borderRadius: 16
                    }}
                >
                    <CheckCircle2 size={24} style={{ marginRight: 8 }} /> I'm Safe – Cancel Alert
                </button>

                <button 
                    onClick={onConfirm}
                    className="btn"
                    style={{ 
                        background: 'rgba(0,0,0,0.3)', color: 'white', 
                        height: 56, fontSize: '1rem', fontWeight: 700,
                        border: '2px solid rgba(255,255,255,0.3)', borderRadius: 16
                    }}
                >
                    <Siren size={20} style={{ marginRight: 8 }} /> Send Emergency Alert Now
                </button>
            </div>

            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
                <Shield size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>MediScan Accident Guard</span>
            </div>
        </div>
    );
}
