# 💼 role based - AI Job Role Matcher (MERN Stack)

Welcome to **role based**, an AI-powered career intelligence platform designed to bridge the gap between your skills and your dream job.

## 🚀 Vision
Built for students and job seekers, this MERN application uses **Retrieval-Augmented Generation (RAG)** and the **Groq API** (Llama 3.1) to analyze resumes with pinpoint accuracy.

---

## 🛠️ Features
- **Modern UI/UX**: Premium dark-mode glassmorphism, responsive dashboard.
- **RAG-based Analysis**: Splits resumes into chunks for contextual retrieval using LangChain.
- **AI Matching Engine**: Powered by Groq for lightning-fast matching scores (%).
- **Skill Gap Analysis**: Identifies matching skills and critical missing competencies.
- **Growth Roadmap**: Personalized interactive learning path generation.
- **Safe & Secure**: JWT-based authentication and secure file processing.

---

## 📂 Project Structure
```bash
/client   # Vite + React.js + Tailwind CSS
/server   # Node.js + Express.js + MongoDB
/models   # MongoDB Schemas (User)
/routes   # API Endpoints (Auth, Resume)
/utils    # RAG Logic & PDF Parsing
```

---

## 🛠️ Installation & Setup

### 1. Backend Setup
1. Go to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Configure `.env` (Rename `.env.example` to `.env` and add your **GROQ_API_KEY**)
4. Start the server: `node index.js`

### 2. Frontend Setup
1. Go to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### 3. Usage
- Register and Login using your credentials.
- Navigate to the dashboard.
- Enter your **Name**, **Age**, and **Target Job Role**.
- Upload your **Resume (PDF)**.
- Hit **Analyze** and explore your career insights!

---

## ⚡ Tech Stack Details
- **Frontend**: Vite, React, Tailwind CSS, Lucide, Framer Motion.
- **Backend**: Express, mongoose, JWT, Bcrypt, Multer, PDF-Parse.
- **AI Logic**: Langchain, Memory Vector Store, Groq SDK.
