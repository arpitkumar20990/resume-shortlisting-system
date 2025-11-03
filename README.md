# 🤖 ML-Based Resume Shortlisting System

An intelligent web application that automatically ranks jobseekers based on the similarity between their resumes and a recruiter’s job description.  
It uses **Machine Learning (TF-IDF + Cosine Similarity)** for text matching, a **Flask backend** for processing, and a **localStorage-based frontend** (HTML/CSS/JS) for user management.

---

## 🧩 Overview

Recruiters spend hours manually reviewing resumes.  
This system automates shortlisting by analyzing resumes and ranking candidates by their relevance to the given job description — making the hiring process faster and smarter.

---

## ✨ Features

### 👩‍💼 Jobseeker
- Create, edit, and delete your profile.
- Upload resume (PDF format).
- Profile and resume stored securely in **browser localStorage**.

### 🧑‍💻 Recruiter
- Login and filter candidates by **skills** and **experience (dropdown)**.
- Enter a **job description** and get **ranked jobseekers**.
- Ranking powered by ML model hosted in Flask.

### 🧠 Machine Learning
- Uses **TF-IDF Vectorization** + **Cosine Similarity** to calculate match score.
- Automatically extracts text from PDF resumes using **PyPDF2**.



## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | HTML, CSS, JavaScript, LocalStorage |
| **Backend** | Python, Flask, Flask-CORS |
| **ML/NLP** | scikit-learn (TF-IDF, Cosine Similarity), PyPDF2 |
| **Environment** | VS Code, Live Server, Python 3.10+ |

## ⚙️ Installation & Setup (How to Run the Project)

Follow these steps carefully 👇

### 1️⃣ Prerequisites
- **Python 3.8+**
- **VS Code** (with Live Server extension)
- Any modern browser (Chrome, Edge, Firefox)

---

### 2️⃣ Clone or Copy the Project
If downloaded as a ZIP, extract it.  
Otherwise, clone from GitHub:
```bash
git clone https://github.com/arpitkumar20990/resume-shortlisting-system.git
cd resume-shortlisting-system
```

3️⃣ Set Up the Backend (Flask ML API)
---
Open a terminal in the backend/ folder and run:
```bash
cd backend
pip install flask flask-cors scikit-learn PyPDF2
python app.py
```
Output Example:
---
```bash
 * Running on http://127.0.0.1:5000 (Press CTRL+C to quit)
 ```


Keep this terminal window running — it hosts the ML API.

4️⃣ Run the Frontend
---
Open frontend/ folder in VS Code.

Right-click on index.html → “Open with Live Server”.

It will open in your browser at:
```bash
http://127.0.0.1:5500/frontend/index.html
```

5️⃣ Using the Application
---
### 👩‍💼 Jobseeker Side:

- Click Jobseeker Login → Create an account.

- Fill in profile details, select experience from dropdown, and upload your PDF resume.

- Profile is stored in your browser (no external server).

- You can edit or delete your profile anytime.

### 🧑‍💻 Recruiter Side:

- Click Recruiter Login → Sign up / Login.

- Enter required skills and experience filters.

- Type in a job description.

- The system calls the Flask backend to calculate a resume score for each jobseeker.

- Candidates are displayed ranked by similarity score (0-100%).

# 🧮 How the ML Model Works

1.  Resume Text Extraction (PyPDF2)

Converts uploaded Base64 PDF resume to text.

2. TF-IDF Vectorization

Converts both the job description and resume text into numerical vectors.

3. Cosine Similarity Calculation

Measures how close the resume and job description vectors are.

Produces a score between 0 and 100.

#### Formula Example:

```bash
Score = Cosine_Similarity(TFIDF(Resume), TFIDF(JobDescription)) × 100
````


## 💬Acknowledgements

 - [Flask](https://flask.palletsprojects.com/en/stable/)
 - [scikit-learn](https://scikit-learn.org/stable/)
 - [PyPDF2](https://pypi.org/project/PyPDF2/)
