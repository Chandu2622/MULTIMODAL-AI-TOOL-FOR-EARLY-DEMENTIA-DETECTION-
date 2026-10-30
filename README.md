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
## Key Features
- **Dynamic Session Generation**: Every assessment session is generated on-the-fly with randomized recall word-triplets, serial math challenges, and orientation options to prevent learning/memorization biases.
- **In-Browser Audio Recording**: Direct microphone capture with real-time waveform inspection, recording controls, and multi-format audio processing (`.webm`, `.wav`).
- **Comprehensive Cognitive Domain Breakdown**:
  - Memory (Registration, Delayed Recall, Recognition)
  - Attention & Calculation (Serial Subtractions, Cancellation)
