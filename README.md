# Code Arena — DSA Pattern Mastery Tracker by Kartikay 🚀

A modern, high-performance, dynamic DSA tracker built with HTML5, Tailwind CSS, and vanilla JavaScript. Designed specifically for practicing and mastering patterns across all 500 curated LeetCode problems.

---

## 🌟 Features

1. **Complete 500 LeetCode Questions**:
   - Extracted directly from `LeetCode_500_DS_Pattern_Question_Sections.xlsx`.
   - Grouped into 17 Core Data Structures (`Arrays`, `Strings`, `Trees`, `Graphs`, `1D DP`, `2D DP`, `Binary Search`, etc.).
   - Nested by specific Algorithmic Patterns (e.g., *Sliding Window*, *Two Pointers*, *Prefix Sum*, *Kadane's Algorithm*, *Monotonic Stack*, *BFS/DFS*).

2. **Hierarchical Dropdown / Accordion**:
   - **Level 1**: Data Structure section with category completion badges and progress indicators.
   - **Level 2**: Sub-patterns dropdown with problem counters.
   - **Level 3**: Clean problem item displaying problem ID, LeetCode link, difficulty pill, and status checkbox.

3. **Realistic Fireworks Celebration 🎉**:
   - Checking a problem triggers an interactive 60fps HTML5 Canvas particle physics fireworks burst directly at the click coordinates!

4. **Real-time Statistics Dashboard**:
   - Total questions completed counter with percentage bar.
   - Detailed breakdown for **Easy**, **Medium**, and **Hard** problems solved.
   - Pick Random Unsolved Question button to beat decision fatigue.

5. **Instant Filter & Search**:
   - Real-time search by question name, pattern, or problem number (`#1`).
   - Filter by Difficulty (`Easy`, `Medium`, `Hard`) and Status (`Solved`, `Unsolved`).

6. **Local Persistence**:
   - Uses browser `localStorage` so progress is automatically preserved across refreshes.

---

## 📂 Project Structure

```
dsa-pattern-tracker/
├── index.html        # Main HTML layout and dashboard structure
├── style.css         # Custom animations, scrollbar, and canvas styling
├── app.js            # Dynamic rendering, fireworks engine, filters, storage
├── data.json         # All 500 parsed questions organized into categories & patterns
└── README.md         # Project documentation
```

---

## 🚀 How to Run

Because `app.js` loads `data.json` via standard browser `fetch()`, simply open the folder in any local server:

### Option 1: VS Code Live Server (Easiest)
1. Open this folder in **VS Code**.
2. Right-click `index.html` and click **"Open with Live Server"**.

### Option 2: Python HTTP Server
Run this one command in your terminal inside the folder:
```bash
python -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your browser.

### Option 3: Node.js (npx serve)
```bash
npx serve .
```
