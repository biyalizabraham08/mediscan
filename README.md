# MediScan: Emergency Medical ID
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/biyalizabraham08/mediscan)

MediScan provides a secure, fast, and reliable way to create a digital medical profile that is instantly accessible via a QR code. In an emergency, first responders can scan the code to get life-saving information like blood type, critical allergies, and emergency contacts, bridging the crucial information gap when every second counts.

## Key Features

*   **Secure Medical Profile:** Store your critical data, including blood group, allergies (with severity), medical conditions, current medications, and emergency contacts.
*   **Instant QR Code Access:** Generate a unique QR code to place on a phone lock screen, wallet card, or sticker. The app includes a tool to create a custom lock screen wallpaper with your QR code.
*   **Smart Accident Detection:** Utilizes your device's motion sensors to detect a potential fall or crash. If an impact is detected, it initiates a countdown to automatically alert your emergency contacts unless canceled.
*   **Tiered Access Control:**
    *   **Public View:** Displays essential, life-saving information for immediate response by anyone.
    *   **Professional Access:** Allows verified medical professionals to view your complete medical history after requesting a one-time password (OTP) sent securely to you.
*   **Automated Email Alerts:** Instantly notifies your emergency contacts via EmailJS when your QR code is scanned or a potential accident is detected.
*   **Comprehensive User Dashboard:** A central hub to manage your profile, view a detailed log of every profile access (including location, if available), toggle data visibility, and test the alert system.
*   **PWA Ready:** Installable on mobile devices for quick, app-like access, with offline fallback capabilities provided by a service worker.

## How It Works

1.  **Sign Up:** Create a secure account using your email and a password.
2.  **Build Your Profile:** Fill in your essential medical details and add one or more emergency contacts.
3.  **Generate Your QR Code:** Download your unique QR code as a standalone image or as a custom-designed phone lock screen wallpaper.
4.  **Stay Prepared:** In an emergency, responders can scan this QR code to view your public medical profile and immediately contact your loved ones.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Backend & Database:** Supabase
*   **Email Notifications:** EmailJS
*   **Routing:** React Router
*   **QR Generation:** `qrcode.react`
*   **State Management:** React Context API
*   **UI/Styling:** Custom CSS with a modern, responsive design system.

## Getting Started: Local Development

Follow these steps to set up and run MediScan on your local machine.

### 1. Prerequisites

*   Node.js (v18 or later)
*   npm or a compatible package manager
*   A Supabase account
*   An EmailJS account

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/biyalizabraham08/mediscan.git
    cd mediscan
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 3. Environment Configuration

1.  Create a `.env` file in the project root by copying the example file:
    ```bash
    cp .env.example .env
    ```

2.  **Configure Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Go to **Project Settings > API**.
    *   Copy the **Project URL** and the `anon` **public key**.
    *   Paste them into your `.env` file:
      ```env
      VITE_SUPABASE_URL=your_supabase_project_url
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
      ```

3.  **Configure EmailJS:**
    *   Log in to your [EmailJS](https://www.emailjs.com/) dashboard.
    *   Add a new email service (e.g., Gmail).
    *   Create two email templates: one for OTPs and one for emergency alerts. The templates must accept the variables defined in `src/utils/email.ts`.
    *   Find your **Service ID**, **Template IDs**, and **Public Key** and add them to your `.env` file.

### 4. Database Setup

1.  In your Supabase project dashboard, navigate to the **SQL Editor**.
2.  You must create the `profiles`, `otps`, and `access_logs` tables. The required SQL commands to define the schema can be inferred from the application's data structures and diagnostic scripts.
3.  **Crucially**, disable the **Confirm email** feature in Supabase for the custom OTP flow to work correctly. Go to **Authentication > Providers > Email** and turn off the "Confirm email" toggle.

### 5. Run the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

2.  **Run the Supabase diagnostic script (optional):**
    To verify your database connection and table setup, run:
    ```bash
    node check-supabase.mjs
    ```

## Available Scripts

*   `npm run dev`: Starts the Vite development server with Hot Module Replacement.
*   `npm run build`: Compiles the TypeScript code and builds the application for production.
*   `npm run lint`: Runs ESLint to analyze the code for potential errors.
*   `npm run preview`: Starts a local server to preview the production build.