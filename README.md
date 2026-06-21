# DSAForge 🛠️

**DSAForge** is a premium, full-stack, spreadsheet-like tracker and analytics dashboard for your complete DSA curriculum.

It features a comprehensive track of 455 DSA problems from Striver's A2Z DSA curriculum. **DSAForge** automatically cross-references questions against the LeetCode API to map slugs, numbers, and difficulty levels, and integrates with your GitHub repositories to automatically synchronize progress and calculate streaks. The SQLite database comes pre-seeded out of the box for quick setup.

#Sample Pics
<img width="1918" height="860" alt="image" src="https://github.com/user-attachments/assets/97a9a4ce-5a8e-47d9-9435-28a640c23d63" />

<img width="1917" height="858" alt="image" src="https://github.com/user-attachments/assets/e32a719e-1cbe-479e-8a0c-3880a723eaed" />

---

## 🚀 Key Features

1. **Excel-Style AG Grid Tracker**:
   - High-performance grid that handles virtualized rendering for all 455 questions with ease.
   - Click-to-complete checkboxes that instantly update status and streaks.
   - Quick-increment/decrement revision count clickers (`-` / `+`).
   - Notion-style inline notes modal for logging algorithms, test cases, and time/space complexities.
   - Direct opening buttons to launch original LeetCode problems in a new tab.
   - Fully searchable by problem name or ID.

2. **Scraper & Importer Service**:
   - Python parser script that imports and updates curriculum datasets.
   - Automatically cross-references LeetCode links against the official LeetCode problems API to resolve actual problem numbers and difficulties.

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
- **React 19** (Modern UI Library)
- **TypeScript** (Strong typing)
- **Vite v8** (Next-generation build tool)
- **Tailwind CSS v4** (High-performance utility styling)
- **AG Grid Community v35** (State-of-the-art virtualized data grid using Quartz themes)
- **Lucide React** (Clean design system icons)

### Backend
- **FastAPI** (Python web framework)
- **SQLAlchemy** (Object-Relational Mapper)
- **SQLite** (Pre-seeded database tracked in Git for plug-and-play setup)
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
| `leetcode_number`| `VARCHAR` | `"NA"` | LeetCode problem ID number (e.g. 1) |
| `difficulty` | `VARCHAR` | `"NA"` | Problem difficulty (Easy, Medium, Hard, or NA) |
| `direct_url` | `VARCHAR` | `""` | Direct link to LeetCode problem page |
| `assignment_file`| `VARCHAR` | *Required* | Curriculum track file name (e.g., `01-basics.md`) |
| `completed` | `BOOLEAN` | `False` | Progress checkbox state |
| `revision_count` | `INTEGER` | `0` | Count of times the user has revised this problem |
| `notes` | `TEXT` | `""` | User comments and algorithmic review notes |
| `date_solved` | `VARCHAR` | `None` | ISO date of completion (YYYY-MM-DD) for streaks |
| `is_top_250` | `BOOLEAN` | `False` | Flag identifying if problem belongs to curated subset |
