<div align="center">
  <img src="public/logo-512.png" width="128" alt="MediScan Logo" />
  <h1>MediScan</h1>
  <p><i>Emergency Medical ID System</i></p>
</div>

# MediScan

MediScan is a professional web application designed to provide instant access to critical medical information during emergencies. By scanning a unique QR code, first responders can retrieve a linked medical profile stored securely in a Supabase database. The application also features an integrated emergency SOS alert for rapid data access.

### 🔗 Live Demo
[View Live Demo](https://mediscan-delta.vercel.app)

### 🚀 Features
- **QR Code Scanning**: Instant retrieval of linked medical data via unique QR codes.
- **Emergency SOS Alert**: One-touch access to critical information in high-pressure scenarios.
- **Secure Medical Profiles**: Managed medical records with real-time data synchronization.
- **Responsive Dashboard**: Optimized for both mobile and desktop views.

### 🛠 Tech Stack
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
- **Frontend**: React.js, JavaScript, HTML, CSS
- **Backend/Database**: Supabase (PostgreSQL, Real-time APIs)
- **Deployment**: Vercel

### 📁 Project Structure
```text
mediscan/
├── public/             # Static assets (logos, icons)
├── src/
│   ├── assets/         # App-specific images and styles
│   ├── components/     # Reusable UI components (e.g., SOS Countdown)
│   ├── lib/            # Supabase client and Auth logic
│   ├── pages/          # Main application screens (Dashboard, Profiles)
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions (e.g., Email alerts)
├── .env.example        # Environment variable template
└── package.json        # Project dependencies and scripts
```

### 📸 Screenshots
![Dashboard](screenshots/dashboard.png)
*User Dashboard with QR Code and SOS Controls*

![Medical Profile](screenshots/profile.png)
*Detailed Medical Profile with Emergency Contacts*

### ⚙️ Setup Instructions
To run this project locally, follow these steps:

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
   Create a `.env` file in the root directory based on `.env.example`.

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

### 🔑 Environment Variables
The application requires the following Supabase credentials:
```env
VITE_SUPABASE_URL=https://xbsyleowkfgabuqkvked.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic3lsZW93a2ZnYWJ1cWt2a2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjY4NjgsImV4cCI6MjA1Nzk5Mjg2OH0.98322z371Y889k0l4l512891289128912891289
```

### 🔍 How It Works
1. **Registration**: The user creates an account and sets up their medical profile.
2. **Profile Mapping**: Medical details are stored in Supabase with a unique identifier.
3. **QR Generation**: A unique QR code is generated, linking to the user's secure profile.
4. **Emergency Retrieval**: A responder scans the code, which triggers a real-time fetch from Supabase to display critical data or initiate an SOS alert.

### 🚑 Use Cases
- **Emergency Response**: Providing first responders with immediate access to blood types and allergies.
- **Health Management**: Keeping a digital and accessible record of personal medical history.

### ⚠️ Limitations
- **Internet Dependency**: Real-time data retrieval requires an active network connection.
- **Manual Data Entry**: The accuracy of the medical profile depends on the user's manual input.

### 🔮 Future Improvements
- **Offline Access**: Implementing PWA capabilities for cached data retrieval.
- **Wearable Integration**: Linking with smartwatches for automated SOS triggers.

### ✍️ Author
[Biya Liza Abraham](https://github.com/biyalizabraham08)