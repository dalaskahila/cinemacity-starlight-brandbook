/* Shared by the cinematic journey and the complete standalone handbook. */
(() => {
  const root=document.documentElement, key='starlight-theme';
  let logoMode=null;
  let saved='light';try{saved=localStorage.getItem(key)==='dark'?'dark':'light'}catch{}
  root.dataset.theme=saved;
  function apply(theme,persist=true){
    root.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#5C1214':'#ffffff');
    document.querySelectorAll('[data-theme-logo]').forEach(img=>{img.src=theme==='dark'?img.dataset.darkSrc:img.dataset.lightSrc});
    renderLogo(theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>{button.setAttribute('aria-pressed',String(theme==='dark'));button.querySelector('[data-theme-state]').textContent=theme==='dark'?'on':'off'});
    if(persist)try{localStorage.setItem(key,theme)}catch{}
  }
  function renderLogo(theme){
    const mode=logoMode||(theme==='dark'?'metallic':'burgundy');
    const panel=document.querySelector('.clearspace');
    if(panel){panel.dataset.logoPreview=mode;panel.querySelector('img').src=mode==='metallic'?'assets/wordmark-gold.svg':'assets/wordmark.svg';}
    document.querySelectorAll('[data-logo-mode]').forEach(button=>{
      button.disabled=false;
      button.removeAttribute('title');
      button.setAttribute('aria-pressed',String(button.dataset.logoMode===mode));
    });
  }
  function selectLogo(mode){
    if(mode!=='burgundy'&&mode!=='metallic')return;
    logoMode=mode;renderLogo(root.dataset.theme);
  }
  window.StarlightTheme={apply,selectLogo,current:()=>root.dataset.theme};
  document.addEventListener('DOMContentLoaded',()=>{
    apply(root.dataset.theme,false);
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>button.addEventListener('click',()=>apply(root.dataset.theme==='dark'?'light':'dark')));
  });
  addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='dark'?'dark':'light',false)});
})();
