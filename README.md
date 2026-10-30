# Early Dementia Detection Platform

A self-administered, web-based platform for early dementia detection. It collects speech and cognitive assessments interactively and processes them using mock machine learning endpoints.

## Project Structure
- `backend/`: FastAPI application containing dynamic test generation and ML mock endpoints.
- `frontend/`: React.js (Vite) application providing the interactive testing interface.

## Prerequisites
- Node.js (v18+)
- Python (v3.11+)

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend will be available at `http://localhost:8000`. API documentation is automatically generated at `http://localhost:8000/docs`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` (or the port specified by Vite).

## Features
- **Dynamic Test Generation**: Each session receives a freshly randomized set of tasks for speech and cognitive assessment.
- **Audio Recording**: Built-in support for capturing speech samples directly from the browser.
- **Responsive UI**: Accessible, step-by-step wizard matching clinical protocol standards.
- **Local Storage**: Data is seamlessly saved to `users.json` for easy local development without an external database.
