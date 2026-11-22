/* Oak & Iron — open slots, booking dialog, analytics goals. No dependencies. */
(function () {
  "use strict";

  var cfg = JSON.parse(document.getElementById("i18n").textContent);
  var STEP = 30; // minutes between slots

  /* ---------- Analytics goals (Yandex Metrica / GA4, if installed) ---------- */
  function goal(name) {
    try {
      if (typeof window.ym === "function" && cfg.metrikaId) window.ym(cfg.metrikaId, "reachGoal", name);
      if (typeof window.gtag === "function") window.gtag("event", name);
    } catch (e) { /* analytics must never break the page */ }
  }

  /* ---------- Schedule helpers ---------- */
  function hoursFor(date) {
    var h = cfg.hours[date.getDay()]; // [open, close] or null
    return h || null;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toISODate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fromISODate(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function label(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (cfg.clock12) {
      var hh = h % 12 || 12;
      return hh + ":" + pad(m) + (h < 12 ? " am" : " pm");
    }
    return pad(h) + ":" + pad(m);
  }
  // Deterministic "busy" pattern so the demo looks like a real schedule and stays stable on reload
  function isBusy(dateISO, mins) {
    var s = 0, key = dateISO + ":" + mins;
    for (var i = 0; i < key.length; i++) s = (s * 31 + key.charCodeAt(i)) >>> 0;
    return s % 100 < 45;
  }
  function freeSlots(date, now) {
    var h = hoursFor(date);
    if (!h) return [];
    var iso = toISODate(date), start = h[0] * 60, end = h[1] * 60 - 60, out = [];
    if (now && toISODate(now) === iso) {
      var nowMins = now.getHours() * 60 + now.getMinutes() + 30;
      start = Math.max(start, Math.ceil(nowMins / STEP) * STEP);
    }
    for (var t = start; t <= end; t += STEP) if (!isBusy(iso, t)) out.push(t);
    return out;
  }

  /* ---------- Open-slots plate in the hero ---------- */
  var list = document.querySelector("[data-slots-list]");
  if (list) {
    var now = new Date(), day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var slots = freeSlots(day, now), isToday = true;
    for (var tries = 0; slots.length < 3 && tries < 7; tries++) {
      day.setDate(day.getDate() + 1);
      slots = freeSlots(day, null);
      isToday = false;
    }
    if (!isToday) document.querySelector("[data-slots-title]").textContent = cfg.slots.tomorrow;
    document.querySelector("[data-slots-date]").textContent =
      day.toLocaleDateString(cfg.dateLocale, { weekday: "long", day: "numeric", month: "long" });
    slots.slice(0, 6).forEach(function (m) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.className = "slot"; b.textContent = label(m);
      b.addEventListener("click", function () { openBooking({ date: toISODate(day), time: m }); });
      li.appendChild(b); list.appendChild(li);
    });
  }

  /* ---------- Telegram links ---------- */
  if (cfg.telegram) {
    document.querySelectorAll("[data-tg-link]").forEach(function (a) { a.href = cfg.telegram; });
  }

  /* ---------- Booking dialog ---------- */
  var dlg = document.getElementById("booking");
  var form = dlg.querySelector("[data-booking-form]");
  var done = dlg.querySelector("[data-booking-done]");
  var f = form.elements;

  function fillTimes(selected) {
    var date = f.date.value ? fromISODate(f.date.value) : null;
    var opts = date ? freeSlots(date, new Date()) : [];
    f.time.innerHTML = "";
    opts.forEach(function (m) {
      var o = document.createElement("option");
      o.value = String(m); o.textContent = label(m);
      if (m === selected) o.selected = true;
      f.time.appendChild(o);
    });
    f.time.disabled = opts.length === 0;
  }

  function openBooking(pre) {
    pre = pre || {};
    form.hidden = false; done.hidden = true;
    var today = new Date(), max = new Date();
    max.setDate(max.getDate() + 30);
    f.date.min = toISODate(today); f.date.max = toISODate(max);
    if (pre.date) f.date.value = pre.date;
    if (!f.date.value) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      while (freeSlots(d, today).length === 0) d.setDate(d.getDate() + 1);
      f.date.value = toISODate(d);
    }
    fillTimes(pre.time);
    if (pre.barber !== undefined) f.barber.value = pre.barber;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    goal("booking_open");
  }

  function closeBooking() { if (dlg.open) dlg.close(); }

  document.querySelectorAll("[data-book]").forEach(function (b) {
    b.addEventListener("click", function () {
      openBooking(b.hasAttribute("data-barber") ? { barber: b.getAttribute("data-barber") } : {});
    });
  });
  dlg.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeBooking); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeBooking(); });
  f.date.addEventListener("change", function () { fillTimes(); });

  /* Phone: keep digits, light formatting */
  f.phone.addEventListener("input", function () {
    var d = f.phone.value.replace(/\D/g, "");
    if (cfg.lang === "ru") {
      if (d[0] === "8") d = "7" + d.slice(1);
      if (d && d[0] !== "7") d = "7" + d;
      d = d.slice(0, 11);
      var s = "+7";
      if (d.length > 1) s += " " + d.slice(1, 4);
      if (d.length > 4) s += " " + d.slice(4, 7);
      if (d.length > 7) s += "-" + d.slice(7, 9);
      if (d.length > 9) s += "-" + d.slice(9, 11);
      f.phone.value = d ? s : "";
    } else {
      if (d[0] === "1") d = d.slice(1);
      d = d.slice(0, 10);
      var u = d.length > 0 ? "(" + d.slice(0, 3) : "";
      if (d.length >= 4) u += ") " + d.slice(3, 6);
      if (d.length >= 7) u += "-" + d.slice(6, 10);
      f.phone.value = u;
    }
  });

  function setError(input, id, msg) {
    var el = document.getElementById(id);
    el.textContent = msg || "";
    if (input) {
      if (msg) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", id); }
      else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); }
    }
    return !msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (f.company.value) return; // honeypot filled: silently drop spam
    var E = cfg.errors, digits = f.phone.value.replace(/\D/g, "");
    var okName = setError(f.name, "e-name", f.name.value.trim() ? "" : E.required);
    var needDigits = cfg.lang === "ru" ? 11 : 10;
    var okPhone = setError(f.phone, "e-phone", !digits ? E.required : digits.length < needDigits ? E.phone : "");
    var okConsent = setError(f.consent, "e-consent", f.consent.checked ? "" : E.consent);
    if (!(okName && okPhone && okConsent)) {
      var bad = form.querySelector("[aria-invalid='true']");
      if (bad) bad.focus();
      return;
    }
    var booking = {
      service: f.service.value, barber: f.barber.value || null,
      date: f.date.value, time: label(+f.time.value),
      name: f.name.value.trim(), phone: digits
    };
    // Live version: POST booking to the bot / CRM webhook, e.g. fetch(cfg.endpoint, {method: "POST", body: JSON.stringify(booking)})
    var dateText = fromISODate(booking.date).toLocaleDateString(cfg.dateLocale, { day: "numeric", month: "long" });
    dlg.querySelector("[data-done-text]").textContent = cfg.doneText.replace("{date}", dateText).replace("{time}", booking.time);
    form.hidden = true; done.hidden = false;
    done.querySelector("button").focus();
    goal("booking_submit");
    form.reset();
  });
})();
