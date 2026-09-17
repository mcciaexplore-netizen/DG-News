export function pageMetadata(state,rows){
 const record=rows.find(r=>r.id===(state.preview||state.record));
 const section=state.section;
 const title=record?record.title+' | MCCIA in News':section==='television'?'Prashant Girbane Interviews & TV | MCCIA':section==='press'?'Prashant Girbane Articles & News Coverage | MCCIA':'MCCIA in News | Prashant Girbane Articles & Interviews';
 const description=record?(record.summary||record.title)+' — '+record.publisher+'.': 'Explore published articles, interviews and news coverage featuring MCCIA Director General Prashant Girbane. Browse by publisher, media category and publication date.';
 return {title,description:description.slice(0,300)};
}
