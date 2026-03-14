import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ArrowRight, Smartphone } from 'lucide-react';
import { getProfile } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export default function QRCodePage() {
    const { authState, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState('');
    const [loading, setLoading] = useState(true);
    const qrRef = useRef<HTMLDivElement>(null);

    const userId = authState.user?.id;
    const emergencyUrl = userId ? `${window.location.origin}/emergency/${userId}` : '';

    useEffect(() => {
        if (authLoading) return;
        if (!userId) {
            navigate('/login');
            return;
        }

        getProfile(userId).then(p => {
            if (!p) { navigate('/profile/create'); return; }
            setProfileName(p.fullName);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load profile:", err);
            toast.error("Failed to load medical profile");
            setLoading(false);
        });
    }, [userId, authLoading, navigate]);

    function downloadQR() {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size; canvas.height = size + 80;
        const ctx = canvas.getContext('2d')!;

        // White background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Red header
        ctx.fillStyle = '#E53935';
        ctx.fillRect(0, 0, size, 50);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚕ EMERGENCY MEDICAL ID', size / 2, 32);

        // QR as image
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 50, 60, 300, 300);

            // Name + URL below
            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(profileName, size / 2, 390);
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText('Scan for emergency medical information', size / 2, 408);
            ctx.fillText(emergencyUrl.replace(window.location.origin, ''), size / 2, 425);

            const link = document.createElement('a');
            link.download = `mediscan-${profileName.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            URL.revokeObjectURL(url);
            toast.success('QR code downloaded!');
        };
        img.src = url;
    }

    async function handleShare() {
        if (navigator.share) {
            await navigator.share({ title: 'My Emergency Medical QR', url: emergencyUrl });
        } else {
            await navigator.clipboard.writeText(emergencyUrl);
            toast.success('Link copied to clipboard!');
        }
    }

    if (loading) {
        return <div className="page-center"><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
    }

    return (
        <div className="page" style={{ background: 'linear-gradient(160deg, #fff7f7 0%, #f8f9fc 100%)' }}>
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <svg className="logo" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#E53935" /><rect x="13" y="6" width="6" height="20" rx="2" fill="white" /><rect x="6" y="13" width="20" height="6" rx="2" fill="white" /></svg>
                    <span>Medi<em>Scan</em></span>
                </Link>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard →</Link>
            </nav>

            <div className="container" style={{ padding: '40px 16px 60px', textAlign: 'center' }}>
                <div className="animate-in">
                    <h2 style={{ marginBottom: 6 }}>Your Emergency QR Code</h2>
                    <p style={{ marginBottom: 32 }}>Anyone who scans this gets your critical medical info instantly.</p>

                    {/* QR Card */}
                    <div className="card" style={{ display: 'inline-block', padding: '28px 32px', marginBottom: 24 }}>
                        {/* Red header strip */}
                        <div style={{ background: 'var(--red)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', marginBottom: 20 }}>
                            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                                ⚕ EMERGENCY MEDICAL ID
                            </p>
                        </div>

                        <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                            <QRCodeSVG
                                value={emergencyUrl}
                                size={220}
                                level="H"
                                fgColor="#0F172A"
                                bgColor="#ffffff"
                                imageSettings={{
                                    src: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#E53935"/><rect x="13" y="6" width="6" height="20" rx="2" fill="white"/><rect x="6" y="13" width="20" height="6" rx="2" fill="white"/></svg>'),
                                    height: 32, width: 32, excavate: true,
                                }}
                            />
                        </div>

                        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{profileName}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Scan to view emergency medical information</p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                        <button className="btn btn-primary btn-lg" onClick={downloadQR}>
                            <Download size={18} /> Download QR
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={handleShare}>
                            <Share2 size={18} /> Share Link
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="card" style={{ textAlign: 'left', background: '#fffbeb', border: '1.5px solid #fde68a' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <Smartphone size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ fontWeight: 700, color: '#92400E', marginBottom: 6 }}>💡 Tip: Set as your lockscreen</p>
                                <ol style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {[
                                        'Download the QR image above',
                                        'Open your phone\'s wallpaper settings',
                                        'Set the QR image as your lockscreen wallpaper',
                                        'First responders can scan it even when your phone is locked!',
                                    ].map((step, i) => (
                                        <li key={i} style={{ fontSize: '0.875rem', color: '#78350F', lineHeight: 1.5 }}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <Link to="/dashboard" className="btn btn-primary btn-lg btn-full">
                            Go to Dashboard <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
