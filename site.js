/* The Usual Suspects — small JS file
 * 1. Show logo-img if logo.jpg exists; hide fallback if so
 * 2. Smooth scroll for hash links (already CSS, but adding offset for sticky-style)
 * 3. Year stamp in footer (when added)
 */

(function () {
  const logoImg = document.querySelector('.logo-img');
  const fallback = document.querySelector('.logo-fallback');
  if (!logoImg || !fallback) return;

  // Try to load logo.jpg; if it succeeds, hide the fallback text mark
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
})();
