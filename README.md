# AutoGrade Frontend

Production-ready frontend for **AutoGrade** — an AI-powered academic evaluation platform where teachers/students can upload answer sheets, run OCR extraction, evaluate answers against model solutions/rubrics, view marks with feedback, track performance analytics, and manage their account with secure authentication flows.

---

## Features

- Modern responsive UI (desktop + mobile)
- JWT-based authentication
  - Signup
  - Login
  - Forgot Password
  - Reset Password
  - Logout
- Profile page
  - View account details
  - Delete account (with secure confirmation)
- Answer sheet upload flow
- OCR and evaluation results display
- API-integrated architecture with env-based backend URL
- Clean state handling and user feedback messages

---

## Tech Stack

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **Lucide Icons**
- **Fetch API** for backend communication

---

## Project Structure (example)

frontend/
├─ app/
│  ├─ login/page.jsx
│  ├─ signup/page.jsx
│  ├─ forgot-password/page.jsx
│  ├─ reset-password/page.jsx
│  ├─ [userId]/
│  │  ├─ profile/page.jsx
│  │  ├─ dashboard/page.jsx
│  │  └─ ...
│  ├─ layout.jsx
│  └─ page.jsx
├─ components/
│  ├─ Navbar.jsx
│  └─ ...
├─ lib/
│  ├─ auth.js
│  └─ ...
├─ public/
├─ .env.local
├─ package.json
└─ README.md

---

## Environment Variables

Create `frontend/.env.local`:

NEXT_PUBLIC_API_BASE=http://localhost:8000

> Use your deployed backend URL in production, for example:  
> `NEXT_PUBLIC_API_BASE=https://your-backend-domain.com`

---

## Installation & Run

1) Install dependencies

npm install

2) Run development server

npm run dev

3) Open app

http://localhost:3000

---

## Build for Production

npm run build  
npm start

---

## Authentication Flow

### Login
- User logs in using email + password
- JWT token and user info are stored (via your `lib/auth.js`)
- Protected pages check token and redirect if missing/invalid

### Forgot Password
- User enters registered email
- Frontend calls:
  - `POST /auth/forgot-password`
- Success message is generic (security best practice)

### Reset Password
- User opens reset link from email:
  - `/reset-password?token=...`
- Frontend submits:
  - `POST /auth/reset-password`
  - body: `{ token, new_password, confirm_password }`
- On success, redirect to `/login`

---

## Profile & Account Deletion

Profile page path example:  
`/[userId]/profile`

Includes:
- Read-only name/email view
- Delete account section with:
  - current password
  - confirmation phrase typing
- Delete button appears only after exact confirmation text (UI safety)
- Calls:
  - `DELETE /profile/me`

---

## API Endpoints Used by Frontend

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /profile/me`
- `PUT /profile/me`
- `DELETE /profile/me`
- OCR/Evaluation endpoints (as implemented in backend)

---

## Example Fetch Pattern

const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/forgot-password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});
const data = await res.json();
if (!res.ok) throw new Error(data?.detail || "Request failed");

---

## Route Protection (Recommended)

For protected pages:
- Check `getToken()` and `getUser()` in `useEffect`
- Redirect to `/login` if token/user not present
- If route userId mismatch, redirect to correct user route

---

## Common Issues & Fixes

### 1) `Failed to fetch`
- Backend not running
- Wrong `NEXT_PUBLIC_API_BASE`
- CORS not configured on backend
- Wrong endpoint path

### 2) Reset page not working
- Ensure frontend route exists:
  - `/reset-password/page.jsx`
- Ensure backend sends link:
  - `${FRONTEND_URL}/reset-password?token=<token>`

### 3) Token-related unauthorized errors
- Ensure `Authorization: Bearer <token>` is sent
- Verify token is stored and not expired
- Clear stale local storage and login again

### 4) Delete account fails
- Confirm backend expects `confirm_text: "DELETE"`
- Send exact expected payload from frontend

---

## UI Notes

- Uses a consistent emerald theme for auth and profile pages
- Danger zone (delete account) uses red styling for clarity
- Supports validation messages for success/error states

---

## Scripts

- `npm run dev` — run development server
- `npm run build` — create production build
- `npm start` — run production server
- `npm run lint` — run linter (if configured)

---

## Deployment

You can deploy frontend on:
- Vercel (recommended for Next.js)
- Netlify
- Any Node-compatible hosting

After deployment:
1. Set `NEXT_PUBLIC_API_BASE` to production backend URL
2. Redeploy frontend
3. Ensure backend CORS allows frontend domain

---

## License

MIT (or your preferred license)

---

## Author

Built for **AutoGrade** project ✨