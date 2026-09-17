import {pageMetadata} from './seo.mjs';
import {selections,categories,readState,stateUrl,filterRecords,sectionRecords,displayDate,safeUrl,relatedRecords} from './core.mjs';
const $=id=>document.getElementById(id);
let showTranslations=false;
let publishersExpanded=false;
const imageKind=r=>r.clippingUrl&&!r.clippingUrl.endsWith('.pdf')?'Original clipping':r.thumbnailUrl?'Publisher image':'Illustration';
const lang=r=>({Hindi:'hi',Marathi:'mr',English:'en'}[r.language]||'und');
function translation(r){return showTranslations&&r.translation?.reviewed?`<p class="translation" lang="en"><small>${r.translation.aiReviewed?'English translation · AI-checked against original':'Reviewed English translation'}</small>${esc(r.translation.title)}</p>`:'';}
function relatedMarkup(r){const related=relatedRecords(rows,r);return related.length?`<section class="reader-related"><h3>Related coverage</h3><p class="small">Separate reports by other publishers.</p>${related.map(x=>`<button type="button" class="related-link" data-related="${esc(x.id)}">${esc(x.publisher)} — ${esc(x.title)}</button>`).join('')}</section>`:'';}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cleanState(){const s=readState(location.search);s.section=['articles','interviews','mentions','about','press','television'].includes(s.section)?s.section:'';s.authorship=['author','coauthor'].includes(s.authorship)?s.authorship:'';for(const k of ['topic','type','language','from','to'])s[k]='';s.view='list';if(s.record){s.preview=s.preview||s.record;s.record='';}return s;}
let rows=[],state=cleanState();const pageSize=10;
function update(patch){state={...state,...patch};if(!('page' in patch))state.page=1;history.pushState({},'',stateUrl(state));render();}
function options(id,values,label){$(id).innerHTML=`<option value="">${label}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v==='unknown'?'Date not recorded':v)}</option>`).join('');$(id).value=state[id]||'';}
function sourceButton(r){const u=safeUrl(r.sourceUrl);const video=['Television','Online video'].includes(r.format);const label=video?(r.coverageType==='Interview'?'Watch interview':r.coverageType==='Panel discussion'?'Watch discussion':'Watch coverage'):'Read article';if(!video)return `<button type="button" class="button" data-read="${esc(r.id)}">Read article</button>`;if(!u)return '';return `<a class="button" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;}
function detailLink(r){return stateUrl({...state,record:'',preview:r.id});}
function publicationLine(r){return r.publicationDate?(['Television','Online video'].includes(r.format)?'Broadcast: ':'')+displayDate(r.publicationDate):['Television','Online video'].includes(r.format)?'Broadcast date not recorded'+(r.uploadDate?' · Uploaded '+displayDate(r.uploadDate):''):'Publication date not recorded';}
function badge(r){return r.coverageType==='Authored article'?(r.authors.length>1?'Co-author':'Author'):r.coverageType==='Quotation'?'Quoted':r.coverageType==='Mention'?'Mentioned':r.coverageType;}
function article(r){const preview=safeUrl((r.clippingUrl?.endsWith('.pdf')?null:r.clippingUrl)||r.thumbnailUrl)||null;return `<article class="result archive-card">${preview?`<a class="card-preview" data-record="${esc(r.id)}" href="${esc(detailLink(r))}"><img src="${esc(preview)}" alt="${imageKind(r)}: ${esc(r.title)}" referrerpolicy="no-referrer" loading="lazy" decoding="async" width="640" height="400"><span>${imageKind(r)}</span></a>`:''}<div class="card-body"><p class="card-meta"><strong>${esc(r.publisher)}</strong><span>${esc(publicationLine(r))}</span></p><h3 lang="${lang(r)}"><a data-record="${esc(r.id)}" href="${esc(detailLink(r))}">${esc(r.title)}</a></h3>${translation(r)}${r.summary?`<p class="card-summary">${esc(r.summary)}</p>`:''}<div class="card-footer"><span class="badge">${esc(badge(r))}</span>${sourceButton(r)}</div></div></article>`;}
function videoCard(r){const thumb=safeUrl(r.thumbnailUrl)||null;return `<article class="video-card">${thumb?`<div class="card-preview"><img src="${esc(thumb)}" alt="${r.thumbnailUrl?'Programme preview':'Generic media illustration'}" loading="lazy" decoding="async" width="640" height="400"><span>${r.thumbnailUrl?'Publisher image':'Illustration'}</span></div>`:''}<p class="meta">${esc(r.publisher)} · ${esc(badge(r))}</p><h3 lang="${lang(r)}"><a data-record="${esc(r.id)}" href="${esc(detailLink(r))}">${esc(r.title)}</a></h3>${translation(r)}<p class="quiet">${esc(r.language||'Language not recorded')} · ${esc(publicationLine(r))}</p>${r.programme?`<p class="small"><strong>Programme:</strong> ${esc(r.programme)}</p>`:''}${r.uploadProvenance?`<p class="small">${esc(r.uploadProvenance)}</p>`:''}${r.playbackStartVerified===false?'<p class="small">Episode playback check pending.</p>':''}${sourceButton(r)}</article>`;}
function render(){
 const meta=pageMetadata(state,rows);document.title=meta.title;
 for(const [selector,value] of [['meta[name="description"]',meta.description],['meta[property="og:title"]',meta.title],['meta[property="og:description"]',meta.description]])document.querySelector(selector)?.setAttribute('content',value);

 const section=state.section||'home',authored=['home','articles'].includes(section);
 $('coverage').hidden=section==='about';$('about').hidden=section!=='about';$('author-tabs').hidden=section==='television';document.querySelectorAll('[data-collection]').forEach(b=>b.hidden=section==='press'&&['interviews','mentions'].includes(b.dataset.collection));
 document.querySelectorAll('[data-section]').forEach(a=>{if(a.dataset.section===state.section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('coverage-title').textContent=section==='interviews'?'Interviews & TV':section==='mentions'?'News mentions':section==='articles'?'Articles by DG':'All coverage';

 $('q').value=state.q;$('sort').value=state.sort;options('year',[...new Set(rows.map(r=>r.publicationDate?.slice(0,4)).filter(Boolean))].sort().reverse().concat('unknown'),'All years');
 options('month',Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')),'All months');
 for(const o of $('month').options)if(o.value)o.textContent=new Intl.DateTimeFormat('en',{month:'long',timeZone:'UTC'}).format(new Date('2024-'+o.value+'-01T12:00:00Z'));
 const selected=section==='interviews'?'interviews':section==='mentions'?'mentions':state.authorship||'all';
 document.querySelectorAll('[data-collection]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.collection===selected)));
 const base=sectionRecords(rows,section,state.authorship);
 const sectionCategories=section==='television'?categories.filter(c=>c.endsWith('television')):['press','articles'].includes(section)?categories.filter(c=>!c.endsWith('television')):categories;
 state.category=selections(state.category).filter(c=>sectionCategories.includes(c)).join('|');
 $('publisher-label').textContent=section==='television'?'Channel':'Publisher';
 const pubs=[...new Set(base.filter(r=>!state.category||selections(state.category).includes(r.category)).map(r=>r.publisher))].sort();
 state.publisher=selections(state.publisher).filter(p=>pubs.includes(p)).join('|');
 const publisherRows=filterRecords(base,{...state,publisher:''});
 const categoryLabels={'National English newspapers':'National English dailies','National television':'National channels','Regional television':'Regional channels'};
 function checkboxes(id,values,labels={},countRows=null){$(id).innerHTML=values.map((v,i)=>`<label class="checkbox-option" for="${id}-${i}"><input type="checkbox" id="${id}-${i}" data-filter="${id}" value="${esc(v)}" ${selections(state[id]).includes(v)?'checked':''}><span>${esc(labels[v]||v)}</span>${countRows?`<small>${countRows.filter(r=>r[id]===v).length}</small>`:''}</label>`).join('');}
 checkboxes('category',sectionCategories,categoryLabels,filterRecords(base,{...state,category:''}));checkboxes('publisher',pubs,{},publisherRows);
 const publisherOptions=[...$('publisher').querySelectorAll('.checkbox-option')];
 publisherOptions.forEach((option,index)=>{option.hidden=!publishersExpanded&&index>=6&&!option.querySelector('input').checked;});
 if(publisherOptions.length>6){const toggle=document.createElement('button');toggle.type='button';toggle.className='publisher-expand text-button';toggle.textContent=publishersExpanded?'View less':'View more';toggle.setAttribute('aria-expanded',String(publishersExpanded));toggle.setAttribute('aria-controls','publisher');toggle.addEventListener('click',()=>{publishersExpanded=!publishersExpanded;render();$('publisher').querySelector('.publisher-expand')?.focus();});$('publisher').append(toggle);}

 const activeCount=['q','authorship','month','year'].filter(k=>state[k]).length+selections(state.category).length+selections(state.publisher).length+(['interviews','mentions'].includes(section)?1:0);
 $('clear').hidden=activeCount===0;
 $('filter-count').textContent=activeCount?'('+activeCount+' active)':'';$('filter-toggle').textContent='Filters'+(activeCount?' ('+activeCount+')':'');
 document.querySelectorAll('[data-authorship]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.authorship===state.authorship)));
 const filtered=filterRecords(base,state),pages=Math.max(1,Math.ceil(filtered.length/pageSize));state.page=Math.min(state.page,pages);
 $('search-status').textContent=state.q?'Search: “'+state.q+'” — '+filtered.length+' matching items. Clear filters to see all coverage.':'';
 $('search-status').hidden=!state.q;
 $('coverage-title').textContent=filtered.length?`Showing ${(state.page-1)*pageSize+1}–${Math.min(state.page*pageSize,filtered.length)} of ${filtered.length} results`:'No matching results';
 $('active-filters').innerHTML=['q','category','publisher','month','year'].flatMap(k=>selections(state[k]).map(v=>`<button type="button" class="filter-chip" data-remove-filter="${k}" data-filter-value="${esc(v)}" aria-label="Remove ${esc(k)} filter: ${esc(v)}">${esc(k==='month'?$('month').selectedOptions[0].textContent:v)} <span aria-hidden="true">×</span></button>`)).join('');
 const visible=filtered.slice((state.page-1)*pageSize,state.page*pageSize);
 $('results').className='coverage-cards';
 $('results').innerHTML=visible.length?visible.map(r=>['interviews','television'].includes(section)&&['Television','Online video'].includes(r.format)?videoCard(r):article(r)).join(''):'<div class="empty"><h3>No matching coverage</h3><p>Try a shorter search or clear the filters. Only source-verified records appear here.</p><button id="empty-clear" class="secondary">Clear filters</button></div>';
 $('pagination').innerHTML=pages>1?`<button data-page="${state.page-1}" ${state.page===1?'disabled':''}>Previous</button><span>Page ${state.page} of ${pages}</span><button data-page="${state.page+1}" ${state.page===pages?'disabled':''}>Next</button>`:'';
 document.body.classList.remove('is-detail');$('detail').hidden=true;history.replaceState({},'',stateUrl(state));syncReader();
}
document.addEventListener('click',async e=>{const el=e.target.closest('a,button');if(!el)return;
 if(el.tagName==='A'&&(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey))return;
 if('section' in el.dataset){e.preventDefault();update({...readState(''),section:el.dataset.section});window.scrollTo(0,0);}
 if(el.dataset.collection){const c=el.dataset.collection;update({section:['interviews','mentions'].includes(c)?c:state.section==='press'?'press':'',authorship:['author','coauthor'].includes(c)?c:'',publisher:'',record:''});}
 if(el.dataset.related){e.preventDefault();update({preview:el.dataset.related,page:state.page});}
 if(el.dataset.removeFilter)update({[el.dataset.removeFilter]:selections(state[el.dataset.removeFilter]).filter(v=>v!==el.dataset.filterValue).join('|')});
 if('authorship' in el.dataset)update({authorship:el.dataset.authorship,publisher:''});
 if(el.dataset.record){e.preventDefault();readerTrigger=el;update({record:'',preview:el.dataset.record,page:state.page});}
 if(el.dataset.page){update({page:Number(el.dataset.page)});$('coverage').scrollIntoView();}
 if(['clear','empty-clear'].includes(el.id))update({...readState(''),section:state.section});
 if(el.id==='back-results'){e.preventDefault();update({record:'',page:state.page});$('coverage').scrollIntoView();}
 if(el.id==='copy-link'){try{await navigator.clipboard.writeText(location.href);el.textContent='Link copied';}catch{el.textContent='Copy the address bar URL';}}
});
for(const id of ['sort','month','year'])$(id).addEventListener('change',()=>update({[id]:$(id).value}));
$('filters').addEventListener('change',event=>{const input=event.target;if(!input.dataset.filter)return;const focusId=input.id;const key=input.dataset.filter;const values=selections(state[key]);update({[key]:(input.checked?[...values,input.value]:values.filter(v=>v!==input.value)).join('|')});$(focusId)?.focus();});
window.addEventListener('popstate',()=>{state=cleanState();render();});


const headerObserver=new ResizeObserver(entries=>{document.body.style.setProperty("--site-header-height",entries[0].target.getBoundingClientRect().height+"px");});
headerObserver.observe(document.querySelector("header"));


const reader=document.createElement('dialog');reader.id='article-reader';reader.setAttribute('aria-labelledby','reader-title');document.body.appendChild(reader);
let readerTrigger=null;let readerRecordId=null;let readerSyncClosing=false;
function openReader(r,trigger){
 readerTrigger=trigger||readerTrigger;readerRecordId=r.id;
 const image=safeUrl((r.clippingUrl?.endsWith('.pdf')?null:r.clippingUrl)||r.thumbnailUrl)||null,source=safeUrl(r.sourceUrl);
 const file=safeUrl(r.clippingUrl)||((r.format==='PDF'&&source)?source:null);
 reader.innerHTML=`<button type="button" class="reader-close" aria-label="Close article">×</button><div class="reader-layout"><div class="reader-image">${image?`<img src="${esc(image)}" alt="${imageKind(r)}: ${esc(r.title)}" referrerpolicy="no-referrer"><p>${imageKind(r)==='Original clipping'?'Archived clipping preview · not a full-resolution original':r.thumbnailUrl?'Article image from '+esc(r.publisher)+' · not a newspaper clipping':'Illustration · sample image, not the original article'}</p>`:'<p>No article image is available for this article.</p>'}</div><div class="reader-copy"><p class="meta">${esc(r.publisher)} · ${esc(publicationLine(r))}</p><h2 id="reader-title" lang="${lang(r)}">${esc(r.title)}</h2>${translation(r)}<p><span class="badge">${esc(badge(r))}</span></p>${r.authors.length?`<p class="reader-byline">By ${r.authors.map(esc).join(' and ')}</p>`:'<p class="small">Publisher byline not recorded in this archive.</p>'}<h3>Summary</h3><p>${esc(r.summary||'A summary is not available. Visit the publisher to read the article.')}</p><div class="reader-actions">${source?`<a class="button" href="${esc(source)}" target="_blank" rel="noopener noreferrer">Visit original ↗</a>`:''}${file?`<a class="button secondary" href="${esc(file)}" download="${esc(r.id)}.${esc(file.split('.').pop().split('?')[0])}" ${file.startsWith('/')?'':'target="_blank" rel="noopener noreferrer"'}>${r.clippingUrl?(file.endsWith('.pdf')?'Download clipping PDF':'Download clipping preview'):'Open source PDF'}</a>`:''}<button type="button" id="reader-share" class="secondary">Copy article link</button></div><p id="share-status" class="small" role="status"></p>${file?`<p class="small">${r.clippingUrl?'Download contains the available clipping preview.':'The PDF opens at its source, where it can be saved.'}</p>`:''}${relatedMarkup(r)}</div></div>`;
 reader.querySelector('.reader-close').addEventListener('click',()=>reader.close());
 reader.querySelector('img')?.addEventListener('error',()=>{reader.querySelector('.reader-image').innerHTML='<p>Article image unavailable. Visit the original source.</p>';});
 reader.querySelector('#reader-share').addEventListener('click',async()=>{const link=new URL(stateUrl({...state,record:'',preview:r.id}),location.origin).href;try{await navigator.clipboard.writeText(link);reader.querySelector('#share-status').textContent='Article link copied.';}catch{reader.querySelector('#share-status').textContent=link;}});
 reader.classList.remove('image-expanded');if(!reader.open)reader.showModal();document.body.classList.add('reader-open');
}
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-read]');if(!trigger)return;const record=rows.find(r=>r.id===trigger.dataset.read);if(record){readerTrigger=trigger;update({preview:record.id,page:state.page});}});
reader.addEventListener('close',()=>{document.body.classList.remove('reader-open');(document.querySelector('[data-read="'+readerRecordId+'"]')||readerTrigger)?.focus();if(!readerSyncClosing&&state.preview){state={...state,preview:''};history.replaceState({},'',stateUrl(state));}readerRecordId=null;});
reader.addEventListener('click',event=>{if(event.target===reader){const b=reader.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)reader.close();}});

// Failed publisher images leave a clean text card.
document.addEventListener("error",event=>{const img=event.target;if(!img.matches?.('.card-preview img'))return;const container=img.closest('.card-preview');if(img.getAttribute('src')==='/media-illustration.png'){container.hidden=true;return;}container.hidden=true;},true);

$('search-form').addEventListener('submit',event=>{event.preventDefault();update({q:$('q').value.trim(),record:''});});
$('filter-toggle').addEventListener('click',()=>{const open=$('filter-toggle').getAttribute('aria-expanded')!=='true';$('filter-toggle').setAttribute('aria-expanded',String(open));$('filter-panel').classList.toggle('filters-open',open);});

function syncReader(){const r=rows.find(r=>r.id===state.preview||r.originalIds.includes(state.preview));if(r){if(readerRecordId!==r.id||!reader.open)openReader(r,readerTrigger);}else if(reader.open){readerSyncClosing=true;reader.close();readerSyncClosing=false;}}
$('apply-filters').addEventListener('click',()=>{$('filter-panel').classList.remove('filters-open');$('filter-toggle').setAttribute('aria-expanded','false');$('filter-toggle').focus();});
try{const response=await fetch('/records.json');if(!response.ok)throw Error('Dataset unavailable');rows=await response.json();render();}catch(error){$('load-error').hidden=false;console.error(error);}

