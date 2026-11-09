
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
          set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const KEY="presid-atual",HKEY="presid-hist",CKEY="presid-cfg",FSKEY="presid-fs";

/* ---------- Abertura ---------- */
(function(){const sp=$("splash");let seen=false;try{seen=sessionStorage.getItem("esb-splash")==="1";sessionStorage.setItem("esb-splash","1")}catch(e){}
  if(seen){sp.remove();return}
  setTimeout(()=>{sp.classList.add("out");setTimeout(()=>sp.remove(),400)},1300)})();

/* ---------- Dados da reunião ---------- */
const FIELDS=["data","hora","canticoNum","canticoTitulo","tema","orador","congregacao","esbocoNum","assistencia","proxDia","proxTema","condutor","notas","tMeta"];
const VAZIO={data:"",hora:"",canticoNum:"",canticoTitulo:"",tema:"",orador:"",congregacao:"",esbocoNum:"",assistencia:"",proxDia:"",proxTema:"",condutor:"",notas:"",tMeta:"",pontos:[]};
let S=Object.assign({},VAZIO,ls.get(KEY,VAZIO));
if(!Array.isArray(S.pontos))S.pontos=[];
const meta=()=>+S.tMeta||30;
$("tMeta").innerHTML='<option value="">Tempo padrão (30 minutos)</option>'+Array.from({length:43},(_,i)=>i+3).map(m=>`<option value="${m}">${m} minutos</option>`).join("");

const CAMPOS={canticoNum:"Cântico nº",canticoTitulo:"Título do cântico",tema:"Tema",orador:"Orador",congregacao:"Congregação",
  assistencia:"Assistência",proxDia:"Dia da próxima",proxTema:"Próximo tema",condutor:"Condutor",hora:"Horário",data:"Data"};
const PLAIN=new Set(["hora","proxDia","data"]);

/* ---------- Personalização ---------- */
const CORES_PAD={c1:"#2f6b2a",c2:"#1d4f8f",c3:"#7a6a12",hl:"#fff04d",fill:"#0b3d91"};
const FONTES=[["Literata","Literata (padrão)",'"Literata",Georgia,serif'],["Atkinson Hyperlegible","Atkinson (fácil leitura)",'"Atkinson Hyperlegible",system-ui,sans-serif'],
  ["Merriweather","Merriweather",'"Merriweather",Georgia,serif'],["Lora","Lora",'"Lora",Georgia,serif'],["Open Sans","Open Sans",'"Open Sans",Arial,sans-serif'],
  ["Roboto","Roboto",'"Roboto",Arial,sans-serif'],["Nunito","Nunito",'"Nunito",Arial,sans-serif'],["","Arial (do aparelho)",'Arial,Helvetica,sans-serif']];
const BLOCOS_PAD=()=>[
 {tipo:"titulo",cor:"ink",texto:"Presidência – Reunião Pública"},
 {tipo:"instrucao",cor:"c1",texto:"(2 minutos antes deve dirigir-se ao palco e dizer):"},
 {tipo:"texto",cor:"c1",texto:"-Gostaria de pedir a atenção de todos, pois dentro de 2 minutos daremos início ao programa espiritual desta noite. Incentivamos todos a já ocuparem seus assentos, a fim de se prepararem para a nossa reunião."},
 {tipo:"secao",cor:"ink",texto:"(INTRODUÇÃO)"},
 {tipo:"forte",cor:"ink",texto:"{hora} horas:"},
 {tipo:"texto",cor:"c2",texto:"- Estamos dando boas vindas a todos os presentes. Por favor sintam-se à vontade para desfrutar do programa espiritual desta noite. Primeiro, teremos um discurso público, e, em seguida, o estudo da Bíblia por meio da revista A Sentinela. Convidamos todos a se colocarem de pé para entoarmos o cântico de nº {canticoNum}, intitulado: {canticoTitulo}. Após o cântico ouviremos uma oração."},
 {tipo:"instrucao",cor:"c2",texto:"(Após a oração)"},
 {tipo:"texto",cor:"c2",texto:"-O tema do discurso público é: {tema}"},
 {tipo:"texto",cor:"c2",texto:"- E será proferido pelo irmão: {orador}"},
 {tipo:"texto",cor:"c2",texto:"Da congregação: {congregacao}. Vamos dar a atenção ao irmão."},
 {tipo:"secao",cor:"ink",texto:"(CONCLUSÃO)"},
 {tipo:"texto",cor:"c3",texto:"-Agradecemos ao irmão {orador}, pelo esclarecimento do tema: {tema}"},
 {tipo:"texto",cor:"c3",texto:"(Ou: Agradecemos ao irmão {orador} pelo seu proferimento, pela clara explanação que fez da matéria)"},
 {tipo:"texto",cor:"c3",texto:"-Elogiamos também a assistência de {assistencia} pessoas pelo silêncio e atenção prestados."},
 {tipo:"texto",cor:"c3",texto:"-Se alguém desejar um estudo bíblico gratuito, favor deixar seu nome e endereço com os indicadores, que teremos prazer em visitá-lo."},
 {tipo:"texto",cor:"c3",texto:"-No próximo {proxDia} teremos outra conferência pública com o seguinte tema: {proxTema}."},
 {tipo:"texto",cor:"c3",texto:"-Agora convidamos todos a participarem do estudo da Bíblia através da revista A Sentinela, que será conduzido pelo irmão: {condutor}."}
].map(b=>Object.assign({id:uid(),oculto:false},b));
const TIPOS={titulo:"Título",secao:"Seção (marcada)",texto:"Texto",instrucao:"Instrução (itálico)",forte:"Negrito"};
const CORNOME={c1:"Cor Abertura",c2:"Cor Introdução",c3:"Cor Conclusão",ink:"Preto"};

