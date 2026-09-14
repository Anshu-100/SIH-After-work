# 🌐 Impact Grid — Multilingual Civic Problem Reporting System

> A Smart India Hackathon (SIH) project that allows citizens to report civic issues in any Indian language. The system auto-detects the language, translates the complaint to English, classifies it using a trained Machine Learning model, and routes it to the appropriate authority.

---

## 📁 Project Structure

```
sih_backend_project-main/
├── frontend/                    # React + Vite (Port 5173)
│   ├── src/
│   │   ├── App.jsx              # Root router + page layout
│   │   ├── api/
│   │   │   └── axiosInstance.js # Axios with JWT interceptor
│   │   ├── pages/
│   │   │   ├── SubmitProblem.jsx
│   │   │   ├── ChallengeDetails.jsx
│   │   │   ├── Challenges.jsx
│   │   │   └── ...
│   │   └── components/
│   └── package.json
│
├── backend/                     # Node.js + Express (Port 5000)
│   ├── server.js                # Entry point
│   ├── routes/
│   │   ├── taskRoutes.js        # Problem CRUD routes
│   │   └── authRoutes.js        # Register / OTP / Login
│   ├── models/
│   │   └── Task.js              # Mongoose schema
│   ├── middlewares/
│   │   └── authMiddleware.js    # JWT verification
│   └── package.json
│
└── SIH_AI_backend/
    └── SIH_AI_backend/          # FastAPI + Python (Port 8000)
        ├── main.py              # FastAPI app entry point
        ├── build_dataset.py     # Generates training dataset (CSV)
        ├── train_models.py      # Trains and saves ML models
        ├── requirements.txt     # Python dependencies
        ├── data/
        │   └── civic_complaints.csv  # 1,550-sample training dataset
        ├── models/
        │   ├── category_model.joblib # Trained category classifier
        │   └── severity_model.joblib # Trained severity classifier
        └── services/
            ├── problem_analyzer.py   # ML inference engine
            └── config.json           # Category & keyword config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Axios |
| Node Backend | Node.js, Express 5, Mongoose, JWT, Nodemailer |
| Python AI Backend | FastAPI, Uvicorn, Scikit-learn, Hugging Face Transformers |
| Database | MongoDB Atlas |
| NLP Translation | `facebook/nllb-200-distilled-600M` (Hugging Face) |
| ML Models | TF-IDF + Calibrated Logistic Regression (joblib) |
| Language Detection | `langdetect` |

---

## ⚙️ Prerequisites

Make sure the following are installed on your machine:

- **Node.js** ≥ 18.x — [nodejs.org](https://nodejs.org)
- **Python** ≥ 3.10 — [python.org](https://python.org)
- **pip** (comes with Python)
- **MongoDB Atlas** account — [mongodb.com/atlas](https://mongodb.com/atlas)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Anshu-100/Impact---Grid.git
cd Impact---Grid/sih_backend_project-main
```

---

### 2. Environment Variables

Create `.env` files in the appropriate directories (never commit these).

#### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.lddqucu.mongodb.net/sih_project?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **How to get Gmail App Password:**
> 1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
> 2. Enable **2-Step Verification**
> 3. Go to **App Passwords** → generate one for "Mail"
> 4. Paste the 16-character password into `EMAIL_PASS`

#### `SIH_AI_backend/SIH_AI_backend/.env`
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.lddqucu.mongodb.net/sih_project?retryWrites=true&w=majority
```

#### `frontend/.env` (optional, for custom API URLs)
```env
VITE_API_URL=http://localhost:5000
```

---

### 3. MongoDB Atlas Setup

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Go to **Network Access** → **Add IP Address**
3. Add `0.0.0.0/0` to allow all IPs (for development), or add your specific IP
4. Copy your **Connection String** and paste it as `MONGO_URI` in both `.env` files

---

### 4. Install Dependencies

Open **three separate terminals** for the three services.

#### Terminal 1 — Frontend
```powershell
cd sih_backend_project-main/frontend
npm install
```

#### Terminal 2 — Node Backend
```powershell
cd sih_backend_project-main/backend
npm install
```

#### Terminal 3 — Python AI Backend
```powershell
cd sih_backend_project-main/SIH_AI_backend/SIH_AI_backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

