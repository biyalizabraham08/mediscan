import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ArrowRight, Smartphone, Activity, X } from 'lucide-react';
import { getProfile } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export default function QRCodePage() {
    const { authState, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState('');
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
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

    function generateWallpaper() {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;

        // 1. Clear top section (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 2. Emergency Card at Bottom (30%)
        const cardHeight = 580;
        const cardY = canvas.height - cardHeight - 80;
        const cardX = 60;
        const cardWidth = canvas.width - 120;
        const radius = 40;

        // Subtle dark overlay for the whole screen (optional, helps readability)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Card Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;

        // Card Background (Dark Semi-transparent)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // 3. Text & Branding
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        
        // Header
        ctx.font = 'bold 54px Inter, system-ui, sans-serif';
        ctx.fillText('MEDICAL EMERGENCY', canvas.width / 2, cardY + 80);
        
        ctx.font = '500 36px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Scan for health information', canvas.width / 2, cardY + 130);

        // Instruction Text (Explicit)
        ctx.fillStyle = '#60A5FA'; // Bright blue
        ctx.font = 'bold 42px Inter, system-ui, sans-serif';
        ctx.fillText('SCAN FOR MEDICAL INFO', canvas.width / 2, cardY + 200);

        // 4. QR Code Drawing
        const qrSize = 340;
        const qrPosX = (canvas.width - qrSize) / 2;
        const qrPosY = cardY + 230;

        // QR Background (White for better scanning)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(qrPosX - 15, qrPosY - 15, qrSize + 30, qrSize + 30, 20);
        ctx.fill();

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, qrPosX, qrPosY, qrSize, qrSize);

            // 5. MediScan Branding
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = 'bold 32px Inter, system-ui, sans-serif';
            ctx.fillText('MediScan Emergency ID', canvas.width / 2, qrPosY + qrSize + 65);

            setPreviewUrl(canvas.toDataURL('image/png'));
            setShowPreview(true);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    function downloadWallpaper() {
        const link = document.createElement('a');
        link.download = `mediscan-lockscreen-${profileName.replace(/\s+/g, '-')}.png`;
        link.href = previewUrl;
        link.click();
        toast.success('Wallpaper saved to downloads!');
    }

    function downloadQR() {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const canvas = document.createElement('canvas');
        const size = 400;
        canvas.width = size; canvas.height = size + 80;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#1E40AF';
        ctx.fillRect(0, 0, size, 50);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚕ EMERGENCY MEDICAL ID', size / 2, 32);

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 50, 60, 300, 300);
            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(profileName, size / 2, 390);
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText('Scan for emergency medical information', size / 2, 408);
            ctx.fillText(emergencyUrl.replace(window.location.origin, ''), size / 2, 425);

            const link = document.createElement('a');
            link.download = `mediscan-qr-${profileName.replace(/\s+/g, '-')}.png`;
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

    if (loading) return <div className="page-center"><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;

    return (
        <div className="page" style={{ background: 'radial-gradient(circle at top left, #f8f9fc 0%, #eef2ff 100%)' }}>
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <div style={{ background: 'var(--blue)', borderRadius: '10px', padding: '6px', display: 'flex', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>
                        <Activity size={22} color="white" />
                    </div>
                    <span>MediScan</span>
                </Link>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            </nav>

            <div className="container" style={{ padding: '40px 16px 60px', textAlign: 'center' }}>
                <div className="animate-in">
                    <h2 style={{ marginBottom: 6 }}>Emergency QR Ready</h2>
                    <p style={{ marginBottom: 32 }}>Save this to your phone so help can find your info even if locked.</p>

                    <div className="card" style={{ display: 'inline-block', padding: '28px 32px', marginBottom: 24 }}>
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
                                    src: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="0" width="24" height="24" rx="6" fill="#1e40af"/><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" stroke-width="2"/></svg>'),
                                    height: 32, width: 32, excavate: true,
                                }}
                            />
                        </div>

                        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{profileName}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Scan for emergency medical information</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                        <button className="btn btn-primary btn-lg" onClick={downloadQR}>
                            <Download size={18} /> Save QR Image
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={generateWallpaper} style={{ background: '#0F172A', color: '#fff', borderColor: '#1e293b' }}>
                            <Smartphone size={18} /> Preview Lock-Screen
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={handleShare}>
                            <Share2 size={18} /> Share Link
                        </button>
                    </div>

                    <div className="card" style={{ textAlign: 'left', background: '#fffbeb', border: '1.5px solid #fde68a' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <Smartphone size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ fontWeight: 700, color: '#92400E', marginBottom: 6 }}>📱 Why set as lockscreen?</p>
                                <p style={{ fontSize: '0.875rem', color: '#78350F', lineHeight: 1.5 }}>
                                    If you are unconscious, paramedics will check your phone. Our <strong>partial-overlay wallpaper</strong> ensures they can scan your QR code without you needing to unlock your device.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallpaper Preview Modal */}
            {showPreview && (
                <div className="modal-overlay" onClick={() => setShowPreview(false)}>
                    <div className="modal-content animate-in" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowPreview(false)}>
                            <X size={20} />
                        </button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                            <div>
                                <h3 style={{ marginBottom: 12 }}>Lock-Screen Preview</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                                    This is how the emergency card will appear at the bottom of your lock screen. 
                                    The top section is transparent so your current wallpaper remains visible.
                                </p>
                                
                                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                                    <h4 style={{ fontSize: '0.875rem', marginBottom: 8 }}>Setup Instructions:</h4>
                                    <ol style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: 20 }}>
                                        <li>Click "Download Wallpaper" below</li>
                                        <li>Open the image in your gallery</li>
                                        <li>Select "Set as Wallpaper"</li>
                                        <li>Choose "Lock Screen"</li>
                                    </ol>
                                </div>

                                <button className="btn btn-primary btn-full btn-lg" onClick={downloadWallpaper}>
                                    <Download size={18} /> Download Wallpaper
                                </button>
                            </div>

                            <div className="phone-mockup">
                                <div className="phone-screen">
                                    {/* Simulated background wallpaper */}
                                    <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1080&h=1920" className="phone-content" alt="wallpaper" />
                                    <div className="phone-overlay">
                                        <div>
                                            <div className="phone-time">09:41</div>
                                            <div className="phone-date">Monday, June 22</div>
                                        </div>
                                    </div>
                                    {/* The actual generated QR overlay */}
                                    <img src={previewUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} alt="generated overlay" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
