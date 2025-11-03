from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_scoring import calculate_resume_score, extract_text_from_pdf

app = Flask(__name__)
CORS(app)

@app.route("/score", methods=["POST"])
def score():
    data = request.get_json()

    # Support both plain text and PDF resume
    resume_text = data.get("resume_text", "")
    job_description = data.get("job_description", "")
    resume_pdf = data.get("resume_pdf", "")

    if resume_pdf:
        resume_text = extract_text_from_pdf(resume_pdf)

    score = calculate_resume_score(resume_text, job_description)
    return jsonify({"score": score})

if __name__ == "__main__":
    app.run(debug=True)
