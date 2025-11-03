import base64
import io
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def extract_text_from_pdf(base64_data):
    """Decode base64 PDF and extract text"""
    try:
        if not base64_data:
            return ""
        # Remove prefix if present
        if base64_data.startswith("data:application/pdf;base64,"):
            base64_data = base64_data.split(",")[1]

        pdf_bytes = base64.b64decode(base64_data)
        pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        print("PDF extraction error:", e)
        return ""

def calculate_resume_score(resume_text, job_description):
    """Calculate TF-IDF similarity score"""
    if not resume_text or not job_description:
        return 0
    try:
        texts = [resume_text, job_description]
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform(texts)
        score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100
        return round(score, 2)
    except Exception as e:
        print("Scoring error:", e)
        return 0
