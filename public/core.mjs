export const categories = ['National English newspapers','Regional newspapers','Magazines and digital publications','National television','Regional television'];
export const fields = ['section','authorship','q','category','publisher','month','year','from','to','language','topic','type','sort','view','page','record','preview'];
export function normalize(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/प्रशांत|प्रशान्त/g,'prashant').replace(/गिरबणे|गिरबने|गिरबाने|गिरबान/g,'girbane')
    .replace(/एमएसएमई|एमएसएमइ|एमएसएमर्इ|msmes/g,'msme')
    .replace(/निर्यात/g,'exports').replace(/उद्योग/g,'industry').replace(/\s+/g,' ').trim();
}
export const selections=value=>String(value||'').split('|').filter(Boolean);
export function readState(search) {
  const p = new URLSearchParams(search), s = {};
  for (const f of fields) s[f] = p.get(f) || '';
  s.category=selections(s.category).filter(c=>categories.includes(c)).join('|');
  if(!/^(0[1-9]|1[0-2])$/.test(s.month))s.month='';
  if (!['oldest','publisher','newest'].includes(s.sort)) s.sort = 'newest';
  if (!['cards','list'].includes(s.view)) s.view = 'list';
  s.page = Math.max(1, Number.parseInt(s.page,10)||1);
  for (const f of ['from','to']) if (!validDate(s[f])) s[f]='';
  if(s.year!=='unknown'&&!/^\d{4}$/.test(s.year))s.year='';
  return s;
}
export function stateUrl(s) {
  const p = new URLSearchParams();
  for(const f of fields) if(s[f] && !(f==='page' && s[f]===1) && !(f==='sort' && s[f]==='newest') && !(f==='view' && s[f]==='list')) p.set(f,s[f]);
  return '/'+(p.size?'?'+p.toString():'');
}
export function dateBounds(date) {
  if (!date) return null;
  if (/^\d{4}$/.test(date)) return [date+'-01-01',date+'-12-31'];
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y,m]=date.split('-').map(Number);
    return [date+'-01',date+'-'+String(new Date(Date.UTC(y,m,0)).getUTCDate()).padStart(2,'0')];
  }
  return [date,date];
}
export function relatedRecords(rows,record){return (record.relatedIds||[]).map(id=>rows.find(r=>r.id===id)).filter(r=>r&&r.id!==record.id&&r.publisher!==record.publisher);}
export function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;}
export function filterRecords(rows,s) {
  if(s.from&&s.to&&s.from>s.to)return [];
  const q=normalize(s.q).split(' ').filter(Boolean);
  return rows.filter(r=>{
    if(s.category && !selections(s.category).includes(r.category)) return false;
    if(s.publisher && !selections(s.publisher).includes(r.publisher)) return false;
    if(s.language && r.language!==s.language) return false;
    if(s.topic && r.topic!==s.topic) return false;
    if(s.type && r.coverageType!==s.type) return false;
    if(s.month && r.publicationDate?.slice(5,7)!==s.month)return false;
    if(s.year==='unknown' && r.publicationDate) return false;
    if(s.year && s.year!=='unknown' && r.publicationDate?.slice(0,4)!==s.year) return false;
    if(s.from || s.to) {
      const b=dateBounds(r.publicationDate);
      if(!b || (s.from && b[1]<s.from) || (s.to && b[0]>s.to)) return false;
    }
    const hay=normalize([r.id,...r.originalIds,r.title,r.publisher,r.topic,r.summary,r.programme,r.evidence,'Prashant Girbane MCCIA'].join(' '));
    return q.every(t=>hay.includes(t));
  }).sort((a,b)=>{
    if(s.sort==='publisher') return a.publisher.localeCompare(b.publisher)||a.title.localeCompare(b.title);
    if(!a.publicationDate && b.publicationDate) return 1;
    if(a.publicationDate && !b.publicationDate) return -1;
    return (s.sort==='oldest'?1:-1)*(a.publicationDate||'').localeCompare(b.publicationDate||'')||a.id.localeCompare(b.id);
  });
}
export function tally(rows,key) {return rows.reduce((a,r)=>{let k=typeof key==='function'?key(r):r[key];k=k||'Not recorded';a[k]=(a[k]||0)+1;return a;},{});}
export function metrics(rows) {
  return {total:rows.length,authored:rows.filter(r=>r.coverageType==='Authored article').length,
    interviews:rows.filter(r=>['Interview','Panel discussion'].includes(r.coverageType)).length,
    reports:rows.filter(r=>['Quotation','Mention','TV news appearance'].includes(r.coverageType)).length,
    publishers:new Set(rows.map(r=>r.publisher)).size};
}
export function displayDate(d) {
  if(!d) return 'Publication date not recorded';
  if(d.length===4) return d;
  const date=new Date(d.length===7?d+'-01T12:00:00Z':d+'T12:00:00Z');
  return new Intl.DateTimeFormat('en-IN',{year:'numeric',month:'short',...(d.length===10?{day:'numeric'}:{}),timeZone:'UTC'}).format(date);
}
export const safeUrl=u=>{if(/^\/clipping-[A-Za-z0-9-]+\.webp$/.test(u||'')||/^\/editorial-assets\/[a-f0-9-]+\.(png|jpg|webp|pdf)$/.test(u||''))return u;try{const v=new URL(u);return ['https:','http:'].includes(v.protocol)?v.href:null;}catch{return null;}};

export function sectionRecords(rows,section,authorship='') {
 const authored=r=>r.coverageType==='Authored article';
 const video=r=>['Television','Online video'].includes(r.format)||['Interview','Panel discussion'].includes(r.coverageType);
 return rows.filter(r=>section==='press'?!['Television','Online video'].includes(r.format):section==='television'?['Television','Online video'].includes(r.format):section==='interviews'?video(r):section==='mentions'?!authored(r)&&!video(r):section==='articles'?authored(r):true).filter(r=>!['home','articles','press',''].includes(section)||!authorship||(authored(r)&&(authorship==='author'?r.authors.length===1:r.authors.length>1)));
}
