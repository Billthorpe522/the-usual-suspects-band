/* The Usual Suspects — site scripts
 *
 * 1. Show logo-img if logo.jpg exists; hide fallback if so
 * 2. Mobile nav toggle (hamburger)
 * 3. Audio sample cards: probe each data-src; swap empty placeholder
 *    for a real <audio controls> tag if the file loads
 * 4. Video section: probe data-local; if video/reel.mp4 loads, replace
 *    YouTube iframe with a local <video controls>
 * 5. Show cards: auto-mark past dates as .show-card-past
 * 6. Booking form: submitBookForm() builds a mailto URL with all fields
 *    and triggers the user's email client
 * 7. Smooth scroll offset for sticky nav (CSS handles smooth scroll,
 *    this just adds the scroll-margin-top to anchor targets)
 */

(function () {
  // ─── 1. Logo fallback probe ────────────────────────────────
  const logoImg = document.querySelector('.logo-img');
  const fallback = document.querySelector('.logo-fallback');
  if (logoImg && fallback) {
    const probe = new Image();
    probe.onload = () => {
      logoImg.style.display = 'block';
      fallback.style.display = 'none';
    };
    probe.onerror = () => {
      logoImg.style.display = 'none';
      fallback.style.display = 'inline-block';
    };
    probe.src = logoImg.getAttribute('src');
  }

  // ─── 2. Mobile nav toggle ─────────────────────────────────
  const navToggle = document.querySelector('.site-nav-toggle');
  const navList = document.getElementById('site-nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close menu when a link is clicked (so anchor scroll lands cleanly)
    navList.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ─── 3. Audio sample auto-load (DORMANT — LISTEN section removed 2026-07-01)
  // To re-enable: drop .mp3 files into audio/, restore the LISTEN <section>
  // in index.html, then uncomment the block below.
  // document.querySelectorAll('.audio-card[data-src]').forEach((card) => {
  //   const src = card.getAttribute('data-src');
  //   const label = card.getAttribute('data-label') || 'Audio sample';
  //   const player = card.querySelector('.audio-player');
  //   if (!src || !player) return;
  //
  //   const probe = new Audio();
  //   probe.addEventListener('loadedmetadata', () => {
  //     const audio = document.createElement('audio');
  //     audio.controls = true;
  //     audio.preload = 'metadata';
  //     audio.src = src;
  //     audio.setAttribute('aria-label', label);
  //     player.innerHTML = '';
  //     player.appendChild(audio);
  //   });
  //   probe.addEventListener('error', () => { return; });
  //   probe.src = src;
  // });

  // ─── 4. Video local-fallback swap ──────────────────────────
  const videoWrap = document.querySelector('.video-wrap[data-local]');
  if (videoWrap) {
    const local = videoWrap.getAttribute('data-local');
    if (local) {
      const probe = new Audio(); // Audio works as a lightweight HEAD probe for media files
      probe.addEventListener('loadedmetadata', () => {
        // Replace the iframe with a local <video>
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.src = local;
        video.poster = '';
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
        const frame = videoWrap.querySelector('.video-frame');
        if (frame) {
          frame.innerHTML = '';
          frame.appendChild(video);
        }
      });
      probe.addEventListener('error', () => {
        // Local file doesn't exist — keep the YouTube embed.
      });
      probe.src = local;
    }
  }

  // ─── 5. Show cards: auto-mark past dates ───────────────────
  document.querySelectorAll('.show-card').forEach((card) => {
    if (card.classList.contains('show-card-placeholder')) return;
    // Parse the show date from the date badge (month + day + year)
    const monthEl = card.querySelector('.show-month');
    const dayEl = card.querySelector('.show-day');
    const yearEl = card.querySelector('.show-year');
    if (!monthEl || !dayEl || !yearEl) return;
    const monthAbbr = monthEl.textContent.trim();
    const day = parseInt(dayEl.textContent.trim(), 10);
    const year = parseInt(yearEl.textContent.trim(), 10);
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    if (!(monthAbbr in months)) return;
    const showDate = new Date(year, months[monthAbbr], day, 23, 59);
    if (showDate < new Date()) {
      card.classList.add('show-card-past');
      const badge = card.querySelector('.show-badge');
      if (badge) {
        badge.textContent = 'PAST';
        badge.classList.remove('show-badge-open');
      }
    }
  });

  // ─── 5a. Hero coupon strip auto-hide ───────────────────────────
  // The top-of-page #hero-coupon strip is for the Manteno Jul 17 show.
  // When the Manteno show-card becomes .show-card-past, hide the strip too
  // so visitors don't see a dead promo above the fold.
  // Match the strip to the Manteno card via its show-date (JUL 17).
  // If Buck swaps the promo to a different show, update this selector.
  (function () {
    const strip = document.getElementById('hero-coupon');
    if (!strip) return;
    const mantenoCard = Array.from(document.querySelectorAll('.show-card')).find((c) => {
      const m = c.querySelector('.show-month')?.textContent.trim();
      const d = c.querySelector('.show-day')?.textContent.trim();
      return m === 'JUL' && d === '17';
    });
    if (mantenoCard && mantenoCard.classList.contains('show-card-past')) {
      strip.classList.add('is-expired');
    }
  })();

  // ─── 5b. Countdown to next show ────────────────────────────
  // Reads the first non-past show-card in the DOM and ticks down to the
  // show date (8 PM local by default, parsed from the show-meta line when
  // possible). Auto-hides if no upcoming show exists.
  (function () {
    const wrap = document.getElementById('next-show-countdown');
    if (!wrap) return;
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    const nextCard = Array.from(document.querySelectorAll('.show-card'))
      .find((c) => !c.classList.contains('show-card-past')
                 && !c.classList.contains('show-card-placeholder'));
    if (!nextCard) return;
    const monthAbbr = nextCard.querySelector('.show-month')?.textContent.trim();
    const day = parseInt(nextCard.querySelector('.show-day')?.textContent.trim(), 10);
    const year = parseInt(nextCard.querySelector('.show-year')?.textContent.trim(), 10);
    if (!monthAbbr || !(monthAbbr in months) || isNaN(day) || isNaN(year)) return;

    // Try to parse time-of-day from .show-meta (e.g. "Sunday · 3:00 PM – 7:00 PM")
    let startHour = 20, startMin = 0; // default 8:00 PM
    const metaText = nextCard.querySelector('.show-meta')?.textContent || '';
    const timeMatch = metaText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      startHour = h; startMin = m;
    }
    const showDate = new Date(year, months[monthAbbr], day, startHour, startMin);
    if (showDate < new Date()) return; // already past — hide

    // Pull venue for the target line
    const venueName = nextCard.querySelector('.show-venue')?.textContent.trim() || '';

    // Day-of-week helper (Sun = 0)
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const targetLine = `${dayNames[showDate.getDay()]}, ${monthNames[showDate.getMonth()]} ${day} · ${venueName}`;
    const targetEl = document.getElementById('countdown-target');
    if (targetEl) targetEl.textContent = targetLine;

    const numEls = {
      days: wrap.querySelector('[data-unit="days"]'),
      hours: wrap.querySelector('[data-unit="hours"]'),
      minutes: wrap.querySelector('[data-unit="minutes"]'),
      seconds: wrap.querySelector('[data-unit="seconds"]')
    };
    const labelEl = wrap.querySelector('.countdown-label');

    function tick() {
      const ms = showDate - new Date();
      if (ms <= 0) {
        // It's showtime
        wrap.classList.add('is-tonight');
        if (labelEl) labelEl.textContent = 'Tonight!';
        if (numEls.days)    numEls.days.textContent    = '00';
        if (numEls.hours)   numEls.hours.textContent   = '00';
        if (numEls.minutes) numEls.minutes.textContent = '00';
        if (numEls.seconds) numEls.seconds.textContent = '00';
        return false; // stop ticking
      }
      const totalSec = Math.floor(ms / 1000);
      const days    = Math.floor(totalSec / 86400);
      const hours   = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      if (numEls.days)    numEls.days.textContent    = String(days).padStart(2, '0');
      if (numEls.hours)   numEls.hours.textContent   = String(hours).padStart(2, '0');
      if (numEls.minutes) numEls.minutes.textContent = String(minutes).padStart(2, '0');
      if (numEls.seconds) numEls.seconds.textContent = String(seconds).padStart(2, '0');
      return true;
    }

    wrap.hidden = false;
    tick();
    const iv = setInterval(() => {
      if (!tick()) clearInterval(iv);
    }, 1000);
  })();

  // ─── 6. Smooth scroll offset for sticky nav ────────────────
  // Add scroll-margin-top to all sections so anchor jumps clear the sticky nav.
  const navHeight = document.querySelector('.site-nav');
  if (navHeight) {
    const offset = navHeight.offsetHeight + 16;
    document.querySelectorAll('section[id], header[id]').forEach((el) => {
      el.style.scrollMarginTop = offset + 'px';
    });
  }

  // ─── 7. Free drink coupon modal ────────────────────────────
  // Wired by [data-free-drink-trigger] on any element (currently the
  // Manteno Jul 17 show card). Opens the #free-drink-modal dialog.
  // Closes on: X button, click on backdrop, Esc key. Locks body scroll
  // while open and traps focus inside the dialog.
  (function () {
    const modal = document.getElementById('free-drink-modal');
    if (!modal) return;
    const triggers = document.querySelectorAll('[data-free-drink-trigger]');
    if (!triggers.length) return;
    const closers = modal.querySelectorAll('[data-free-drink-close]');
    const dialog = modal.querySelector('.modal-dialog');
    let lastFocused = null;

    // Reserve space for the scrollbar before locking, so the page doesn't shift
    function getScrollbarGutter() {
      return window.innerWidth - document.documentElement.clientWidth;
    }
    function lockScroll() {
      const gutter = getScrollbarGutter();
      if (gutter > 0) {
        document.body.style.setProperty('--scrollbar-gutter', gutter + 'px');
      }
      document.body.classList.add('modal-open');
    }
    function unlockScroll() {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('--scrollbar-gutter');
    }

    function focusableInDialog() {
      return Array.from(dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }

    function open() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      // Force layout before transitioning
      // eslint-disable-next-line no-unused-expressions
      modal.offsetHeight;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      lockScroll();
      // Focus the close button (sensible default for a passive modal)
      const closeBtn = dialog.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
      document.addEventListener('keydown', onKeydown);
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      unlockScroll();
      document.removeEventListener('keydown', onKeydown);
      // Wait for transition end to hide, but if reduced-motion, hide immediately
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finalize = () => {
        modal.hidden = true;
        if (lastFocused && typeof lastFocused.focus === 'function') {
          lastFocused.focus();
        }
        modal.removeEventListener('transitionend', finalize);
      };
      if (reduce) {
        finalize();
      } else {
        modal.addEventListener('transitionend', finalize);
        // Safety: if transitionend never fires (e.g., display:none), force-hide after 300ms
        setTimeout(finalize, 300);
      }
    }
    function onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      // Basic focus trap on Tab
      if (e.key === 'Tab') {
        const f = focusableInDialog();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    triggers.forEach((t) => {
      t.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    });
    closers.forEach((c) => {
      c.addEventListener('click', (e) => {
        e.preventDefault();
        close();
      });
    });
  })();
})();

// ─── 7. Booking form mailto builder ──────────────────────────
// Global so the inline onsubmit can find it. Builds a mailto URL with
// all form fields URL-encoded into subject + body, then triggers the
// user's default email client.
function submitBookForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!form) return false;

  const data = {
    name: form.name.value.trim(),
    contact: form.contact.value.trim(),
    venue_type: form.venue_type.value.trim(),
    event_date: form.event_date.value.trim(),
    notes: form.notes.value.trim(),
  };

  const subject = `Booking inquiry: ${data.venue_type || 'unspecified'} — ${data.event_date || 'date TBD'}`;

  const bodyLines = [
    `Name: ${data.name}`,
    `Contact: ${data.contact}`,
    ``,
    `Venue type: ${data.venue_type}`,
    `Event date: ${data.event_date}`,
    ``,
    `Notes:`,
    data.notes || '(none)',
    ``,
    `— Sent from theusualsuspects.com booking form`,
  ];
  const body = bodyLines.join('\n');

  const mailto = `mailto:buck956@att.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Track the booking inquiry as a Lead conversion for Facebook Pixel.
  // Fires before the mail client opens so Meta's attribution captures the event.
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', {
      content_name: 'booking_inquiry',
      content_category: data.venue_type || 'unspecified',
      value: 1.00,
      currency: 'USD',
    });
  }

  // Trigger the mail client. Use window.location so the form action fallback
  // (for browsers without JS) still has a sensible behavior path.
  window.location.href = mailto;
  return false;
}