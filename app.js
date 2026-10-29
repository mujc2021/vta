'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const data = window.VTA_DATA;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reducedMotion.matches;
const source = id => `assets/videos/${id}.mp4`;
const poster = id => `assets/images/${id}.webp`;
const format = n => Number(n.toFixed(2)).toString();
function attachVideo(video, id, autoplay=false) {
  video.pause();
  video.poster = poster(id);
  if (video.getAttribute('src') !== source(id)) {video.src = source(id); video.load();}
  if (autoplay) video.play().catch(()=>{});
}
function setActive(group, selected, attr='aria-selected') {
  group.forEach(button => {const active=button===selected;button.setAttribute(attr,String(active));button.classList.toggle('active',active);if(button.getAttribute('role')==='tab')button.tabIndex=active?0:-1;});
}
function setupKeyboardTabs(container) {
  container.addEventListener('keydown',e=>{
    const tabs=[...container.querySelectorAll('[role="tab"]')];
    const current=tabs.indexOf(document.activeElement);if(current<0)return;
    let next=current;
    if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(current+1)%tabs.length;
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(current-1+tabs.length)%tabs.length;
    else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
    e.preventDefault();tabs[next].focus();tabs[next].click();
  });
}

// Load and play ambient media only while it is visible. Explicit demos retain native controls.
const ambientObserver = new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(isIntersecting && !motionPaused && !document.hidden && !$('#media-dialog').open){
    if(!target.getAttribute('src'))target.src=target.dataset.src;
    target.play().catch(()=>{});
  } else target.pause();
}),{threshold:.15});
$$('.ambient').forEach(v=>ambientObserver.observe(v));
function updateMotionButton(){ $('#motion-toggle').innerHTML=motionPaused?'Resume motion <span>▷</span>':'Pause motion <span>Ⅱ</span>';$('#motion-toggle').setAttribute('aria-pressed',String(motionPaused));}
updateMotionButton();
$('#motion-toggle').addEventListener('click',()=>{
  motionPaused=!motionPaused;updateMotionButton();
  $$('.ambient').forEach(v=>{if(motionPaused)v.pause();else{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){if(!v.src)v.src=v.dataset.src;v.play().catch(()=>{});}}});
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$$('video').forEach(v=>v.pause());else if(!motionPaused)$$('.ambient').forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)v.play().catch(()=>{});});});

// Instruction-following galleries use the user's full-frame curated clips.
function selectShowcase(id,play=false){
 const entry=data.showcases[id];const buttons=$$('[data-showcase]');setActive(buttons,buttons.find(b=>b.dataset.showcase===id));
 $('#instruction-panel').setAttribute('aria-labelledby',`showcase-tab-${id}`);
 $('#instruction-kind').textContent=entry.kind;$('#instruction-title').textContent=entry.title;$('#instruction-description').textContent=entry.description;$('#instruction-count').textContent=entry.count;
 $('#instruction-expand').dataset.watch=entry.video;$('#instruction-expand').dataset.title=entry.title;
 attachVideo($('#instruction-video'),entry.video,play);
}
$$('[data-showcase]').forEach(b=>b.addEventListener('click',()=>selectShowcase(b.dataset.showcase,true)));
selectShowcase('grasps');

// Task explorer.
let activeTask='track';
$('.demo-nav').innerHTML=data.tasks.map((t,i)=>`<button role="tab" id="task-tab-${t.id}" aria-controls="demo-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" class="${i===0?'active':''}" data-task="${t.id}"><span class="task-number">0${i+1}</span><span class="task-name">${t.name}<small>${t.short}</small></span><span class="task-arrow">↗</span></button>`).join('');
$('.demo-stage').id='demo-panel';$('.demo-stage').setAttribute('role','tabpanel');
function selectTask(id,play=false){
 const task=data.tasks.find(t=>t.id===id);activeTask=id;
 const buttons=$$('[data-task]');setActive(buttons,buttons.find(b=>b.dataset.task===id));
 $('.demo-stage').setAttribute('aria-labelledby',`task-tab-${id}`);
 $('#demo-count').textContent=`0${data.tasks.indexOf(task)+1} / 05`;
 $('#demo-title').textContent=task.title;$('#demo-description').textContent=task.description;$('#demo-score').innerHTML=`${task.score}<span>%</span>`;
 $('#demo-route').hidden=id!=='track';
 if(id==='track')setActive($$('[data-route]'),$('[data-route="front"]'),'aria-pressed');
 attachVideo($('#demo-video'),task.video,play);
}
$$('[data-task]').forEach(b=>b.addEventListener('click',()=>selectTask(b.dataset.task,true)));
$$('[data-route]').forEach(b=>b.addEventListener('click',()=>{setActive($$('[data-route]'),b,'aria-pressed');attachVideo($('#demo-video'),`track-${b.dataset.route}`,true);}));
selectTask('track');

