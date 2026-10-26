/* Clone once for a seamless join; duplicate images are hidden from accessibility. */
(() => {
 const section=document.getElementById('screening');
 const rail=section.querySelector('.screening-rail');
 const original=rail.querySelector('.screening-loop-group');
 const clone=original.cloneNode(true);clone.setAttribute('aria-hidden','true');
 clone.querySelectorAll('img').forEach(img=>img.alt='');rail.append(clone);
 const button=section.querySelector('.screening-pause');
 button.addEventListener('click',()=>{
  const paused=section.classList.toggle('gallery-paused');
  button.setAttribute('aria-label',paused?'Play image carousel':'Pause image carousel');
  button.setAttribute('aria-pressed',String(paused));
 });
})();
