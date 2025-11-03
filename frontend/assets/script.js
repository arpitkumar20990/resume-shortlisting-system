// -----------------------------------------
// Common Utility Functions
// -----------------------------------------
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

function getExperienceValue(exp) {
  if (!exp) return 0;
  if (exp.includes("+")) return parseInt(exp);
  const [min, max] = exp.split("-").map(Number);
  return (min + max) / 2;
}

function openResume(base64Data) {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl);
}

// -----------------------------------------
// Authentication (Login / Signup)
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("index.html")) {
    setupLoginSignup();
  } else if (path.endsWith("jobseeker.html")) {
    setupJobseekerProfile();
  } else if (path.endsWith("jobseeker-home.html")) {
    loadJobseekerHome();
  } else if (path.endsWith("recruiter.html")) {
    setupRecruiterPage();
  }
});

function setupLoginSignup() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => login("login"));
  }
  if (signupBtn) {
    signupBtn.addEventListener("click", () => login("signup"));
  }
}

function login(action) {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked').value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (action === "signup") {
    if (users[email]) {
      alert("User already exists!");
      return;
    }
    users[email] = { password, role };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please login.");
  } else {
    if (!users[email] || users[email].password !== password) {
      alert("Invalid credentials!");
      return;
    }
    localStorage.setItem("loggedInUser", JSON.stringify({ email, role }));
    if (role === "recruiter") {
      window.location.href = "recruiter.html";
    } else {
      const profiles = JSON.parse(localStorage.getItem("profiles_jobseeker")) || {};
      if (profiles[email]) {
        window.location.href = "jobseeker-home.html";
      } else {
        window.location.href = "jobseeker.html";
      }
    }
  }
}

// -----------------------------------------
// Jobseeker Profile Setup
// -----------------------------------------
function setupJobseekerProfile() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return (window.location.href = "index.html");

  document.getElementById("user-email").innerText = user.email;
  document.getElementById("logout").addEventListener("click", logout);
  document.getElementById("save-profile").addEventListener("click", saveJobseekerProfile);
}

function saveJobseekerProfile() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const email = user.email;

  const name = document.getElementById("name").value;
  const location = document.getElementById("location").value;
  const skills = document.getElementById("skills").value;
  const experience = document.getElementById("experience")
    ? document.getElementById("experience").value
    : "0";
  const bio = document.getElementById("bio").value;
  const resumeFile = document.getElementById("resume-file").files[0];

  if (!name || !skills || !bio) {
    alert("Please fill in all fields.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const profiles = JSON.parse(localStorage.getItem("profiles_jobseeker")) || {};
    profiles[email] = { name, location, skills, bio, experience, resume: e.target.result };
    localStorage.setItem("profiles_jobseeker", JSON.stringify(profiles));
    alert("Profile saved successfully!");
    window.location.href = "jobseeker-home.html";
  };
  if (resumeFile) reader.readAsDataURL(resumeFile);
  else reader.onload({ target: { result: "" } });
}

// -----------------------------------------
// Jobseeker Home (View/Edit/Delete)
// -----------------------------------------
function loadJobseekerHome() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return (window.location.href = "index.html");

  const email = user.email;
  const profiles = JSON.parse(localStorage.getItem("profiles_jobseeker")) || {};
  const profile = profiles[email];

  if (!profile) {
    alert("Profile not found!");
    return (window.location.href = "jobseeker.html");
  }

  document.getElementById("js-email").innerText = email;
  document.getElementById("name").innerText = profile.name;
  document.getElementById("location").innerText = profile.location;
  document.getElementById("skills").innerText = profile.skills;
  document.getElementById("experience").innerText = profile.experience || "N/A";
  document.getElementById("bio").innerText = profile.bio;

  const resumeLink = document.getElementById("resume-link");
  if (profile.resume) {
    resumeLink.addEventListener("click", () => openResume(profile.resume));
  } else {
    resumeLink.innerText = "No Resume Uploaded";
  }

  document.getElementById("logout").addEventListener("click", logout);
  document.getElementById("edit-btn").addEventListener("click", () => {
    window.location.href = "jobseeker.html";
  });
  document.getElementById("delete-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your profile?")) {
      delete profiles[email];
      localStorage.setItem("profiles_jobseeker", JSON.stringify(profiles));
      alert("Profile deleted!");
      window.location.href = "jobseeker.html";
    }
  });
}

// -----------------------------------------
// Recruiter Dashboard (Search + ML Scoring)
// -----------------------------------------

async function fetchResumeScore(resumeText, jobDesc, resumePdf = "") {
  try {
    const res = await fetch("http://127.0.0.1:5000/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDesc, resume_pdf: resumePdf }),
    });
    const data = await res.json();
    return data.score || 0;
  } catch (err) {
    console.error("Error fetching score:", err);
    return 0;
  }
}


async function loadJobseekersWithFilters() {
  const table = document.querySelector("#jobseeker-table tbody");
  const profiles = JSON.parse(localStorage.getItem("profiles_jobseeker")) || {};
  const skillFilter = document.getElementById("skill-filter").value.toLowerCase();
  const expFilter = document.getElementById("exp-filter").value;
  const jobDesc = document.getElementById("job-desc").value.toLowerCase();

  const seekers = [];

  for (const [email, profile] of Object.entries(profiles)) {
    const skills = profile.skills ? profile.skills.toLowerCase() : "";
    const experience = profile.experience || "0";
    const expValue = getExperienceValue(experience);

    // Skill filter
    if (skillFilter && !skills.includes(skillFilter)) continue;

    // Experience filter
    if (expFilter) {
      const [min, max] = expFilter === "5+" ? [5, 50] : expFilter.split("-").map(Number);
      if (expValue < min || expValue > max) continue;
    }

    let resumeText = skills + " " + profile.bio;
let resumePdf = profile.resume || "";

let score = 0;
if (jobDesc) {
  score = await fetchResumeScore(resumeText, jobDesc, resumePdf);
}


    seekers.push({
      email,
      name: profile.name || "N/A",
      skills,
      experience,
      resume: profile.resume,
      score,
    });
  }

  seekers.sort((a, b) => b.score - a.score);

  table.innerHTML = "";
  seekers.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.skills}</td>
      <td>${s.experience}</td>
      <td>${
        s.resume
          ? `<a href="#" onclick="openResume('${s.resume}')">View Resume</a>`
          : "No Resume"
      }</td>
      <td>${s.score.toFixed(1)}%</td>
    `;
    table.appendChild(row);
  });
}

function setupRecruiterPage() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return (window.location.href = "index.html");

  document.getElementById("rec-email").innerText = user.email;
  document.getElementById("logout").addEventListener("click", logout);
  document.getElementById("search-btn").addEventListener("click", loadJobseekersWithFilters);
  loadJobseekersWithFilters();
}
