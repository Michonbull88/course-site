const defaultCourses = [
  {
    id: "business-foundations",
    title: "Business Foundations",
    category: "Business",
    level: "Beginner",
    price: "$199",
    duration: "5 modules",
    description: "A general course structure for onboarding learners into core business concepts, workflows, and practical exercises.",
    image: "course-platform-hero.png",
    videoUrl: "",
    lessons: ["Welcome and course outcomes", "Core concepts", "Practical workbook", "Assessment preparation"],
    documents: [
      { title: "Course outline", type: "PDF", content: "Business Foundations course outline\n\nReplace this sample file with your own course documentation." },
      { title: "Learner workbook", type: "DOC", content: "Learner workbook\n\nAdd worksheets, activities, and notes for your students here." }
    ]
  },
  {
    id: "leadership-practice",
    title: "Leadership Practice",
    category: "Leadership",
    level: "Intermediate",
    price: "$249",
    duration: "7 modules",
    description: "A practical training path for managers, supervisors, or teams that need structured leadership development.",
    image: "course-platform-herocopy4.png",
    videoUrl: "",
    lessons: ["Leadership styles", "Communication routines", "Decision making", "Team performance"],
    documents: [
      { title: "Facilitator guide", type: "PDF", content: "Leadership Practice facilitator guide\n\nReplace this sample guide with your own PDF or document." }
    ]
  },
  {
    id: "digital-skills",
    title: "Digital Skills Toolkit",
    category: "Technology",
    level: "Beginner",
    price: "$149",
    duration: "4 modules",
    description: "A flexible placeholder for any software, digital literacy, online tools, or workplace technology course.",
    image: "course-platform-hero copy 2.png",
    videoUrl: "",
    lessons: ["Getting started", "Tool walkthrough", "Practice tasks", "Next steps"],
    documents: [
      { title: "Setup checklist", type: "PDF", content: "Digital Skills Toolkit setup checklist\n\nAdd installation notes, links, and requirements here." }
    ]
  }
];

const storageKeys = {
  courses: "coursehub:courses",
  registrations: "coursehub:registrations",
  newsletter: "coursehub:newsletter",
  selected: "coursehub:selected"
};

let courses = loadCourses();
let selectedCourseId = localStorage.getItem(storageKeys.selected) || courses[0]?.id;
let stagedDocument = null;

const elements = {
  courseList: document.getElementById("courseList"),
  courseSearch: document.getElementById("courseSearch"),
  categoryFilter: document.getElementById("categoryFilter"),
  levelFilter: document.getElementById("levelFilter"),
  selectedCourseTitle: document.getElementById("selectedCourseTitle"),
  videoFrame: document.getElementById("videoFrame"),
  lessonList: document.getElementById("lessonList"),
  downloadList: document.getElementById("downloadList"),
  purchaseSummary: document.getElementById("purchaseSummary"),
  coursePrice: document.getElementById("coursePrice"),
  courseCount: document.getElementById("courseCount"),
  registerInterest: document.getElementById("registerInterest"),
  mobileCourseTitle: document.getElementById("mobileCourseTitle"),
  mobileCourseMeta: document.getElementById("mobileCourseMeta")
};

function loadCourses() {
  const saved = localStorage.getItem(storageKeys.courses);
  if (!saved) {
    return defaultCourses;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return defaultCourses;
  }
}

function saveCourses() {
  localStorage.setItem(storageKeys.courses, JSON.stringify(courses));
}

function getSelectedCourse() {
  return courses.find((course) => course.id === selectedCourseId) || courses[0];
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function uniqueCategories() {
  return [...new Set(courses.map((course) => course.category))].sort();
}

function renderFilters() {
  const current = elements.categoryFilter.value || "all";
  elements.categoryFilter.innerHTML = '<option value="all">All categories</option>';
  uniqueCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.append(option);
  });
  elements.categoryFilter.value = uniqueCategories().includes(current) ? current : "all";

  elements.registerInterest.innerHTML = "";
  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.title;
    option.textContent = course.title;
    elements.registerInterest.append(option);
  });
}