let C=ls.get(CKEY,null)||{};
C.cores=Object.assign({},CORES_PAD,C.cores||{});
if(typeof C.fonte!=="string")C.fonte="Literata";
if(!Array.isArray(C.blocos)||!C.blocos.length)C.blocos=BLOCOS_PAD();
if(!C.fundoPres)C.fundoPres="auto";
if(!C.fundoDisc)C.fundoDisc="auto";
if(typeof C.crono!=="boolean")C.crono=true;
if(typeof C.marca!=="boolean")C.marca=true;
if(!C.discCores)C.discCores={};
const saveC=()=>ls.set(CKEY,C);
const saveS=()=>ls.set(KEY,S);

function mix(hex,to,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const a=p(hex),b=p(to);
  return"#"+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,"0")).join("")}
/* versão para fundo escuro: cores muito escuras clareiam mais */
function dk(hex){const m=Math.max(...[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));
  return mix(hex,"#ffffff",m<.3?.85:.5)}
function applyCores(){const r=document.documentElement.style;
  for(const k of ["c1","c2","c3","fill"]){r.setProperty("--u-"+k,C.cores[k]);r.setProperty("--u-"+k+"-dk",dk(C.cores[k]))}
  r.setProperty("--u-hl",C.cores.hl);r.setProperty("--u-hl-dk",mix(C.cores.hl,"#000000",.6));
  for(const k in CORES_PAD)$("cor-"+k).value=C.cores[k];
  document.documentElement.toggleAttribute("data-nomark",!C.marca);$("usaMarca").checked=C.marca;
  $("swHl").classList.toggle("off",!C.marca);$("cor-hl").disabled=!C.marca}
const DCORES_PAD={d1:"#1f2328",d2:"#0f766e",d3:"#1f2328",d4:"#1f2328"};
function applyDiscCores(){const r=document.documentElement.style;
  for(const k in DCORES_PAD){const v=C.discCores[k];$("dcor-"+k).value=v||DCORES_PAD[k];
    if(v){r.setProperty("--u-"+k,v);r.setProperty("--u-"+k+"-dk",dk(v))}else{r.removeProperty("--u-"+k);r.removeProperty("--u-"+k+"-dk")}}}
function applyFonte(){const f=FONTES.find(x=>x[0]===C.fonte)||FONTES[0];
  document.documentElement.style.setProperty("--u-font",f[2]);$("fonte").value=f[0]}
$("fonte").innerHTML=FONTES.map(f=>`<option value="${esc(f[0])}">${esc(f[1])}</option>`).join("");
$("fonte").onchange=e=>{C.fonte=e.target.value;saveC();applyFonte()};
for(const k in CORES_PAD)$("cor-"+k).addEventListener("input",e=>{C.cores[k]=e.target.value;saveC();applyCores()});
$("usaMarca").onchange=e=>{C.marca=e.target.checked;saveC();applyCores()};
for(const k in DCORES_PAD)$("dcor-"+k).addEventListener("input",e=>{C.discCores[k]=e.target.value;saveC();applyDiscCores()});
$("dCorReset").onclick=()=>{C.discCores={};saveC();applyDiscCores();toast("Cores padrão restauradas")};
$("corReset").onclick=()=>{C.cores=Object.assign({},CORES_PAD);saveC();applyCores();toast("Cores originais restauradas")};

/* ---------- Fundo claro / escuro por tela ---------- */
const VIEW_OF={presidencia:"pres",editar:"pres",discurso:"disc","editar-discurso":"disc"};
let curTab="presidencia";
const sysDark=()=>{const t=document.documentElement.getAttribute("data-theme");if(t)return t==="dark";
  try{return matchMedia("(prefers-color-scheme: dark)").matches}catch(e){return false}};
function applyFundo(){const v=VIEW_OF[curTab],val=v==="pres"?C.fundoPres:v==="disc"?C.fundoDisc:"auto",r=document.documentElement;
  if(val==="auto")r.removeAttribute("data-esq");else r.setAttribute("data-esq",val);
  const dark=val==="auto"?sysDark():val==="dark";
  document.querySelectorAll(".fundo").forEach(b=>b.textContent=dark?"Fundo claro":"Fundo escuro");
  $("fundoPres").value=C.fundoPres;$("fundoDisc").value=C.fundoDisc}
document.querySelectorAll(".fundo").forEach(b=>b.onclick=()=>{const k=b.dataset.view==="pres"?"fundoPres":"fundoDisc";
  const v=C[k],dark=v==="auto"?sysDark():v==="dark";C[k]=dark?"light":"dark";saveC();applyFundo()});
$("fundoPres").onchange=e=>{C.fundoPres=e.target.value;saveC();applyFundo()};
$("fundoDisc").onchange=e=>{C.fundoDisc=e.target.value;saveC();applyFundo()};
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyFundo)}catch(e){}

/* ---------- Presidência (leitura) ---------- */
function fmtData(d){if(!d)return"";const[y,m,dd]=d.split("-");
  return new Date(+y,+m-1,+dd).toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}
function campo(k){const v=k==="data"?fmtData(S.data):S[k];
  if(PLAIN.has(k))return esc(v||"");
  const span=v?`<span class="blank">${esc(v)}</span>`:`<span class="blank empty">&nbsp;</span>`;
  return span+(k==="assistencia"?`<button class="edit-pin" data-goto="assistencia" aria-label="Editar assistência">✎</button>`:"")}
