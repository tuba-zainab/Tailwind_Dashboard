const tasks = [
  { id: 1, name: "Portfolio Website", stack: "HTML", status: "Completed", score: 88, hours: 10, week: "Week 1 · Sep 1–5" },
  { id: 2, name: "Kanban Board", stack: "HTML · CSS · JS", status: "Completed", score: 92, hours: 14, week: "Week 2 · Sep 8–12" },
  { id: 3, name: "Bootstrap Dashboard", stack: "Bootstrap · jQuery", status: "Completed", score: 85, hours: 12, week: "Week 3 · Sep 15–19" },
  { id: 4, name: "Tailwind Dashboard", stack: "Tailwind · Chart.js", status: "Completed", score: 90, hours: 2, week: "Week 4 · Sep 22–30" }
];

const project = { id: 5, name: "Project", stack: "To be decided", status: "Upcoming", score: null, hours: 0, week: "Final week" };

const allItems = [...tasks, project];

const statusStyle = {
  "Completed": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-700 border border-amber-200",
  "Upcoming": "bg-slate-100 text-slate-500 border border-slate-200"
};

const state = { filter: "all", query: "" };

const charts = {
  line: null, doughnut: null, bar: null, taskStatus: null, milestoneProgress: null
};

function safe(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`[dashboard] "${label}" failed to initialize:`, err);
  }
}

