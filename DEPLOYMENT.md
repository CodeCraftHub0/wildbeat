# Deployment Guide

This project runs a Vite/React frontend and an Express + SQLite backend. Deploy them separately:

- **Backend API**: host on a Node-friendly service (Render, Railway, Fly.io, etc.).
- **Frontend**: deploy to Vercel pointing at the hosted backend via `VITE_API_BASE_URL`.

---

## 1. Prepare the Backend

1. **Create a Git repository** that includes the `backend/` folder and `backend/package.json`.
2. **Set environment variables** using the values from `backend/.env`:
   - `PORT` (optional, defaults to `3001`)
   - `CLIENT_ORIGIN` (comma-separated list of allowed frontend origins, e.g. `https://wildbeat.vercel.app`)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_REDIRECT_URL`
   - `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`, `MPESA_BASE_URL`
   - `EMAIL_USER`, `EMAIL_PASS`
3. **Run the database setup** command on the hosting platform before starting the server:
   ```bash
   npm run setup-db
   ```
   This creates the `wildbeat.db` SQLite database with seed data.
4. **Start command** for the service:
   ```bash
   npm run start
   ```
5. Ensure the service exposes the Express server on the assigned port.

## 2. Deploy the Backend (Render example)

1. Log in to [Render](https://render.com/) and create a new **Web Service**.
2. Connect the Git repository and choose the `backend/` directory.
3. Set the build command:
   ```bash
   npm install && npm run setup-db
   ```
4. Set the start command:
   ```bash
   npm run start
   ```
5. Add the required environment variables in Render's dashboard.
6. Deploy. Record the public URL (for example `https://wildbeat-backend.onrender.com`).

## 3. Configure the Frontend for Vercel

1. In the Vite app root, create `.env.production` with:
   ```env
   VITE_API_BASE_URL=https://wildbeat-backend.onrender.com/api
   ```
2. In Vercel, add the same environment variable under **Project Settings → Environment Variables**.
3. Ensure all React fetch calls rely on `import.meta.env.VITE_API_BASE_URL` (already wired through `src/lib/api-local.ts`).

## 4. Deploy the Frontend to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In the Vercel dashboard, **Import Project** and select the repository.
3. When prompted for project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: project root (where `package.json` resides)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the `VITE_API_BASE_URL` environment variable in Vercel.
5. Deploy. Vercel will output a production URL (for example `https://wildbeat.vercel.app`).

## 5. Post-Deployment Checklist

- **CORS**: ensure `CLIENT_ORIGIN` on the backend includes the Vercel URL.
- **Admin Account**: sign up using the admin code `181950` to seed the first admin.
- **Payments**: verify each configured payment provider with test credentials before enabling live keys.
- **Environment Variables**: double check production services use real secrets and not placeholder values.
- **Database Backups**: if using SQLite, enable persistent storage or scheduled exports on the hosting provider.

---

Following these steps will produce a hosted Express API and a Vercel frontend wired to it. Update the environment variables whenever you change hosts or domains.
