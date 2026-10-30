# MindTrack: Multimodal Early Dementia Detection Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**MindTrack** is an AI-powered, self-administered web platform designed for the early screening and risk assessment of cognitive impairment and dementia. By integrating **speech acoustic biomarkers** with digitized **standardized clinical cognitive tests**, MindTrack delivers accessible, multi-modal cognitive evaluations directly from a web browser.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Machine Learning Models & Weights](#machine-learning-models--weights)
- [Clinical Protocols Implemented](#clinical-protocols-implemented)
- [API Reference](#api-reference)
- [Security, Privacy & Medical Disclaimer](#security-privacy--medical-disclaimer)
- [License](#license)

---

## Overview

Traditional dementia screening often involves lengthy clinical appointments, high costs, and specialized clinical personnel. MindTrack bridges this gap by enabling high-frequency, non-invasive digital screening:

1. **Acoustic & Speech Analysis**: Collects natural audio samples using the standardized *Cookie Theft* picture description task to compute speech rate, pause ratios, pitch variability, and linguistic markers.
2. **Digitized Neuropsychological Tests**: Dynamically generates randomized sessions covering MMSE, CDR-SB, and ADAS-Cog protocols.
3. **Multi-Modal Decision Fusion**: Combines acoustic signals (40% weight) with cognitive domain scores (60% weight) to produce a calibrated risk classification (Low, Moderate, High) alongside cognitive domain health breakdowns.

---

## Key Features

- **Dynamic Session Generation**: Every assessment session is generated on-the-fly with randomized recall word-triplets, serial math challenges, and orientation options to prevent learning/memorization biases.
- **In-Browser Audio Recording**: Direct microphone capture with real-time waveform inspection, recording controls, and multi-format audio processing (`.webm`, `.wav`).
- **Comprehensive Cognitive Domain Breakdown**:
  - Memory (Registration, Delayed Recall, Recognition)
  - Attention & Calculation (Serial Subtractions, Cancellation)
  - Language & Comprehension (Object Naming, Responsive Speech, Word Finding)
  - Temporal & Spatial Orientation
  - Executive Function & Visuospatial Praxis
- **Interactive Patient & Clinician Dashboard**:
  - Overall Cognitive Health index and Risk Gauges
  - Longitudinal assessment history and trend charts (via Recharts)
  - Domain-specific radar analysis
  - Clinician summary reports and recommended lifestyle/medical next steps
- **Secure Authentication & Onboarding**:
  - JWT bearer token authentication and bcrypt password hashing
  - Demographic profiling (Age, Education, Native Language, Baseline Concerns)
  - Email-based OTP password recovery (SMTP)

---

## Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                  React 19 + Vite Frontend                │
   │  (Wizard UI, Audio Recorder, Charts, User Dashboard)    │
   └────────────────────────────┬────────────────────────────┘
                                │ REST API (JSON / FormData)
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    FastAPI Backend                      │
   │  (JWT Auth, Session Generator, Email OTP, API Routers)  │
   └───────────────┬─────────────────────────┬───────────────┘
                   │                         │
                   ▼                         ▼
   ┌───────────────────────────────┐ ┌───────────────────────┐
   │    Speech Biomarker Pipeline   │ │  Cognitive ML Engine  │
   │  - Audio Feature Extraction   │ │  - Interaction Ratios │
   │    (Librosa, SoundFile)       │ │  - Scaler & Classifiers│
   │  - speech_model.pkl           │ │  - cognitive_model.pkl│
   └───────────────┬───────────────┘ └───────────┬───────────┘
                   │                             │
                   └──────────────┬──────────────┘
                                  ▼
                     ┌─────────────────────────┐
                     │ Weighted Fusion Engine  │
                     │  (Overall Risk & Tier)  │
                     └─────────────────────────┘
```

- **Frontend**: React 19, Vite, React Router v7, Recharts, Lucide React, HTML5 Audio API.
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Passlib (bcrypt), SQLAlchemy.
- **Data Science & ML**: Scikit-Learn, XGBoost, LightGBM, Pandas, NumPy, Librosa, SoundFile, PyDub.

---

## Repository Structure

```
.
├── backend/
│   ├── data/                 # Session templates, word banks, and data helpers
│   │   ├── db.py             # Data access layer
│   │   ├── question_templates.py
│   │   └── word_bank.py
│   ├── db/                   # Database models & engine configurations
│   ├── models/               # ML feature engineering & scoring pipelines
│   │   ├── cognitive_model.py
│   │   ├── speech_model.py
│   │   └── combiner.py
│   ├── routers/              # FastAPI Route Handlers
│   │   ├── cognitive.py      # Cognitive test submissions
│   │   ├── predict.py        # Fusion prediction endpoint
│   │   ├── session.py        # Randomized test session generator
│   │   ├── speech.py         # Audio processing & speech submission
│   │   └── users.py          # Authentication, Profile & OTP
│   ├── utils/                # Auth, JWT, and SMTP email helpers
│   ├── weights/              # ML model checkpoints (.gitkeep)
│   ├── .env.example          # Environment variables template
│   ├── config.py             # Pydantic application settings
│   ├── main.py               # FastAPI application entrypoint
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── public/               # Static assets & Cookie Theft stimuli image
│   ├── src/
│   │   ├── api/              # Axios / Fetch API client
│   │   ├── components/       # Reusable UI components (AudioRecorder, RiskGauge, Layout)
│   │   ├── pages/            # View pages (Dashboard, TestFlow, Results, Auth, etc.)
│   │   ├── App.jsx           # Application routing
│   │   └── main.jsx          # React DOM entry point
│   ├── .env.example          # Frontend environment variables template
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.js        # Vite build configuration
├── .gitignore                # Protects credentials, sensitive data & large weights
└── README.md
```

---

## Prerequisites

- **Python**: Version `3.11` or higher
- **Node.js**: Version `18.x` or higher (with `npm` or `yarn`)
- **Git**: Installed and configured on your machine

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/mindtrack.git
cd mindtrack
```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env     # On Windows: copy .env.example .env
   ```
   Edit `.env` to configure your SMTP settings for password reset emails:
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

5. **Start the FastAPI backend server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API endpoints will be live at `http://localhost:8000`.
   - Interactive Swagger API docs: `http://localhost:8000/docs`.

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node packages**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env     # On Windows: copy .env.example .env
   ```
   Ensure `VITE_API_URL` points to your backend:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## Machine Learning Models & Weights

MindTrack utilizes two machine learning models located in `backend/weights/`:
- `cognitive_model.pkl` (~177 MB): Gradient-boosted / ensemble model trained on cognitive assessment scores and interaction ratios.
- `speech_model.pkl` (~8.8 MB): Acoustic and linguistic classification model.

> **Note on GitHub Push**:
> GitHub enforces a strict **100 MB single-file limit**. As a result, `.pkl` files in `backend/weights/` are excluded by `.gitignore` to prevent push errors.
>
> - **Graceful Fallback**: If weight files are absent, the platform automatically runs in fallback/mock assessment mode so that all tests, UI components, and test flows function seamlessly without crashing.
> - **Hosting Weights**: To use the full pre-trained models in production, upload your `.pkl` files to **GitHub Releases**, **Hugging Face**, or a secure cloud bucket, and place them into `backend/weights/`.
> - **Git LFS (Alternative)**: If you prefer tracking the models via Git, configure [Git LFS](https://git-lfs.com/):
>   ```bash
>   git lfs install
>   git lfs track "backend/weights/*.pkl"
>   git add .gitattributes
>   ```

---

## Clinical Protocols Implemented

1. **MMSE (Mini-Mental State Examination)**
   - 3-word registration & delayed recall
   - Serial 7s / attention math calculation
   - Orientation to time (Year, Season)
   - Object naming and phrase repetition
2. **CDR-SB (Clinical Dementia Rating Sum of Boxes)**
   - Functional memory evaluation
   - Judgment and problem solving
   - Community affairs and home hobbies
3. **ADAS-Cog (Alzheimer's Disease Assessment Scale–Cognitive)**
   - Constructional & ideational praxis
   - Word recognition task
   - Spoken language ability and word-finding evaluation
4. **Cookie Theft Picture Description Task**
   - Standardized narrative speech assessment protocol from the *Boston Diagnostic Aphasia Examination*.

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/users/register` | Register new user account |
| `POST` | `/users/login` | Authenticate and obtain JWT access token |
| `POST` | `/users/forgot-password` | Send OTP for password recovery |
| `POST` | `/users/reset-password` | Verify OTP and reset password |
| `POST` | `/session/create` | Generate a fresh randomized assessment session |
| `POST` | `/submit/speech` | Upload audio and speech transcript for feature extraction |
| `POST` | `/submit/cognitive` | Submit raw answers for MMSE, CDR-SB, and ADAS-Cog |
| `POST` | `/predict/` | Compute fused multi-modal risk score and domain health |

Interactive documentation is available at `http://localhost:8000/docs` when running the backend.

---

## Security, Privacy & Medical Disclaimer

### Privacy & Data Protection
- Local test data containing personal identifiable information (PII) is kept off version control via `.gitignore`.
- Password hashes are encrypted using `bcrypt`.
- Secret keys and email credentials must never be committed to source control; always use `.env` files.

### Medical Disclaimer
> **IMPORTANT**: MindTrack is designed as a digital health research and pre-screening prototype. It is **not** a diagnostic medical device and does not replace formal clinical diagnosis by a licensed neurologist, geriatrician, or psychologist. Anyone with cognitive concerns should consult a qualified healthcare professional.

---

## License

This project is licensed under the [MIT License](LICENSE).