const fill=t=>esc(t).replace(/\{(\w+)\}/g,(m,k)=>k in CAMPOS?campo(k):m);
function renderSheet(){
  $("sheet").innerHTML=C.blocos.filter(b=>!b.oculto).map(b=>{const t=fill(b.texto),c=b.cor;
    switch(b.tipo){
      case"titulo":return`<h2 class="${c}"><span class="mark">${t}</span></h2>`;
      case"secao":return`<span class="sec ${c}"><span class="mark">${t}</span></span>`;
      case"instrucao":return`<p class="${c} cue">${t}</p>`;
      case"forte":return`<p class="${c} strong">${t}</p>`;
      default:return`<p class="${c}">${t}</p>`}}).join("")}

/* ---------- Editor do texto da presidência ---------- */
let lastTA=null;
$("chips").innerHTML=Object.entries(CAMPOS).map(([k,l])=>`<button type="button" data-ins="${k}">${esc(l)}</button>`).join("");
$("chips").addEventListener("mousedown",e=>{if(e.target.closest("[data-ins]"))e.preventDefault()});
$("chips").addEventListener("click",e=>{const b=e.target.closest("[data-ins]");if(!b)return;
  if(!lastTA||!document.body.contains(lastTA)){toast("Toque primeiro dentro de um parágrafo");return}
  const tok="{"+b.dataset.ins+"}",s=lastTA.selectionStart,en=lastTA.selectionEnd;
  lastTA.setRangeText(tok,s,en,"end");lastTA.focus();lastTA.dispatchEvent(new Event("input",{bubbles:true}))});
const opts=(obj,sel)=>Object.entries(obj).map(([v,l])=>`<option value="${v}"${v===sel?" selected":""}>${l}</option>`).join("");
function renderBlks(){
  $("blkList").innerHTML=C.blocos.map((b,i)=>`<div class="blk${b.oculto?" hidden-b":""}" data-id="${b.id}" style="--bc:var(--${b.cor})">
    <div class="blk-head">
      <select data-k="tipo" aria-label="Tipo">${opts(TIPOS,b.tipo)}</select>
      <select data-k="cor" aria-label="Cor">${opts(CORNOME,b.cor)}</select>
      <label><input type="checkbox" data-k="oculto"${b.oculto?" checked":""}> Ocultar</label>
      <span class="spacer"></span>
      <button class="btn sm" data-act="up" aria-label="Subir"${i===0?" disabled":""}>↑</button>
      <button class="btn sm" data-act="down" aria-label="Descer"${i===C.blocos.length-1?" disabled":""}>↓</button>
      <span class="confirm"><button class="btn sm danger" data-act="del">Excluir</button></span>
    </div>
    <textarea id="blk-${b.id}" data-k="texto" rows="3" aria-label="Texto do parágrafo">${esc(b.texto)}</textarea>
  </div>`).join("")}
const blkOf=el=>{const d=el.closest(".blk");return d&&C.blocos.find(b=>b.id===d.dataset.id)};
$("blkList").addEventListener("focusin",e=>{if(e.target.tagName==="TEXTAREA")lastTA=e.target});
function onBlk(e){const b=blkOf(e.target);if(!b)return;const k=e.target.dataset.k;
  if(k==="oculto"){b.oculto=e.target.checked;e.target.closest(".blk").classList.toggle("hidden-b",b.oculto)}
  else if(k){b[k]=e.target.value;if(k==="cor")e.target.closest(".blk").style.setProperty("--bc",`var(--${b.cor})`)}
  saveC();renderSheet()}
$("blkList").addEventListener("input",onBlk);
$("blkList").addEventListener("change",e=>{if(e.target.tagName==="SELECT")onBlk(e)});
function moveAct(list,a,item,rerender){const i=list.indexOf(item);
  if(a.dataset.act==="up"&&i>0)[list[i-1],list[i]]=[list[i],list[i-1]];
  else if(a.dataset.act==="down"&&i<list.length-1)[list[i+1],list[i]]=[list[i],list[i+1]];
  else if(a.dataset.act==="del"){a.parentElement.innerHTML=`Excluir? <button class="btn sm danger" data-act="delok">Sim</button><button class="btn sm" data-act="delno">Não</button>`;return}
  else if(a.dataset.act==="delok")list.splice(i,1);
  else if(a.dataset.act!=="delno")return;
  rerender()}
$("blkList").addEventListener("click",e=>{const a=e.target.closest("[data-act]");if(!a)return;
  moveAct(C.blocos,a,blkOf(a),()=>{saveC();renderBlks();renderSheet()})});
$("blkAdd").onclick=()=>{const b={id:uid(),tipo:"texto",cor:"c3",texto:"",oculto:false};C.blocos.push(b);saveC();renderBlks();renderSheet();
  const ta=$("blk-"+b.id);ta.scrollIntoView({block:"center"});ta.focus()};
$("txtReset").onclick=()=>{$("txtConfirm").hidden=false;$("txtReset").hidden=true};
$("txtNao").onclick=()=>{$("txtConfirm").hidden=true;$("txtReset").hidden=false};
$("txtSim").onclick=()=>{C.blocos=BLOCOS_PAD();saveC();renderBlks();renderSheet();$("txtNao").click();toast("Texto original restaurado")};

