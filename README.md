# SamadhanSetu (समाधानसेतु)

### *Connecting People, Ideas, and Solutions — Together for a Better India*

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://sih.gov.in/)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20Statement%20ID-26043-blue.svg)](https://sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Agriculture%20%26%20Rural%20Development-green.svg)](#)
[![Nodal Body](https://img.shields.io/badge/Nodal%20Body-Government%20of%20Jharkhand-navy.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Node.js%20%7C%20MongoDB-brightgreen.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#)

---

## What is SamadhanSetu?

SamadhanSetu is a web app that helps fix real problems in rural India — like dirty water, broken roads, or bad irrigation — by connecting four groups of people:

- **Citizens** report local problems
- **Universities** study and solve those problems
- **Companies** fund the solutions
- **Government** approves and deploys the fix

Instead of complaints getting lost in old government portals, SamadhanSetu turns them into actual solutions.

---

## How it Works — 6 Simple Steps

```
Step 1 — PEOPLE       : Citizens report problems (with photo, GPS location, voice)
Step 2 — AI           : AI groups similar reports together and checks for duplicates
Step 3 — UNIVERSITY   : Students/researchers pick a problem and build a solution
Step 4 — INDUSTRY     : Companies fund the project through CSR grants
Step 5 — GOVERNMENT   : Government officials approve the project and give permits
Step 6 — IMPACT       : Solution is deployed in the field; results are tracked
```

---

## Why SamadhanSetu? (vs Old Portals like CPGRAMS)

| Feature | Old Portals | SamadhanSetu |
| :--- | :--- | :--- |
| How problems are treated | As complaints to close | As challenges to solve |
| Duplicate reports | Clutter the system | AI merges them automatically |
| Who solves problems | Overloaded contractors | Students, researchers, companies |
| Student involvement | None | University students earn college credits |
| Funding | Only government budget | Companies donate CSR funds (₹5L–₹25L) |
| Map / Location | Text dropdowns only | Live map with district-level alerts |
| Progress tracking | Just "Pending / Closed" | 4-stage tracker: Research → Prototype → Pilot → Deployed |

---

## Who Uses This App?

1. **Citizens & Farmers** — Report local problems using their phone (photo, GPS, voice note). They can also report through local help centers (Pragya Kendras).

2. **Universities** — Engineering and agriculture colleges take up challenges, build solutions, and students earn academic credits for it (NEP 2020).

3. **Companies (Industry)** — CSR teams browse open projects and choose to fund them with money or mentorship.

4. **Government Officials** — District collectors monitor problems on a map, approve projects, and track results.

---

## Pages in the App (12 Screens)

| # | Page | URL | What it does |
| :-: | :--- | :--- | :--- |
| 1 | Landing Page | `/` | Home page with live impact numbers and how the platform works |
| 2 | Sign Up | `/signup` | Create an account as Citizen, University, Industry, or Government |
| 3 | Login | `/login` | Log in to your account (includes demo role switcher for testing) |
| 4 | Report a Problem | `/report` | 4-step form with GPS, photo upload, and severity level |
| 5 | AI Result | `/ai-result` | Shows AI's analysis of your report (domain, priority, similar reports) |
| 6 | Challenges Explorer | `/challenges` | Browse all problems filtered by domain, district, priority, or status |
| 7 | University Dashboard | `/university` | Universities see recommended challenges and accept them |
| 8 | Industry Dashboard | `/industry` | Companies see projects to sponsor and pledge funds |
| 9 | Government Dashboard | `/government` | Map of Jharkhand showing problems by district with alert levels |
| 10 | Project Workspace | `/workspace/:id` | Team workspace with milestone tracker, tasks, and materials list |
| 11 | Impact Dashboard | `/impact` | Public dashboard showing results and beneficiaries |
| 12 | About Page | `/about` | Mission, values, and team info |

---

## Tech Stack (What it's Built With)

| Part | Technology |
| :--- | :--- |
| Frontend (UI) | React 18 + Vite |
| Backend (Server) | Node.js + Express.js |
| Database | MongoDB 7.0+ |
| Maps / Location | MongoDB GeoJSON (2dsphere indexes) |
| Styling | CSS (vanilla) |

**Simple flow:**
```
User (browser)  →  React Frontend  →  Express API  →  MongoDB Database
```

---

## How AI Works in This App

The AI does 3 simple things:

1. **Classifies the problem** into one of 4 categories based on keywords in the report:
   - Water & Sanitation (e.g., "arsenic", "handpump", "borewell")
   - Agriculture (e.g., "crop", "canal", "irrigation", "soil")
   - Healthcare (e.g., "doctor", "medicine", "vaccine", "clinic")
   - Rural Infrastructure (e.g., "road", "bridge", "school", "electricity")

2. **Gives a priority score** (1–10) based on how serious the problem is:
   - High severity → starts at 8.0
   - Medium severity → starts at 6.0
   - Low severity → starts at 4.0
   - Score goes up (+0.2) for every extra report on the same problem (max +2.0)

3. **Detects location** from GPS coordinates and maps it to the nearest Jharkhand district (e.g., Ranchi, Bokaro, Dhanbad, etc.)

---

## How to Run This Project Locally

### What you need first
- **Node.js** version 18 or higher → [Download here](https://nodejs.org/)
- **MongoDB** running locally or a MongoDB Atlas account

---

### Step 1 — Download the code
```bash
git clone https://github.com/your-username/samadhansetu.git
cd samadhansetu
```

### Step 2 — Set up the Backend
```bash
cd backend
npm install
```

Create a file called `.env` inside the `backend/` folder and paste this:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/samadhansetu
JWT_SECRET=samadhansetu_super_secret_jwt_key_2026
NODE_ENV=development
```

(Optional) Load sample data into the database:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Runs at: http://localhost:5000
```

### Step 3 — Set up the Frontend
Open a **new terminal** and run:
```bash
cd frontend
npm install
npm run dev
# Runs at: http://localhost:5173
```

Open your browser and go to: **http://localhost:5173**

---

## Database — What Gets Stored

| Collection | What it stores |
| :--- | :--- |
| `users` | User accounts for all 4 roles (Citizen, University, Industry, Government) |
| `challenges` | Grouped problems with location, domain, and priority score |
| `challenge_reports` | Individual citizen reports with GPS, photos, and severity |
| `workspaces` | Team project spaces with tasks, milestones, and materials list |

---

## Hackathon Info

- **Event:** Smart India Hackathon 2026
- **Problem Statement ID:** 26043
- **Theme:** Agriculture, FoodTech & Rural Development
- **Nodal Body:** Government of Jharkhand
- **Category:** Software / Web Application

---

## Team

- **Project Name:** SamadhanSetu (समाधानसेतु)
- **Motto:** *"Small Problems, Big Change — Stronger Communities, Brighter India"*