function toast(msg, type = "success") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const el = document.createElement("div");
  const colors = { success: "border-emerald-200 text-emerald-800", info: "border-brand-200 text-brand-800", warn: "border-amber-200 text-amber-800" };
  el.className = `toast-in bg-white border ${colors[type]} shadow-lg rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2`;
  el.innerHTML = `<span class="w-2 h-2 rounded-full ${type === "success" ? "bg-emerald-500" : type === "warn" ? "bg-amber-500" : "bg-brand-500"}"></span>${msg}`;
  wrap.appendChild(el);
  setTimeout(() => { el.style.transition = "opacity .3s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 2600);
}

function statusCounts() {
  return {
    Completed: allItems.filter(t => t.status === "Completed").length,
    "In Progress": allItems.filter(t => t.status === "In Progress").length,
    Upcoming: allItems.filter(t => t.status === "Upcoming").length,
  };
}

function weeklyCompletion() {
  return allItems.map(t => ({
    label: t.week.split("·")[0].trim(),
    pct: t.status === "Completed" ? 100 : t.status === "In Progress" ? 55 : 5,
  }));
}

function updateKPIs() {
  const doneEl = document.getElementById("kpiDone");
  const progressEl = document.getElementById("kpiProgress");
  const progressBar = document.getElementById("kpiProgressBar");
  if (!doneEl || !progressEl || !progressBar) return;
  const done = tasks.filter(t => t.status === "Completed").length;
  const inProg = tasks.filter(t => t.status === "In Progress").length;
  const progress = Math.round(((done + inProg * 0.5) / allItems.length) * 100);
  doneEl.textContent = done;
  progressEl.textContent = progress;
  progressBar.style.width = progress + "%";
}

function visibleTasks() {
  return allItems.filter(t => {
    const okFilter = state.filter === "all" || t.status === state.filter;
    const okQuery = t.name.toLowerCase().includes(state.query) || t.stack.toLowerCase().includes(state.query);
    return okFilter && okQuery;
  });
}

function actionCell(t) {
  if (t.status === "Completed") {
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Done</span>`;
  }
  if (t.name === "Project") {
    return `<button type="button" data-start-project class="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition">Start Project</button>`;
  }
  return `<button type="button" data-complete="${t.id}" class="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition">Mark Complete</button>`;
}

function renderTable() {
  const tbody = document.getElementById("taskTable");
  if (!tbody) return;
  const list = visibleTasks();
  tbody.innerHTML = list.length ? list.map(t => `
    <tr class="border-b border-slate-50 hover:bg-slate-50/60 transition">
      <td class="py-3.5 pr-4">
        <p class="font-semibold text-slate-800">${t.name}</p>
        <p class="text-xs text-slate-400">${t.week}</p>
      </td>
      <td class="py-3.5 pr-4 text-slate-500 text-xs sm:text-sm">${t.stack}</td>
      <td class="py-3.5 pr-4"><span class="inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[t.status]}">${t.status}</span></td>
      <td class="py-3.5 pr-4 font-semibold">${t.score ?? "—"}</td>
      <td class="py-3.5 text-right">${actionCell(t)}</td>
    </tr>`).join("")
    : `<tr><td colspan="5" class="py-8 text-center text-slate-400 text-sm">No tasks match your search.</td></tr>`;
}

function renderCards() {
  const wrap = document.getElementById("taskCards");
  if (!wrap) return;
  wrap.innerHTML = allItems.map(t => {
    const pct = t.status === "Completed" ? 100 : t.status === "In Progress" ? 55 : 5;
    return `
    <div class="card-hover bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">${t.week}</span>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[t.status]}">${t.status}</span>
      </div>
      <h3 class="font-bold text-lg leading-snug">${t.name}</h3>
      <p class="text-sm text-slate-500 mt-1">${t.stack}</p>
      <div class="mt-4">
        <div class="flex justify-between text-xs font-medium text-slate-500 mb-1.5"><span>Progress</span><span>${pct}%</span></div>
        <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500" style="width:${pct}%"></div></div>
      </div>
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span class="text-xs text-slate-400">${t.hours}h logged · Score ${t.score ?? "—"}</span>
        ${t.status !== "Completed" ? actionCell(t) : `<span class="text-xs font-semibold text-emerald-600">Approved</span>`}
      </div>
    </div>`;
  }).join("");
}

function renderScores() {
  const wrap = document.getElementById("scoreBars");
  if (!wrap) return;
  wrap.innerHTML = allItems.map(t => {
    const s = t.score ?? 0;
    return `
    <div>
      <div class="flex justify-between text-sm mb-1.5"><span class="font-medium text-slate-700">${t.name}</span><span class="font-semibold ${t.score ? "text-brand-600" : "text-slate-400"}">${t.score ?? "Pending"}</span></div>
      <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full rounded-full ${t.score ? "bg-gradient-to-r from-brand-500 to-violet-500" : "bg-slate-200"} transition-all duration-700" style="width:${s}%"></div></div>
    </div>`;
  }).join("");
}

function renderSessions() {
  const list = document.getElementById("sessionList");
  if (!list) return;
  const sessions = [
    { d: "Tue", date: "Sep 15", label: "Session 6", done: true },
    { d: "Fri", date: "Sep 18", label: "Session 7", done: false, next: true },
    { d: "Tue", date: "Sep 22", label: "Session 8", done: false },
    { d: "Fri", date: "Sep 25", label: "Session 9", done: false }
  ];
  list.innerHTML = sessions.map(s => `
    <div class="flex items-center gap-3 p-3 rounded-xl ${s.next ? "bg-brand-50 border border-brand-100" : "bg-slate-50 border border-slate-100"}">
      <div class="w-11 h-11 rounded-xl ${s.done ? "bg-emerald-100 text-emerald-600" : s.next ? "bg-brand-600 text-white" : "bg-white text-slate-400 border border-slate-200"} flex flex-col items-center justify-center leading-none">
        <span class="text-[10px] font-bold">${s.d}</span>
        <span class="text-sm font-extrabold">${s.date.replace("Sep ", "")}</span>
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-700">${s.label}</p>
        <p class="text-xs ${s.done ? "text-emerald-600" : s.next ? "text-brand-600" : "text-slate-400"}">${s.done ? "Completed" : s.next ? "Next session" : "Scheduled"}</p>
      </div>
      ${s.done ? `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>` : ""}
    </div>`).join("");
}

function renderTimeline() {
  const wrap = document.getElementById("timeline");
  if (!wrap) return;
  const items = [
    { w: "Week 1 · Sep 1–5", t: "Portfolio Website", d: "Personal portfolio built with pure HTML.", done: true },
    { w: "Week 2 · Sep 8–12", t: "Kanban Board", d: "Todo application with HTML, CSS and JavaScript.", done: true },
    { w: "Week 3 · Sep 15–19", t: "Bootstrap Dashboard", d: "Responsive dashboard built with Bootstrap and jQuery.", done: true },
    { w: "Week 4 · Sep 22–30", t: "Tailwind Dashboard", d: "Performance-optimized dashboard with Tailwind CSS and charts.", done: true },
    { w: "Final Week", t: "Project", d: "Final project applying everything learned during the internship.", done: false, current: true }
  ];
  wrap.innerHTML = items.map(i => `
    <div class="relative">
      <span class="absolute -left-8 top-1 w-5 h-5 rounded-full border-4 ${i.done ? "bg-emerald-500 border-emerald-100" : i.current ? "bg-brand-500 border-brand-100 animate-pulse" : "bg-slate-300 border-slate-100"}"></span>
      <div class="bg-white rounded-2xl border ${i.current ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200"} p-5 card-hover">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">${i.w}</span>
          ${i.done ? `<span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span>` : i.current ? `<span class="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">In Progress</span>` : `<span class="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Upcoming</span>`}
        </div>
        <h3 class="font-bold">${i.t}</h3>
        <p class="text-sm text-slate-500 mt-1">${i.d}</p>
      </div>
    </div>`).join("");
}

function renderTaskSnapshot() {
  const wrap = document.getElementById("taskSnapshot");
  if (!wrap) return;
  const counts = statusCounts();
  const chips = [
    { label: "Completed", value: counts.Completed, color: "text-emerald-600 bg-emerald-50" },
    { label: "In Progress", value: counts["In Progress"], color: "text-amber-600 bg-amber-50" },
    { label: "Upcoming", value: counts.Upcoming, color: "text-slate-500 bg-slate-100" },
  ];
  wrap.innerHTML = chips.map(c => `
    <div class="rounded-xl ${c.color} py-3">
      <p class="text-2xl font-extrabold">${c.value}</p>
      <p class="text-xs font-medium mt-0.5">${c.label}</p>
    </div>`).join("");
}

function buildOrUpdateCharts() {
  if (typeof Chart === "undefined") {
    window.addEventListener("load", buildOrUpdateCharts, { once: true });
    return;
  }

  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.color = "#94a3b8";

  const lineCanvas = document.getElementById("lineChart");
  if (lineCanvas && !charts.line) {
    charts.line = new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{
          label: "Tasks completed",
          data: [1, 1, 1, 1],
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79,70,229,.08)",
          fill: true,
          tension: .45,
          pointRadius: 5,
          pointBackgroundColor: "#4f46e5",
          pointBorderColor: "#fff",
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#f1f5f9" }, title: { display: true, text: "Tasks", color: "#94a3b8" } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const doughnutCanvas = document.getElementById("doughnutChart");
  if (doughnutCanvas && !charts.doughnut) {
    charts.doughnut = new Chart(doughnutCanvas, {
      type: "doughnut",
      data: {
        labels: ["HTML / CSS", "JavaScript", "Bootstrap", "Tailwind"],
        datasets: [{
          data: [90, 75, 80, 55],
          backgroundColor: ["#4f46e5", "#8b5cf6", "#38bdf8", "#fbbf24"],
          borderWidth: 3,
          borderColor: "#ffffff",
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { display: false } }
      }
    });
  }

  const barCanvas = document.getElementById("barChart");
  if (barCanvas && !charts.bar) {
    charts.bar = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: ["Portfolio", "Kanban Board", "Bootstrap Dash.", "Tailwind Dash.", "Project"],
        datasets: [{
          label: "Hours",
          data: [10, 14, 12, 2, 0],
          backgroundColor: ["#4f46e5", "#8b5cf6", "#38bdf8", "#fbbf24", "#cbd5e1"],
          borderRadius: 8,
          barThickness: 34
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" }, title: { display: true, text: "Hours", color: "#94a3b8" } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const taskStatusCanvas = document.getElementById("taskStatusChart");
  if (taskStatusCanvas) {
    const counts = statusCounts();
    const data = [counts.Completed, counts["In Progress"], counts.Upcoming];
    if (charts.taskStatus) {
      charts.taskStatus.data.datasets[0].data = data;
      charts.taskStatus.update();
    } else {
      charts.taskStatus = new Chart(taskStatusCanvas, {
        type: "doughnut",
        data: {
          labels: ["Completed", "In Progress", "Upcoming"],
          datasets: [{
            data,
            backgroundColor: ["#10b981", "#fbbf24", "#cbd5e1"],
            borderWidth: 3,
            borderColor: "#ffffff",
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  const milestoneCanvas = document.getElementById("milestoneProgressChart");
  if (milestoneCanvas) {
    const weekly = weeklyCompletion();
    const labels = weekly.map(w => w.label);
    const data = weekly.map(w => w.pct);
    if (charts.milestoneProgress) {
      charts.milestoneProgress.data.labels = labels;
      charts.milestoneProgress.data.datasets[0].data = data;
      charts.milestoneProgress.update();
    } else {
      charts.milestoneProgress = new Chart(milestoneCanvas, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Complete",
            data,
            backgroundColor: data.map(p => p === 100 ? "#10b981" : p >= 50 ? "#4f46e5" : "#cbd5e1"),
            borderRadius: 6,
            barThickness: 22
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, max: 100, grid: { color: "#f1f5f9" }, title: { display: true, text: "% complete", color: "#94a3b8" } },
            y: { grid: { display: false } }
          }
        }
      });
    }
  }
}

function refresh() {
  updateKPIs();
  renderTable();
  renderCards();
  renderScores();
  renderTaskSnapshot();
  buildOrUpdateCharts();
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el && typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar) sidebar.classList.add("-translate-x-full");
  if (overlay) overlay.classList.add("hidden");
}

function initDelegatedClicks() {
  document.addEventListener("click", e => {
    const jump = e.target.closest("[data-target]");
    if (jump) {
      scrollToSection(jump.dataset.target);
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.target === jump.dataset.target));
      closeSidebar();
      return;
    }
    const startBtn = e.target.closest("[data-start-project]");
    if (startBtn) {
      if (project.status === "Upcoming") {
        project.status = "In Progress";
        refresh();
        toast("Project started — good luck, Tuba!", "info");
      }
      return;
    }
    const btn = e.target.closest("[data-complete]");
    if (btn) {
      const t = tasks.find(x => x.id === +btn.dataset.complete);
      if (t && t.status !== "Completed") {
        t.status = "Completed";
        t.score = t.score ?? 90;
        refresh();
        toast(`"${t.name}" marked as complete.`, "success");
      }
      return;
    }
    const fb = e.target.closest(".filter-btn");
    if (fb) {
      state.filter = fb.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach(b => {
        const on = b === fb;
        b.className = `filter-btn text-xs font-medium px-3 py-1.5 rounded-full transition ${on ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`;
      });
      renderTable();
    }
  });
}

function initSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return console.warn('[dashboard] #globalSearch not found — search disabled.');
  input.addEventListener("input", e => {
    state.query = e.target.value.trim().toLowerCase();
    renderTable();
    if (state.query.length === 1) scrollToSection("overview");
  });
}

function initExport() {
  const btn = document.getElementById("exportBtn");
  if (!btn) return console.warn('[dashboard] #exportBtn not found — export disabled.');
  btn.addEventListener("click", () => {
    const rows = [["Task", "Stack", "Status", "Score", "Hours"]].concat(allItems.map(t => [t.name, t.stack, t.status, t.score ?? "", t.hours]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "sps-internship-tasks.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Task list exported as CSV.", "info");
  });
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");
  if (!sidebar || !overlay || !menuBtn) return console.warn('[dashboard] sidebar elements missing — mobile menu disabled.');
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  });
  overlay.addEventListener("click", closeSidebar);
}

function initScrollSpy() {
  const topBtn = document.getElementById("topBtn");
  if (!topBtn) return console.warn('[dashboard] #topBtn not found — back-to-top disabled.');
  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("hidden", window.scrollY < 400);
    topBtn.classList.toggle("flex", window.scrollY >= 400);
    const sections = ["overview", "tasks", "analytics", "milestones"];
    let current = "overview";
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    });
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.target === current));
  }, { passive: true });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function init() {
  safe("data render", refresh);
  safe("sessions", renderSessions);
  safe("timeline", renderTimeline);
  safe("delegated clicks", initDelegatedClicks);
  safe("search", initSearch);
  safe("export", initExport);
  safe("sidebar", initSidebar);
  safe("scroll spy", initScrollSpy);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}