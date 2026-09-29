/* Progressive enhancement: show details, media, photos, and email preparation. */
document.documentElement.classList.add('js');
const navToggle = document.querySelector('.site-nav-toggle');
const navList = document.getElementById('site-nav-list');
function closeMenu(returnFocus = false) {
  navList.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  if (returnFocus) navToggle.focus();
}
navToggle.addEventListener('click', () => navToggle.setAttribute('aria-expanded', String(navList.classList.toggle('open'))));
navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && navList.classList.contains('open')) closeMenu(true); });

// Explicit offsets preserve Central time for visitors in every timezone.
function refreshShows(now = Date.now()) {
  const cards = [...document.querySelectorAll('.show-card[data-start]')].sort((a,b) => Date.parse(a.dataset.start) - Date.parse(b.dataset.start));
  cards.forEach(card => { card.hidden = Date.parse(card.dataset.end) <= now; });
  const featured = document.querySelector('[data-featured-end]');
  if (featured) featured.hidden = Date.parse(featured.dataset.featuredEnd) <= now;
  const next = cards.find(card => !card.hidden);
  const hero = document.getElementById('hero-next');
  hero.replaceChildren();
  const label = document.createElement('span'); label.className = 'eyebrow';
  const title = document.createElement('strong'); const detail = document.createElement('span');
  if (next) {
    const playing = Date.parse(next.dataset.start) <= now;
    label.textContent = playing ? 'On stage now' : 'Next show';
    const date = new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago',month:'short',day:'numeric'}).format(new Date(next.dataset.start));
    title.textContent = date + ' · ' + next.querySelector('.show-venue').textContent.trim();
    detail.textContent = next.querySelector('.show-meta').textContent.split(' · ').slice(0,2).join(' · ') + ' CT →';
    hero.href = '#' + next.id;
  } else {
    label.textContent = 'More nights ahead'; title.textContent = 'New dates on the way.';
    detail.textContent = 'Book your night with us →'; hero.href = '#book';
  }
  hero.append(label,title,detail);
}
refreshShows(); setInterval(() => refreshShows(), 60000);

const photoDialog = document.getElementById('photo-dialog');
let photoTrigger;
document.querySelectorAll('[data-gallery]').forEach(link => link.addEventListener('click', e => {
  if (!photoDialog.showModal) return;
  e.preventDefault(); photoTrigger = link;
  const img = photoDialog.querySelector('img'); img.src = link.href; img.alt = link.querySelector('img').alt;
  photoDialog.querySelector('p').textContent = img.alt;
  photoDialog.showModal();
}));
document.getElementById('photo-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', e => { if(e.target === photoDialog) { const r = photoDialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) photoDialog.close(); } });
photoDialog.addEventListener('close', () => photoTrigger?.focus());

const clipGrid = document.getElementById('song-clips');
(window.BAND_CLIPS || []).forEach(clip => {
  if (!clip.title || (!/^[\w-]{11}$/.test(clip.youtubeId || '') && !/^video\/[\w./-]+\.mp4$/.test(clip.src || ''))) return;
  const card = document.createElement('article'); card.className = 'clip-card';
  const frame = document.createElement('div'); frame.className = 'video-frame';
  if (clip.youtubeId) {
    const iframe = document.createElement('iframe'); iframe.src = 'https://www.youtube.com/embed/' + clip.youtubeId;
    iframe.title = clip.title; iframe.loading = 'lazy'; iframe.allowFullscreen = true; iframe.allow = 'encrypted-media; picture-in-picture'; frame.append(iframe);
  } else {
    const video = document.createElement('video'); video.src = clip.src; video.controls = true; video.preload = 'none'; video.playsInline = true;
    if (clip.poster) video.poster = clip.poster;
    const fallback = document.createElement('a'); fallback.href = clip.src; fallback.textContent = 'Download ' + clip.title; video.append(fallback); frame.append(video);
  }
  const heading = document.createElement('h3'); heading.textContent = clip.title;
  const description = document.createElement('p'); description.textContent = clip.description || '';
  card.append(frame,heading,description); clipGrid.append(card); clipGrid.hidden = false;
});

function buildBookingDraft(form) {
  const data = new FormData(form);
  const value = name => String(data.get(name) || '').trim();
  const subject = `Booking inquiry: ${value('venue_type')} — ${value('event_date') || 'date TBD'}`;
  const body = [`Name: ${value('name')}`, `Contact: ${value('contact')}`, '', `Venue type: ${value('venue_type')}`, `Event date: ${value('event_date') || 'To be decided'}`, '', 'Event details:', value('notes') || '(none)', '', 'From playtheusualsuspects.com'].join('\n');
  return {subject, body, mailto:`mailto:buck956@att.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
function submitBookForm(event) {
  event.preventDefault();
  const form = event.target;
  for (const name of ['name','contact']) {
    const field = form.elements.namedItem(name);
    field.setCustomValidity(field.value.trim() ? '' : 'Please enter your ' + name + '.');
    field.oninput = () => field.setCustomValidity('');
  }
  if (!form.reportValidity()) return false;
  const draft = buildBookingDraft(form);
  document.getElementById('booking-draft').value = 'Subject: ' + draft.subject + '\n\n' + draft.body;
  document.getElementById('booking-copy').hidden = false;
  document.getElementById('booking-status').textContent = 'Your email is ready. Send it from your email app to complete your inquiry. If it did not open, copy the draft below.';
  window.location.href = draft.mailto;
  return false;
}
