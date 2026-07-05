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

  // ─── 6. Smooth scroll offset for sticky nav ────────────────
  // Add scroll-margin-top to all sections so anchor jumps clear the sticky nav.
  const navHeight = document.querySelector('.site-nav');
  if (navHeight) {
    const offset = navHeight.offsetHeight + 16;
    document.querySelectorAll('section[id], header[id]').forEach((el) => {
      el.style.scrollMarginTop = offset + 'px';
    });
  }
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

  // Trigger the mail client. Use window.location so the form action fallback
  // (for browsers without JS) still has a sensible behavior path.
  window.location.href = mailto;
  return false;
}