// DOM 
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
const searchAPI = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";

// Spinner toggle
const toggleSpinner = (show) => {
  spinner.style.display = show ? "flex" : "none";
};

// Card template
function createCard(issue) {
  const statusIcon =
    issue.status === "open"
      ? "./assets/Open-Status.png"
      : "./assets/Closed-Status.png";

  const borderColor =
    issue.status === "open" ? "border-green-500" : "border-violet-500";

  let priorityClass = "btn btn-soft btn-neutral";
  const p = issue.priority.toLowerCase();
  if (p === "high") priorityClass = "btn btn-soft btn-error";
  else if (p === "medium") priorityClass = "btn btn-soft btn-warning";

  return `
    <div onclick="loadIssueDetails(${issue.id})" 
         class="bg-white p-4 border-t-4 ${borderColor} rounded-lg h-[350px] flex flex-col space-y-3">
      
      <!-- Top row -->
      <div class="flex justify-between items-center h-16">
        <img src="${statusIcon}" alt="${issue.status} status icon" />
        <span class="${priorityClass} rounded-3xl w-28">${issue.priority.toUpperCase()}</span>
      </div>

      <!-- Title + description -->
      <div class="h-32">
        <p class="font-bold text-base">${issue.title}</p>
        <p class="text-[12px] text-[#64748B] line-clamp-3">
          ${issue.description}
        </p>
      </div>

      <!-- Labels -->
      <div class="flex gap-2 flex-wrap pb-2">
        ${issue.labels.map(label => {
          let icon = '<i class="fa-solid fa-circle"></i>';
          const lower = label.toLowerCase();
          if (lower.includes("bug")) icon = '<i class="fa-solid fa-bug text-red-500"></i>';
          else if (lower.includes("enhancement")) icon = '<i class="fa-solid fa-wrench text-green-500"></i>';
          else if (lower.includes("help wanted")) icon = '<i class="fa-solid fa-handshake text-yellow-500"></i>';
          else if (lower.includes("documentation")) icon = '<i class="fa-brands fa-readme text-blue-500"></i>';
          else if (lower.includes("good first issue")) icon = '<i class="fa-solid fa-circle-exclamation text-purple-500"></i>';
          return `<span class="btn btn-soft rounded-3xl w-fit text-[12px]">${icon} ${label}</span>`;
        }).join("")}
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
function loadIssues(type, searchText = "") {
  toggleSpinner(true);
  const url = searchText ? searchAPI + searchText : allIssuesAPI;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const issues = data.data;
      Object.values(containers).forEach(c => c.innerHTML = "");

      let count = 0;
      issues.forEach(issue => {
        if (type === "all" || issue.status === type) {
          containers[type].innerHTML += createCard(issue);
          count++;
        }
      });

      totalIssuesText.textContent = `${count} Issues`;

      Object.keys(containers).forEach(key => {
        containers[key].style.display = key === type ? "grid" : "none";
      });

      Object.keys(buttons).forEach(key => {
        buttons[key].classList.toggle("btn-primary", key === type);
        buttons[key].classList.toggle("btn-soft", key !== type);
      });
    })
    .catch(err => {
      console.error(err);
      containers[type].innerHTML = "<p class='text-red-500'>Failed to load issues.</p>";
    })
    .finally(() => toggleSpinner(false));
}

// Initial load
loadIssues("all");

// Button events
buttons.all.addEventListener("click", () => loadIssues("all"));
buttons.open.addEventListener("click", () => loadIssues("open"));
buttons.closed.addEventListener("click", () => loadIssues("closed"));

// Search
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const activeType = Object.keys(buttons).find(key =>
      buttons[key].classList.contains("btn-primary")
    ) || "all";
    loadIssues(activeType, searchInput.value.trim());
  }
});

// Modal and its api
function loadIssueDetails(id) {
  const url = `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const issue = data.data;
      document.getElementById("modalTitle").textContent = issue.title;
      document.getElementById("modalAuthor").textContent = `Opened by ${issue.author}`;
      document.getElementById("modalDate").textContent = new Date(issue.createdAt).toLocaleDateString();
      document.getElementById("modalDescription").textContent = issue.description;
      document.getElementById("modalAssignee").textContent = issue.author;
      document.getElementById("modalPriority").textContent = issue.priority.toUpperCase();

      const labelsContainer = document.getElementById("modalLabels");
      labelsContainer.innerHTML = "";
      issue.labels.forEach(label => {
        const span = document.createElement("span");
        span.className = "badge badge-outline";
        span.textContent = label.toUpperCase();
        labelsContainer.appendChild(span);
      });

      const statusBadge = document.getElementById("modalStatus");
      statusBadge.textContent = issue.status === "open" ? "Opened" : "Closed";

      document.getElementById("issueModal").showModal();
    })
    .catch(err => console.error(err));
}
