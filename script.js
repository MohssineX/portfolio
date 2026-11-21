// Copyright (C) 2026 Mohssine <https://github.com/MohssineX>
// SPDX-License-Identifier: GPL-3.0-only

// Tiny theme toggle: dark by default, follows system light, remembers the choice
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");
  // The saved theme is applied by the inline script in <head>

  function isLight() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "light";
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function render() {
    // The button shows the theme you will switch TO
    btn.innerHTML = isLight() ? "Dark theme " + MOON : "Light theme " + SUN;
    btn.title = isLight() ? "Switch to dark theme" : "Switch to light theme";
  }
  render();

  btn.addEventListener("click", function () {
    var next = isLight() ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    render();
  });
})();

// Live star and fork counts from GitHub, cached for 30 minutes to stay under
// the unauthenticated API limit (60 requests/hour per IP).
// Stars show whenever known; forks show only when greater than 0.
// If a fetch fails, the cached values (if any) stay on screen.
(function () {
  var KEY = "gh-counts-v2";
  var TTL = 30 * 60 * 1000;

  function setTag(card, selector, n, label, hideZero) {
    var tag = card.querySelector(selector);
    if (!tag) return;
    if (typeof n !== "number" || (hideZero && n <= 0)) { tag.hidden = true; return; }
    tag.querySelector(".count").textContent = n;
    tag.title = n + " " + label;
    tag.hidden = false;
  }

  function apply(data) {
    document.querySelectorAll("[data-repo]").forEach(function (card) {
      var r = data[card.getAttribute("data-repo").toLowerCase()];
      if (!r) return;
      setTag(card, ".tag.stars", r.stars, "GitHub stars", false);
      setTag(card, ".tag.forks", r.forks, "GitHub forks", true);
    });
  }

  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (cached && cached.data) {
    apply(cached.data);
    if (Date.now() - cached.time < TTL) return;
  }

  fetch("https://api.github.com/users/MohssineX/repos?per_page=100", {
    headers: { "Accept": "application/vnd.github+json" }
  })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (repos) {
      var data = {};
      repos.forEach(function (r) {
        data[r.name.toLowerCase()] = { stars: r.stargazers_count, forks: r.forks_count };
      });
      apply(data);
      try { localStorage.setItem(KEY, JSON.stringify({ time: Date.now(), data: data })); } catch (e) {}
    })
    .catch(function () { /* offline or rate-limited: keep cached/hidden values */ });
})();
