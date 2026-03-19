<div align="center">
  <img src="public/logo-512.png" width="128" alt="Mediscan Logo" />
  <h1>Mediscan</h1>
  <p><i>Reliable Medical Information for Emergency Situations</i></p>
  
  <p>
    <img src="https://img.shields.io/badge/Stack-React%20%2B%20Supabase-blue?style=for-the-badge" alt="Stack" />
    <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge" alt="Vercel" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>
</div>

Mediscan is a professional web application designed to bridge the information gap in medical emergencies. By scanning a unique QR code, first responders can instantly retrieve critical medical data stored securely in a real-time database.

## Overview
Mediscan provides a streamlined interface for users to manage their medical profiles and generate accessible QR codes. The system ensures that life-saving information—such as blood type, allergies, and emergency contacts—is available exactly when it's needed most.

## Features
- **Instant QR Generation**: Generate unique QR codes for phone lock screens or physical cards.
- **Secure Medical Profiles**: Store and update critical health information in a structured format.
- **Real-time Synchronization**: Instant updates to medical data across all scanned instances.
- **Emergency Dashboard**: A dedicated view for quick data retrieval during critical situations.
- **Responsive Design**: Optimized for mobile devices used by first responders on the field.

## Tech Stack
- **Frontend**: [React](https://reactjs.org/) (Vite)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Generation**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)

## How It Works

<div align="center">
  <h3>🔄 Real-time Data Retrieval</h3>
  <p><i>Subtle animations indicate active data fetching and synchronization</i></p>
</div>

1. **Profile Creation**: Users sign up and input their essential medical details.
2. **QR Generation**: The app generates a unique identifier mapped to the user's Supabase record.
3. **Data Retrieval**: When scanned, the app fetches the most recent data directly from Supabase APIs.
4. **Real-time Updates**: Any changes made by the user are instantly reflected on the scan result page.

## Setup
To run Mediscan locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mediscan.git
   cd mediscan
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the environment**:
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables)).

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Environment Variables
The application requires the following Supabase credentials to function:

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anonymous API Key |

## Limitations
- **Connectivity**: Requires an active internet connection to fetch real-time data from Supabase.
- **Data Dependency**: Information accuracy is dependent on the data provided by the user.
- **Scan Environment**: QR code readability depends on the physical condition of the code and ambient lighting.

## Future Improvements
- **Offline Mode**: Local caching of profile data for environments with poor connectivity.
- **Multi-language Support**: Expanding accessibility for international users.
- **Integration**: Secure data sharing with wearable health devices.

---
*Developed with a focus on reliability and speed in medical emergency scenarios.*