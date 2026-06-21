# DSAForge 🛠️

**DSAForge** is a premium, full-stack, spreadsheet-like tracker and analytics dashboard for your complete DSA curriculum.

It features a comprehensive track of 455 DSA problems covering all major topics, along with a curated **DSAForge Core 250** track of essential interview questions. **DSAForge** automatically cross-references questions against the LeetCode API to map slugs, numbers, and difficulty levels, and integrates with your GitHub repositories to automatically synchronize progress and calculate streaks.

#Sample Pics
<img width="1918" height="860" alt="image" src="https://github.com/user-attachments/assets/97a9a4ce-5a8e-47d9-9435-28a640c23d63" />

<img width="1917" height="858" alt="image" src="https://github.com/user-attachments/assets/e32a719e-1cbe-479e-8a0c-3880a723eaed" />

---

## 🚀 Key Features

1. **Excel-Style AG Grid Tracker**:
   - High-performance grid that handles virtualized rendering for 450+ questions with ease.
   - Click-to-complete checkboxes that instantly update status and streaks.
   - Quick-increment/decrement revision count clickers (`-` / `+`).
   - Notion-style inline notes modal for logging algorithms, test cases, and time/space complexities.
   - Direct opening buttons to launch original LeetCode problems in a new tab.
   - Fully searchable by problem name or ID.
   - Instant toggle between the full track and the curated **DSAForge Core 250**.

2. **Scraper & Importer Service**:
   - Python parser script that imports and updates curriculum datasets.
   - Automatically cross-references LeetCode links against the official LeetCode problems API to resolve actual problem numbers and difficulties.
   - Curates exactly 250 core questions evenly spread across all categories.

3. **Analytics Dashboard**:
   - **KPI Overview**: Solved vs. remaining counts, completion percentages, and daily streaks.
   - **Streak Tracker**: Calculates both **Current Streak** (consecutive active solving days ending today or yesterday) and **Longest Streak** from history.
   - **Difficulty Breakdown**: Color-coded visualization (Easy, Medium, Hard, conceptual) with individual completion statistics.
   - **Topic Progress**: Horizontal progress bars showing question totals and percentages for each category.
   - **Recent Solves**: A timeline displaying recently completed questions.


4. **Notion/Linear Premium Styling**:
   - Styled with a dark theme utilizing deep slate and zinc colors, subtle borders, and smooth hover micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (UI Library)
- **TypeScript** (Strong typing)
- **Vite** (Fast dev server and bundler)
- **Tailwind CSS** (Modern styling and theme system)
- **AG Grid Community** (High performance data grid)
- **Lucide React** (Clean design system icons)

### Backend
- **FastAPI** (Python web framework)
- **SQLAlchemy** (Object-Relational Mapper)
- **SQLite** (Initial local database, easily upgradeable to PostgreSQL)
- **Uvicorn** (ASGI server)

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # DB connection (absolute path SQLite)
│   │   ├── models.py         # SQLAlchemy Problem schemas
│   │   ├── schemas.py        # Pydantic schemas (requests/responses)
│   │   ├── crud.py           # Database operations and streak algorithms
│   │   ├── importer.py       # Scraper/import script connecting to GitHub & LeetCode APIs
│   │   └── main.py           # FastAPI routes (CORS, CRUD wrappers)
│   ├── requirements.txt      # Python dependencies
│   └── dsaforge.db           # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx   # Topic list, views, and importer service trigger
│   │   │   ├── Dashboard.tsx # Streaks, analytics charts, and recent solves
│   │   │   ├── ProblemsGrid.tsx # Virtualized AG Grid spreadsheet
│   │   │   └── NotesModal.tsx # Form to edit review notes
│   │   ├── App.tsx           # State engine and API connector
│   │   ├── main.tsx          # React application root mount
│   │   ├── index.css         # Tailwind styles & AG Grid dark theme overrides
│   │   └── types.ts          # TypeScript interfaces
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Design system tokens configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── vite.config.ts        # Vite build properties
├── INSTALLATION.md           # Instructions to run backend & frontend
└── README.md                 # System overview (this file)
```

---

## 📊 Database Schema

The `problems` table structure is configured as follows:

| Column Name | Data Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` (PK) | Auto-increment | Unique identifier |
| `topic` | `VARCHAR` | *Required* | Categorized topic from assignment file name |
| `problem_name` | `VARCHAR` | *Required* | Problem title parsed or fetched from LeetCode |
| `leetcode_number`| `VARCHAR` | `"NA"` | LeetCode problem ID number (e.g. 1920) |
| `difficulty` | `VARCHAR` | `"NA"` | Problem difficulty (Easy, Medium, Hard, or NA) |
| `direct_url` | `VARCHAR` | `""` | Direct link to LeetCode problem page |
| `assignment_file`| `VARCHAR` | *Required* | File name from Kunal's assignments repo (e.g., `05-arrays.md`) |
| `completed` | `BOOLEAN` | `False` | Progress checkbox state |
| `revision_count` | `INTEGER` | `0` | Count of times the user has revised this problem |
| `notes` | `TEXT` | `""` | User comments and algorithmic review notes |
| `date_solved` | `VARCHAR` | `None` | ISO date of completion (YYYY-MM-DD) for streaks |
