const API = "https://opensheet.elk.sh/1i0dWthUd7ZKNKHjFc2I96g5L7AWbalLmzB92Wuo-Unk/1";

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const status = document.getElementById("status");
const count = document.getElementById("count");

let cards = [];

function vid(u) {
  const m = u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})|([A-Za-z0-9_-]{11})/);
  return (m && (m[1] || m[2])) || "";
}

// Deterministic "call number" per video — a small nod to the library
// conceit, stable across reloads since it's derived from the video id.
function callNumber(id, channel) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const section = 100 + (hash % 900); // 100–999, Dewey-ish
  const decimal = hash % 100;
  const initials = (channel || "YT")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase() || "YT";
  return `${section}.${String(decimal).padStart(2, "0")} ${initials}`;
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

function renderSkeleton(n = 8) {
  grid.innerHTML = "";
  for (let i = 0; i < n; i++) {
    grid.insertAdjacentHTML(
      "beforeend",
      `<div class="skeleton">
        <div class="thumb-wrap"><div class="thumb"></div></div>
        <div class="line"></div>
        <div class="line short"></div>
      </div>`
    );
  }
}

function render(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    setStatus(
      search.value
        ? `No matches in the stacks for "${search.value}".`
        : "The shelf is empty.",
      true
    );
    count.textContent = "";
    return;
  }

  setStatus("");
  count.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;

  list.forEach((v) => {
    grid.insertAdjacentHTML(
      "beforeend",
      `<a class="card" href="${v.url}" target="_blank" rel="noopener">
        <span class="tab">${v.call}</span>
        <div class="thumb-wrap">
          <img class="thumb" src="${v.thumb}" alt="" loading="lazy"
               onerror="this.onerror=null;this.src='${v.fallback}'">
        </div>
        <div class="info">
          <div class="title">${v.title}</div>
          <div class="channel">${v.channel || "Unknown channel"}</div>
        </div>
      </a>`
    );
  });
}

async function load() {
  renderSkeleton();
  setStatus("Fetching the shelf…");

  try {
    const res = await fetch(API);
    if (!res.ok) {
      throw new Error(`Sheet request failed (${res.status})`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      throw new Error("Sheet response wasn't a list of rows");
    }

    cards = await Promise.all(
      rows.map(async (r) => {
        const url = r.url || r.URL || Object.values(r)[0];
        if (!url) return null;
        const id = vid(url);

        let title = "YouTube Video";
        let channel = "";
        try {
          const meta = await fetch(
            "https://noembed.com/embed?url=" + encodeURIComponent(url)
          ).then((r) => r.json());
          title = meta.title || title;
          channel = meta.author_name || "";
        } catch (e) {
          console.warn("noembed lookup failed for", url, e);
          // fall back to defaults above
        }

        return {
          url,
          title,
          channel,
          call: callNumber(id, channel),
          thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
          fallback: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        };
      })
    );

    render(cards.filter(Boolean));
  } catch (e) {
    console.error("Library failed to load:", e);
    grid.innerHTML = "";
    setStatus(
      "Couldn't reach the shelf (" + e.message + "). Reload, or open the DevTools console for details.",
      true
    );
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

search.oninput = () => {
  const q = search.value.toLowerCase();
  render(
    cards.filter(
      (v) =>
        v &&
        (v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q))
    )
  );
};

load();const API = "https://opensheet.elk.sh/1i0dWthUd7ZKNKHjFc2I96g5L7AWbalLmzB92Wuo-Unk/1";

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const status = document.getElementById("status");
const count = document.getElementById("count");

let cards = [];

function vid(u) {
  const m = u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})|([A-Za-z0-9_-]{11})/);
  return (m && (m[1] || m[2])) || "";
}

// Deterministic "call number" per video — a small nod to the library
// conceit, stable across reloads since it's derived from the video id.
function callNumber(id, channel) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const section = 100 + (hash % 900); // 100–999, Dewey-ish
  const decimal = hash % 100;
  const initials = (channel || "YT")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase() || "YT";
  return `${section}.${String(decimal).padStart(2, "0")} ${initials}`;
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

function renderSkeleton(n = 8) {
  grid.innerHTML = "";
  for (let i = 0; i < n; i++) {
    grid.insertAdjacentHTML(
      "beforeend",
      `<div class="skeleton">
        <div class="thumb-wrap"><div class="thumb"></div></div>
        <div class="line"></div>
        <div class="line short"></div>
      </div>`
    );
  }
}

function render(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    setStatus(
      search.value
        ? `No matches in the stacks for "${search.value}".`
        : "The shelf is empty.",
      true
    );
    count.textContent = "";
    return;
  }

  setStatus("");
  count.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;

  list.forEach((v) => {
    grid.insertAdjacentHTML(
      "beforeend",
      `<a class="card" href="${v.url}" target="_blank" rel="noopener">
        <span class="tab">${v.call}</span>
        <div class="thumb-wrap">
          <img class="thumb" src="${v.thumb}" alt="" loading="lazy"
               onerror="this.onerror=null;this.src='${v.fallback}'">
        </div>
        <div class="info">
          <div class="title">${v.title}</div>
          <div class="channel">${v.channel || "Unknown channel"}</div>
        </div>
      </a>`
    );
  });
}

