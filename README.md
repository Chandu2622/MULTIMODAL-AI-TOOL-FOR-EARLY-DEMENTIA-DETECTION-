 Early Dementia Detection Platform
# MindTrack: Multimodal Early Dementia Detection Platform
A self-administered, web-based platform for early dementia detection. It collects speech and cognitive assessments interactively and processes them using mock machine learning endpoints.
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
## Project Structure
- `backend/`: FastAPI application containing dynamic test generation and ML mock endpoints.
- `frontend/`: React.js (Vite) application providing the interactive testing interface.
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
   The backend will be available at `http://localhost:8000`. API documentation is automatically generated at `http://localhost:8000/docs`.
   - API endpoints will be live at `http://localhost:8000`.
   - Interactive Swagger API docs: `http://localhost:8000/docs`.
### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
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
3. Start the development server:
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
   The frontend will be available at `http://localhost:5173` (or the port specified by Vite).
   Open your browser at `http://localhost:5173`.

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