> **Note:** Installing `torch` and `transformers` can take several minutes and requires ~3 GB of disk space. The NLLB translation model (~2.5 GB) will be downloaded on first startup.

---

### 5. Train the ML Models (First-Time Setup)

The trained model files (`*.joblib`) are NOT included in the repository (they are git-ignored). You must generate the dataset and train them locally:

```powershell
# Make sure your venv is activated
cd sih_backend_project-main/SIH_AI_backend/SIH_AI_backend

# Step 1: Generate the training dataset (creates data/civic_complaints.csv)
python build_dataset.py

# Step 2: Train and save the models (creates models/*.joblib)
python train_models.py
```

Expected output from training:
```
Category Classifier — CV Macro F1: 1.00 ± 0.00
Severity Classifier — CV Macro F1: 1.00 ± 0.00
Saved: models/category_model.joblib
Saved: models/severity_model.joblib
```

---

### 6. Run All Three Services

#### Terminal 1 — Frontend (React + Vite)
```powershell
cd sih_backend_project-main/frontend
npm run dev
```
→ Opens at **http://localhost:5173**

#### Terminal 2 — Node Backend (Express)
```powershell
cd sih_backend_project-main/backend
node server.js
```
→ Runs at **http://localhost:5000**

#### Terminal 3 — Python AI Backend (FastAPI)
```powershell
cd sih_backend_project-main/SIH_AI_backend/SIH_AI_backend
.\venv\Scripts\activate
python -m uvicorn main:app --reload --port 8000
```
→ Runs at **http://localhost:8000**

> **First startup of the AI backend** will download the `facebook/nllb-200-distilled-600M` model (~2.5 GB) from Hugging Face. Subsequent starts are fast.

---

## 🤖 AI Backend — How It Works

### `/analyze-problem` Endpoint

**Method:** `POST`  
**URL:** `http://localhost:8000/analyze-problem`  
**Body (JSON):**
```json
{ "text": "सड़क पर बड़ा गड्ढा है जिससे दुर्घटना हो सकती है" }
```

