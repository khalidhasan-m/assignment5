// DOM elements
const containers = {
  all: document.getElementById("all-issue-container"),
  open: document.getElementById("open-issue-container"),
  closed: document.getElementById("closed-issue-container"),
};

const buttons = {
  all: document.getElementById("all-btn"),
  open: document.getElementById("open-btn"),
  closed: document.getElementById("closed-btn"),
};

const totalIssuesText = document.getElementById("total-issues");
const searchInput = document.getElementById("search-input");
const spinner = document.getElementById("spinner");

// APIs
const allIssuesAPI = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const searchAPI =
  "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";

// Spinner toggle
const toggleSpinner = (show) => {
  spinner.style.display = show ? "flex" : "none";
};

// Helper for label badges
function getLabelBadge(label, soft = true) {
  let icon = '<i class="fa-solid fa-circle"></i>';
  let base = soft ? "badge badge-soft badge-outline" : "badge badge-outline";
  const lower = label.toLowerCase();

  if (lower.includes("bug")) {
    icon = '<i class="fa-solid fa-bug"></i>';
    base = soft ? "badge badge-error badge-soft" : "badge badge-error";
  } else if (lower.includes("enhancement")) {
    icon = '<i class="fa-solid fa-wrench"></i>';
    base = soft ? "badge badge-success badge-soft" : "badge badge-success";
  } else if (lower.includes("help wanted")) {
    icon = '<i class="fa-solid fa-handshake"></i>';
    base = soft ? "badge badge-warning badge-soft" : "badge badge-warning";
  } else if (lower.includes("documentation")) {
    icon = '<i class="fa-brands fa-readme"></i>';
    base = soft ? "badge badge-info badge-soft" : "badge badge-info";
  } else if (lower.includes("good first issue")) {
    icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    base = soft ? "badge badge-primary badge-soft" : "badge badge-primary";
  }

  return `<span class="${base} flex items-center gap-1 px-2 py-1 text-[12px]">${icon} ${label}</span>`;
}

// Card template
function createCard(issue) {
  const statusIcon =
    issue.status === "open"
      ? "./assets/Open-Status.png"
      : "./assets/Status.png";
  const borderColor =
    issue.status === "open" ? "border-green-500" : "border-violet-500";

  const priorityClass =
    issue.priority.toLowerCase() === "high"
      ? "badge badge-error badge-soft"
      : issue.priority.toLowerCase() === "medium"
        ? "badge badge-warning badge-soft"
        : "badge badge-neutral badge-soft";

  return `
    <div onclick="loadIssueDetails(${issue.id})" 
         class="bg-white p-4 border-t-4 ${borderColor} rounded-lg h-[350px] flex flex-col space-y-3">

      <!-- Top row -->
      <div class="flex justify-between items-center h-16">
        <img src="${statusIcon}" alt="${issue.status} status icon" />
        <span class="${priorityClass} rounded-3xl px-3 py-1 text-[12px]">${issue.priority.toUpperCase()}</span>
      </div>

      <!-- Title + description -->
      <div class="h-32 space-y-2">
        <p class="font-bold text-lg">${issue.title}</p>
        <p class="text-[12px] text-[#64748B] line-clamp-3">
          ${issue.description}
        </p>
      </div>

      <!-- Labels -->
      <div class="flex gap-2 flex-wrap pb-2">
        ${issue.labels.map((label) => getLabelBadge(label)).join("")}
      </div>

      <!-- Footer -->
      <div class="border-t-2 border-gray-100 pt-4">
        <p class="text-[12px] text-[#64748B]">#${issue.id} by ${issue.author}</p>
        <p class="text-[12px] text-[#64748B]">${new Date(issue.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  `;
}

// Load issues
async function loadIssues(type, searchText = "") {
  toggleSpinner(true);
  const url = searchText ? searchAPI + searchText : allIssuesAPI;

  const res = await fetch(url);
  const data = await res.json();
  const issues = data.data;

  Object.values(containers).forEach((c) => (c.innerHTML = ""));

  let count = 0;
  issues.forEach((issue) => {
    if (type === "all" || issue.status === type) {
      containers[type].innerHTML += createCard(issue);
      count++;
    }
  });

  totalIssuesText.textContent = `${count} Issues`;

  Object.keys(containers).forEach((key) => {
    containers[key].style.display = key === type ? "grid" : "none";
  });

  Object.keys(buttons).forEach((key) => {
    buttons[key].classList.toggle("btn-primary", key === type);
    buttons[key].classList.toggle("btn-soft", key !== type);
  });

  toggleSpinner(false);
}

// Initial load
loadIssues("all");

// Button events
buttons.all.addEventListener("click", () => loadIssues("all"));
buttons.open.addEventListener("click", () => loadIssues("open"));
buttons.closed.addEventListener("click", () => loadIssues("closed"));

// Search
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const activeType =
      Object.keys(buttons).find((key) =>
        buttons[key].classList.contains("btn-primary"),
      ) || "all";
    loadIssues(activeType, searchInput.value.trim());
  }
});

// Modal
async function loadIssueDetails(id) {
  const url = `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`;
  const res = await fetch(url);
  const data = await res.json();
  const issue = data.data;

  // Title, Author, Date
  document.getElementById("modalTitle").textContent = issue.title;
  document.getElementById("modalAuthor").textContent =
    `Opened by ${issue.author}`;
  document.getElementById("modalDate").textContent = new Date(
    issue.createdAt,
  ).toLocaleDateString();

  // Description
  document.getElementById("modalDescription").textContent = issue.description;

  // Assignee
  document.getElementById("modalAssignee").textContent = issue.author;

  // Priority badge
  const modalPriorityBadge = document.getElementById("modalPriority");
  modalPriorityBadge.textContent = issue.priority.toUpperCase();
  modalPriorityBadge.className = `badge ${
    issue.priority.toLowerCase() === "high"
      ? "badge-error"
      : issue.priority.toLowerCase() === "medium"
        ? "badge-warning"
        : "badge-neutral"
  } badge`;

  // Status badge
  const statusBadge = document.getElementById("modalStatus");
  statusBadge.textContent = issue.status === "open" ? "Opened" : "Closed";
  statusBadge.className =
    issue.status === "open" ? "badge badge-success" : "badge badge-primary";

  // Labels
  const labelsContainer = document.getElementById("modalLabels");
  labelsContainer.innerHTML = issue.labels
    .map((label) => getLabelBadge(label, false))
    .join("");

  // Show modal
  document.getElementById("issueModal").showModal();
}
