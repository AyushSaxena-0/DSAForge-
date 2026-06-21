# Installation & Run Guide 🚀

Follow these steps to set up and run the **DSAForge** web application locally.

---

## ⚡ Quick Start (PowerShell Automation)

If you are on Windows, you can start both the backend and frontend with a single command:

1. Double-click or run the `run.ps1` script:
   ```powershell
   ./run.ps1
   ```
   This will spin up the FastAPI server, start the Vite development server, and automatically open [http://localhost:5173](http://localhost:5173) in your default browser.

---

## 📋 Prerequisites

Before getting started, make sure you have the following installed:
- **Python 3.10+** (pip included)
- **Node.js 18+** (npm included)

---

## 💾 Part 1: Backend Setup (FastAPI & SQLite)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install the Python dependencies (ensure you have the latest packages, especially if using pre-releases like Python 3.14):
   ```bash
   pip install -r requirements.txt
   ```
   *Note: If requirements.txt has compilation issues on your Python version, simply run:*
   ```bash
   pip install fastapi uvicorn sqlalchemy requests pydantic
   ```

3. Run the parser and importer script to seed your database with the bootcamp assignments:
   ```bash
   python app/importer.py
   ```
   This will download the assignments from the GitHub repository, fetch LeetCode metadata, and initialize the SQLite database (`dsaforge.db`).

4. Launch the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend API will be available at [http://localhost:8000](http://localhost:8000). You can view the interactive swagger documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🌐 Part 2: Frontend Setup (Vite React & Tailwind)

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install the Node packages:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided in the console (usually [http://localhost:5173](http://localhost:5173)).

---

## 🛢️ Upgrading to PostgreSQL

To swap from local SQLite to PostgreSQL:

1. Install the PostgreSQL database driver in Python:
   ```bash
   pip install psycopg2-binary
   ```

2. Set the `DATABASE_URL` environment variable before running the importer or starting the server.

   **On Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL="postgresql://username:password@localhost:5432/dsaforge"
   ```

   **On Linux / macOS:**
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/dsaforge"
   ```

3. Run `python app/importer.py` to initialize tables and import the bootcamp assignments into the PostgreSQL database.
4. Launch uvicorn again. The application will dynamically connect to PostgreSQL.
