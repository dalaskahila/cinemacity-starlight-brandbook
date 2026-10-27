/* Local, editable choreography. The shared ScrollCraft engine is unchanged. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const main = document.querySelector('main');
  const folios = [...document.querySelectorAll('.folio')];
  const sectionIndex = Object.fromEntries(folios.map((el,i)=>[el.id,i]));
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const q = s => document.querySelector(s);
  const clamp = v => Math.max(0, Math.min(1, v));
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const smooth = v => v * v * (3 - 2 * v);
  let engine, frame = 0, bounds = [];
  let activeIndex = -1, enteredAt = 0, clubBeat = 0, clubTimer = 0;
  let navigationFrame = 0, navigationTarget = null;
  const entryDuration = 1800, clubHold = 8000;
  function armClub() {
    clearTimeout(clubTimer);
    if(document.hidden || reduce.matches || activeIndex !== sectionIndex.nineteen)return;
    clubTimer=setTimeout(()=>{clubBeat=(clubBeat+1)%3;schedule();armClub();},clubHold);
  }
  function measure() { bounds = folios.map(el => ({top:el.getBoundingClientRect().top + scrollY, travel:Math.max(1,el.offsetHeight-innerHeight)})); }
  function reveal(el, p, a, b, shift=22) {
    const t=smooth(range(p,a,b)); el.style.opacity=t; el.style.transform=`translateY(${(1-t)*shift}px)`;
  }
  function paint() {
    frame=0;
    const progress=bounds.map(b=>clamp((scrollY-b.top)/b.travel));
    let current=0;
    bounds.forEach((b,i)=>{if(scrollY>=b.top-100)current=i;});
    if(current!==activeIndex){activeIndex=current;enteredAt=performance.now();clubBeat=0;armClub();}
    const elapsed=performance.now()-enteredAt;
    const story=progress.map((p,i)=>i===current?Math.min(.68,elapsed/entryDuration*.68):p);
    links.forEach((l,i)=>{ if(i===current)l.setAttribute('aria-current','true');else l.removeAttribute('aria-current'); });
    window.DCTOpening?.update(progress,bounds);
    document.body.classList.toggle('is-cover-active',!document.hidden&&current===sectionIndex.cover&&progress[sectionIndex.cover]<.99&&!reduce.matches);
    folios.forEach((el,i)=>el.classList.toggle('is-scene-active',!document.hidden&&i===current&&(i===folios.length-1||progress[i]<.99)&&!reduce.matches));
    if(reduce.matches)return;
    folios.forEach((el,i)=>{
      const p=progress[i]; el.style.setProperty('--scene-p',p.toFixed(5));
      const sheet=el.querySelector('.sheet');
      if(i<folios.length-1){const t=smooth(range(p,.84,1));sheet.style.transform=`translateY(${-t*6}vh) scale(${1-t*.12})`;sheet.style.borderRadius=`${t*48}px`;sheet.style.opacity=1-smooth(range(p,.92,1));sheet.style.pointerEvents=p>.98?'none':'auto';}
    });
    const h=progress[sectionIndex.cover];
    q('.cover-backdrop').style.transform=`translateY(${-h*1.5}vh)`;
    const s=story[sectionIndex.starlight];
    q('.tall-photo img').style.transform=`scale(1.08) translateY(${-s*4}%)`;
    const unfurl=smooth(range(s,0,.55));
    q('.small-theatre').style.transform=`translate3d(${(1-unfurl)*34}px,${(1-unfurl)*30}px,0) rotate(${(1-unfurl)*-5}deg)`;
    q('.photo-outline').style.transform=`translateX(${(1-unfurl)*8}px) rotate(${(1-unfurl)*2}deg)`;
    q('.photo-outline-second').style.transform=`translateX(${(1-unfurl)*14}px) rotate(${(1-unfurl)*4}deg)`;
    folios.forEach((section,i)=>{
      if(section.id==='cover')return;
      section.querySelectorAll('.presentation-bullets > li').forEach((item,j)=>{
        const start=j*(section.id==='nineteen'?.005:.018),duration=section.id==='nineteen'?.025:.06;
        reveal(item,story[i],start,start+duration,12);
      });
    });
    const t=story[sectionIndex.theatre], aperture=smooth(range(t,.04,.48));
    const mobile=innerWidth<761;
    const horizontal=(mobile?12:23)*(1-aperture), vertical=19*(1-aperture);
    const archRadius=(mobile?170:280)*(1-aperture);
    q('.theatre-photo').style.clipPath=`inset(${vertical}% ${horizontal}% ${vertical}% ${horizontal}% round ${archRadius}px ${archRadius}px ${14*(1-aperture)}px ${14*(1-aperture)}px)`;
    q('.theatre-photo img').style.transform=`scale(${1.08-aperture*.08})`;
    const frameFade=1-smooth(range(t,.22,.48));
    q('.theatre-frame-inner').style.transform=`scale(${1+aperture*.72})`;
    q('.theatre-frame-outer').style.transform=`scale(${1+aperture*.95})`;
    document.querySelectorAll('.theatre-frame').forEach(el=>el.style.opacity=frameFade);
    reveal(q('.theatre-facts'),t,.47,.65,28);
    const beat=clubBeat, local=1;
    document.querySelectorAll('[data-club-beat]').forEach((el,i)=>{
      el.style.visibility=i===beat?'visible':'hidden';el.style.opacity=i===beat?1:0;el.inert=i!==beat;el.setAttribute('aria-hidden',String(i!==beat));
      el.style.transform=i===beat?`translateY(${(1-smooth(local))*14}px)`:'none';
      el.querySelectorAll('img').forEach(img=>img.style.transform=`scale(${1+local*.045})`);
    });
    document.querySelectorAll('[data-club-go]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===beat)));
    const craft=progress[sectionIndex.craft];
    document.querySelectorAll('.craft-lines i').forEach((el,i)=>el.style.transform=`scale(${1+craft*(.035+i*.025)}) rotate(${craft*(i-1)*2}deg)`);
    q('.craft-photo figure img').style.transform=`scale(${1+craft*.07})`;
    const hosting=progress[sectionIndex.hosting];
    q('.hosting-lobby img').style.transform=`scale(${1+hosting*.07})`;
    q('.hosting-private').style.transform=`translate3d(${-hosting*12}px,${-hosting*25}px,0) rotate(${-hosting*2}deg)`;
    if(elapsed<entryDuration&&!document.hidden)schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function setup(){
    cancelNavigation();
    clearTimeout(clubTimer);activeIndex=-1;
    if(engine)engine.destroy();
    document.querySelectorAll('[style]').forEach(el=>{if(el!==document.body)el.removeAttribute('style');});
    window.DCTOpening?.reset();
    document.querySelectorAll('[data-club-beat]').forEach(el=>{el.inert=false;el.removeAttribute('aria-hidden');});
    if(!reduce.matches && window.ScrollCraft)engine=ScrollCraft.mount(main);
    requestAnimationFrame(()=>{measure();paint();});
  }
  function cancelNavigation(){
    cancelAnimationFrame(navigationFrame);navigationFrame=0;navigationTarget=null;
  }
  function goTo(index){
    index=Math.max(0,Math.min(folios.length-1,index));measure();
    const arrival=Number(folios[index].dataset.arrival||.68);
    const destination=bounds[index].top+(reduce.matches||index===0?0:bounds[index].travel*arrival);
    cancelNavigation();
    if(reduce.matches){window.scrollTo({top:destination,behavior:'instant'});paint();return;}
    navigationTarget=index;
    const from=scrollY,started=performance.now();
    // Keep the existing scroll-driven sheet exit/entrance, but finish it with one press.
    function step(now){
      const p=clamp((now-started)/1100);
      window.scrollTo({top:from+(destination-from)*smooth(p),behavior:'instant'});
      schedule();
      if(p<1)navigationFrame=requestAnimationFrame(step);
      else{navigationFrame=0;navigationTarget=null;}
    }
    navigationFrame=requestAnimationFrame(step);
  }
  links.forEach((link,i)=>link.addEventListener('click',e=>{e.preventDefault();goTo(i);}));
  document.querySelectorAll('[data-club-go]').forEach(el=>el.addEventListener('click',()=>{clubBeat=Number(el.dataset.clubGo);schedule();armClub();}));
  addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;
    if(e.key===' '&&e.target.closest('button,a'))return;
    const index=navigationTarget??Math.max(0,activeIndex);
    const next=['ArrowDown','ArrowRight','PageDown'].includes(e.key)?index+1:
      ['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?index-1:
      e.key==='Home'?0:e.key==='End'?folios.length-1:e.key===' '?index+(e.shiftKey?-1:1):null;
    if(next!==null){e.preventDefault();if(!e.repeat)goTo(next);}
  });
  const fs=q('.fullscreen');
  fs.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{fs.hidden=true;}});
  document.addEventListener('fullscreenchange',()=>{fs.setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');});
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{measure();schedule();});
  addEventListener('wheel',cancelNavigation,{passive:true});
  addEventListener('touchstart',cancelNavigation,{passive:true});
  reduce.addEventListener('change',setup);
  document.addEventListener('visibilitychange',()=>{armClub();schedule();});
  document.fonts.ready.then(setup);
  addEventListener('load',()=>{measure();schedule();});
  window.dctPreview={measure,progress:()=>bounds.map(b=>clamp((scrollY-b.top)/b.travel))};
})();
