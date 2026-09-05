# Mediczen Doctor Dashboard

Mediczen is a clinical workflow dashboard for doctors to manage patients, appointments, schedules, billing records, AI-assisted consultations, and read-only patient portals.

The application uses React and Vite for the frontend, Express and Node.js for the backend, and Supabase for authentication and PostgreSQL data storage.

> **Important:** This project handles medical-style demonstration data. It is not a production medical-record system and must not be used with real patient information without a complete security, compliance, and clinical review.

## Features

- Supabase email/password authentication for doctor accounts
- Doctor-specific data isolation using `doctor_id` filters and Row Level Security policies
- Patient creation, viewing, editing, and deletion
- Patient records containing symptoms, vitals, notes, and AI consultation summaries
- AI-assisted symptom analysis through OpenAI when configured, with a symptom-aware local fallback
- Explicit **Save Consultation** workflow before a generated consultation becomes part of the patient record
- Appointment management
- Weekly schedule and timeline management
- Internal invoice and billing management
- Secure, expiring patient portal links
- Read-only patient portal displaying saved diagnostic and treatment records
- Responsive dashboard UI with light and dark themes

## Technology Stack

### Frontend

- React 18
- Vite 7
- React Router
- Tailwind CSS
- Supabase JavaScript client
- Axios
- Lucide React

### Backend

- Node.js
- Express
- Supabase JavaScript client
- Supabase Auth and PostgreSQL
- OpenAI API integration for clinical decision support
- CORS and dotenv

## Project Structure

```text
.
├── backend/
│   ├── config/              Supabase server configuration
│   ├── middleware/          Authentication middleware
│   ├── routes/              Auth, patients, portal, scheduling, billing APIs
│   ├── services/            AI consultation service
│   ├── schema.sql           Supabase tables and RLS policies
│   ├── server.js            Express entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      Dashboard, layout, and modal components
│   │   ├── pages/            Application pages
│   │   ├── services/         Supabase and API clients
│   │   ├── App.jsx           Application routing and session state
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── .env.example files       Environment variable templates
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project
- Optional: an OpenAI API key for live AI responses

## Installation

From the project root:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

The included `setup.bat` may contain a machine-specific path. If it does not match your checkout location, use the commands above instead.

## Environment Configuration

Create the backend environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

Create the frontend environment file:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Configure the values as follows.

### `backend/.env`

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
```

`SUPABASE_SERVICE_ROLE_KEY` is required for server-side account provisioning and protected backend operations. It must be a real service-role/secret key, not the public anon or publishable key.

### `frontend/.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:5000/api
```

Only public frontend values may use the `VITE_` prefix. Never put service-role, OpenAI, Gemini, or other private keys in frontend environment files.

## Database Setup

1. Create or open a Supabase project.
2. Open the Supabase SQL Editor.
3. Run [backend/schema.sql](backend/schema.sql).
4. Confirm that the tables and ownership-based RLS policies were created.
5. Confirm that Supabase Auth email/password sign-in is enabled.
6. Restart the backend after changing environment variables.

The schema includes doctors, patients, patient records, appointments, schedules, invoices, and patient portal links.

## Running Locally

Start the backend in one terminal:

```powershell
cd backend
npm run dev
```

The API runs on `http://localhost:5000`.

Start the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

The dashboard runs on `http://localhost:5173`.

For a production frontend build:

```powershell
cd frontend
npm run build
npm run preview
```

## Main Workflows

### Doctor account

Use **Create Account** to provision a confirmed Supabase Auth user and doctor profile. Use **Sign In** for existing accounts. The browser stores the doctor profile locally while the Supabase session remains the source of authentication.

### AI consultation

1. Open a patient.
2. Open the AI Symptom Assistant.
3. Enter symptoms and vitals.
4. Generate the consultation.
5. Review the result.
6. Click **Save Consultation to Patient Record**.

A consultation is not intended to become part of the patient record until the save action succeeds.

### Patient portal

1. Open a patient from the dashboard.
2. Generate a portal link.
3. Share or open the generated URL.
4. The read-only portal loads the patient and all saved records associated with that patient.

Portal links are stored in Supabase, expire after seven days, and should be regenerated when an old link is invalid or expired.

## API Overview

| Method | Endpoint                        | Purpose                                       |
| ------ | ------------------------------- | --------------------------------------------- |
| `POST` | `/api/auth/register`            | Create a confirmed doctor account and profile |
| `POST` | `/api/auth/login`               | Authenticate a doctor and return a session    |
| `POST` | `/api/auth/provision`           | Provision a profile for an authenticated user |
| `GET`  | `/api/patients`                 | List the authenticated doctor’s patients      |
| `POST` | `/api/patients`                 | Create a patient                              |
| `POST` | `/api/patients/:id/diagnose-ai` | Generate an AI consultation draft             |
| `POST` | `/api/patients/:id/records`     | Save a consultation record                    |
| `POST` | `/api/patients/:id/share-link`  | Create an expiring portal link                |
| `GET`  | `/api/portal/:token`            | Load a read-only patient portal               |
| `GET`  | `/api/appointments`             | List appointments                             |
| `GET`  | `/api/schedules`                | List schedules                                |
| `GET`  | `/api/invoices`                 | List invoices                                 |

Clinical dashboard endpoints require a valid `Authorization: Bearer <supabase-access-token>` header. Portal access is token-based and does not require doctor login.

## Security Notes

- Never commit `.env`, `.env.*`, service-role keys, API keys, passwords, or private certificates.
- Rotate any credential that has been exposed in logs, screenshots, chat, source control, or terminal output.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. It bypasses RLS.
- Keep OpenAI and other AI provider keys server-side only.
- Do not use permissive `USING (true)` or `WITH CHECK (true)` policies for production data.
- Use HTTPS and secure deployment secrets outside local development.
- Review authentication, authorization, audit logging, backups, retention, and applicable healthcare privacy requirements before production use.

## Validation

Run the frontend build:

```powershell
cd frontend
npm run build
```

Check backend JavaScript syntax:

```powershell
cd backend
node --check server.js
Get-ChildItem routes,middleware,services -Filter *.js -Recurse | ForEach-Object { node --check $_.FullName }
```

## Troubleshooting

### `User not allowed` during registration

The backend is using an anon key where a service-role/secret key is required. Check `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`, then fully restart the backend.

### `Invalid login credentials`

Confirm that the account exists in Supabase Auth, the email is correct, and the password is correct. Existing rows in the `doctors` table alone are not sufficient for Auth login.

### Portal shows no records

Generate a new portal link after saving the consultation. Confirm that the consultation save succeeded and that the link has not expired.

### Frontend dependency resolution fails

Run `npm install` from the `frontend` directory. The project uses Vite 7 with the compatible React Vite plugin range.

## License

No license has been specified for this project. Add an explicit license before distributing it publicly.
