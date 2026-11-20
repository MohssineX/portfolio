// Copyright (C) 2026 Mohssine <https://github.com/MohssineX>
// SPDX-License-Identifier: GPL-3.0-only

// Tiny theme toggle: dark by default, follows system light, remembers the choice
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}

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

// Live star counts from GitHub, fetched on every page load (one API request)
(function () {
  fetch("https://api.github.com/users/MohssineX/repos?per_page=100", {
    headers: { "Accept": "application/vnd.github+json" },
    cache: "no-store"
  })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (repos) {
      var stars = {};
      repos.forEach(function (r) { stars[r.name.toLowerCase()] = r.stargazers_count; });
      document.querySelectorAll("[data-repo]").forEach(function (card) {
        var n = stars[card.getAttribute("data-repo").toLowerCase()];
        if (typeof n !== "number") return;
        var tag = card.querySelector(".tag.stars");
        tag.querySelector(".count").textContent = n;
        tag.title = n + " GitHub stars";
        tag.hidden = false;
      });
    })
    .catch(function () { /* offline or rate-limited: stars stay hidden */ });
})();