// Backbone comparison: linear axes are labeled for the selected metric.
function renderPrior(metric){
 const maximum=metric==='if'?100:10;
 $('#prior-bars').innerHTML=data.priors.map(row=>{const mean=row[metric].reduce((a,b)=>a+b,0)/8;return `<div class="prior-bar ${row.ours?'ours':''}"><div class="prior-bar-head"><span>${row.name}</span><strong>${mean.toFixed(2)}%</strong></div><div class="prior-track"><i style="width:${mean/maximum*100}%"></i></div></div>`;}).join('')+`<div class="prior-axis"><span>0</span><span>${maximum/2}</span><span>${maximum}%</span></div>`;
 $('#prior-note').textContent=metric==='if'?'Eight-task mean joint IF: the generated video follows the instruction and execution follows the video, judged by GPT-6.1 Sol.':'Eight-task mean task completion after target adaptation. These backbone-transfer results use the same evaluation setting as the paper’s comparison.';
}
$$('[data-prior-metric]').forEach(b=>b.addEventListener('click',()=>{setActive($$('[data-prior-metric]'),b,'aria-pressed');renderPrior(b.dataset.priorMetric);}));renderPrior('if');
let planPlaying=false;
$('#plan-play').addEventListener('click',()=>{
 planPlaying=!planPlaying;
 $$('[data-plan]').forEach(v=>{if(planPlaying){attachVideo(v,v.dataset.plan);v.currentTime=0;v.play().catch(()=>{});}else v.pause();});
 $('#plan-play').innerHTML=planPlaying?'Pause all three <span>Ⅱ</span>':'Play all three <span>▷</span>';
});

// The curated pouring / fruit pairs are uniformly retimed to 10.6 seconds.
let activeICL='pour';let iclPlaying=false;
function selectICL(id,play=false){
 activeICL=id;const entry=data.icl[id];const buttons=$$('[data-icl]');setActive(buttons,buttons.find(b=>b.dataset.icl===id));
 $('#icl-input-label').textContent=entry.label;$('#icl-title').textContent=entry.title;$('#icl-description').textContent=entry.description;
 $('#icl-reference').hidden=!!entry.image;$('#icl-image').hidden=!entry.image;
 if(entry.image){$('#icl-reference').pause();$('#icl-image').src=poster(entry.reference);}else attachVideo($('#icl-reference'),entry.reference,play);
 attachVideo($('#icl-execution'),entry.execution,play);
 iclPlaying=play;updateICLButton();
}
function updateICLButton(){$('#icl-play').innerHTML=iclPlaying?'Pause the pair <span>Ⅱ</span>':'Play the pair <span>▷</span>';}
$$('[data-icl]').forEach(b=>b.addEventListener('click',()=>selectICL(b.dataset.icl,true)));
$('#icl-play').addEventListener('click',()=>{iclPlaying=!iclPlaying;['#icl-reference','#icl-execution'].forEach(sel=>{const v=$(sel);if(v.hidden)return;if(iclPlaying){if(v.ended)v.currentTime=0;v.play().catch(()=>{});}else v.pause();});updateICLButton();});
selectICL('pour');