function filteredCourses() {
  const query = elements.courseSearch.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;
  const level = elements.levelFilter.value;

  return courses.filter((course) => {
    const matchesQuery = !query || [course.title, course.category, course.description].join(" ").toLowerCase().includes(query);
    const matchesCategory = category === "all" || course.category === category;
    const matchesLevel = level === "all" || course.level === level;
    return matchesQuery && matchesCategory && matchesLevel;
  });
}

function renderCourses() {
  const visibleCourses = filteredCourses();
  elements.courseCount.textContent = String(courses.length);
  elements.courseList.innerHTML = "";

  if (!visibleCourses.length) {
    elements.courseList.innerHTML = '<p class="form-note error">No courses match the current filters.</p>';
    return;
  }

  visibleCourses.forEach((course) => {
    const card = document.createElement("article");
    card.className = `course-card${course.id === selectedCourseId ? " is-selected" : ""}`;
    card.innerHTML = `
      <img src="${escapeHtml(course.image)}" alt="${escapeHtml(course.title)} course cover">
      <div class="course-meta">
        <span class="pill">${escapeHtml(course.category)}</span>
        <span class="pill">${escapeHtml(course.level)}</span>
        <span class="pill">${escapeHtml(course.duration)}</span>
      </div>
      <h3>${escapeHtml(course.title)}</h3>
      <p>${escapeHtml(course.description)}</p>
      <button class="secondary-button" type="button" data-course-id="${escapeHtml(course.id)}">View course</button>
    `;
    elements.courseList.append(card);
  });
}

function toEmbedUrl(url) {
  if (!url) {
    return "";
  }

  if (url.includes("youtube.com/watch")) {
    try {
      const videoId = new URL(url).searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  }

  if (url.includes("youtu.be/")) {
    return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
  }

  if (url.includes("vimeo.com/")) {
    return `https://player.vimeo.com/video/${url.split("vimeo.com/")[1].split("?")[0]}`;
  }

  return url;
}

function renderVideo(course) {
  const embedUrl = toEmbedUrl(course.videoUrl);

  if (!embedUrl) {
    elements.videoFrame.innerHTML = `
      <div class="video-placeholder">
        <span class="play-button">▶</span>
        <strong>Video preview placeholder</strong>
        <span>Add a YouTube, Vimeo, or MP4 URL in the content manager.</span>
      </div>
    `;
    return;
  }

  if (embedUrl.endsWith(".mp4") || embedUrl.startsWith("blob:") || embedUrl.startsWith("data:video")) {
    elements.videoFrame.innerHTML = `<video controls src="${escapeHtml(embedUrl)}"></video>`;
    return;
  }

  elements.videoFrame.innerHTML = `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(course.title)} video preview" allowfullscreen></iframe>`;
}

function renderSelectedCourse() {
  const course = getSelectedCourse();
  if (!course) {
    return;
  }

  selectedCourseId = course.id;
  localStorage.setItem(storageKeys.selected, selectedCourseId);
  elements.selectedCourseTitle.textContent = course.title;
  elements.purchaseSummary.textContent = course.description;
  elements.coursePrice.textContent = course.price;
  elements.mobileCourseTitle.textContent = course.title;
  elements.mobileCourseMeta.textContent = `${course.duration} • ${course.documents.length} downloads`;

  renderVideo(course);

  elements.lessonList.innerHTML = "";
  course.lessons.forEach((lesson, index) => {
    const row = document.createElement("div");
    row.className = "lesson-row";
    row.innerHTML = `
      <span class="lesson-index">${index + 1}</span>
      <strong>${escapeHtml(lesson)}</strong>
      <span class="pill">${index === 0 ? "Preview" : "Lesson"}</span>
    `;
    elements.lessonList.append(row);
  });

  elements.downloadList.innerHTML = "";
  course.documents.forEach((documentItem, index) => {
    const card = document.createElement("article");
    card.className = "download-card";
    card.innerHTML = `
      <span class="pill">${escapeHtml(documentItem.type)}</span>
      <strong>${escapeHtml(documentItem.title)}</strong>
      <p>Downloadable documentation for ${escapeHtml(course.title)}.</p>
      <button class="secondary-button" type="button" data-download-index="${index}">Download</button>
    `;
    elements.downloadList.append(card);
  });

  renderCourses();
}

function downloadDocument(course, documentItem) {
  if (documentItem.dataUrl) {
    const link = document.createElement("a");
    link.href = documentItem.dataUrl;
    link.download = documentItem.fileName || `${slugify(documentItem.title)}.pdf`;
    link.click();
    return;
  }

  const blob = new Blob([documentItem.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(course.title)}-${slugify(documentItem.title)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function setMessage(id, message, type = "success") {
  const target = document.getElementById(id);
  target.textContent = message;
  target.className = `form-note ${type}`;
}

function appendStoredItem(key, item) {
  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  saved.push({ ...item, createdAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(saved));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

elements.courseList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-course-id]");
  if (!button) {
    return;
  }
  selectedCourseId = button.dataset.courseId;
  renderSelectedCourse();
  document.getElementById("learning").scrollIntoView({ behavior: "smooth", block: "start" });
});

elements.downloadList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-download-index]");
  const course = getSelectedCourse();
  if (!button || !course) {
    return;
  }
  downloadDocument(course, course.documents[Number(button.dataset.downloadIndex)]);
});

