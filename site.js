(function () {
  /* Theme toggle: remembers the choice on this device only. */
  var b = document.getElementById("theme-toggle");
  if (b) {
    var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    var apply = function (t) {
      document.documentElement.setAttribute("data-theme", t);
      var next = t === "dark" ? "light" : "dark";
      b.innerHTML = next === "dark" ? MOON : SUN;
      b.setAttribute("aria-label", "Switch to " + next + " theme");
    };
    apply(document.documentElement.getAttribute("data-theme"));
    b.addEventListener("click", function () {
      var t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      apply(t);
      try { localStorage.setItem("theme", t); } catch (e) {}
    });
  }

  /* Tour tabs: arrow keys move between tabs. Without JavaScript every panel stays visible. */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  if (tabs.length) {
    var show = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { show(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); show(tabs[j], true); }
      });
    });
  }

  /* Download page: highlight the package that fits this device. */
  var reco = document.getElementById("reco");
  if (reco) {
    var ua = navigator.userAgent || "", plat = (navigator.platform || "") + " " + ua;
    var os = /Win(32|64|dows)/i.test(plat) && !/Phone/i.test(ua) ? "win" : /Mac/i.test(plat) && !/iPhone|iPad/i.test(ua) ? "mac" : /Linux|X11/i.test(plat) && !/Android/i.test(ua) ? "linux" : "";
    var arch = "";
    if (os === "linux") arch = /aarch64|arm64|armv8/i.test(plat) ? "arm64" : "amd64";
    var finish = function (key) {
      var row = document.querySelector('[data-pkg="' + key + '"]');
      if (!row) return;
      row.classList.add("is-match");
      document.getElementById("reco-name").textContent = row.getAttribute("data-label");
      document.getElementById("reco-link").setAttribute("href", row.getAttribute("data-href"));
      document.getElementById("reco-link").textContent = "Download " + row.getAttribute("data-ext");
      reco.hidden = false;
    };
    if (os === "win") finish("win-x64");
    else if (os === "linux") finish("deb-" + arch);
    else if (os === "mac") {
      /* Safari and Chrome hide the Mac chip, so ask for the architecture when the browser can tell us. */
      var guess = function (a) { finish(a === "arm" || a === "arm64" ? "dmg-arm64" : "dmg-x86_64"); };
      if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        navigator.userAgentData.getHighEntropyValues(["architecture"]).then(function (v) { guess(v.architecture); }, function () { finish("dmg-arm64"); });
      } else { finish("dmg-arm64"); }
      var hint = document.getElementById("reco-hint");
      if (hint) hint.hidden = false;
    }
  }
})();
