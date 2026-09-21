# Shifts

A shift-tracking app: log shifts on a calendar, tag them by category, optionally
track pay, and see hours/pay analytics broken down by week, month, and year.

## What you need

- Node.js 18 or newer installed on your computer.
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster.

## Setup (do this once)

1. **Unzip this folder** anywhere on your computer.
2. In Atlas: **Database → Connect → Drivers**, copy the connection string, and
   replace `<password>` with your database user's password.
3. In the `backend` folder, duplicate `.env.example` and rename the copy to
   `.env`. Paste your connection string in as `MONGODB_URI`.

That's the *only* manual step. You do **not** need to create a database or
any collections yourself — the app does that automatically the first time it
starts.

## Run it

From the root of this folder (the one with this README), run:

```bash
npm start
```

This single command installs everything and starts both the API and the web
app. The first time it runs it will:

- Connect to your Atlas cluster.
- Create the `shift_tracker` database and its collections.
- Seed a few starter categories (Main job, Side gig, Volunteer, Overtime) —
  you can rename, add, or remove categories from inside the app.

Once it's running, open **http://localhost:5173** in your browser.

To stop it, press `Ctrl+C` in the terminal. Next time, just run `npm start`
again from the same folder.

## Using the app

- **Calendar** — click any day to add a shift (start/end time, category,
  optional location and notes). Turn on "Track pay" per shift to log an
  hourly rate or a flat amount.
- **Analytics** — switch between Week / Month / Year to see total hours,
  total pay, average hourly rate, and a breakdown by category. Use the arrows
  to move between periods.

## Deploy to Vercel

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com/new).
2. In **Project Settings → General**, set:
   - **Framework Preset** → **Other**
   - **Root Directory** → leave **blank** (repo root). Do **not** set this to `frontend`, or the API will not deploy and Analytics will hang.
3. In **Project Settings → Environment Variables**, add:
   - `MONGODB_URI` — your MongoDB Atlas connection string (same value as in `backend/.env`).
4. Deploy. Vercel builds the React app and runs the API as a serverless function at `/api/*`.

In Atlas, allow access from anywhere (`0.0.0.0/0`) under **Network Access**, since Vercel uses dynamic IPs.

## Project structure

```
shift-tracker/
├── api/         Vercel serverless entry (wraps the Express API)
├── backend/     Express + MongoDB API (auto-provisions the DB on boot)
└── frontend/    React + Tailwind web app
```

## Troubleshooting

- **"Missing MONGODB_URI"** — you haven't created `backend/.env` yet, or it's
  missing the `MONGODB_URI` line.
- **Connection errors** — in Atlas, make sure your current IP address is
  allow-listed under **Network Access** (or allow access from anywhere while
  testing), and double-check the password in your connection string.
- **`mongodb+srv URI cannot have port number`** — your connection string has
  `:27017` (or another port) in it. Remove the port. It should look like:
  `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/shift_tracker?retryWrites=true&w=majority`
  Also remove the separate `PORT` env var from Vercel — that is only for local dev.
- **Port already in use** — something else is using port 5050 or 5173; close
  it, or edit `PORT` in `backend/.env` / the `dev` script in `frontend/package.json`.
