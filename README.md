# SpendWise Premium 📒✨

A high-fidelity, premium digital ledger and expense tracker built with **Flutter** and **Supabase**. It is optimized for high readability, user accessibility, and multi-device responsiveness.

<p align="center">
  <img src="logo.png" alt="SpendWise Premium Logo" width="140" style="border-radius: 28px;" />
</p>

<p align="center">
  <img src="screenshot.png" alt="SpendWise Premium Interface" width="360" />
</p>

---

## 🎨 Brand Design & Colors

SpendWise Premium uses a clean, high-contrast color scheme to ensure absolute readability:

*   **Primary Green (`#1D9E75`)** — Active states, primary buttons, and accent tabs.
*   **Danger Coral (`#E24B4A`)** — Delete flags, budget warnings, and error messages.
*   **Deep Charcoal (`#1A1A1A`)** — Main headers, labels, and text fields for clear contrast.
*   **Soft Backdrop (`#F8F9FC`)** — Clean grey scaffold background to ease eye strain.
*   **Balance Banner (`#E6F1FB`)** — Calming blue bar highlighting the grand total.

---

## 🚀 Key Features

*   **Auto-Seeding Categories** — New users are immediately set up with essential categories: **`Photos`** (seeded at the top with a camera icon), followed by `Food`, `Fuel`, and `Bills`.
*   **Zero-Amount Photo Records** — Save receipt/document photos without typing an expense amount. The app automatically assigns a micro-value (`0.01`) to bypass database constraints.
*   **Split Document Gallery** — Photo records are kept out of the main transaction list and shown in a dedicated horizontal scrollable **Record Gallery** for quick previews.
*   **Personalization Hub** — Choose custom base64 profile pictures, select dynamic currency symbols (`Rs`, `$`, `€`, `£`, `¥`), and set monthly budget limits.
*   **Adaptive Device Wrapper** — Displays the app inside a simulated phone wrapper with a top camera notch (Dynamic Island style) on large displays, scaling down dynamically to fit smaller screens.

---

## ⚙️ Quick Start Guide

### 1. Generate Platform Files
Run the following in the root directory to generate the folders (`android`, `ios`, `web`, etc.):
```bash
flutter create .
```

### 2. Configure Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of `supabase_setup.sql`, and run it.

### 3. Add Environment Keys
1. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Paste your project details:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-public-key
   ```

### 4. Build and Run
```bash
flutter pub get
flutter run
```

---

## 🧱 Tech Stack
*   **Flutter (Material 3)** — Adaptive frontend layout.
*   **Supabase** — User authentication and cloud storage.
*   **Provider** — State and setting notifications.
*   **Shared Preferences** — Offline local settings persistence.