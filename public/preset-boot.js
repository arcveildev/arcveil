/* Applies the stored theme/font preset before first paint (no flash).
   Valid ids come from data-themes / data-fonts on <html>; storage keys
   must match THEME_STORAGE_KEY / FONT_STORAGE_KEY in src/theme/presets.ts.
   `?theme=...&font=...` in the URL selects and stores a preset. */
(function () {
  try {
    var d = document.documentElement;
    var themes = (d.dataset.themes || "").split(",");
    var fonts = (d.dataset.fonts || "").split(",");
    var q = new URLSearchParams(location.search);
    var qt = q.get("theme");
    var qf = q.get("font");
    if (qt && themes.indexOf(qt) > -1) localStorage.setItem("prime.theme", qt);
    if (qf && fonts.indexOf(qf) > -1) localStorage.setItem("prime.font", qf);
    var t = localStorage.getItem("prime.theme");
    var f = localStorage.getItem("prime.font");
    if (t && themes.indexOf(t) > -1) d.dataset.theme = t;
    if (f && fonts.indexOf(f) > -1) d.dataset.font = f;
  } catch {
    /* storage unavailable — keep server defaults */
  }
})();