/* ---------- Tamanho da letra ---------- */
let fs=ls.get(FSKEY,1.18);
function applyFs(){document.documentElement.style.setProperty("--fs",fs+"rem");ls.set(FSKEY,fs);$("fsVal").textContent=Math.round(fs/1.18*100)+"%"}
document.addEventListener("click",e=>{const b=e.target.closest("[data-fs]");if(!b)return;
  fs=Math.min(2.4,Math.max(.85,+(fs+(+b.dataset.fs)*.12).toFixed(2)));applyFs()});

/* ---------- Dados (formulários) ---------- */
function fillForm(){FIELDS.forEach(k=>{const el=$(k);if(el)el.value=S[k]??""})}
FIELDS.forEach(k=>{const el=$(k);if(!el)return;el.addEventListener("input",()=>{S[k]=el.value;saveS();renderData()});
  if(el.tagName==="SELECT")el.addEventListener("change",()=>{S[k]=el.value;saveS();renderData()})});
function renderDiscHead(){
  $("discHead").innerHTML=`<p class="t">${esc(S.tema)||'<span style="color:var(--muted)">Tema ainda não preenchido</span>'}</p>
   <div class="m">${S.orador?"Irmão "+esc(S.orador):"Orador não informado"}${S.congregacao?" · Congregação "+esc(S.congregacao):""}${S.esbocoNum?" · Esboço nº "+esc(S.esbocoNum):""} · ${meta()} min</div>`}
function renderData(){renderSheet();renderDiscHead();renderPtView();$("hdrDate").textContent=fmtData(S.data);$("miniMeta").textContent="/"+meta()}

/* ---------- Esboço do discurso ---------- */
const CORES_PONTO=new Map([
  ["","Sem cor"],["amarelo","Amarelo"],["verde","Verde"],
  ["azul","Azul"],["rosa","Rosa"],["roxo","Roxo"],["vermelho","Vermelho"],["laranja","Laranja"]
]);
const CORES_IMPORTACAO=["azul","vermelho","verde","roxo","laranja","rosa","amarelo"];
function renderTexto(t,faixas){const out=[];let ul=null,pos=0;
  for(const raw of String(t||"").split("\n")){
    const l=raw.trim(),inicio=pos+raw.length-raw.trimStart().length;
    pos+=raw.length+1;
    if(!l){ul=null;continue}
    const marcador=l.match(/^[-•*]\s*/)?.[0];
    if(marcador){if(!ul){ul=[];out.push(ul)}ul.push(colorirTrecho(l.slice(marcador.length),faixas,inicio+marcador.length))}
    else{ul=null;out.push(colorirTrecho(l,faixas,inicio))}
  }
  return out.map(x=>Array.isArray(x)?`<ul>${x.map(i=>`<li>${i}</li>`).join("")}</ul>`:`<p>${x}</p>`).join("")}
function renderPtView(){let acc=0;
  const tot=S.pontos.reduce((s,p)=>s+(+p.min||0),0);
  $("ptSum").textContent=S.pontos.length?`${tot} de ${meta()} min`:"Nenhum ponto ainda";$("ptSum").className="sum"+(tot>meta()?" over":"");
  if(!S.pontos.length){$("ptView").innerHTML=`<p class="empty-state">Nenhum esboço ainda. Adicione os pontos na aba “Editar discurso”.</p>`;curIdx=-2;return}
  $("ptView").innerHTML=S.pontos.map((p,i)=>{const a=acc;acc+=(+p.min||0);
    const cor=CORES_PONTO.has(p.cor)&&p.cor?` data-cor="${p.cor}"`:"";
    const titulo=p.titulo|| (p.paragrafo?"":"(sem título)");
    const paragrafoSemTempo=p.paragrafo&&!p.min;
    return`<div class="ponto${paragrafoSemTempo?" paragrafo":""}" data-i="${i}"${cor}>${paragrafoSemTempo?"":`<div class="tm">${p.min?`${a}–${acc} min`:"—"}</div>`}
      <div class="body">${titulo?`<h4>${colorirTrecho(titulo,p.coresTitulo)}</h4>`:""}${renderTexto(p.texto,p.coresTexto)}</div></div>`}).join("");
  curIdx=-2;drawClock()}
const temCoresOriginais=p=>Boolean(p.coresTitulo?.length||p.coresTexto?.length);
function renderPtEdit(){
  $("ptList").innerHTML=S.pontos.map((p,i)=>`<div class="blk pt-edit" data-id="${p.id}">
    <div class="r"><input data-k="titulo" id="pt-${p.id}" placeholder="Título do ponto" value="${esc(p.titulo)}" aria-label="Título do ponto">
      <input data-k="min" inputmode="numeric" placeholder="min" value="${esc(p.min)}" aria-label="Minutos"></div>
    <textarea data-k="texto" rows="4" placeholder="Textos, perguntas, ilustrações…" aria-label="Conteúdo do ponto">${esc(p.texto)}</textarea>
    <div class="blk-head"><label>Cor da letra
      <select data-k="cor">${temCoresOriginais(p)?'<option value="original" selected disabled>Cores originais</option>':""}${Array.from(CORES_PONTO,([valor,nome])=>`<option value="${valor}"${!temCoresOriginais(p)&&(p.cor||"")===valor?" selected":""}>${nome}</option>`).join("")}</select>
    </label><span class="spacer"></span>
      <button class="btn sm" data-act="up"${i===0?" disabled":""} aria-label="Subir">↑</button>
      <button class="btn sm" data-act="down"${i===S.pontos.length-1?" disabled":""} aria-label="Descer">↓</button>
      <span class="confirm"><button class="btn sm danger" data-act="del">Excluir</button></span></div></div>`).join("")||`<p class="empty-state">Nenhum ponto ainda. Toque em “+ Adicionar ponto”.</p>`}
