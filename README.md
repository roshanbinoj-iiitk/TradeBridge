# TradeBridge

TradeBridge is a full-stack project with a Next.js/TypeScript frontend and a Python backend, designed for seamless deployment and development.

## Project Structure

- `frontend/` — Next.js app (TypeScript)
- `backend/` — Python backend (Vercel-compatible)

## Getting Started

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Recommended) Create a Python 3.10 environment using conda or venv:
   - Using conda:
     ```bash
     conda create -p venv python=3.10 -y
     conda activate ./venv
     ```
   - Or using venv:
     ```bash
     python3.10 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server with Uvicorn (runs on http://localhost:8000):
   ```bash
   uvicorn main:app --reload
   ```

## Features

### QR Collection System

TradeBridge includes a secure QR code-based collection system for seamless item handovers:

#### How it works:
1. **Borrow Flow**: Lender generates a QR code → Borrower scans to confirm collection
2. **Return Flow**: Borrower generates a QR code → Lender scans to confirm return

#### Setup:
1. Add the following environment variable to your `.env.local`:
   ```
   QR_SIGNING_SECRET=your-secure-random-secret-key-here
   ```

2. Run the database migration:
   ```sql
   -- Run the contents of add_qr_collection_migration.sql
   ```

#### Usage:
- In the dashboard, look for "Collection QR" or "Return QR" buttons on active bookings
- QR codes expire after 10 minutes for security
- Each QR code can only be used once
- Successful scans automatically update booking status and send notifications

#### Security:
- JWT tokens signed server-side with HS256
- Single-use tokens stored as SHA-256 hashes
- 10-minute expiry for short-lived access
- Atomic database updates to prevent race conditions

## Deployment

- The backend is configured for Vercel deployment (see `backend/vercel.json`).
- The frontend can be deployed using Vercel or any platform supporting Next.js.

## License

This project is licensed under the MIT License.
