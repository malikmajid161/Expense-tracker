# 🚀 Viva Cheat Sheet: Expense Tracker (My Khata)
*Complete Technical Breakdown & Interview Guide*

---

## 1. Overall Architecture & Tech Stack
- **Frontend:** Flutter & Dart (Cross-platform UI)
- **Backend (BaaS):** Supabase (PostgreSQL Database, Authentication)
- **State Management:** Provider Pattern
- **Local Storage:** SharedPreferences (For offline caching & settings)
- **Environment Management:** `flutter_dotenv` (for safely hiding API keys)

---

## 2. Project Directory Structure
| Directory / File | Purpose |
| :--- | :--- |
| `lib/main.dart` | Entry point of the app. Initializes Supabase, loads `.env` file, and injects Providers. |
| `lib/models/` | Data structures (e.g., `Expense`, `Category`) that represent database rows. |
| `lib/providers/` | State Management logic (`auth_provider.dart`, `expense_provider.dart`). |
| `lib/screens/` | UI Views/Pages (Login, Dashboard, Profile, Add Expense, etc.). |
| `lib/services/` | Backend API communication files (Supabase setup, DB queries, Auth). |
| `lib/theme/` | Global colors, fonts, and styling for consistent UI design. |
| `.env` | Hidden file containing secure **Supabase URL** and **Anon Key**. |

---

## 3. State Management (Provider)
**Question: "Which state management did you use and why?"**
> **Answer:** "I used the **Provider** package. It separates the Business Logic from the UI. Instead of using `setState()` everywhere (which rebuilds the whole screen and makes the app slow), Provider uses `ChangeNotifier`. When data changes (like adding a new expense), it calls `notifyListeners()`, which updates *only* the specific widgets listening to that data. It makes the code clean and memory efficient."

- `AuthProvider`: Manages login state, current user, budget limit, and currency.
- `ExpenseProvider`: Manages the list of expenses, calculates total spending, and fetches categories.

---

## 4. Database & Authentication (Supabase)
**Question: "How did you connect the database and authentication?"**
> **Answer:** "I used **Supabase**, an open-source Firebase alternative based on PostgreSQL. The connection is established in `lib/main.dart` by calling `Supabase.initialize()`. We pass it our Supabase URL and Anon Key, which are safely read from the `.env` file. For authentication, Supabase handles JWT tokens automatically."

### Where is the Backend Code written?
| File | What it does |
| :--- | :--- |
| `supabase_service.dart` | Core connection setup. Reads the API keys and exposes the global `SupabaseClient`. |
| `auth_service.dart` | Handles Supabase Auth commands like `signIn()`, `signUp()`, and `signOut()`. |
| `database_service.dart` | Writes/Reads SQL data from the Supabase PostgreSQL database tables (e.g. inserting an expense). |

---

## 5. Screens & Widget Breakdown
*The UI is composed of 6 main screens and roughly dozens of custom widgets.*

- `auth_gate.dart`: A smart widget that listens to auth state. If the user is logged in, it shows the Dashboard. If logged out, it shows Login.
- `login_screen.dart`: UI with text fields for Email/Password, handles Auth exceptions, and includes an Offline Demo mode.
- `dashboard_screen.dart`: The main home page. Shows pie charts, summary cards, and the list of recent expenses.
- `add_expense_screen.dart`: A form with amount, title, date picker, and category dropdown to insert data into Supabase.
- `profile_screen.dart`: User settings. Saves Display Name and Budget Limit immediately when tapping outside the text boxes.
- `category_detail_screen.dart`: Shows all expenses filtered by a specific category.

---

## 6. VS Code / IDE Shortcut Cheat Sheet
| Shortcut (Windows) | What it does (Tell the teacher!) |
| :--- | :--- |
| `Ctrl + P` | **Quick Open File:** Instantly search and jump to any file by name. |
| `Ctrl + Shift + F` | **Global Search:** Search for a specific word or function across the entire project. |
| `F12` (or Ctrl + Click) | **Go to Definition:** Click on any function or widget to jump to exactly where it is written. |
| `Alt + Shift + F` | **Format Document:** Automatically indents and beautifies the Flutter code. |
| `Ctrl + .` (Dot) | **Quick Fix / Refactor:** Wrap a widget in a Container, Column, or Padding instantly. |