const ptOf=el=>{const d=el.closest(".pt-edit");return d&&S.pontos.find(p=>p.id===d.dataset.id)};
$("ptList").addEventListener("input",e=>{const p=ptOf(e.target);if(!p)return;const k=e.target.dataset.k;
  if(k==="cor")return;
  if(k==="titulo"&&p.coresTitulo)p.coresTitulo=ajustarCores(p.titulo,e.target.value,p.coresTitulo);
  if(k==="texto"&&p.coresTexto)p.coresTexto=ajustarCores(p.texto,e.target.value,p.coresTexto);
  if(k==="min"){p.min=e.target.value.replace(/[^\d]/g,"");e.target.value=p.min}else p[k]=e.target.value;saveS();renderPtView()});
$("ptList").addEventListener("change",e=>{
  const p=ptOf(e.target);
  if(!p||e.target.dataset.k!=="cor"||!CORES_PONTO.has(e.target.value))return;
  p.cor=e.target.value;delete p.coresTitulo;delete p.coresTexto;
  e.target.querySelector('option[value="original"]')?.remove();
  saveS();renderPtView();
});
$("ptList").addEventListener("click",e=>{const a=e.target.closest("[data-act]");if(!a)return;
  moveAct(S.pontos,a,ptOf(a),()=>{saveS();renderPtEdit();renderPtView()})});
$("ptAdd").onclick=()=>{const p={id:uid(),titulo:"",min:"",texto:""};S.pontos.push(p);saveS();renderPtEdit();renderPtView();$("pt-"+p.id).focus()};
$("ptImpBtn").onclick=()=>{$("ptImp").hidden=false;$("ptImpTxt").focus()};
$("ptImpNo").onclick=()=>{$("ptImp").hidden=true};
// Somente texto e cores são extraídos. Nenhum nó colado entra no documento.
const corColadaValida=cor=>typeof cor==="string"&&cor.length<=64&&
  /^(?:#[a-f0-9]{3,8}|[a-z]+|rgba?\([\d.,% /]+\))$/i.test(cor)&&
  !/^(inherit|initial|unset|revert|currentcolor|transparent)$/i.test(cor)&&CSS.supports("color",cor);
function faixasValidas(faixas,tamanho){
  if(!Array.isArray(faixas))return false;
  let fim=0;
  return faixas.every(f=>{
    if(!f||!Number.isInteger(f.inicio)||!Number.isInteger(f.fim)||
      f.inicio<fim||f.fim<=f.inicio||f.fim>tamanho||!corColadaValida(f.cor))return false;
    fim=f.fim;return true;
  });
}
function colorirTrecho(texto,faixas=[],inicio=0){
  const fim=inicio+texto.length;
  let pos=inicio,saida="";
  for(const f of faixas){
    if(f.fim<=inicio)continue;
    if(f.inicio>=fim)break;
    const a=Math.max(inicio,f.inicio),b=Math.min(fim,f.fim);
    if(!corColadaValida(f.cor))continue;
    saida+=esc(texto.slice(pos-inicio,a-inicio));
    saida+=`<span style="color:${f.cor}">${esc(texto.slice(a-inicio,b-inicio))}</span>`;
    pos=b;
  }
  return saida+esc(texto.slice(pos-inicio));
}
function recortarCores(faixas,inicio,fim){
  return faixas.filter(f=>f.fim>inicio&&f.inicio<fim).map(f=>({
    inicio:Math.max(f.inicio,inicio)-inicio,fim:Math.min(f.fim,fim)-inicio,cor:f.cor
  }));
}
function ajustarCores(antes,depois,faixas){
  let inicio=0,a=antes.length,b=depois.length;
  while(inicio<a&&inicio<b&&antes[inicio]===depois[inicio])inicio++;
  while(a>inicio&&b>inicio&&antes[a-1]===depois[b-1]){a--;b--}
  return [...recortarCores(faixas,0,inicio),...recortarCores(faixas,a,antes.length)
    .map(f=>({inicio:f.inicio+b,fim:f.fim+b,cor:f.cor}))];
}
function lerCoresColadas(html,texto){
  const template=document.createElement("template");
  template.innerHTML=html;
  const faixas=[];
  let pos=0;
  function visitar(no,herdada){
    if(no.nodeType===3){
      const partes=no.textContent.match(/\S+/g)||[];
      for(const parte of partes){
        // Alinha por palavras para respeitar as quebras fornecidas pelo texto simples.
        while(pos<texto.length&&/\s/.test(texto[pos]))pos++;
        const palavra=texto.slice(pos,pos+parte.length).replace(/\u00a0/g," ");
        if(palavra!==parte)return false;
        if(herdada){
          const ultima=faixas[faixas.length-1];
          if(ultima?.cor===herdada&&/^\s*$/.test(texto.slice(ultima.fim,pos)))ultima.fim=pos+parte.length;
          else faixas.push({inicio:pos,fim:pos+parte.length,cor:herdada});
        }
        pos+=parte.length;
      }
      return true;
    }
    if(no.nodeType!==1)return true;
    if(["SCRIPT","STYLE","HEAD","TITLE","META","LINK","IMG","OBJECT","IFRAME","SVG","TEMPLATE"].includes(no.tagName)||no.style.display==="none")return true;
    const definida=no.style.color||no.getAttribute("color");
    const cor=corColadaValida(definida)?definida:herdada;
    return Array.from(no.childNodes).every(filho=>visitar(filho,cor));
  }
  return Array.from(template.content.childNodes).every(no=>visitar(no,""))&&!texto.slice(pos).trim()?faixas:[];
}
const campoColado=$("ptImpTxt");
let colagemColorida=null;
function mostrarCoresColadas(){
  const previa=$("ptImpCores");
  previa.hidden=!colagemColorida?.faixas.length;
  previa.innerHTML=previa.hidden?"":colorirTrecho(colagemColorida.texto,colagemColorida.faixas);
}
campoColado.addEventListener("input",()=>{
  if(!colagemColorida)return;
  colagemColorida={texto:campoColado.value,
    faixas:ajustarCores(colagemColorida.texto,campoColado.value,colagemColorida.faixas)};
  mostrarCoresColadas();
});
campoColado.addEventListener("paste",event=>{
  const html=event.clipboardData?.getData("text/html");
  const texto=event.clipboardData?.getData("text/plain").replace(/\r\n?/g,"\n");
  if(!html||!texto||html.length>1000000)return;
  const faixas=lerCoresColadas(html,texto);
  if(!faixas.length)return;
  event.preventDefault();
  const inicio=campoColado.selectionStart,fim=campoColado.selectionEnd;
  const antigas=colagemColorida?.texto===campoColado.value?colagemColorida.faixas:[];
  const deslocar=(lista,offset)=>lista.map(f=>({inicio:f.inicio+offset,fim:f.fim+offset,cor:f.cor}));
  const antes=recortarCores(antigas,0,inicio);
  const depois=recortarCores(antigas,fim,campoColado.value.length);
  campoColado.setRangeText(texto,inicio,fim,"end");
  colagemColorida={texto:campoColado.value,faixas:[
    ...antes,...deslocar(faixas,inicio),...deslocar(depois,inicio+texto.length)
  ]};
  mostrarCoresColadas();
});

function importarEsboco(comTitulos){
  const valor=campoColado.value;
  const blocos=valor.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean);
  if(!blocos.length){toast("Cole algum texto primeiro");return}
  const cores=colagemColorida?.texto===valor?colagemColorida.faixas:[];
  let pos=0,corIndex=CORES_IMPORTACAO.indexOf(S.pontos[S.pontos.length-1]?.cor)+1;
  for(const bloco of blocos){
    const inicio=valor.indexOf(bloco,pos);
    pos=inicio+bloco.length;
    const [primeiraLinha,...resto]=bloco.split("\n");
    const titulo=comTitulos?primeiraLinha.trim():"";
    const texto=comTitulos?resto.join("\n"):bloco;
    const coresTitulo=recortarCores(cores,inicio,inicio+titulo.length);
    const coresTexto=recortarCores(cores,pos-texto.length,pos);
    const ponto={id:uid(),titulo,min:"",texto,paragrafo:!comTitulos,
      cor:cores.length?"":CORES_IMPORTACAO[corIndex++%CORES_IMPORTACAO.length]};
    if(coresTitulo.length)ponto.coresTitulo=coresTitulo;
    if(coresTexto.length)ponto.coresTexto=coresTexto;
    S.pontos.push(ponto);
  }
  saveS();campoColado.value="";colagemColorida=null;$("ptImpCores").hidden=true;$("ptImp").hidden=true;
  renderPtEdit();renderPtView();toast(blocos.length+" bloco(s) criado(s)");
}
$("ptImpOk").onclick=()=>importarEsboco(true);
$("ptImpParagrafos").onclick=()=>importarEsboco(false);

