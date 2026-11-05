let DATA=[];
const $=id=>document.getElementById(id);
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function parseCSV(txt){
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<txt.length;i++){const c=txt[i];
    if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;
    else if(c===';'){row.push(f);f=''}
    else if(c==='\n'){row.push(f);rows.push(row);row=[];f=''}
    else if(c!=='\r')f+=c}
  if(f||row.length){row.push(f);rows.push(row)}
  return rows;
}
async function carregar(){
  const buf=await (await fetch('csv/tribunal.csv',{cache:'no-store'})).arrayBuffer();
  let txt;try{txt=new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){txt=new TextDecoder('windows-1252').decode(buf)}
  txt=txt.replace(/^\uFEFF/,'');
  const [h,...r]=parseCSV(txt).filter(l=>l.some(x=>x.trim()));
  const cab=h.map(x=>x.trim());
  DATA=r.map(l=>{const d={};cab.forEach((k,i)=>d[k]=(l[i]||'').trim());
    ['Telefone','Email','Horario'].forEach(k=>{if(d[k]==='-')d[k]=''});
    d.Local=d.Local.replace(/\s+/g,' ');
    d.Telefone=d.Telefone.replace(/[-\s]+$/,'');
    d._k=norm(Object.values(d).join(' '));return d}).filter(d=>d.Departamento);
}
const letraDe=s=>norm(s).charAt(0).toUpperCase();
const RAPIDO=[
 ['Tribunal - Recepção:',null,'(63) 3142-2200 / 3142-2201'],
 ['CGJUS - Secretaria do Gabinete do Corregedor','corregedoria@tjto.jus.br','(63) 3142-2390'],
 ['DIJUD - Suporte E-Proc','processoeletronico@tjto.jus.br','(63) 3142-2165'],
 ['Gabinete - Chefia de Gabinete',null,'(63) 3142-2002'],
 ['Ouvidoria Judiciária e Ouvidoria da Mulher - Ouvidoria Judiciária','ouvidoria@tjto.jus.br','0800 644 4334 (Opção 1)'],
 ['ESMAT - Recepção',null,'(63) 3142-2501'],
 ['DIGER - Secretaria de Processos Administrativos','spadg@tjto.jus.br','(63) 3142-2252 / 3142-2253']];
let aba='tribunal',sel=null;
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function mail(addr){const a=el('a',null,addr);a.href='mailto:'+addr;return a}
function linha(c,label,val,href){if(!val)return;const p=el('p','l');p.appendChild(el('b',null,label+': '));
  if(href){const a=el('a',null,val);a.href=href;p.appendChild(a)}else p.append(val);c.appendChild(p)}