["input", "change"].forEach((eventName) => {
  elements.courseSearch.addEventListener(eventName, renderCourses);
  elements.categoryFilter.addEventListener(eventName, renderCourses);
  elements.levelFilter.addEventListener(eventName, renderCourses);
});

document.getElementById("purchaseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const course = getSelectedCourse();
  const data = new FormData(event.currentTarget);
  appendStoredItem("coursehub:purchases", {
    course: course.title,
    name: data.get("buyerName"),
    email: data.get("buyerEmail"),
    paymentOption: data.get("paymentOption")
  });
  setMessage("purchaseMessage", "Purchase request saved. Connect Stripe, PayPal, or your payment provider when ready.");
  event.currentTarget.reset();
});

document.getElementById("registerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  appendStoredItem(storageKeys.registrations, {
    name: data.get("registerName"),
    email: data.get("registerEmail"),
    interest: data.get("registerInterest"),
    updates: data.get("updates") === "on"
  });
  setMessage("registerMessage", "Registration saved locally in this browser.");
  event.currentTarget.reset();
});

document.getElementById("newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  appendStoredItem(storageKeys.newsletter, {
    email: document.getElementById("newsletterEmail").value
  });
  setMessage("newsletterMessage", "Subscribed. This can be connected to your email platform later.");
  event.currentTarget.reset();
});

document.getElementById("newDocUpload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  stagedDocument = file ? {
    title: file.name.replace(/\.[^.]+$/, ""),
    type: file.name.split(".").pop().toUpperCase(),
    fileName: file.name,
    dataUrl: await fileToDataUrl(file)
  } : null;
});

document.getElementById("courseForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const imageFile = document.getElementById("newImageUpload").files[0];
  const videoFile = document.getElementById("newVideoUpload").files[0];
  const title = document.getElementById("newTitle").value.trim();
  const image = imageFile ? await fileToDataUrl(imageFile) : "assets/course-platform-hero.png";
  const videoUrl = videoFile ? await fileToDataUrl(videoFile) : document.getElementById("newVideoUrl").value.trim();
  const newCourse = {
    id: `${slugify(title)}-${Date.now()}`,
    title,
    category: document.getElementById("newCategory").value.trim(),
    level: document.getElementById("newLevel").value,
    price: document.getElementById("newPrice").value.trim(),
    duration: "New course",
    description: document.getElementById("newDescription").value.trim(),
    image,
    videoUrl,
    lessons: ["Course introduction", "Main lesson", "Resources and assessment"],
    documents: [
      stagedDocument || {
        title: "Course documentation",
        type: "TXT",
        content: `${title} documentation\n\nUpload your own files from the content manager.`
      }
    ]
  };

  courses = [newCourse, ...courses];
  selectedCourseId = newCourse.id;
  stagedDocument = null;
  try {
    saveCourses();
  } catch {
    courses = courses.filter((course) => course.id !== newCourse.id);
    setMessage("newsletterMessage", "That upload is too large for browser storage. Use a video URL or a smaller sample file.", "error");
    return;
  }
  renderFilters();
  renderSelectedCourse();
  setMessage("newsletterMessage", "New course added to the catalogue.");
  event.currentTarget.reset();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

renderFilters();
renderCourses();
renderSelectedCourse();