// Benchmark explorer. Tables remain available alongside the visual comparison.
let activeBenchmark='real';
function renderBenchmark(id){
 activeBenchmark=id;const b=data.benchmarks[id];const buttons=$$('[data-benchmark]');setActive(buttons,buttons.find(btn=>btn.dataset.benchmark===id));
 $('#benchmark-eyebrow').textContent=b.eyebrow;$('#benchmark-score').innerHTML=`${b.score}<span>%</span>`;$('#benchmark-title').textContent=b.title;$('#benchmark-description').textContent=b.description;$('#benchmark-protocol').textContent=b.protocol;
 $('#benchmark-score-label').textContent=id==='twin'?'CLEAN → RANDOM SUCCESS':'MEAN TASK SUCCESS';
 $('#benchmark-task').innerHTML=(id==='twin'?'':'<option value="mean">Mean success</option>')+b.tasks.map((t,i)=>`<option value="${i}">${t}</option>`).join('');
 renderBenchmarkBars();
 $('#benchmark-table').innerHTML=`<table><caption class="sr-only">${b.eyebrow} task success percentages</caption><thead><tr><th>Method</th>${b.tasks.map(t=>`<th>${t}</th>`).join('')}${id==='twin'?'':'<th>Mean</th>'}</tr></thead><tbody>${b.rows.map(r=>`<tr class="${r.ours?'ours':''}"><td>${r.name}</td>${r.scores.map(s=>`<td>${format(s)}</td>`).join('')}${id==='twin'?'':`<td>${format(r.average)}</td>`}</tr>`).join('')}</tbody></table>`;
}
function renderBenchmarkBars(){
 const b=data.benchmarks[activeBenchmark],metric=$('#benchmark-task').value;
 const rows=b.rows.map(r=>({...r,value:metric==='mean'?r.average:r.scores[Number(metric)]})).sort((a,b)=>b.value-a.value);
 $('#benchmark-bars').innerHTML=rows.map(r=>`<div class="benchmark-bar ${r.ours?'ours':''}"><span class="benchmark-name">${r.name}</span><span class="benchmark-track"><i style="width:${r.value}%"></i></span><span class="benchmark-value">${format(r.value)}</span></div>`).join('');
}
$$('[data-benchmark]').forEach(b=>b.addEventListener('click',()=>renderBenchmark(b.dataset.benchmark)));$('#benchmark-task').addEventListener('change',renderBenchmarkBars);renderBenchmark('real');
$$('[data-result-link]').forEach(a=>a.addEventListener('click',()=>renderBenchmark(a.dataset.resultLink)));
$$('[role="tablist"]').forEach(setupKeyboardTabs);

// Accessible full-size video / figure viewer.
let mediaTrigger=null;const dialog=$('#media-dialog');
function openMedia(button,isImage=false){
 mediaTrigger=button;$$('video').forEach(v=>v.pause());planPlaying=false;$('#plan-play').innerHTML='Play all three <span>▷</span>';iclPlaying=false;updateICLButton();
 $('#dialog-title').textContent=button.dataset.title;
 const content=$('#dialog-content');content.replaceChildren();
 if(isImage){const img=new Image();img.src=`assets/images/${button.dataset.image}.webp`;img.alt=button.dataset.title;const link=document.createElement('a');link.href=img.src;link.target='_blank';link.rel='noopener';link.className='figure-original';link.textContent='Open full-resolution figure ↗';content.append(img,link);}
 else{const v=document.createElement('video');v.controls=true;v.playsInline=true;v.src=source(button.dataset.watch);v.poster=poster(button.dataset.watch);v.setAttribute('aria-label',button.dataset.title);content.append(v);}
 dialog.showModal();if(!isImage)content.querySelector('video').play().catch(()=>{});
}
$$('[data-watch]').forEach(b=>b.addEventListener('click',()=>openMedia(b)));$$('[data-image]').forEach(b=>b.addEventListener('click',()=>openMedia(b,true)));
$('#dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{$('#dialog-content').querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});$('#dialog-content').replaceChildren();mediaTrigger?.focus();if(!motionPaused&&!document.hidden)$$('.ambient').forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)v.play().catch(()=>{});});});

// Stop off-screen non-ambient media; do not unexpectedly restart it when scrolling back.
const demoObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting){target.querySelectorAll('video:not(.ambient)').forEach(v=>v.pause());if(target.classList.contains('icl-player')){iclPlaying=false;updateICLButton();}if(target.classList.contains('plan-triptych')){planPlaying=false;$('#plan-play').innerHTML='Play all three <span>▷</span>';}}}),{threshold:0});
[$('.demo-stage'),$('.plan-triptych'),$('.icl-player'),$('.instruction-panel')].forEach(el=>demoObserver.observe(el));

const menu=$('.menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');$('#nav-links').classList.toggle('open',open);});
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');$('#nav-links').classList.remove('open');}
$$('.nav-links a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
function updateNavigation(){let active='';$$('.nav-links a').forEach(a=>{if($(a.hash).getBoundingClientRect().top<=180)active=a.hash;});$$('.nav-links a').forEach(a=>a.classList.toggle('active',a.hash===active));}
updateNavigation();window.addEventListener('resize',updateNavigation);
let ticking=false;window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{const height=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=`${height>0?scrollY/height*100:0}%`;updateNavigation();ticking=false;});ticking=true;}},{passive:true});
$('#resource-links').innerHTML=['paper','code'].map(key=>{const label=key==='paper'?'Paper':'Code';const url=window.VTA_RESOURCES[key];if(url){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=`${label} ↗`;return a.outerHTML;}return `<span class="resource-pending">${label}<span>RELEASE FORTHCOMING</span></span>`;}).join('');
$('#copy-citation').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#bibtex').textContent);$('#copy-status').textContent='Citation copied.';$('#copy-citation').textContent='Copied ✓';}catch{$('#copy-status').textContent='Select and copy the BibTeX text below.';}});
