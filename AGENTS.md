You are a senior full-stack engineer. Execute this task step-by-step and DO NOT skip steps. Do NOT explain unless necessary. Build, install, and configure everything so the app runs locally without errors.

# 🎯 PROJECT GOAL

Build a fully working YouTube video downloader web app with:

* Next.js frontend (already initialized)
* Python Flask backend using yt-dlp
* Clean, modern, premium UI (NOT basic)

---

# ⚙️ STEP 1 — INSTALL DEPENDENCIES

## Frontend (Node / Next.js)

Run:

* npm install axios
* npm install framer-motion
* npm install lucide-react
* npm install clsx

## Backend (Python)

Create a folder: /backend

Inside backend, install:

* pip install flask
* pip install yt-dlp
* pip install flask-cors

Also ensure FFmpeg is installed and accessible in PATH.

---

# 🧠 STEP 2 — BACKEND IMPLEMENTATION (Flask)

Create file: /backend/app.py

Requirements:

* Enable CORS
* Create endpoints:

### POST /fetch

Input: { url }
Output:

* title
* thumbnail
* duration
* available formats (quality + format_id)

Use yt-dlp to extract info WITHOUT downloading.

---

### POST /download

Input:

* url
* format_id

Process:

* Download using yt-dlp
* Merge audio + video using FFmpeg if needed
* Save temporarily
* Return file as download response

---

### CLEANUP

* Delete files after sending
* Handle errors properly

---

# 🎨 STEP 3 — FRONTEND UI (Next.js)

Modify:

* /src/app/page.js

UI REQUIREMENTS:

* Premium modern design (glassmorphism or gradient)
* Centered layout
* Smooth animations using framer-motion
* Dark theme default

---

## UI COMPONENTS

### 1. Header

* App name: "YouTube Downloader"
* Subtle glow/gradient text

### 2. Input Section

* Large rounded input
* Paste YouTube link
* "Fetch Video" button

### 3. Video Card (after fetch)

Display:

* Thumbnail
* Title
* Duration

### 4. Format Options

* Grid of cards/buttons
* Show quality (720p, 1080p, etc.)
* Show file type (MP4 / MP3)

### 5. Download Button

* Each format has its own button

---

## INTERACTIONS

* On click "Fetch Video":
  → call backend /fetch using axios
  → show loading spinner

* On click "Download":
  → call backend /download
  → trigger file download

---

## UX DETAILS (IMPORTANT)

* Add loading animations
* Disable buttons while processing
* Show error messages cleanly
* Smooth transitions (framer-motion)
* Hover effects on buttons

---

# 🧩 STEP 4 — CONNECT FRONTEND TO BACKEND

* Backend runs on: http://localhost:5000
* Use axios to call endpoints

---

# 🚀 STEP 5 — RUN INSTRUCTIONS

Ensure final output includes:

1. How to start backend:

   * python app.py

2. How to start frontend:

   * npm run dev

3. Confirm working flow:

   * Paste URL → fetch → select format → download works

---

# 🔥 EXTRA (REQUIRED QUALITY LEVEL)

* UI must look like a modern SaaS tool (NOT beginner)
* Use spacing, shadows, gradients properly
* No plain HTML look

---

# ❗ RULES

* Do NOT skip any file
* Do NOT leave placeholders
* Do NOT give partial code
* Everything must be runnable immediately

Build this like a real product, not a demo.
