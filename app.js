(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  // ScrollCraft supplies the single worldflight clock and scroll track. The
  // photographic set remains mounted; these transforms are bespoke to Starlight.
  const world = $('#world'), clock = $('[data-sc-world]');
  [...clock.children].forEach(el => { el.style.pointerEvents = 'none'; world.appendChild(el); });
  clock.remove(); world.setAttribute('data-sc-world', '');
  ScrollCraft.mount(document);
  const weights = [1.8,1.6,1.6,2.8,1.8,1.8,1.6], names=['Arrival','Essence','Signature','Colour','Type','Image','Atelier'];
  const starts = weights.map((_, i) => weights.slice(0,i).reduce((a,b)=>a+b,0)), total=weights.reduce((a,b)=>a+b,0);
  const stories=$$('[data-story]'), routes=$$('.route button'), stages=[$('#essence-stage'),$('#identity-plate'),$('#colour-stage'),$('#type-stage'),$('#gallery-stage'),$('#atelier-stage')];
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!media.matches, current=-1, pending=false, toastTimer;
  const clamp=v=>Math.max(0,Math.min(1,v)), ease=v=>{v=clamp(v);return v*v*(3-2*v)};
  const vh=()=>world.getBoundingClientRect().height;
  const updateMotion=()=>{$('#motion-toggle').setAttribute('aria-pressed',String(motion));$('#motion-toggle span').textContent=motion?'on':'off';document.body.classList.toggle('reduced',!motion);render()};
  function visibleAt(i,t){return (i===0?1:ease((t-starts[i]+.16)/.32))*(i===6?1:1-ease((t-starts[i+1]+.16)/.32))}
  function render(){
    pending=false;
    const t=Math.min(total,Math.max(0,scrollY/Math.max(1,vh())));
    let k=0; starts.forEach((s,i)=>{if(t>=s)k=i});
    const local=clamp((t-starts[k])/weights[k]);
    if(k!==current){current=k;routes.forEach((el,i)=>{if(i===k)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current')});$('#location').textContent=names[k]}
    // Never superimpose two readable headlines. A short time-based entrance
    // resolves even when a visitor stops exactly at a waypoint boundary.
    stories.forEach((el,i)=>{const op=+(i===k);el.classList.toggle('active',!!op);el.style.opacity=op;el.inert=i!==k;el.setAttribute('aria-hidden',String(i!==k))});
    stages.forEach((el,j)=>{const i=j+1,op=+(i===k);el.style.opacity=op;el.style.visibility=op?'visible':'hidden';el.inert=i!==k;el.classList.toggle('is-interactive',i===k)});
    const progress=t/total, mobile=innerWidth<=760;
    const emerge=ease(t/1.8), retire=ease((t-1.45)/.35);
    const photoScale=motion?1+emerge*.07-retire*.20:1;
    $('#proscenium').style.transform=`translate3d(${motion?-emerge*1.7:0}vw,${motion?emerge*1.1:0}vh,0) scale(${photoScale})`;
    $('#proscenium').style.opacity=1-retire;
    $('#left-panel').style.opacity=1-retire;
    $('#right-panel').style.opacity=1-retire;
    $('#left-panel').style.transform=motion?`translate3d(${-emerge*1.3}vw,${-emerge*2.5}vh,0) scale(${1-emerge*.04})`:'none';
    $('#right-panel').style.transform=motion?`translate3d(${emerge*1.3}vw,${emerge*2.5}vh,0) scale(${1-emerge*.04})`:'none';
    $('#theatre').style.transform=motion?`scale(${1.03+emerge*.17})`:'none';
    $('#orbital').style.transform=motion?`rotate(${progress*72}deg) scale(${1-progress*.08})`:'none';
    $('#orbital').style.opacity=k>=2?.16:.34;
    const essenceLocal=clamp((t-starts[1])/weights[1]);
    $('.essence-wide img').style.transform=motion?`scale(${1+essenceLocal*.12})`:'none';
    $('.essence-portrait').style.transform=motion?`translateY(${-essenceLocal*18}px)`:'none';
    $('.brand-pattern').style.translate=motion?`0 ${-progress*70}px`:'none';
    $('#type-ribbon').style.opacity=+(k===4);$('#type-ribbon').style.visibility=k===4?'visible':'hidden';
    $('#type-ribbon').style.transform=motion?`translateY(${-clamp((t-starts[4])/weights[4])*25}px)`:'none';
    // The chromatic proscenium opens symmetrically: four rounded frames resolve
    // into the source palette, then stay usable for copying exact colour values.
    const unfurl=motion?ease((t-starts[3]+.16)/2.5):1;
    $$('.swatch-set button').forEach((el,i)=>{const d=i-1.5;el.style.transform=`translateX(${(1-unfurl)*(-d)*(mobile?22:35)}px) rotate(${(1-unfurl)*d*7}deg) translateY(${(1-unfurl)*Math.abs(d)*12}px)`});
    const signatureScale=motion?(.96+clamp((t-starts[2])/weights[2])*.08):1;
    const galleryScale=motion?(1+clamp((t-starts[5])/weights[5])*.12):1;
    const atelierLocal=clamp((t-starts[6])/weights[6]);
    $('.clearspace').style.transform=`scale(${signatureScale})`;
    $('.gallery-main img').style.transform=`scale(${galleryScale})`;
    $('.popcorn-piece').style.transform=motion?`translate3d(${local*12}px,${-local*22}px,0) rotate(${-3+local*5}deg)`:'none';
    $('.stationery-piece').style.transform=motion?`translate3d(${-local*25}px,${local*13}px,0) rotate(${2-local*4}deg)`:'none';
    $('#timeline-fill').style.transform=`scaleX(${progress})`;
    world.dataset.scVerifyState=JSON.stringify({photoScale:+photoScale.toFixed(3),photoOpacity:+(1-retire).toFixed(2),ornamentAngle:motion?+(progress*72).toFixed(1):0,visible:stories.map(el=>+Number(el.style.opacity).toFixed(2)),paletteOpen:+unfurl.toFixed(2),signatureScale:+signatureScale.toFixed(3),galleryScale:+galleryScale.toFixed(3),popcornTilt:motion?+(-3+atelierLocal*5).toFixed(2):0,ticketTilt:motion?+(2-atelierLocal*4).toFixed(2):0,essenceScale:motion?+(1+essenceLocal*.12).toFixed(3):1});
    world.dataset.scVerifyHold=String(!motion);
  }
  function requestRender(){if(!pending){pending=true;requestAnimationFrame(render)}}
  addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender,{passive:true});
  const go=i=>scrollTo({top:(i===0?0:starts[i]+Math.min(.65,weights[i]*.35))*vh(),behavior:motion?'smooth':'instant'});
  $$('[data-go]').forEach(el=>el.addEventListener('click',()=>go(Number(el.dataset.go))));
  $('.brand').addEventListener('click',e=>{e.preventDefault();go(0)});
  $('#grain-toggle').addEventListener('click',()=>{const off=document.body.classList.toggle('no-grain');$('#grain-toggle').setAttribute('aria-pressed',String(!off));$('#grain-toggle span').textContent=off?'off':'on'});
  $('#motion-toggle').addEventListener('click',()=>{motion=!motion;updateMotion()});
  media.addEventListener('change',e=>{motion=!e.matches;updateMotion()});
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
  $$('[data-colour]').forEach(button=>button.addEventListener('click',async()=>{const value=button.dataset.colour;$('#colour-word').style.color=value;$('.colour-specimen').style.setProperty('--sample-ground',value==='#FFE49F'?'#5C1214':'#fff');$('.colour-specimen').style.setProperty('--sample-ink',value==='#FFE49F'?'#FFE49F':'#5C1214');try{await navigator.clipboard.writeText(value);toast(`${value} copied`)}catch{toast(`Colour selected: ${value}`)}}));
  $$('[data-logo-mode]').forEach(button=>button.addEventListener('click',()=>StarlightTheme.selectLogo(button.dataset.logoMode)));
  const setType=()=>{const size=Number($('#type-size').value),actual=innerWidth<=760?size*(innerHeight<=700?.60:.72):size;$('#type-input').style.fontSize=actual+'px';$('#size-output').textContent=size};
  $('#type-size').addEventListener('input',setType);addEventListener('resize',setType,{passive:true});
  $('#reset-type').addEventListener('click',()=>{$('#type-input').value='An evening,\nwell spent.';$('#type-size').value=76;setType()});
  $$('[data-crop]').forEach(el=>el.addEventListener('click',()=>{$('#gallery-stage').classList.toggle('portrait',el.dataset.crop==='portrait');$$('[data-crop]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)))}));
  $$('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const img=$('.gallery-main img');img.src=`assets/${button.dataset.photo}.webp`;img.alt=button.getAttribute('aria-label')+' at Cinemacity Starlight';$('.gallery-main figcaption').textContent=button.getAttribute('aria-label')+'. Original Starlight photography.';$$('[data-photo]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
  const book=$('#handbook'), data=window.STARLIGHT_GUIDE;
  $('#book-index').innerHTML=data.map((p,i)=>`<button data-page="${i}"><span>${String(i+1).padStart(2,'0')}</span>${p.title}</button>`).join('');
  function showPage(i){const p=data[i];$('#book-article').innerHTML=`<span class="tiny">THE HANDBOOK / ${String(i+1).padStart(2,'0')}</span><h2 class="guide-title">${p.heading}</h2><div class="guide-copy">${p.html}</div><div class="guide-next">${i>0?`<button data-page="${i-1}">← ${data[i-1].title}</button>`:'<span></span>'}${i<19?`<button data-page="${i+1}">${data[i+1].title} →</button>`:'<a class="text-link" href="assets.html">Get the SVG assets ↗</a>'}</div>`;$$('#book-index button').forEach((b,j)=>{b.classList.toggle('selected',i===j);b.setAttribute('aria-current',String(i===j))});$('#book-article').scrollTop=0;}
  function openBook(i=1){showPage(i);book.showModal();document.body.style.overflow='hidden'}
  $('#open-index').addEventListener('click',()=>openBook());
  document.addEventListener('click',e=>{const guide=e.target.closest('[data-guide]');if(guide)openBook(Number(guide.dataset.guide));const page=e.target.closest('[data-page]');if(page)showPage(Number(page.dataset.page))});
  $('#close-book').addEventListener('click',()=>book.close());book.addEventListener('close',()=>document.body.style.overflow='');
  book.addEventListener('click',e=>{if(e.target===book){const r=book.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)book.close()}});
  updateMotion();setType();render();
})();

