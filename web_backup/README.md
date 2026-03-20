<div align="center">
  <img src="public/favicon.svg" width="128" alt="MediScan Logo" />
  <h1>MediScan</h1>
  <p><i>Emergency Medical ID System</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

MediScan is a QR-based medical identification system designed for rapid information retrieval in emergency scenarios. By scanning a unique patient ID, responders can instantly access critical medical data synchronized across a secure cloud infrastructure.

### 🔗 Live Demo
[View Live Demo](https://mediscan-delta.vercel.app)

### ⚠️ Important Note
MediScan is a technical demonstration and is **not** a production-grade medical record system. It has not undergone clinical auditing or regulatory compliance (e.g., HIPAA). All medical data is user-reported and should be verified by authorized medical personnel using standard protocols.

### 🧪 Test QR / Demo Data
To review the system's output without creating an account, you can use the following profile data for testing:
- **Test User**: Biya
- **Blood Group**: O+
- **Allergies**: No known allergies
- **Emergency Contact**: Tamil (9361472469)

### 🚀 Key Features
- **Dynamic QR Retrieval**: Unique patient identifiers mapped to real-time cloud records.
- **Accident Guard / SOS Alert**: Automatic impact detection with a 15-second cancellation window.
- **Managed Medical Profiles**: Structured storage for clinical data including severe allergies and medications.
- **Role-Based Access**: Toggleable visibility for professional and public views.

### 🚨 SOS Alert Behavior
When an impact is detected or the SOS is manually triggered:
1. **Critical Overlay**: A high-visibility countdown appears on the device.
2. **Notification Pipeline**: If not canceled within 15 seconds, pre-configured emergency contacts are notified via secure email alerts.
3. **Emergency State**: The patient's profile displays a prioritized "CRITICAL ALERT" banner and elevates the visibility of life-saving data.

### 📌 Key Medical Data Displayed
Responders are presented with a prioritized view of:
- **Vital Information**: Blood group and age.
- **High-Priority Alerts**: Life-threatening and severe allergies.
- **Clinical Context**: Existing medical conditions and active medications.
- **Actionable Contacts**: Direct-dial buttons for primary emergency contacts.

### 📁 Project Structure
```text
mediscan/
├── public/             # Static assets and PWA manifest
├── screenshots/        # Application UI demonstrations
├── src/
│   ├── components/     # UI components (SOS Countdown, Profile Cards)
│   ├── lib/            # Supabase client and Auth logic
│   ├── pages/          # Application screens (Dashboard, Emergency View)
│   ├── utils/          # Logic for location detection and email alerts
│   └── types/          # TypeScript interface definitions
├── .env.example        # Environment configuration template
└── package.json        # Dependencies and build scripts
```

### 📸 Screenshots
![Dashboard](screenshots/dashboard.png)
*User Dashboard with QR Code and SOS Controls*

![Medical Profile](screenshots/profile.png)
*Emergency Profile View with Contact Integration*

### ⚙️ Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/biyalizabraham08/mediscan.git
   cd mediscan
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`.
4. **Start Development**:
   ```bash
   npm run dev
   ```

### 🔑 Environment Variables
Replace the placeholders in your `.env` file with your actual project credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🔍 How It Works
1. **Authentication**: Users establish identity through a secure login flow.
2. **Data Ingestion**: Clinical details are ingested and stored as structured records in Supabase.
3. **Identifier Mapping**: Profiles are hashed to unique IDs, which are used to generate scannable QR codes.
4. **Real-Time Retrieval**: Scanning triggers an API call that fetches the latest profile state, ensuring zero-latency updates for critical alerts.

### ✍️ Author
[Biya Liza Abraham](https://github.com/biyalizabraham08)