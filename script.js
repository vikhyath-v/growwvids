/* ============ CONFIG — edit this part ============ */

// Your Google Sheet ID (the long string in the sheet's URL).
const SHEET_ID = "1i0dWthUd7ZKNKHjFc2I96g5L7AWbalLmzB92Wuo-Unk";

// One entry per section on the page. `tab` is either the sheet's tab
// name (as shown on the tab at the bottom of Google Sheets, case-sensitive)
// or its 1-based position (1, 2, 3…) if you'd rather not rename tabs.
const SECTIONS = [
  { title: "Thrive", tab: "Thrive" },
  { title: "Groww", tab: "Groww" },
];

// Free YouTube Data API key — needed for view counts. Get one at
// https://console.cloud.google.com/apis/credentials (enable "YouTube Data
// API v3" on the project first). Leave blank to skip view counts.
const YOUTUBE_API_KEY = "";

/* ============ end config ============ */

const shelvesEl = document.getElementById("shelves");
const search = document.getElementById("search");
const status = document.getElementById("status");
const count = document.getElementById("count");

let sections = []; // [{ title, cards: [...] }]

function vid(u) {
  const m = u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})|([A-Za-z0-9_-]{11})/);
  return (m && (m[1] || m[2])) || "";
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function formatViews(n) {
  if (n == null) return null;
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B views";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M views";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K views";
  return n + (n === 1 ? " view" : " views");
}

function setStatus(text, isEmpty = false) {
  if (!text) {
    status.hidden = true;
    return;
  }
  status.hidden = false;
  status.textContent = text;
  status.classList.toggle("empty", isEmpty);
}

function renderSkeletonShelves() {
  shelvesEl.innerHTML = SECTIONS.map(
    (s) => `
    <div class="shelf">
      <div class="shelf-head">
        <span class="shelf-title">${escapeHtml(s.title)}</span>
        <span class="shelf-rule"></span>
      </div>
      <div class="grid">
        ${Array.from({ length: 4 })
          .map(
            () => `<div class="skeleton">
              <div class="thumb-wrap"><div class="thumb"></div></div>
              <div class="line"></div>
              <div class="line short"></div>
            </div>`
          )
          .join("")}
      </div>
    </div>`
  ).join("");
}

function cardHtml(v) {
  return `<a class="card" href="${v.url}" target="_blank" rel="noopener">
    ${v.views != null ? `<span class="tab">${formatViews(v.views)}</span>` : ""}
    <div class="thumb-wrap">
      <img class="thumb" src="${v.thumb}" alt="" loading="lazy"
           onerror="this.onerror=null;this.src='${v.fallback}'">
    </div>
    <div class="info">
      <div class="title">${escapeHtml(v.title)}</div>
      <div class="channel">${escapeHtml(v.channel || "Unknown channel")}</div>
    </div>
  </a>`;
}

function render() {
  const q = search.value.toLowerCase();
  let totalShown = 0;
  let html = "";

  sections.forEach((sec) => {
    const list = sec.cards.filter(
      (v) => v && (v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q))
    );
    if (list.length === 0) return;
    totalShown += list.length;
    html += `
      <div class="shelf">
        <div class="shelf-head">
          <span class="shelf-title">${escapeHtml(sec.title)}</span>
          <span class="shelf-rule"></span>
          <span class="shelf-count">${list.length}</span>
        </div>
        <div class="grid">${list.map(cardHtml).join("")}</div>
      </div>`;
  });

  shelvesEl.innerHTML = html;

  if (totalShown === 0) {
    setStatus(
      q ? `No matches in the stacks for "${search.value}".` : "The shelf is empty.",
      true
    );
    count.textContent = "";
  } else {
    setStatus("");
    count.textContent = `${totalShown} item${totalShown === 1 ? "" : "s"}`;
  }
}

// Fetch snippet + view counts from YouTube in batches of 50 ids.
async function fetchYoutubeData(ids) {
  if (!YOUTUBE_API_KEY || ids.length === 0) return {};
  const map = {};
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const url =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics` +
      `&id=${chunk.join(",")}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message || `YouTube API error (${res.status})`);
    }
    const data = await res.json();
    (data.items || []).forEach((item) => {
      map[item.id] = {
        title: item.snippet?.title,
        channel: item.snippet?.channelTitle,
        views: item.statistics?.viewCount != null ? Number(item.statistics.viewCount) : null,
      };
    });
  }
  return map;
}

// Fallback for videos with no API key / not found via the API: noembed
// gives title + channel but no view count.
async function fetchNoembed(url) {
  try {
    const meta = await fetch("https://noembed.com/embed?url=" + encodeURIComponent(url)).then((r) =>
      r.json()
    );
    return { title: meta.title, channel: meta.author_name };
  } catch (e) {
    return {};
  }
}

async function loadSection(section) {
  const res = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(section.tab)}`);
  if (!res.ok) throw new Error(`Sheet tab "${section.tab}" failed (${res.status})`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`Sheet tab "${section.tab}" returned unexpected data`);

  const entries = rows
    .map((r) => {
      const url = r.url || r.URL || Object.values(r)[0];
      if (!url) return null;
      return { url, id: vid(url) };
    })
    .filter(Boolean);

  return { title: section.title, entries };
}

async function load() {
  renderSkeletonShelves();
  setStatus("Fetching the shelves…");

  try {
    // 1. Pull every configured sheet tab in parallel.
    const loaded = await Promise.all(SECTIONS.map(loadSection));

    // 2. Look up title/channel/views for every video in one batch per 50.
    const allIds = [...new Set(loaded.flatMap((s) => s.entries.map((e) => e.id)).filter(Boolean))];
    const ytMap = await fetchYoutubeData(allIds);

    // 3. Assemble cards, falling back to noembed where the API has no data.
    sections = await Promise.all(
      loaded.map(async (sec) => {
        const cards = await Promise.all(
          sec.entries.map(async (e) => {
            let data = ytMap[e.id];
            if (!data) data = await fetchNoembed(e.url);
            return {
              url: e.url,
              title: data.title || "YouTube Video",
              channel: data.channel || "",
              views: data.views ?? null,
              thumb: `https://img.youtube.com/vi/${e.id}/maxresdefault.jpg`,
              fallback: `https://img.youtube.com/vi/${e.id}/hqdefault.jpg`,
            };
          })
        );
        return { title: sec.title, cards };
      })
    );

    render();
  } catch (e) {
    console.error("Library failed to load:", e);
    shelvesEl.innerHTML = "";
    setStatus("Couldn't reach the shelves (" + e.message + "). Check the console for details.", true);
  }
}

window.addEventListener("error", (e) => {
  console.error("Uncaught error:", e.error || e.message);
  setStatus("Something broke while loading the shelf. Check the DevTools console for details.", true);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled rejection:", e.reason);
  setStatus("Something broke while loading the shelf. Check the DevTools console for details.", true);
});

search.oninput = render;

load();
