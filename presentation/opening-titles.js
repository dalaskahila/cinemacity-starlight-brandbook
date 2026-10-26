/* Original implementation of the user's selected OpeningSequence title treatment.
   Source mechanics: perspective 1000px, rotateY(-90deg), blur/dispersal into focus.
   V11: the previous 2.6-second entrance now runs at 3x speed (2600/3 ms).
   The scroll exit covers one third of its former range, ending at the same handoff.
   No remote dependencies; exact DOM text and existing cover line structure survive. */
(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const sections=[...document.querySelectorAll('.folio')];
  const entranceDuration=2600/3;
  const exitEnd=.99, exitRange=.15/3;
  const entries=sections.flatMap((section,sectionIndex)=>{
    const marked=[...section.querySelectorAll('[data-opening-title]')];
    const headings=marked.length?marked:[section.querySelector('h1,h2')];
    return headings.map(heading=>{
    const original=heading.textContent;
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    const letters=[],words=[];
    for(const node of nodes){
      const frag=document.createDocumentFragment();
      for(const token of node.textContent.split(/(\s+)/)){
        if(!token)continue;
        if(/^\s+$/.test(token)){frag.append(document.createTextNode(token));continue;}
        const word=document.createElement('span');word.className='opening-word';word.setAttribute('aria-hidden','true');
        const characters=Array.from(token);
        characters.forEach((character,i)=>{
          const outer=document.createElement('span');outer.className='opening-letter';
          const glyph=document.createElement('span');glyph.className='opening-glyph';glyph.textContent=character;
          outer.append(glyph);word.append(outer);
          letters.push({glyph,spread:(i-(characters.length-1)/2)*.8});
        });
        frag.append(word);words.push(word);
      }
      node.replaceWith(frag);
    }
    heading.classList.add('opening-heading');heading.setAttribute('aria-label',original);
    heading.dataset.openingState=reduce.matches?'held':'waiting';
    return {heading,sectionIndex,letters,words,active:false,animations:[],exit:-1};
    });
  });
  function stop(entry){entry.animations.forEach(a=>a.cancel());entry.animations=[];}
  function enter(entry){
    stop(entry);entry.active=true;entry.exit=-1;entry.heading.dataset.openingState='entering';
    entry.animations=entry.letters.map(({glyph,spread})=>glyph.animate([
      {transform:`translate3d(${spread}em,0,0) rotateY(-90deg)`,opacity:.2,filter:'blur(.36em)',offset:0},
      {transform:`translate3d(${spread*.55}em,0,0) rotateY(-48deg)`,opacity:.55,filter:'blur(.16em)',offset:.38},
      {transform:'translate3d(0,0,0) rotateY(0deg)',opacity:1,filter:'blur(0px)',offset:1}
    ],{duration:entranceDuration,easing:'linear',fill:'both'}));
    const current=entry.animations;
    Promise.all(current.map(a=>a.finished)).then(()=>{
      if(entry.animations!==current)return;
      entry.heading.dataset.openingState='held';stop(entry);
    }).catch(()=>{});
  }
  function reset(){
    entries.forEach(e=>{stop(e);e.active=false;e.exit=-1;e.heading.dataset.openingState=reduce.matches?'held':'waiting';e.words.forEach(w=>{w.style.transform='';w.style.opacity='';w.style.filter='';});});
  }
  function update(progress,bounds){
    if(reduce.matches)return;
    entries.forEach(entry=>{
      const i=entry.sectionIndex;
      const p=progress[i];
      const active=scrollY>=bounds[i].top-1 && (i===sections.length-1||p<exitEnd);
      if(active&&!entry.active)enter(entry);
      if(!active&&entry.active){stop(entry);entry.active=false;entry.heading.dataset.openingState='waiting';}
      const exit=i===sections.length-1?0:Math.max(0,Math.min(1,(p-(exitEnd-exitRange))/exitRange));
      if(exit!==entry.exit){
        entry.exit=exit;
        entry.words.forEach(word=>{word.style.transform=`scale(${1+exit*.13})`;word.style.opacity=String(1-exit);word.style.filter=exit?`blur(${exit*3}px)`:'none';});
      }
    });
  }
  reduce.addEventListener('change',reset);
  window.DCTOpening={update,reset};
})();