/* ---------- Cronômetro pequeno ---------- */
let t0=null,acc=0,tick=null,curIdx=-2;
const elapsed=()=>acc+(t0?Date.now()-t0:0);
function drawClock(){const s=Math.floor(elapsed()/1000),m=meta()*60;
  $("miniT").textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  const st=s>=m?"over":s>=m-300?"warn":"";
  $("miniT").className="mini-t "+st;$("miniBar").className=st;$("miniBar").style.width=Math.min(100,s/m*100)+"%";
  let idx=-1;if(s>0&&C.crono&&!leituraAmpliada){let c=0;for(let i=0;i<S.pontos.length;i++){c+=(+S.pontos[i].min||0)*60;if(s<c){idx=i;break}}}
  if(idx!==curIdx){curIdx=idx;document.querySelectorAll("#ptView .ponto").forEach(el=>el.classList.toggle("cur",+el.dataset.i===idx))}}
$("miniGo").onclick=()=>{if(t0){acc+=Date.now()-t0;t0=null;clearInterval(tick);$("miniGo").textContent="Continuar"}
  else{t0=Date.now();tick=setInterval(drawClock,250);$("miniGo").textContent="Pausar"}drawClock()};
$("miniReset").onclick=()=>{t0=null;acc=0;clearInterval(tick);$("miniGo").textContent="Iniciar";drawClock()};
let leituraAmpliada=false;
function applyCrono(){const show=C.crono&&curTab==="discurso";
  $("mini").hidden=!show;
  $("miniProg").hidden=!show||leituraAmpliada;$("hdrDate").hidden=curTab==="discurso";
  $("cronoToggle").textContent="Cronômetro: "+(C.crono?"ligado":"desligado");$("cronoToggle").classList.toggle("on",C.crono);curIdx=-2;drawClock()}
