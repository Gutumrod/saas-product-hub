const form = document.querySelector("#shorten-form");
const urlInput = document.querySelector("#url-input");
const customCodeInput = document.querySelector("#custom-code-input");
const result = document.querySelector("#result");
const resultLink = document.querySelector("#result-link");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");
const linksBody = document.querySelector("#links-body");
const refreshButton = document.querySelector("#refresh-button");
const analyticsPanel = document.querySelector("#analytics-panel");
const analyticsTitle = document.querySelector("#analytics-title");
const closeAnalytics = document.querySelector("#close-analytics");
const totalClicks = document.querySelector("#total-clicks");
const lastClick = document.querySelector("#last-click");
const referrerList = document.querySelector("#referrer-list");
const recentClicks = document.querySelector("#recent-clicks");

let latestShortUrl = "";

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function setMessage(text, isError = true) {
  message.textContent = text;
  message.style.color = isError ? "#b42318" : "#067647";
}

function formatDate(value) {
  if (!value) return "Never";
  return new Date(value.replace(" ", "T")).toLocaleString();
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Request failed with ${response.status}`);
  }
  return data;
}

function renderLinks(items) {
  if (!items.length) {
    linksBody.innerHTML = '<tr><td colspan="5">No links yet.</td></tr>';
    return;
  }

  linksBody.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td><a href="/${encodeURIComponent(item.short_code)}" target="_blank">${escapeHtml(item.short_code)}</a></td>
          <td class="url-cell">${escapeHtml(item.original_url)}</td>
          <td>${item.click_count}</td>
          <td>${escapeHtml(formatDate(item.created_at))}</td>
          <td><button type="button" data-analytics="${encodeURIComponent(item.short_code)}">View Analytics</button></td>
        </tr>
      `,
    )
    .join("");
}

async function loadLinks() {
  const data = await fetchJson("/api/links");
  renderLinks(data.items);
}

async function loadAnalytics(shortCode) {
  const data = await fetchJson(`/api/analytics/${encodeURIComponent(shortCode)}`);
  analyticsTitle.textContent = `Analytics: ${data.short_code}`;
  totalClicks.textContent = data.total_clicks;
  lastClick.textContent = formatDate(data.last_clicked_at);
  referrerList.innerHTML = data.referrers.length
    ? data.referrers.map((item) => `<li>${escapeHtml(item.source)}: ${item.count}</li>`).join("")
    : "<li>No referrer data yet.</li>";
  recentClicks.innerHTML = data.recent_clicks.length
    ? data.recent_clicks
        .map(
          (click) =>
            `<li>${escapeHtml(formatDate(click.clicked_at))} · ${escapeHtml(click.ip_address || "Unknown IP")} · ${escapeHtml(click.referrer)}</li>`,
        )
        .join("")
    : "<li>No clicks yet.</li>";
  analyticsPanel.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");
  result.classList.add("hidden");

  const body = { url: urlInput.value.trim() };
  if (customCodeInput.value.trim()) {
    body.custom_code = customCodeInput.value.trim();
  }

  try {
    const data = await fetchJson("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    latestShortUrl = data.short_url;
    resultLink.textContent = latestShortUrl;
    result.classList.remove("hidden");
    form.reset();
    setMessage("Short link created.", false);
    await loadLinks();
  } catch (error) {
    setMessage(error.message);
  }
});

copyButton.addEventListener("click", async () => {
  if (!latestShortUrl) return;
  await navigator.clipboard.writeText(latestShortUrl);
  setMessage("Copied.", false);
});

linksBody.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-analytics]");
  if (!button) return;
  try {
    await loadAnalytics(button.dataset.analytics);
  } catch (error) {
    setMessage(error.message);
  }
});

refreshButton.addEventListener("click", () => {
  loadLinks().catch((error) => setMessage(error.message));
});

closeAnalytics.addEventListener("click", () => {
  analyticsPanel.classList.add("hidden");
});

loadLinks().catch((error) => setMessage(error.message));
