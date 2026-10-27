'use strict';
let state, view=location.hash==='#history'?'history':'remaining', queue=Promise.resolve();
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const total=rows=>rows.reduce((n,r)=>n+(Number(r.ects)||0),0);
const statuses={candidate:'Do wyboru',active:'W trakcie',planned:'Planowany',completed:'Zaliczony',recognized:'Przepisany',transfer:'Do przepisania'};
const allocations={bachelor:'Licencjat',surplus:'Magisterka'};
function save(){
 const data=JSON.stringify(state);$('#save-status').hidden=true;
 queue=queue.catch(()=>{}).then(async()=>{const r=await fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:data});if(!r.ok)throw Error();$('#save-status').hidden=true;}).catch(()=>{$('#save-status').hidden=false;$('#save-status').textContent='Błąd zapisu — pobierz kopię danych';$('#save-status').className='error';});
}
function requirementTable(list){return `<div class="table-wrap"><table><thead><tr><th>Wymaganie</th><th class="num">ECTS</th><th>Semestr</th><th>Kurs</th></tr></thead><tbody>${list.map(r=>`<tr class="${r.done?'done-row':''}"><td><label class="requirement-label"><input type="checkbox" data-req="${esc(r.id)}" ${r.done?'checked':''} aria-label="Zrealizowane: ${esc(r.name)} (semestr ${r.semester})"><span>${esc(r.name)}</span></label></td><td class="num">${r.ects}</td><td>${r.semester}</td><td><input class="mapping" aria-label="Kurs do wymagania ${esc(r.name)} (semestr ${r.semester})" data-mapping="${esc(r.id)}" value="${esc(r.mapping)}" placeholder="—"></td></tr>`).join('')}</tbody></table></div>`;}
function coursesTable(list){return `<div class="table-wrap"><table><thead><tr><th>Przedmiot</th><th class="num">ECTS</th><th>Status</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td>${c.url?`<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.name)}</a>`:esc(c.name)}</td><td class="num">${c.ects}</td><td><span class="tag ${esc(c.status)}">${esc(statuses[c.status]||c.status)}</span></td><td><button class="text-button" data-edit="${esc(c.id)}" aria-label="Edytuj ${esc(c.name)}">Edytuj</button></td></tr>`).join('')}</tbody></table></div>`;}
function transferRows(){return (state.history||[]).filter(h=>h.allocation==='surplus');}
function transfersTable(){const list=transferRows();return `<div class="table-wrap"><table><thead><tr><th>Zaliczony przedmiot</th><th class="num">ECTS</th><th>Semestr licencjatu</th><th>Przepisanie</th></tr></thead><tbody>${list.map(h=>`<tr><td>${esc(h.name)}</td><td class="num">${h.ects}</td><td>${h.semester}</td><td><label class="check-label"><input type="checkbox" data-transfer="${esc(h.id)}" aria-label="Przepisane: ${esc(h.name)}" ${h.transferStatus==='recognized'?'checked':''}>Przepisane</label></td></tr>`).join('')||'<tr><td colspan="4">Brak przedmiotów oznaczonych jako nadwyżka.</td></tr>'}</tbody></table></div>`;}
function render(){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));
 if(view==='remaining'){
  const remaining=state.requirements.filter(r=>!r.done),current=state.courses.filter(c=>c.semester===1),pending=transferRows().filter(h=>h.transferStatus!=='recognized');
  $('#content').innerHTML=`<h1>Do zrobienia</h1><p class="summary"><b>${remaining.length} wymagań · ${total(remaining)} ECTS</b><br>Do przepisania: ${pending.length} przedmiotów · ${total(pending)} ECTS</p><h2>Wymagania</h2>${requirementTable(remaining)}<div class="heading"><h2>Ten semestr</h2><button class="text-button" data-add>Dodaj przedmiot</button></div>${coursesTable(current)}<h2>Kolejny semestr</h2>${coursesTable(state.courses.filter(c=>c.semester===2&&c.status!=='candidate'))}<h2>UW · do wyboru</h2>${coursesTable(state.courses.filter(c=>c.status==='candidate'))}<h2>Do przepisania</h2>${transfersTable()}<details><summary>Zrobione (${state.requirements.filter(r=>r.done).length})</summary>${requirementTable(state.requirements.filter(r=>r.done))}</details>`;
 }else{
  const history=state.history||[];
  $('#content').innerHTML=`<h1>Historia semestrów</h1>${[1,2,3,4,5,6].map(s=>{const rows=history.filter(h=>h.semester===s);return `<div class="semester-group"><div class="semester-title"><h2>Licencjat · semestr ${s}</h2><span>${total(rows)} ECTS</span></div><div class="table-wrap"><table><thead><tr><th>Przedmiot</th><th class="num">ECTS</th><th class="hide-mobile">Ćw. / egz. / prac.</th><th>Rozliczenie</th></tr></thead><tbody>${rows.map(h=>`<tr><td>${esc(h.name)}</td><td class="num">${h.ects}</td><td class="hide-mobile">${esc([h.exercise||'—',h.exam||'—',h.lab||'—'].join(' / '))}</td><td><select data-allocation="${esc(h.id)}" aria-label="Rozliczenie: ${esc(h.name)}">${Object.entries(allocations).map(([k,v])=>`<option value="${k}" ${h.allocation===k?'selected':''}>${v}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></div>`;}).join('')}${[1,2,3,4].map(s=>{const rows=state.courses.filter(c=>c.semester===s&&c.status!=='candidate');return rows.length?`<div class="semester-title"><h2>Magisterskie · semestr ${s}</h2><span>${total(rows)} ECTS</span></div>${coursesTable(rows)}`:'';}).join('')}`;
 }
}
function openEditor(course){const f=$('#course-form');f.reset();f.elements.id.value=course?.id||'';f.elements.semester.value=course?.semester||1;for(const k of ['name','ects','status','notes'])if(course?.[k]!==undefined)f.elements[k].value=course[k];$('#editor').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.view){view=b.dataset.view;location.hash=view;render();}if(b.dataset.edit)openEditor(state.courses.find(c=>c.id===b.dataset.edit));if(b.hasAttribute('data-add'))openEditor();});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.req){state.requirements.find(r=>r.id===t.dataset.req).done=t.checked;save();render();}
 if(t.dataset.mapping){state.requirements.find(r=>r.id===t.dataset.mapping).mapping=t.value;save();}
 if(t.dataset.transfer){const h=state.history.find(h=>h.id===t.dataset.transfer);h.transferStatus=t.checked?'recognized':'pending';const c=state.courses.find(c=>c.historyId===h.id);if(c)c.status=t.checked?'recognized':'transfer';save();render();}
 if(t.dataset.allocation){const h=state.history.find(h=>h.id===t.dataset.allocation);h.allocation=t.value;if(h.allocation!=='surplus')h.transferStatus='pending';const c=state.courses.find(c=>c.historyId===h.id);if(c)c.status=h.allocation==='surplus'?(h.transferStatus==='recognized'?'recognized':'transfer'):'completed';save();render();}
});
$('#course-form').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.name=data.name.trim();if(!data.name)return;data.ects=Number(data.ects);data.semester=Number(data.semester);const old=state.courses.find(c=>c.id===data.id);if(old)Object.assign(old,data);else state.courses.push({...data,id:crypto.randomUUID(),category:'Kurs',grade:''});save();$('#editor').close();render();};
$('#close').onclick=()=>$('#editor').close();
$('#export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='studia-ai.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
window.addEventListener('hashchange',()=>{view=location.hash==='#history'?'history':'remaining';if(state)render();});
fetch('/api/state').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{state=data;render();}).catch(()=>{$('#content').innerHTML='<h1>Nie można wczytać danych</h1><p>Uruchom python3 server.py i odśwież stronę.</p>';});
