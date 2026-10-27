'use strict';
const slides = [...document.querySelectorAll('.slide')];
let current = 0;
const isOverview = () => document.body.classList.contains('overview');
function show(index, updateHash = true) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => { slide.classList.toggle('active', i === current); slide.setAttribute('aria-hidden', String(!isOverview() && i !== current)); slide.inert = !isOverview() && i !== current; });
  document.querySelector('#counter').textContent = `${String(current + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  document.querySelector('.progress').style.width = `${(current + 1) / slides.length * 100}%`;
  document.querySelector('#prev').disabled = current === 0;
  document.querySelector('#next').disabled = current === slides.length - 1;
  if (updateHash) history.replaceState(null, '', `#${current + 1}`);
}
function overview() {
  document.body.classList.toggle('overview');
  document.querySelector('#overview').setAttribute('aria-pressed', String(isOverview()));
  show(current);
}
async function fullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { document.querySelector('#fullscreen').textContent = 'Use browser fullscreen'; }
}
document.querySelector('#prev').onclick = () => show(current - 1);
document.querySelector('#next').onclick = () => show(current + 1);
document.querySelector('#overview').onclick = overview;
document.querySelector('#fullscreen').onclick = fullscreen;
document.querySelector('#print').onclick = () => { if (isOverview()) overview(); window.print(); };
slides.forEach((slide, i) => slide.addEventListener('click', () => { if (isOverview()) { overview(); show(i); window.scrollTo(0,0); } }));
document.addEventListener('keydown', e => {
  if (e.altKey || e.metaKey || e.ctrlKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
  if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('button')) return;
  if (['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); show(current + 1); }
  if (['ArrowLeft','ArrowUp','PageUp'].includes(e.key)) { e.preventDefault(); show(current - 1); }
  if (e.key === 'Home') { e.preventDefault(); show(0); }
  if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
  if (e.key.toLowerCase() === 'o') overview();
  if (e.key.toLowerCase() === 'f') fullscreen();
  if (e.key === 'Escape' && isOverview()) overview();
});
window.addEventListener('hashchange', () => show((parseInt(location.hash.slice(1),10) || 1) - 1, false));
document.querySelectorAll('[data-k]').forEach(button => button.addEventListener('click', () => {
  const two = button.dataset.k === '2';
  document.querySelectorAll('[data-k]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
  document.querySelector('[data-secondary]').classList.toggle('selected',two);
  document.querySelector('[data-selection]').textContent = two ? 'top-2: E2, E3' : 'top-1: E2';
  document.querySelector('[data-formula]').textContent = two ? 'y = 0.61 · E2(x) + 0.18 · E3(x)' : 'y = 0.61 · E2(x)';
}));
window.addEventListener('beforeprint', () => { if (isOverview()) overview(); slides.forEach(s => { s.inert=false; s.setAttribute('aria-hidden','false'); }); });
window.addEventListener('afterprint', () => show(current));
show((parseInt(location.hash.slice(1),10) || 1) - 1, false);