function filtrados(){
  if(aba!=='tribunal')return[];
  const q=norm($('q').value.trim()).split(/\s+/).filter(Boolean);
  return DATA.filter(d=>q.every(t=>d._k.includes(t)));
}
function renderIndice(res){
  const deps=[...new Set(res.map(d=>d.Departamento))].sort((a,b)=>norm(a).localeCompare(norm(b)));
  const box=$('indice');box.replaceChildren();
  let cur='';
  deps.forEach(dep=>{const L=letraDe(dep);
    if(L!==cur){cur=L;const h=el('div','letra',L);h.id='letra-'+L;box.appendChild(h)}
    const a=el('a',dep===sel?'dep sel':'dep',dep);a.href='#';if(dep===sel)a.setAttribute('aria-current','true');
    a.onclick=e=>{e.preventDefault();sel=dep;render();window.scrollTo({top:0,behavior:'instant'});const h=$('painel').querySelector('h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}};box.appendChild(a)});
}
function renderPainel(res){
  const p=$('painel');p.replaceChildren();
  if(aba==='foruns'){p.appendChild(el('h2',null,'Fóruns'));p.appendChild(el('p','l','Os contatos dos Fóruns ainda não estão disponíveis nesta agenda.'));return}
  const q=$('q').value.trim();
  if(!sel&&!q){
    p.appendChild(el('h2',null,'Acesso rápido'));
    RAPIDO.forEach(([t,m,tel])=>{const d=el('div','rapido');d.appendChild(el('b',null,t));
      if(m){const x=el('div');x.appendChild(mail(m));d.appendChild(x)}d.appendChild(el('div',null,tel));p.appendChild(d)});
    return}
  const lista=sel?res.filter(d=>d.Departamento===sel):res;
  if(sel){
    p.appendChild(el('h2',null,sel));
    const f=lista[0];
    const info=(l,v)=>{if(!v)return;const x=el('p','info');x.appendChild(el('b',null,l+': '));x.append(v);p.appendChild(x)};
    info('Responsável',f.Responsavel);info('Endereço',f.Endereco);info('Horário de Funcionamento',f.Horario);
    const tb=el('table','tab'),th=el('thead'),tr=el('tr');tb.setAttribute('aria-label','Contatos de '+sel);
    ['Unidade','E-mail','Telefone'].forEach(h=>{const x=el('th',null,h);x.scope='col';tr.appendChild(x)});th.appendChild(tr);tb.appendChild(th);
    const body=el('tbody');
    lista.forEach(d=>{const r=el('tr');r.appendChild(el('td',null,d.Unidade||d.Departamento));
      const m=el('td');if(d.Email)m.appendChild(mail(d.Email));r.appendChild(m);
      const tt=el('td');d.Telefone.split(/\s*\/\s*/).filter(Boolean).forEach(n=>tt.appendChild(el('div',null,n)));r.appendChild(tt);body.appendChild(r)});
    tb.appendChild(body);p.appendChild(tb);return}
  p.appendChild(el('h2',null,sel||'Resultados ('+lista.length+')'));
  if(!lista.length)p.appendChild(el('p','l','Nenhum contato encontrado.'));
  lista.forEach(d=>{const c=el('article','card');c.appendChild(el('h3',null,d.Unidade||d.Departamento));
    if(!sel)c.appendChild(el('p','dep-nome',d.Departamento));
    linha(c,'Telefone',d.Telefone,d.Telefone&&'tel:'+d.Telefone.split('/')[0].replace(/[^\d+]/g,''));
    linha(c,'Fax',d.Fax);linha(c,'E-mail',d.Email,d.Email&&'mailto:'+d.Email);
    linha(c,'Responsável',d.Responsavel);linha(c,'Horário',d.Horario);
    linha(c,'Local',d.Local);linha(c,'Endereço',d.Endereco);p.appendChild(c)});
}
function render(){
  const res=filtrados();
  if(sel&&!res.some(d=>d.Departamento===sel))sel=null;
  renderIndice(res);renderPainel(res);
  document.querySelectorAll('.letras button:not(.casa)').forEach(b=>b.disabled=!document.getElementById('letra-'+b.textContent));
  $('t-tribunal').classList.toggle('ativo',aba==='tribunal');$('t-foruns').classList.toggle('ativo',aba==='foruns');
  $('t-tribunal').toggleAttribute('aria-current',aba==='tribunal');$('t-foruns').toggleAttribute('aria-current',aba==='foruns');
}
{const b=el('button','casa');b.type='button';b.setAttribute('aria-label','Voltar ao topo');b.title='Voltar ao topo';
  b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/></svg>';
  b.onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});$('letras').appendChild(b)}
for(let c=65;c<=90;c++){const b=el('button',null,String.fromCharCode(c));b.type='button';b.setAttribute('aria-label','Ir para a letra '+b.textContent);
  b.onclick=()=>{const h=document.getElementById('letra-'+b.textContent);if(h)h.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};$('letras').appendChild(b)}
$('q').addEventListener('input',()=>{sel=null;render();window.scrollTo({top:0,behavior:'instant'})});
$('t-tribunal').onclick=e=>{e.preventDefault();aba='tribunal';sel=null;render()};
$('t-foruns').onclick=e=>{e.preventDefault();aba='foruns';sel=null;render()};
const ajusta=()=>document.documentElement.style.setProperty('--alt',$('fixo').offsetHeight+'px');
ajusta();addEventListener('resize',ajusta);
carregar().then(render).catch(()=>{
  $('painel').textContent='Não foi possível carregar o arquivo csv/tribunal.csv. Abra a página por um servidor web (não direto do arquivo) e verifique se csv/tribunal.csv existe.';
});