$("cronoToggle").onclick=()=>{C.crono=!C.crono;saveC();applyCrono()};

/* ---------- Leitura ampliada ---------- */
function setLeituraAmpliada(ativa){
  leituraAmpliada=ativa;
  document.body.classList.toggle("leitura-ampliada",ativa);
  $("sairLeituraAmpliada").hidden=true;
  applyCrono();
  $(ativa?"folhaDiscurso":"ampliarEsboco").focus({preventScroll:true});
}
$("ampliarEsboco").onclick=()=>setLeituraAmpliada(true);
$("sairLeituraAmpliada").onclick=()=>setLeituraAmpliada(false);
$("folhaDiscurso").addEventListener("click",()=>{
  if(!leituraAmpliada||window.getSelection()?.toString())return;
  $("sairLeituraAmpliada").hidden=!$("sairLeituraAmpliada").hidden;
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&leituraAmpliada)setLeituraAmpliada(false);
});

/* ---------- Manter tela ligada ---------- */
let lock=null;
const setWake=t=>document.querySelectorAll(".wake").forEach(b=>b.textContent=t);
document.querySelectorAll(".wake").forEach(b=>b.onclick=async()=>{
  if(lock){try{await lock.release()}catch(e){}lock=null;setWake("Manter tela ligada");return}
  try{lock=await navigator.wakeLock.request("screen");setWake("Tela ligada ✓");
    lock.addEventListener("release",()=>{lock=null;setWake("Manter tela ligada")})}
  catch(e){toast("Este aparelho não permitiu manter a tela ligada")}});

/* ---------- Abas ---------- */
const TABS=["presidencia","personalizar","editar","discurso","editar-discurso","historico"];
function showTab(name){curTab=name;
  document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===name));
  TABS.forEach(t=>$("tab-"+t).hidden=t!==name);
  if(name==="historico")renderHist();
  if(name==="editar-discurso")renderPtEdit();
  applyFundo();applyCrono();
  const sel=document.querySelector(`nav.tabs button[data-tab="${name}"]`);try{sel.scrollIntoView({inline:"nearest",block:"nearest"})}catch(e){}
  try{if(location.hash!=="#"+name)history.replaceState(null,"","#"+name)}catch(e){}window.scrollTo(0,0)}
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
document.addEventListener("click",e=>{const g=e.target.closest("[data-goto]");if(!g)return;
  showTab("editar");const el=$(g.dataset.goto);el.scrollIntoView({block:"center"});el.focus()});

/* ---------- Histórico ---------- */
function getHist(){
  const h=ls.get(HKEY,[]);
  if(h.every(reuniao=>reuniao.registroId))return h;
  const historico=h.map((reuniao,i)=>reuniao.registroId?reuniao:{...reuniao,registroId:"legado-"+i});
  ls.set(HKEY,historico);
  return historico;
}
function loadMeeting(x){S=Object.assign({},VAZIO,JSON.parse(JSON.stringify(x)));if(!Array.isArray(S.pontos))S.pontos=[];saveS();fillForm();renderData();renderPtEdit()}
function salvarNoHistorico(){
  if(!S.registroId)S.registroId=uid()+"-"+uid();
  const h=getHist().filter(x=>x.registroId!==S.registroId);
  h.unshift(JSON.parse(JSON.stringify(S)));
  h.sort((a,b)=>(b.data||"").localeCompare(a.data||""));
  try{
    localStorage.setItem(HKEY,JSON.stringify(h));saveS();
    toast("Salvo no histórico");
  }catch{toast("Não foi possível salvar no aparelho")}
}
$("btnSalvar").onclick=salvarNoHistorico;
$("salvarDiscurso").onclick=salvarNoHistorico;
$("btnNova").onclick=()=>{$("novaConfirm").hidden=false};
$("novaNao").onclick=()=>{$("novaConfirm").hidden=true};
$("novaSim").onclick=()=>{loadMeeting(VAZIO);$("miniReset").onclick();$("novaConfirm").hidden=true;toast("Campos limpos")};
function renderHist(){const h=getHist(),ul=$("hist");
  if(!h.length){ul.innerHTML=`<li class="empty-state" style="display:block">Nenhuma reunião salva ainda. Em “Editar presidência”, toque em “Salvar no histórico”.</li>`;return}
  ul.innerHTML=h.map((x,i)=>`<li><div class="info"><b>${esc(fmtData(x.data))}</b>
    <span>${esc(x.tema||"Sem tema")} · ${esc(x.orador||"—")}${x.assistencia?" · "+esc(x.assistencia)+" pessoas":""}${x.pontos&&x.pontos.length?" · esboço com "+x.pontos.length+" pontos":""}</span></div>
    <button class="btn sm" data-open="${i}">Abrir discurso</button>
    <button class="btn sm" data-open="${i}" data-presidencia>Abrir presidência</button>
    <span class="confirm"><button class="btn sm danger" data-del="${i}">Excluir</button></span></li>`).join("")}
$("hist").addEventListener("click",e=>{const h=getHist();
  const o=e.target.closest("[data-open]");if(o){loadMeeting(h[+o.dataset.open]);$("miniReset").onclick();showTab(o.hasAttribute("data-presidencia")?"presidencia":"discurso");toast("Reunião carregada");return}
  const d=e.target.closest("[data-del]");if(d){d.parentElement.innerHTML=`Excluir? <button class="btn sm danger" data-delok="${d.dataset.del}">Sim</button><button class="btn sm" data-delno>Não</button>`;return}
  const ok=e.target.closest("[data-delok]");if(ok){h.splice(+ok.dataset.delok,1);ls.set(HKEY,h);renderHist();toast("Excluída");return}
  if(e.target.closest("[data-delno]"))renderHist()});

