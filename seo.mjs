import {pageMetadata} from './public/seo.mjs';
import {readState,filterRecords,sectionRecords,displayDate,stateUrl} from './public/core.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderSearchHtml(template,search,rows){
 const state=readState(search),meta=pageMetadata(state,rows);
 let html=template.replace(/<title>.*?<\/title>/,`<title>${esc(meta.title)}</title>`);
 html=html.replace('</head>',`<meta name="description" content="${esc(meta.description)}"><meta name="robots" content="noindex, nofollow"><meta property="og:type" content="website"><meta property="og:site_name" content="MCCIA in News"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta name="twitter:card" content="summary"></head>`);
 const filtered=filterRecords(sectionRecords(rows,state.section,state.authorship),state);
 const selected=rows.find(r=>r.id===(state.preview||state.record));
 const visible=selected?[selected]:filtered.slice((state.page-1)*10,state.page*10);
 const cards=visible.map(r=>`<article><p>${esc(r.publisher)} · ${esc(displayDate(r.publicationDate))}</p><h3><a href="${esc(stateUrl({...state,record:'',preview:r.id}))}">${esc(r.title)}</a></h3><p>${esc(r.summary||'')}</p><p>${esc(r.coverageType==='Authored article'?(r.authors.length>1?'Co-author':'Author'):r.coverageType)}</p></article>`).join('');
 html=html.replace('<div id="results" aria-live="polite"></div>',`<div id="results" aria-live="polite">${cards||'<p>No matching coverage.</p>'}</div>`);
 html=html.replace('<h2 id="coverage-title"></h2>',`<h2 id="coverage-title">${filtered.length} matching items</h2>`);
 return html;
}