**Pipeline:**
1. **Language Detection** — `langdetect` identifies the input language (Hindi, Tamil, etc.)
2. **Translation** — NLLB-200 model translates non-English text to English
3. **ML Classification** — TF-IDF + Logistic Regression predicts:
   - **Category** (e.g., `Roads`, `Water`, `Electricity`)
   - **Severity** (e.g., `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
4. **Rule-based Enrichment** — Identifies problem subtype and affected group
5. **MongoDB Save** — Stores the full result in the `problems` collection

**Sample Response:**
```json
{
  "language": "Hindi",
  "category": "Roads",
  "category_confidence": 0.97,
  "problem_type": "Pothole Issue",
  "severity": "HIGH",
  "severity_confidence": 0.88,
  "affected_group": "General Public",
  "impact_level": "HIGH",
  "required_skills": ["Civil Engineering", "Road Safety"],
  "summary": "This is a pothole issue under the Roads category affecting general public.",
  "overall_confidence": 0.74,
  "model_pipeline": "Machine Learning (TF-IDF + Calibrated Logistic Regression)",
  "original_text": "सड़क पर बड़ा गड्ढा है...",
  "translated_text": "There is a big pothole on the road...",
  "language_code": "hi",
  "problem_id": "64abc123..."
}
```

### ML Model Details

| Property | Category Model | Severity Model |
|---|---|---|
| Algorithm | TF-IDF + Logistic Regression | TF-IDF + Logistic Regression |
| TF-IDF features | Unigrams + Bigrams, sublinear_tf | Unigrams + Bigrams, sublinear_tf |
| Regularization | C = 5.0 | C = 3.0 |
| Class weighting | balanced | balanced |
| Training samples | 1,550 | 1,550 |
| Cross-val (5-fold) F1 | 1.00 ± 0.00 | 1.00 ± 0.00 |

**Supported Categories:** Roads, Water Supply, Electricity, Sanitation, Healthcare, Education, Public Safety, Environment, Housing, Infrastructure

**Supported Severities:** CRITICAL, HIGH, MEDIUM, LOW

> If `.joblib` model files are missing, the system **automatically falls back** to rule-based keyword matching — no crash occurs.

---

## 🔐 Authentication Flow

1. **Register** — `POST /api/auth/register` with `{ name, email, password }`
2. **OTP Sent** — A 6-digit OTP is emailed via Gmail SMTP (if Gmail fails, OTP is printed to the Node terminal as a fallback)
3. **Verify OTP** — `POST /api/auth/verify-otp` with `{ email, otp }`
4. **Login** — `POST /api/auth/login` → returns a JWT token
5. **Authenticated Requests** — Include `Authorization: Bearer <token>` header (handled automatically by `axiosInstance.js`)

---

## 🛣️ API Reference

### Node Backend (Port 5000)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user + send OTP |
| `POST` | `/api/auth/verify-otp` | ❌ | Verify OTP to activate account |
| `POST` | `/api/auth/login` | ❌ | Login and get JWT |
| `POST` | `/api/auth/logout` | ❌ | Logout |
| `GET` | `/api/tasks` | ❌ | List all public challenges |
| `GET` | `/api/tasks/:id` | ❌ | Get a specific challenge |
| `POST` | `/api/tasks` | ✅ | Create a new challenge |
| `PUT` | `/api/tasks/:id` | ✅ | Update a challenge |
| `DELETE` | `/api/tasks/:id` | ✅ | Delete a challenge |
| `GET` | `/api/tasks/my/:id` | ✅ | Get user's own challenge |

### Python AI Backend (Port 8000)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/analyze-problem` | Analyze and classify a civic complaint |
| `GET` | `/docs` | Auto-generated Swagger UI |
| `GET` | `/redoc` | ReDoc API documentation |

---

## 🧪 Testing the AI Backend

You can test the `/analyze-problem` endpoint directly from your browser at:

```
http://localhost:8000/docs
```

Or via `curl`:

```bash
curl -X POST http://localhost:8000/analyze-problem \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"The water supply has been cut off for 3 days. People are suffering.\"}"
```

---

## 📦 Re-training the Models

To retrain models with more data or different parameters:

```powershell
cd sih_backend_project-main/SIH_AI_backend/SIH_AI_backend
.\venv\Scripts\activate

# Regenerate dataset (optional — only if you want more samples)
python build_dataset.py

# Retrain models
python train_models.py
```

The new `.joblib` files will overwrite the old ones in `models/`. Restart the AI backend to pick up the new models.

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|---|---|
| `MongoServerError: bad auth` | Check `MONGO_URI` in `.env`; ensure Atlas IP whitelist includes your IP |
| OTP email not received | Check Node terminal — OTP is printed there as fallback. Check `EMAIL_USER` / `EMAIL_PASS` in `.env` |
| `ML models not found` | Run `python train_models.py` first |
| AI backend slow to start | First start downloads the NLLB model (~2.5 GB). Wait for "Multilingual AI model loaded!" |
| CORS error in browser | Make sure all 3 servers are running on ports 5173, 5000, and 8000 |
| `ModuleNotFoundError` in Python | Activate venv: `.\venv\Scripts\activate`, then `pip install -r requirements.txt` |
| `JWT_SECRET` not set | Add `JWT_SECRET=<any-long-random-string>` to `backend/.env` |

---

## 🗂️ Git & Secrets

The following are **git-ignored** and must be created manually:

- `backend/.env`
- `SIH_AI_backend/SIH_AI_backend/.env`
- `frontend/.env`
- `node_modules/`
- `venv/`
- `models/*.joblib` (regenerate via `train_models.py`)
- `data/*.csv` (regenerate via `build_dataset.py`)
- `__pycache__/`

---

## 👥 Team & Repository

- **GitHub:** [https://github.com/Anshu-100/Impact---Grid](https://github.com/Anshu-100/Impact---Grid)
- **Project:** Smart India Hackathon (SIH) — Civic Issue Reporting System

---

## 📄 License

This project is developed for the Smart India Hackathon. All rights reserved.