/* ---------- Backup local ---------- */
const BACKUP_TIPO="esboco-eletronico";
const LIMITE_BACKUP=10*1024*1024;
const objeto=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const idSeguro=v=>typeof v==="string"&&/^[a-z0-9-]+$/i.test(v);
const corHex=v=>typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v);
function backupValido(b){
  if(!objeto(b)||b.tipo!==BACKUP_TIPO||b.versao!==1)return false;
  const reuniao=r=>objeto(r)&&FIELDS.every(k=>typeof r[k]==="string")&&
    (r.registroId===undefined||idSeguro(r.registroId))&&Array.isArray(r.pontos)&&
    r.pontos.every(p=>objeto(p)&&idSeguro(p.id)&&typeof p.titulo==="string"&&
      typeof p.texto==="string"&&(typeof p.min==="string"||Number.isFinite(p.min))&&
      (p.cor===undefined||CORES_PONTO.has(p.cor))&&
      (p.coresTitulo===undefined||faixasValidas(p.coresTitulo,p.titulo.length))&&
      (p.coresTexto===undefined||faixasValidas(p.coresTexto,p.texto.length)));
  const c=b.preferencias;
  return reuniao(b.atual)&&Array.isArray(b.historico)&&b.historico.every(reuniao)&&
    objeto(c)&&objeto(c.cores)&&Object.values(c.cores).every(corHex)&&
    objeto(c.discCores)&&Object.values(c.discCores).every(corHex)&&
    Array.isArray(c.blocos)&&c.blocos.every(x=>objeto(x)&&idSeguro(x.id)&&
      Object.hasOwn(TIPOS,x.tipo)&&Object.hasOwn(CORNOME,x.cor)&&typeof x.texto==="string")&&
    ["auto","light","dark"].includes(c.fundoPres)&&["auto","light","dark"].includes(c.fundoDisc)&&
    typeof c.fonte==="string"&&typeof c.crono==="boolean"&&typeof c.marca==="boolean"&&
    Number.isFinite(b.tamanhoLetra)&&b.tamanhoLetra>=.85&&b.tamanhoLetra<=2.4;
}
function gravarBackup(b){
  const dados=[[KEY,b.atual],[HKEY,b.historico],[CKEY,b.preferencias],[FSKEY,b.tamanhoLetra]];
  const anteriores=dados.map(([chave])=>[chave,localStorage.getItem(chave)]);
  let gravados=0;
  try{
    for(const [chave,valor] of dados){localStorage.setItem(chave,JSON.stringify(valor));gravados++}
  }catch(erro){
    for(const [chave,valor] of anteriores.slice(0,gravados)){
      if(valor===null)localStorage.removeItem(chave);
      else localStorage.setItem(chave,valor);
    }
    throw erro;
  }
}
$("exportarBackup").onclick=()=>{
  const b={tipo:BACKUP_TIPO,versao:1,atual:S,historico:getHist(),preferencias:C,tamanhoLetra:fs};
  const arquivo=new Blob([JSON.stringify(b,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(arquivo);
  const link=document.createElement("a");
  link.href=url;link.download="esboco-eletronico-backup-"+new Date().toISOString().slice(0,10)+".json";
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
};
$("importarBackup").onclick=()=>$("arquivoBackup").click();
$("arquivoBackup").onchange=async event=>{
  const arquivo=event.target.files[0];
  event.target.value="";
  if(!arquivo)return;
  let backup;
  try{
    if(arquivo.size>LIMITE_BACKUP)throw new Error();
    backup=JSON.parse(await arquivo.text());
    if(!backupValido(backup))throw new Error();
  }catch{toast("Arquivo de backup inválido ou incompatível");return}
  if(!confirm("Restaurar este backup? O esboço atual, o histórico e as preferências deste aparelho serão substituídos."))return;
  try{gravarBackup(backup)}catch{toast("Não foi possível restaurar o backup neste aparelho");return}
  location.reload();
};

let tt;function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2200)}

/* ---------- Início ---------- */
applyCores();applyDiscCores();applyFonte();applyFs();fillForm();renderBlks();renderData();
const h0=location.hash.slice(1);showTab(TABS.includes(h0)?h0:(h0==="esboco"?"presidencia":"presidencia"));

;

(() => {
  if (!window.isSecureContext || !/^https?:$/.test(location.protocol)) return;
  if (matchMedia("(display-mode: standalone)").matches || navigator.standalone) return;

  const panel = document.getElementById("pwa-install");
  const button = document.getElementById("pwa-install-button");
  const help = document.getElementById("pwa-install-help");
  const appleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let installPrompt;

  help.textContent = appleMobile
    ? "Abra este link no Safari. Toque em Compartilhar → Adicionar à Tela de Início. Se aparecer, ative Abrir como App da Web e toque em Adicionar."
    : "Abra este link no Chrome. No menu ⋮, procure Instalar app ou Adicionar à tela inicial.";
  panel.hidden = false;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    panel.hidden = true;
  });
  button.addEventListener("click", async () => {
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      try {
        await prompt.prompt();
        return;
      } catch {
        // Use the browser's manual installation instructions.
      }
    }
    help.hidden = !help.hidden;
    button.setAttribute("aria-expanded", String(!help.hidden));
  });
})();

;
if("serviceWorker" in navigator){addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))}
