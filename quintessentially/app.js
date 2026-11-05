/* Standalone presenter controller adapted from the approved DCT V26 behavior.
   Entry is time based; ambient photography never depends on continued scrolling. */
(()=>{
const sections=[...document.querySelectorAll('.folio')],links=[...document.querySelectorAll('.chapter-nav a')];
const reduce=matchMedia('(prefers-reduced-motion:reduce)'),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x);
let bounds=[],active=-1,raf=0,nav=0,target=null,paused=false,touchY=null,touchIndex=0;
const prev=document.querySelector('.prev'),next=document.querySelector('.next'),pause=document.querySelector('.pause');
function measure(){bounds=sections.map(e=>({top:e.getBoundingClientRect().top+scrollY,travel:Math.max(1,e.offsetHeight-innerHeight)}))}
function paint(){
 raf=0;let index=0;bounds.forEach((b,i)=>{if(scrollY>=b.top-2)index=i});
 const p=bounds.map(b=>clamp((scrollY-b.top)/b.travel));
 window.DCTOpening?.update(p,bounds);
 if(index!==active){
  active=index;sections.forEach((s,i)=>s.classList.toggle('is-active',i===active));
  links.forEach((a,i)=>i===active?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));
  document.querySelector('.position').textContent=`${String(active+1).padStart(2,'0')} / ${sections.length}`;
  prev.disabled=active===0;next.disabled=active===sections.length-1;
  if(!reduce.matches){
   sections[active].querySelectorAll('.copy > *, .copy li').forEach((e,i)=>{if(e.matches('ul'))return;e.animate([{opacity:0,transform:'translateY(17px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,delay:Math.min(i*65,390),fill:'backwards',easing:'cubic-bezier(.2,.6,.2,1)'})});
  }
 }
 sections.forEach((s,i)=>{
  const sheet=s.querySelector('.sheet');const exit=reduce.matches?0:ease(clamp((p[i]-.48)/.52));
  sheet.style.transform=`translateY(${-exit*5}vh) scale(${1-exit*.07})`;
  sheet.style.borderRadius=`${exit*32}px`;
  sheet.style.opacity=i===sections.length-1?1:1-exit*.5;
 });
}
function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
function cancel(){cancelAnimationFrame(nav);nav=0;target=null}
function go(index){
 index=Math.max(0,Math.min(sections.length-1,index));measure();cancel();
 const arrival=reduce.matches||index===0||index===sections.length-1?0:bounds[index].travel*.12;
 const to=bounds[index].top+arrival;
 document.body.classList.add('has-navigated');
 if(reduce.matches){scrollTo(0,to);schedule();return}
 const start=performance.now(),from=scrollY;target=index;
 function step(now){const t=clamp((now-start)/1100);scrollTo(0,from+(to-from)*ease(t));schedule();if(t<1)nav=requestAnimationFrame(step);else{nav=0;target=null}}
 nav=requestAnimationFrame(step);
}
links.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();go(i)}));
prev.addEventListener('click',()=>go((target??active)-1));next.addEventListener('click',()=>go((target??active)+1));
addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;
 if(e.key===' '&&e.target.closest('button,a'))return;
 const i=target??active;
 const n=['ArrowDown','ArrowRight','PageDown'].includes(e.key)?i+1:['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?i-1:e.key==='Home'?0:e.key==='End'?sections.length-1:e.key===' '?i+(e.shiftKey?-1:1):null;
 if(n!==null){e.preventDefault();if(!e.repeat)go(n)}
});
pause.addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('paused',paused);pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume ambient motion':'Pause ambient motion');pause.textContent=paused?'▷':'Ⅱ'});
const fs=document.querySelector('.fullscreen');fs.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}});
document.addEventListener('fullscreenchange',()=>fs.setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'));
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{cancel();measure();schedule()});addEventListener('wheel',cancel,{passive:true});
addEventListener('touchstart',e=>{cancel();touchY=e.touches[0].clientY;touchIndex=active},{passive:true});
addEventListener('touchend',e=>{if(touchY!==null){const d=touchY-e.changedTouches[0].clientY;if(Math.abs(d)>45)go(touchIndex+(d>0?1:-1));touchY=null}},{passive:true});
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);schedule()});
reduce.addEventListener('change',()=>{cancel();measure();window.DCTOpening?.reset();active=-1;schedule()});
document.fonts.ready.then(()=>{measure();paint();const hash=sections.findIndex(s=>'#'+s.id===location.hash);if(hash>0)go(hash)});
addEventListener('load',()=>{measure();schedule()});
window.presentation={go,measure,get active(){return active},get target(){return target}};
})();