async function load() {
  renderSkeleton();
  setStatus("Fetching the shelf…");

  try {
    const res = await fetch(API);
    if (!res.ok) {
      throw new Error(`Sheet request failed (${res.status})`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      throw new Error("Sheet response wasn't a list of rows");
    }

    cards = await Promise.all(
      rows.map(async (r) => {
        const url = r.url || r.URL || Object.values(r)[0];
        if (!url) return null;
        const id = vid(url);

        let title = "YouTube Video";
        let channel = "";
        try {
          const meta = await fetch(
            "https://noembed.com/embed?url=" + encodeURIComponent(url)
          ).then((r) => r.json());
          title = meta.title || title;
          channel = meta.author_name || "";
        } catch (e) {
          console.warn("noembed lookup failed for", url, e);
          // fall back to defaults above
        }

        return {
          url,
          title,
          channel,
          call: callNumber(id, channel),
          thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
          fallback: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        };
      })
    );

    render(cards.filter(Boolean));
  } catch (e) {
    console.error("Library failed to load:", e);
    grid.innerHTML = "";
    setStatus(
      "Couldn't reach the shelf (" + e.message + "). Reload, or open the DevTools console for details.",
      true
    );
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

search.oninput = () => {
  const q = search.value.toLowerCase();
  render(
    cards.filter(
      (v) =>
        v &&
        (v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q))
    )
  );
};

load();const API = "https://opensheet.elk.sh/1i0dWthUd7ZKNKHjFc2I96g5L7AWbalLmzB92Wuo-Unk/1";

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const status = document.getElementById("status");
const count = document.getElementById("count");

let cards = [];

function vid(u) {
  const m = u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})|([A-Za-z0-9_-]{11})/);
  return (m && (m[1] || m[2])) || "";
}

// Deterministic "call number" per video — a small nod to the library
// conceit, stable across reloads since it's derived from the video id.
function callNumber(id, channel) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const section = 100 + (hash % 900); // 100–999, Dewey-ish
  const decimal = hash % 100;
  const initials = (channel || "YT")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase() || "YT";
  return `${section}.${String(decimal).padStart(2, "0")} ${initials}`;
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

function renderSkeleton(n = 8) {
  grid.innerHTML = "";
  for (let i = 0; i < n; i++) {
    grid.insertAdjacentHTML(
      "beforeend",
      `<div class="skeleton">
        <div class="thumb-wrap"><div class="thumb"></div></div>
        <div class="line"></div>
        <div class="line short"></div>
      </div>`
    );
  }
}

function render(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    setStatus(
      search.value
        ? `No matches in the stacks for "${search.value}".`
        : "The shelf is empty.",
      true
    );
    count.textContent = "";
    return;
  }

  setStatus("");
  count.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;

  list.forEach((v) => {
    grid.insertAdjacentHTML(
      "beforeend",
      `<a class="card" href="${v.url}" target="_blank" rel="noopener">
        <span class="tab">${v.call}</span>
        <div class="thumb-wrap">
          <img class="thumb" src="${v.thumb}" alt="" loading="lazy"
               onerror="this.onerror=null;this.src='${v.fallback}'">
        </div>
        <div class="info">
          <div class="title">${v.title}</div>
          <div class="channel">${v.channel || "Unknown channel"}</div>
        </div>
      </a>`
    );
  });
}

async function load() {
  renderSkeleton();
  setStatus("Fetching the shelf…");

  try {
    const res = await fetch(API);
    if (!res.ok) {
      throw new Error(`Sheet request failed (${res.status})`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      throw new Error("Sheet response wasn't a list of rows");
    }

    cards = await Promise.all(
      rows.map(async (r) => {
        const url = r.url || r.URL || Object.values(r)[0];
        if (!url) return null;
        const id = vid(url);

        let title = "YouTube Video";
        let channel = "";
        try {
          const meta = await fetch(
            "https://noembed.com/embed?url=" + encodeURIComponent(url)
          ).then((r) => r.json());
          title = meta.title || title;
          channel = meta.author_name || "";
        } catch (e) {
          console.warn("noembed lookup failed for", url, e);
          // fall back to defaults above
        }

        return {
          url,
          title,
          channel,
          call: callNumber(id, channel),
          thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
          fallback: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        };
      })
    );

    render(cards.filter(Boolean));
  } catch (e) {
    console.error("Library failed to load:", e);
    grid.innerHTML = "";
    setStatus(
      "Couldn't reach the shelf (" + e.message + "). Reload, or open the DevTools console for details.",
      true
    );
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

search.oninput = () => {
  const q = search.value.toLowerCase();
  render(
    cards.filter(
      (v) =>
        v &&
        (v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q))
    )
  );
};

load();
