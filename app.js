const { useState, useEffect } = React;

// ─── CREDENCIAIS ──────────────────────────────────────────────────────────────
const USERS = [
  { user:"admin",  pass:"gabriel", role:"admin",  name:"Administrador" },
  { user:"editor", pass:"sylas",   role:"editor", name:"Editor" },
];

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
// Bandeiras via SVG inline do flagicons.lipis.org (sem CORS, sem bloqueio)
const FLAGS = [
  {code:"BR",br:true},{code:"AR"},{code:"FR"},{code:"DE"},{code:"PT"},
  {code:"IT"},{code:"ES"},{code:"UY"},{code:"JP"},{code:"KR"},
  {code:"NL"},{code:"BE"},{code:"CR"},{code:"MX"},{code:"GH"},
  {code:"SN"},{code:"AU"},{code:"CH"},{code:"PL"},{code:"US"},
  {code:"HR"},{code:"BR",br:true},{code:"BR",br:true},
];
const MGOLD  = "#FFDF00";
const MGREEN = "#009C3B";
const M_COLOR = "#1565C0";
const F_COLOR = "#e91e8c";
const M_BG = "linear-gradient(160deg,#0a1628,#0d2137,#0a0f00)";
const F_BG = "linear-gradient(160deg,#1a0015,#2d0022,#0a0f00)";

const MODS_META = [
  { id:"tenis",    name:"Tênis de Mesa", emoji:"🏓", accent:"#e91e8c" },
  { id:"dama",     name:"Dama",          emoji:"♟️", accent:"#7c3aed" },
  { id:"queimada", name:"Queimada",      emoji:"🔥", accent:"#ea580c" },
  { id:"volei",    name:"Vôlei",         emoji:"🏐", accent:"#0ea5e9" },
  { id:"futsal",   name:"Futsal",        emoji:"⚽", accent:"#009C3B" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,9);
const mkMatch = (p1=null,p2=null) => ({ id:uid(), p1, p2, winner:null });
const mkRound = (name="Nova Fase", players=[]) => {
  const matches = [];
  for (let i=0;i<players.length;i+=2) matches.push(mkMatch(players[i]||null,players[i+1]||null));
  if (!matches.length) matches.push(mkMatch());
  return { id:uid(), name, matches };
};
function propagate(rounds) {
  const r = rounds.map(rn => ({ ...rn, matches: rn.matches.map(m => ({...m})) }));
  for (let ri=0;ri<r.length-1;ri++) {
    const cur=r[ri].matches, nxt=r[ri+1].matches;
    for (let mi=0;mi<cur.length;mi+=2) {
      const slot=Math.floor(mi/2);
      if (slot<nxt.length) nxt[slot]={...nxt[slot],p1:cur[mi]?.winner??nxt[slot].p1,p2:cur[mi+1]?.winner??nxt[slot].p2};
    }
  }
  return r;
}

// ─── GERADOR DE CHAVES ────────────────────────────────────────────────────────
function shuffleArr(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function nextPow2(n){ let p=1; while(p<n)p*=2; return p; }
function gerarChave(players, randomize, modName) {
  const list = randomize ? shuffleArr(players) : [...players];
  const size = nextPow2(list.length);
  while(list.length<size) list.push("BYE");
  const roundNames = ["Final","Final","Semifinal","Quartas de Final","Oitavas","1ª Fase","2ª Fase","3ª Fase"];
  const rounds = [];
  const firstMatches = [];
  for(let i=0;i<list.length;i+=2){
    const p1=list[i], p2=list[i+1];
    firstMatches.push({id:uid(),p1,p2,winner:p2==="BYE"?p1:null});
  }
  const firstName = size<=2?"Final":size<=4?"Semifinal":size<=8?"Quartas de Final":size<=16?"1ª Fase":"Fase Inicial";
  rounds.push({id:uid(),name:firstName,matches:firstMatches});
  let prev=firstMatches;
  while(prev.length>1){
    const next=[];
    for(let i=0;i<prev.length;i+=2){
      next.push({id:uid(),p1:prev[i]?.winner||null,p2:prev[i+1]?.winner||null,winner:null});
    }
    const n=next.length;
    const name=n===1?"Final":n===2?"Semifinal":n===4?"Quartas de Final":"Fase";
    rounds.push({id:uid(),name,matches:next});
    prev=next;
  }
  return rounds;
}

function saveData(d){ try{localStorage.setItem("copa26_v5",JSON.stringify(d));}catch(e){} }
function loadData(){ try{const s=localStorage.getItem("copa26_v5");return s?JSON.parse(s):null;}catch(e){return null;} }

const mkGender = (id) => ({
  rounds: id==="tenis"
    ? [mkRound("1ª Fase",["Jogador A","Jogador B","Jogador C","Jogador D"]),mkRound("Semifinal"),mkRound("Final")]
    : [mkRound("Semifinal",["Time A","Time B","Time C","Time D"]),mkRound("Final")]
});

const INITIAL = { mods: MODS_META.map(m => ({ ...m, genders:{ masculino:mkGender(m.id), feminino:mkGender(m.id) } })) };
INITIAL.mods[0].genders.masculino.rounds = [
  {id:"tm1",name:"1ª Fase",matches:[
    {id:"a1",p1:"Christopher",p2:"José",winner:null},{id:"a2",p1:"Paulo",p2:"João Pedro",winner:null},
    {id:"a3",p1:"Vitor",p2:"Ruan",winner:null},{id:"a4",p1:"Jullio",p2:"Eduardo",winner:null},
    {id:"a5",p1:"Pedro V",p2:"Leo A",winner:null},{id:"a6",p1:"Luiz H",p2:"Gustavo",winner:null},
    {id:"a7",p1:"Endrew",p2:"Pietro",winner:null},{id:"a8",p1:"Marcelo",p2:"Davi",winner:null},
    {id:"a9",p1:"Leonardo D",p2:"Arthur",winner:null},{id:"a10",p1:"Hector",p2:"Marcos",winner:null},
  ]},
  {id:"tm2",name:"Quartas de Final",matches:[{id:"b1",p1:null,p2:null,winner:null},{id:"b2",p1:null,p2:null,winner:null},{id:"b3",p1:null,p2:null,winner:null},{id:"b4",p1:null,p2:null,winner:null}]},
  {id:"tm3",name:"Semifinal",matches:[{id:"c1",p1:null,p2:null,winner:null},{id:"c2",p1:null,p2:null,winner:null}]},
  {id:"tm4",name:"Final",matches:[{id:"d1",p1:null,p2:null,winner:null}]},
];
INITIAL.mods[0].genders.feminino.rounds = [
  {id:"tf1",name:"Quartas de Final",matches:[
    {id:"f1",p1:"Ana Bella",p2:"Vitória",winner:null},{id:"f2",p1:"Thifany",p2:"BYE",winner:"Thifany"},
    {id:"f3",p1:"Milena",p2:"Maria Cecília",winner:null},{id:"f4",p1:"Maria Vitória",p2:"BYE",winner:"Maria Vitória"},
  ]},
  {id:"tf2",name:"Semifinal",matches:[{id:"f5",p1:null,p2:null,winner:null},{id:"f6",p1:null,p2:null,winner:null}]},
  {id:"tf3",name:"Final",matches:[{id:"f7",p1:null,p2:null,winner:null}]},
];

// ─── SVG DECO ─────────────────────────────────────────────────────────────────
function DecoSVG({ id, gc }) {
  const s = { position:"absolute",inset:0,width:"100%",height:"100%",opacity:.07,pointerEvents:"none" };
  if (id==="tenis") return (
    <svg style={s} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
      <rect x="40" y="30" width="720" height="240" rx="4" fill="none" stroke={gc} strokeWidth="3"/>
      <line x1="400" y1="30" x2="400" y2="270" stroke={gc} strokeWidth="3"/>
      <line x1="40" y1="150" x2="760" y2="150" stroke={gc} strokeWidth="2" strokeDasharray="8,4"/>
      <rect x="360" y="140" width="80" height="20" rx="2" fill={gc} opacity=".4"/>
    </svg>
  );
  if (id==="dama") {
    const cells=[];
    for(let c=0;c<8;c++) for(let r=0;r<3;r++) if((c+r)%2===0) cells.push(<rect key={c*10+r} x={c*100} y={r*100} width="100" height="100" fill={gc} opacity=".5"/>);
    return <svg style={{...s,opacity:.05}} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">{cells}</svg>;
  }
  if (id==="queimada") return (
    <svg style={s} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
      <ellipse cx="400" cy="150" rx="300" ry="110" fill="none" stroke={gc} strokeWidth="2" strokeDasharray="10,5"/>
      <line x1="0" y1="150" x2="800" y2="150" stroke={gc} strokeWidth="3"/>
      <circle cx="400" cy="150" r="28" fill="none" stroke={gc} strokeWidth="2"/>
      <circle cx="400" cy="150" r="6" fill={gc}/>
    </svg>
  );
  if (id==="volei") return (
    <svg style={s} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
      <rect x="40" y="40" width="720" height="220" rx="4" fill="none" stroke={gc} strokeWidth="2"/>
      <line x1="0" y1="90" x2="800" y2="90" stroke={gc} strokeWidth="3"/>
      <line x1="400" y1="40" x2="400" y2="260" stroke={gc} strokeWidth="2" strokeDasharray="8,4"/>
      <circle cx="400" cy="175" r="60" fill="none" stroke={gc} strokeWidth="2"/>
    </svg>
  );
  if (id==="futsal") return (
    <svg style={s} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
      <rect x="40" y="30" width="720" height="240" rx="4" fill="none" stroke={gc} strokeWidth="2"/>
      <circle cx="400" cy="150" r="70" fill="none" stroke={gc} strokeWidth="2"/>
      <circle cx="400" cy="150" r="5" fill={gc}/>
      <line x1="400" y1="30" x2="400" y2="270" stroke={gc} strokeWidth="2"/>
      <rect x="40" y="105" width="110" height="90" fill="none" stroke={gc} strokeWidth="2"/>
      <rect x="650" y="105" width="110" height="90" fill="none" stroke={gc} strokeWidth="2"/>
    </svg>
  );
  return null;
}

// ─── BANDEIRA BR (imagem real, sem emoji) ─────────────────────────────────────
function BRFlag({ size=24, style={} }) {
  return (
    <img
      src="https://flagsapi.com/BR/flat/64.png"
      alt="Brasil"
      onError={e=>{ e.target.src="https://flagcdn.com/w40/br.png"; }}
      style={{height:size,width:"auto",borderRadius:2,...style}}
    />
  );
}
// ─── FLAG STRIP ───────────────────────────────────────────────────────────────
function FlagStrip({ rev, speed=20, h=44 }) {
  // Faixa reversa tem ordem embaralhada para parecer diferente da de cima
  const fwd=[...FLAGS,...FLAGS,...FLAGS,...FLAGS];
  const bwd=[...FLAGS].reverse().concat([...FLAGS].reverse()).concat([...FLAGS].reverse()).concat([...FLAGS].reverse());
  const all = rev ? bwd : fwd;
  return (
    <div style={{overflow:"hidden",height:h,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",
        animation:`${rev?"flagScroll2":"flagScroll"} ${speed}s linear infinite`,
        width:"max-content",
        willChange:"transform",
      }}>
        {all.map((f,i)=>(
          <img key={i}
            src={"https://flagsapi.com/"+f.code+"/flat/64.png"}
            alt={f.code}
            onError={e=>{ e.target.src="https://flagcdn.com/w40/"+f.code.toLowerCase()+".png"; }}
            style={{
              height: f.br ? h*.82 : h*.56,
              width:"auto",
              margin:"0 "+(h*.12)+"px",
              borderRadius:3,
              filter: f.br
                ? "drop-shadow(0 0 8px rgba(0,156,59,.9)) drop-shadow(0 0 12px rgba(255,223,0,.5))"
                : "grayscale(25%) opacity(60%)",
              flexShrink:0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [show,setShow]=useState(false);
  const go=()=>{ const f=USERS.find(x=>x.user===u&&x.pass===p); f?onLogin(f):setErr("Usuário ou senha incorretos."); };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#0a2200,#001a0a,#0a0f00)",fontFamily:"'Inter',sans-serif",position:"relative",overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.08,pointerEvents:"none"}} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="150" cy="150" rx="400" ry="80" fill="#FFDF00" transform="rotate(-15,150,150)"/>
        <ellipse cx="700" cy="450" rx="350" ry="70" fill="#009C3B" transform="rotate(-10,700,450)"/>
        <ellipse cx="400" cy="520" rx="300" ry="55" fill="#FFDF00" transform="rotate(5,400,520)"/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,right:0}}><FlagStrip speed={25} h={36}/></div>
      <div style={{background:"rgba(0,10,0,.65)",backdropFilter:"blur(20px)",border:"2px solid rgba(255,223,0,.22)",borderRadius:16,padding:"44px 36px",width:"100%",maxWidth:360,position:"relative",zIndex:1,boxShadow:"0 0 80px rgba(255,223,0,.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,animation:"floatUp 3s ease-in-out infinite",filter:"drop-shadow(0 0 28px rgba(255,223,0,.6))"}}>🏆</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:33,letterSpacing:5,color:MGOLD,lineHeight:1,textShadow:"0 0 18px rgba(255,223,0,.5)"}}>COPA SYLAS</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:21,letterSpacing:8,color:MGREEN,marginTop:2}}>2026</div>
          <div style={{fontSize:11,letterSpacing:5,color:"rgba(255,223,0,.35)",marginTop:5}}>★ ★ ★ ★ ★</div>
          <div style={{color:"rgba(255,255,255,.25)",fontSize:11,marginTop:3,letterSpacing:2}}>ÁREA RESTRITA</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input value={u} onChange={e=>setU(e.target.value)} placeholder="Usuário"
            style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"9px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif"}}/>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Senha"
              style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"9px 36px 9px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:13}}>{show?"🙈":"👁️"}</button>
          </div>
          {err&&<div style={{color:"#f87171",fontSize:12,textAlign:"center"}}>{err}</div>}
          <button onClick={go} style={{background:"linear-gradient(135deg,#FFDF00,#FFB800)",color:"#0a0f00",border:"none",borderRadius:8,padding:13,fontWeight:900,fontSize:14,cursor:"pointer",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Inter',sans-serif",boxShadow:"0 4px 22px rgba(255,223,0,.3)",marginTop:4}}>
            ENTRAR →
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,.12)",fontSize:10,letterSpacing:2}}><BRFlag size={14} style={{marginRight:4,verticalAlign:"middle"}}/> E.E. Sylas Baltazar de Araújo · Miracatu</div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0}}><FlagStrip rev speed={30} h={36}/></div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ mods, page, onNav, isOpen, isMobile, user, onLogout, collapsed }) {
  const items=[{id:"home",label:"Início",emoji:"🏠"},...mods.map(m=>({id:m.id,label:m.name,emoji:m.emoji})),...(user?.role==="admin"?[{id:"admin",label:"Admin",emoji:"⚙️"}]:[])];
  const W = isMobile ? 260 : (collapsed ? 56 : 220);
  return (
    <aside className={`sidebar${isMobile&&isOpen?" open":""}`}
      style={{width:W,position:isMobile?"fixed":"relative",top:0,left:0,bottom:0,zIndex:isMobile?150:"auto",
        transform:isMobile?(isOpen?"translateX(0)":"translateX(-100%)"):"none",
        transition:isMobile?"transform .25s":"width .25s cubic-bezier(.4,0,.2,1)"}}>

      {/* Cabeçalho sidebar — só quando expandida */}
      {(!collapsed||isMobile)&&(
        <div style={{padding:"14px 12px 12px",borderBottom:"1px solid rgba(255,223,0,.1)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#009C3B,#002776)",border:"2px solid #FFDF00",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🏆</div>
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,letterSpacing:3,color:MGOLD,lineHeight:1}}>COPA SYLAS</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,.2)",letterSpacing:2}}>2026 · MIRACATU</div>
            </div>
          </div>
        </div>
      )}

      {/* Links */}
      <nav style={{padding:collapsed&&!isMobile?"10px 4px":"10px 7px",flex:1,overflowY:"auto"}}>
        {items.map(item=>{
          const mod=mods.find(m=>m.id===item.id);
          const ac=mod?.accent||MGOLD;
          const active=page===item.id;
          return (
            <div key={item.id} className="tip-host">
              <button className={`slink${active?" active":""}`} onClick={()=>onNav(item.id)}
                style={{justifyContent:collapsed&&!isMobile?"center":"flex-start",
                  padding:collapsed&&!isMobile?"11px 0":"10px 11px",
                  borderLeft:collapsed&&!isMobile?"none":(active?"3px solid #FFDF00":"3px solid transparent"),
                  borderRadius:collapsed&&!isMobile?8:"0 6px 6px 0",
                  boxShadow:collapsed&&!isMobile&&active?("0 0 0 2px "+MGOLD+"44"):"none"}}>
                <span style={{fontSize:collapsed&&!isMobile?20:16,flexShrink:0,filter:active?("drop-shadow(0 0 5px "+ac+")"):"none"}}>{item.emoji}</span>
                {(!collapsed||isMobile)&&<span>{item.label}</span>}
              </button>
              {collapsed&&!isMobile&&<div className="tip">{item.label}</div>}
            </div>
          );
        })}
      </nav>

      {/* Rodapé */}
      {(!collapsed||isMobile)&&(
        <div style={{padding:"11px 13px",borderTop:"1px solid rgba(255,223,0,.08)",flexShrink:0}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:6}}>
            <span style={{color:MGOLD,fontWeight:700}}>{user?.name}</span>
            <span style={{fontSize:9,marginLeft:5,color:"rgba(255,255,255,.2)"}}>{user?.role}</span>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"6px 12px",color:"rgba(255,255,255,.35)",fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",width:"100%"}}>
            Sair →
          </button>
          <div style={{textAlign:"center",marginTop:8,fontSize:11,letterSpacing:5,color:"rgba(255,223,0,.22)"}}>★ ★ ★ ★ ★</div>
        </div>
      )}
    </aside>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({ mods, onNav, isMobile }) {
  return (
    <div>
      <div style={{position:"relative",minHeight:isMobile?400:550,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"linear-gradient(160deg,#0a2200,#0f3300,#001a0a,#0a0f00)"}}>
        <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.13,pointerEvents:"none"}} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="180" cy="140" rx="380" ry="75" fill="#FFDF00" transform="rotate(-14,180,140)"/>
          <ellipse cx="1020" cy="460" rx="340" ry="68" fill="#FFDF00" transform="rotate(-9,1020,460)"/>
          <ellipse cx="600" cy="75" rx="290" ry="52" fill="#009C3B" transform="rotate(4,600,75)"/>
          <ellipse cx="80" cy="510" rx="260" ry="50" fill="#009C3B" transform="rotate(-18,80,510)"/>
        </svg>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(0,156,59,.18),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0}}><FlagStrip speed={18} h={isMobile?34:50}/></div>
        <div style={{position:"absolute",bottom:0,left:0,right:0}}><FlagStrip rev speed={24} h={isMobile?34:50}/></div>
        <div style={{position:"relative",zIndex:3,textAlign:"center",padding:isMobile?"60px 16px":"90px 24px"}}>
          <div className="fu1" style={{fontSize:11,letterSpacing:7,color:MGOLD,marginBottom:5}}>★ ★ ★ ★ ★</div>
          <div style={{lineHeight:1,marginBottom:4,animation:"floatUp 3s ease-in-out infinite",filter:"drop-shadow(0 0 25px rgba(0,156,59,.9)) drop-shadow(0 0 50px rgba(255,223,0,.4))"}}><BRFlag size={isMobile?64:86}/></div>
          <div className="fu2" style={{fontFamily:"'Bebas Neue',cursive",fontSize:"clamp(58px,11vw,120px)",letterSpacing:6,lineHeight:.88,background:"linear-gradient(180deg,#FFDF00,#FFB800,#cc8800,#FFDF00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 4px 16px rgba(255,180,0,.4))"}}>
            COPA<br/>SYLAS
          </div>
          <div className="fu2" style={{fontFamily:"'Bebas Neue',cursive",fontSize:"clamp(32px,6vw,66px)",letterSpacing:12,color:MGREEN,textShadow:"0 0 18px rgba(0,156,59,.8),2px 2px 0 rgba(0,0,0,.5)",marginTop:4}}>2026</div>
          <div className="fu3" style={{fontSize:"clamp(10px,1.8vw,13px)",letterSpacing:5,textTransform:"uppercase",color:"rgba(255,255,255,.45)",marginTop:10,fontStyle:"italic"}}>Compromisso em Campo</div>
          <div className="fu3" style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:16,background:"linear-gradient(135deg,rgba(0,39,118,.9),rgba(0,80,30,.9))",border:"1px solid rgba(255,223,0,.4)",borderRadius:30,padding:isMobile?"8px 18px":"10px 28px"}}>
            <span>⚽</span>
            <span style={{fontSize:isMobile?9:11,letterSpacing:2,color:MGOLD,fontWeight:800}}>PEI · SYLAS BALTAZAR · MIRACATU · SP</span>
            <span>🏆</span>
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,#0a0f00)",pointerEvents:"none"}}/>
      </div>
      <div style={{height:4,background:"linear-gradient(90deg,#002776,#009C3B,#FFDF00,#009C3B,#002776)"}}/>
      <div style={{background:"linear-gradient(180deg,#0a0f00,#0d1a05)",padding:isMobile?"28px 14px":"44px 48px"}}>
        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:6,color:MGOLD,borderBottom:"3px solid #009C3B",display:"inline-block",paddingBottom:5}}>MODALIDADES 2026</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fit,minmax(${isMobile?140:158}px,1fr))`,gap:12,maxWidth:"100%",margin:"0 auto"}}>
          {mods.map(mod=>(
            <div key={mod.id} className="mcard" onClick={()=>onNav(mod.id)} style={{border:`1px solid ${mod.accent}44`,boxShadow:`0 4px 18px ${mod.accent}14`}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${mod.accent},transparent)`}}/>
              <span style={{fontSize:35,filter:`drop-shadow(0 0 8px ${mod.accent}88)`}}>{mod.emoji}</span>
              <span style={{color:mod.accent,fontWeight:800,fontSize:12,letterSpacing:2,textTransform:"uppercase",textAlign:"center",lineHeight:1.3}}>{mod.name}</span>
              <div style={{display:"flex",gap:5}}>
                <div style={{background:"#1565C022",border:"1px solid #1565C055",borderRadius:4,padding:"3px 7px",fontSize:10,color:"#64b5f6",fontWeight:700}}>♂</div>
                <div style={{background:"#e91e8c22",border:"1px solid #e91e8c55",borderRadius:4,padding:"3px 7px",fontSize:10,color:"#f48fb1",fontWeight:700}}>♀</div>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.2)"}}>Ver chave →</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,223,0,.07)"}}><FlagStrip speed={14} h={40}/></div>
      <div style={{background:"linear-gradient(135deg,#001a0a,#002776,#001a0a)",padding:isMobile?"26px 16px":"36px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 80% at 50% 50%,rgba(0,156,59,.1),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{animation:"floatUp 3s ease-in-out infinite",filter:"drop-shadow(0 0 18px rgba(0,156,59,.8))"}}><BRFlag size={isMobile?46:60}/></div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?22:28,letterSpacing:5,color:MGOLD}}>ORGULHO DO BRASIL</div>
            <div style={{color:"rgba(255,255,255,.3)",fontSize:11,letterSpacing:3,marginTop:4}}>★ ★ ★ ★ ★ · PENTACAMPEÕES</div>
            <div style={{color:"rgba(255,255,255,.15)",fontSize:10,letterSpacing:2,marginTop:2}}>E.E. Sylas Baltazar de Araújo · Miracatu, SP</div>
          </div>
          <div style={{fontSize:isMobile?46:60,animation:"floatUp 3s ease-in-out infinite",animationDelay:".5s",filter:"drop-shadow(0 0 14px rgba(255,223,0,.6))"}}>🏆</div>
        </div>
      </div>
    </div>
  );
}

// ─── MATCH CARD ───────────────────────────────────────────────────────────────
function MatchCard({ match, gc, canEdit, onWin, onEdit }) {
  return (
    <div style={{background:"rgba(255,255,255,.04)",border:`1px solid ${match.winner?"rgba(255,223,0,.2)":"rgba(255,255,255,.08)"}`,borderRadius:8,overflow:"hidden",minWidth:185,position:"relative",opacity:(!match.p1&&!match.p2)?.38:1}}>
      {canEdit&&<button onClick={()=>onEdit(match)} style={{position:"absolute",top:3,right:3,background:"none",border:"none",color:"rgba(255,255,255,.25)",cursor:"pointer",fontSize:11,zIndex:1}}>✏️</button>}
      {[match.p1,match.p2].map((n,pi)=>(
        <div key={pi} className="mrow" onClick={()=>canEdit&&n&&n!=="BYE"&&onWin(match.id,n)}
          style={{borderBottom:pi===0?"1px solid rgba(255,255,255,.06)":"none",background:match.winner===n?`${gc}28`:"transparent",cursor:canEdit&&n&&n!=="BYE"?"pointer":"default",color:match.winner===n?gc:n?"#e2e8f0":"rgba(255,255,255,.2)",fontWeight:match.winner===n?800:400}}>
          {match.winner===n&&<span style={{fontSize:10,color:gc}}>✓</span>}
          <span>{n||"—"}</span>
          {n==="BYE"&&<span style={{fontSize:9,color:"#64748b",marginLeft:"auto"}}>bye</span>}
        </div>
      ))}
    </div>
  );
}

// ─── BRACKET COM LINHAS SVG ──────────────────────────────────────────────────
const CARD_H=74, CARD_W=188, H_GAP=36, V_GAP=10;
function getMatchY(ri,mi){ const f=Math.pow(2,ri); return (f-1)*(CARD_H+V_GAP)/2+mi*f*(CARD_H+V_GAP); }

function Bracket({ rounds, gc, canEdit, onWin, onEdit, onAddMatch, onRename, onAddRound, onRemoveRound, onMoveRound }) {
  const champ=rounds[rounds.length-1]?.matches[0]?.winner;
  const totalH=Math.pow(2,rounds.length-1)*(CARD_H+V_GAP)+80;
  const totalW=rounds.length*(CARD_W+H_GAP)+(champ?230:40)+(canEdit?60:0);
  return (
    <div style={{overflowX:"auto",overflowY:"hidden",paddingBottom:24}}>
      <div style={{position:"relative",width:totalW,height:totalH}}>

        {/* SVG linhas conectoras */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible"}}>
          {rounds.map((round,ri)=>{
            if(ri===rounds.length-1) return null;
            return round.matches.map((match,mi)=>{
              const x1=ri*(CARD_W+H_GAP)+CARD_W;
              const y1=getMatchY(ri,mi)+CARD_H/2+24;
              const nmi=Math.floor(mi/2);
              const x2=(ri+1)*(CARD_W+H_GAP);
              const y2=getMatchY(ri+1,nmi)+CARD_H/2+24;
              const mx=x1+H_GAP/2;
              const won=match.winner!==null;
              const lc=won?gc:"rgba(255,255,255,.1)";
              const sw=won?2:1.5;
              const da=won?"none":"5,4";
              return (
                <g key={match.id}>
                  <line x1={x1} y1={y1} x2={mx} y2={y1} stroke={lc} strokeWidth={sw} strokeDasharray={da}/>
                  <line x1={mx} y1={y1} x2={mx} y2={y2} stroke={lc} strokeWidth={sw} strokeDasharray={da}/>
                  <line x1={mx} y1={y2} x2={x2} y2={y2} stroke={lc} strokeWidth={sw} strokeDasharray={da}/>
                  {won&&<circle cx={x2} cy={y2} r={3.5} fill={gc}/>}
                </g>
              );
            });
          })}
        </svg>

        {/* Cards */}
        {rounds.map((round,ri)=>(
          <div key={round.id}>
            {/* Label fase + botões mover */}
            <div style={{position:"absolute",left:ri*(CARD_W+H_GAP),top:0,width:CARD_W,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
              {canEdit&&ri>0&&(
                <button onClick={()=>onMoveRound(round.id,"left")} title="Mover para esquerda"
                  style={{background:"none",border:"none",color:`${gc}88`,cursor:"pointer",fontSize:12,padding:"0 2px",lineHeight:1}}>◀</button>
              )}
              {canEdit
                ?<input value={round.name} onChange={e=>onRename(round.id,e.target.value)}
                    style={{background:"transparent",border:"none",borderBottom:`1px solid ${gc}44`,color:gc,fontSize:9,fontWeight:800,letterSpacing:2,textTransform:"uppercase",outline:"none",fontFamily:"'Inter',sans-serif",width:"60%",padding:"2px 0",textAlign:"center"}}/>
                :<span style={{fontSize:9,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:gc,padding:"3px 10px",background:`${gc}14`,borderRadius:4,display:"inline-block"}}>{round.name}</span>
              }
              {canEdit&&ri<rounds.length-1&&(
                <button onClick={()=>onMoveRound(round.id,"right")} title="Mover para direita"
                  style={{background:"none",border:"none",color:`${gc}88`,cursor:"pointer",fontSize:12,padding:"0 2px",lineHeight:1}}>▶</button>
              )}
              {canEdit&&<button onClick={()=>onRemoveRound(round.id)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:11,padding:"0 2px",verticalAlign:"middle"}}>🗑</button>}
            </div>

            {round.matches.map((match,mi)=>{
              const x=ri*(CARD_W+H_GAP);
              const y=getMatchY(ri,mi)+24;
              const isEmpty=!match.p1&&!match.p2;
              return (
                <div key={match.id} style={{position:"absolute",left:x,top:y,width:CARD_W,height:CARD_H,
                  background:isEmpty?"rgba(255,255,255,.02)":"rgba(255,255,255,.05)",
                  border:`1px solid ${match.winner?gc+"55":"rgba(255,255,255,.1)"}`,
                  borderRadius:8,overflow:"hidden",opacity:isEmpty?.3:1,
                  boxShadow:match.winner?`0 0 14px ${gc}22`:"none"}}>
                  {/* ✏️ em TODOS os cards quando canEdit, inclusive vazios */}
                  {canEdit&&<button onClick={()=>onEdit(match)}
                    style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,.3)",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:10,zIndex:1,borderRadius:3,padding:"1px 4px"}}>✏️</button>}
                  {[match.p1,match.p2].map((n,pi)=>(
                    <div key={pi} className="mrow" onClick={()=>canEdit&&n&&n!=="BYE"&&onWin(match.id,n)}
                      style={{height:"50%",padding:"0 10px",display:"flex",alignItems:"center",gap:6,
                        borderBottom:pi===0?"1px solid rgba(255,255,255,.07)":"none",
                        background:match.winner===n?`${gc}28`:"transparent",
                        cursor:canEdit&&n&&n!=="BYE"?"pointer":"default",
                        color:match.winner===n?gc:n&&n!=="BYE"?"#e2e8f0":"rgba(255,255,255,.2)",
                        fontWeight:match.winner===n?800:400,fontSize:12}}>
                      {match.winner===n&&<div style={{width:14,height:14,borderRadius:"50%",background:gc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#0a0f00",fontWeight:900,flexShrink:0}}>✓</div>}
                      <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n||"—"}</span>
                      {n==="BYE"&&<span style={{fontSize:9,color:"#64748b"}}>bye</span>}
                    </div>
                  ))}
                </div>
              );
            })}

            {canEdit&&(
              <div style={{position:"absolute",left:ri*(CARD_W+H_GAP),top:getMatchY(ri,round.matches.length)+24+CARD_H+6}}>
                <button onClick={()=>onAddMatch(round.id)} style={{background:"transparent",border:`1px dashed ${gc}44`,borderRadius:6,padding:"4px 8px",color:`${gc}77`,fontSize:10,cursor:"pointer",fontFamily:"'Inter',sans-serif",width:CARD_W}}>+ confronto</button>
              </div>
            )}
          </div>
        ))}

        {/* + Nova Fase */}
        {canEdit&&(
          <div style={{position:"absolute",left:rounds.length*(CARD_W+H_GAP)+4,top:getMatchY(0,0)+24}}>
            <button onClick={onAddRound} style={{background:"transparent",border:"1px dashed rgba(255,223,0,.28)",borderRadius:8,padding:"12px 9px",color:"rgba(255,223,0,.45)",fontSize:10,cursor:"pointer",fontFamily:"'Inter',sans-serif",writingMode:"vertical-rl"}}>+ Fase</button>
          </div>
        )}

        {/* Campeão */}
        {champ&&(
          <div style={{position:"absolute",left:rounds.length*(CARD_W+H_GAP)+(canEdit?52:8),top:getMatchY(rounds.length-1,0)+24,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:3,color:MGOLD}}>★ CAMPEÃO ★</div>
            <div style={{background:"linear-gradient(135deg,#FFDF00,#FFB800,#cc8800)",color:"#0a0f00",borderRadius:10,padding:"13px 18px",fontWeight:900,fontSize:14,boxShadow:"0 0 28px rgba(255,223,0,.45)",border:"2px solid rgba(255,255,255,.25)",whiteSpace:"nowrap",textAlign:"center"}}>
              🏆 {champ}
            </div>
            <div style={{fontSize:12,color:"rgba(255,223,0,.35)"}}>★ ★ ★ ★ ★</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function EditModal({ match, onSave, onRemove, onClose }) {
  const [p1,setP1]=useState(match.p1||""); const [p2,setP2]=useState(match.p2||"");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0d1a05",border:"2px solid rgba(255,223,0,.2)",borderRadius:14,padding:26,width:"100%",maxWidth:420,boxShadow:"0 0 60px rgba(255,223,0,.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD}}>✏️ EDITAR CONFRONTO</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {[["Jogador / Time 1",p1,setP1],["Jogador / Time 2",p2,setP2]].map(([label,val,set])=>(
          <div key={label} style={{marginBottom:12}}>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:10,marginBottom:4,letterSpacing:1,textTransform:"uppercase"}}>{label}</div>
            <input value={val} onChange={e=>set(e.target.value)} placeholder="Nome ou BYE"
              style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"8px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"space-between"}}>
          <button onClick={()=>{onRemove(match.id);onClose();}} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑 Remover</button>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.4)",borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
            <button onClick={()=>{onSave(match.id,p1.trim()||null,p2.trim()||null);onClose();}} style={{background:MGOLD,color:"#0a0f00",border:"none",borderRadius:6,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkModal({ onAdd, onClose }) {
  const [raw,setRaw]=useState("");
  const players=raw.split("\n").map(s=>s.trim()).filter(Boolean);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0d1a05",border:"2px solid rgba(255,223,0,.2)",borderRadius:14,padding:26,width:"100%",maxWidth:420}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD}}>+ ADICIONAR JOGADORES</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{color:"rgba(255,255,255,.3)",fontSize:12,marginBottom:10}}>Um nome por linha. Confrontos gerados automaticamente.</div>
        <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"João\nPedro\nLucas\nGabriel"} rows={9}
          style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"9px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box"}}/>
        <div style={{color:"rgba(255,255,255,.2)",fontSize:11,marginTop:6}}>{players.length} jogadores → {Math.ceil(players.length/2)} confrontos</div>
        <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.4)",borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
          <button onClick={()=>{onAdd(players);onClose();}} style={{background:MGOLD,color:"#0a0f00",border:"none",borderRadius:6,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Gerar Confrontos ▶</button>
        </div>
      </div>
    </div>
  );
}


// ─── GERADOR DE CHAVES UI ────────────────────────────────────────────────────
function GeradorChave({ mod, onSalvar, onClose }) {
  const [raw,setRaw]=useState("");
  const [gender,setGender]=useState("masculino");
  const [randomize,setRandomize]=useState(true);
  const [rounds,setRounds]=useState(null);
  const players=raw.split("\n").map(s=>s.trim()).filter(Boolean);
  const gc=gender==="masculino"?M_COLOR:F_COLOR;

  const gerar=()=>{ if(players.length<2)return; setRounds(gerarChave(players,randomize,mod.name)); };
  const salvar=()=>{
    if(!rounds) return;
    onSalvar(gender, rounds);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:400,display:"flex",alignItems:"stretch",justifyContent:"center"}}>
      <div style={{background:"#0a0f00",border:"2px solid rgba(255,223,0,.2)",borderRadius:0,width:"100%",maxWidth:1100,display:"flex",flexDirection:"column",maxHeight:"100vh",overflow:"hidden"}}>

        {/* Header modal */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"2px solid rgba(255,223,0,.15)",flexShrink:0}}>
          <span style={{fontSize:22}}>{mod.emoji}</span>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD}}>GERADOR DE CHAVES · {mod.name}</div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          {/* Painel esquerdo — configuração */}
          <div style={{width:280,flexShrink:0,borderRight:"1px solid rgba(255,255,255,.07)",padding:20,overflowY:"auto",background:"rgba(255,255,255,.02)"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.35)",letterSpacing:3,textTransform:"uppercase",marginBottom:16}}>Configurar Chave</div>

            {/* Categoria */}
            <div style={{marginBottom:14}}>
              <div style={{color:"rgba(255,255,255,.35)",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Categoria</div>
              <div style={{display:"flex",borderRadius:7,overflow:"hidden",border:"2px solid rgba(255,255,255,.1)"}}>
                {["masculino","feminino"].map(g=>(
                  <button key={g} onClick={()=>{setGender(g);setRounds(null);}} style={{flex:1,padding:"8px 0",border:"none",cursor:"pointer",background:gender===g?(g==="masculino"?M_COLOR:F_COLOR):"transparent",color:gender===g?"#fff":"rgba(255,255,255,.35)",fontWeight:800,fontSize:11,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Inter',sans-serif",transition:"all .2s"}}>
                    {g==="masculino"?"♂ Masc":"♀ Fem"}
                  </button>
                ))}
              </div>
            </div>

            {/* Atletas */}
            <div style={{marginBottom:14}}>
              <div style={{color:"rgba(255,255,255,.35)",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
                Atletas — um por linha <span style={{color:gc,fontWeight:700}}>({players.length})</span>
              </div>
              <textarea value={raw} onChange={e=>setRaw(e.target.value)} rows={12}
                placeholder={"João Silva\nPedro Santos\nLucas Oliveira\nGabriel Costa"}
                style={{width:"100%",background:"rgba(255,255,255,.05)",border:`1px solid ${gc}33`,borderRadius:6,padding:"9px 11px",color:"#e2e8f0",fontSize:12,outline:"none",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>
            </div>

            {/* Sorteio */}
            <div style={{marginBottom:16}}>
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:6,border:"1px solid rgba(255,255,255,.07)"}}>
                <div onClick={()=>setRandomize(!randomize)} style={{width:38,height:21,borderRadius:11,background:randomize?"#009C3B":"rgba(255,255,255,.12)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                  <div style={{position:"absolute",top:2,left:randomize?17:2,width:17,height:17,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.4)"}}/>
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>Sorteio aleatório</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.28)",marginTop:1}}>Embaralha os atletas</div>
                </div>
              </label>
            </div>

            {/* Info estrutura */}
            {players.length>=2&&(
              <div style={{padding:"10px 12px",background:`${gc}12`,border:`1px solid ${gc}28`,borderRadius:6,marginBottom:14,fontSize:11}}>
                <div style={{color:gc,fontWeight:700,marginBottom:4}}>📐 Estrutura</div>
                <div style={{color:"rgba(255,255,255,.45)"}}>{players.length} atletas → {nextPow2(players.length)} vagas</div>
                <div style={{color:"rgba(255,255,255,.45)"}}>{nextPow2(players.length)-players.length} BYE(s) automáticos</div>
                <div style={{color:"rgba(255,255,255,.45)"}}>{Math.log2(nextPow2(players.length))} fases até o campeão</div>
              </div>
            )}

            <button onClick={gerar} disabled={players.length<2}
              style={{width:"100%",background:players.length>=2?`linear-gradient(135deg,${gc},${gc}bb)`:"rgba(255,255,255,.07)",color:players.length>=2?"#fff":"rgba(255,255,255,.2)",border:"none",borderRadius:8,padding:"12px",fontWeight:900,fontSize:13,cursor:players.length>=2?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif",letterSpacing:1,transition:"all .2s",boxShadow:players.length>=2?`0 4px 18px ${gc}44`:"none",marginBottom:8}}>
              ⚡ GERAR CHAVE
            </button>

            {rounds&&(
              <>
                <button onClick={()=>setRounds(gerarChave(players,randomize,mod.name))}
                  style={{width:"100%",background:"transparent",border:`1px solid ${gc}44`,color:gc,borderRadius:8,padding:"9px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif",letterSpacing:1,marginBottom:8}}>
                  🎲 Novo sorteio
                </button>
                <button onClick={salvar}
                  style={{width:"100%",background:"linear-gradient(135deg,#FFDF00,#FFB800)",color:"#0a0f00",border:"none",borderRadius:8,padding:"12px",fontWeight:900,fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif",letterSpacing:1,boxShadow:"0 4px 18px rgba(255,223,0,.3)"}}>
                  💾 SALVAR NO SITE
                </button>
              </>
            )}
          </div>

          {/* Painel direito — visualização */}
          <div style={{flex:1,padding:24,overflowX:"auto",overflowY:"auto"}}>
            {!rounds?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,opacity:.35}}>
                <div style={{fontSize:56}}>🏆</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:4,color:MGOLD}}>CONFIGURE E GERE A CHAVE</div>
                <div style={{color:"rgba(255,255,255,.3)",fontSize:12}}>Adicione os atletas e clique em Gerar</div>
              </div>
            ):(
              <div>
                <div style={{marginBottom:20}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:MGOLD,letterSpacing:4,lineHeight:1}}>{mod.name}</div>
                  <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
                    <div style={{background:gc,borderRadius:4,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#fff"}}>{gender==="masculino"?"♂ Masculino":"♀ Feminino"}</div>
                    <div style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{players.length} atletas · {rounds.length} fases</div>
                  </div>
                </div>
                <Bracket rounds={rounds} gc={gc} canEdit={false} onWin={()=>{}} onEdit={()=>{}} onAddMatch={()=>{}} onRename={()=>{}} onAddRound={()=>{}} onRemoveRound={()=>{}}/>
                <div style={{marginTop:20,padding:"12px 16px",background:"rgba(0,156,59,.08)",border:"1px solid rgba(0,156,59,.2)",borderRadius:8,fontSize:11,color:"rgba(255,255,255,.4)"}}>
                  💡 Clique em <strong style={{color:MGOLD}}>Salvar no Site</strong> para confirmar esta chave. Depois você pode lançar os resultados normalmente pelo chaveamento.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODALITY PAGE ────────────────────────────────────────────────────────────
function ModalityPage({ mod, onChange, canEdit, isMobile }) {
  const [gender,setGender]=useState("masculino");
  const [subTab,setSubTab]=useState("chave"); // "chave" | "campeao"
  const [editMatch,setEditMatch]=useState(null);
  const [showBulk,setShowBulk]=useState(false);
  const [showGerador,setShowGerador]=useState(false);
  const gc  = gender==="masculino"?M_COLOR:F_COLOR;
  const gbg = gender==="masculino"?M_BG:F_BG;
  const gData = mod.genders[gender];
  const upd=(newRounds)=>onChange({...mod,genders:{...mod.genders,[gender]:{rounds:propagate(newRounds)}}});
  const handleWin    =(mid,w)=>upd(gData.rounds.map(r=>({...r,matches:r.matches.map(m=>m.id===mid?{...m,winner:w}:m)})));
  const handleSave   =(mid,p1,p2)=>upd(gData.rounds.map(r=>({...r,matches:r.matches.map(m=>m.id===mid?{...m,p1,p2,winner:null}:m)})));
  const handleRemove =(mid)=>upd(gData.rounds.map(r=>({...r,matches:r.matches.filter(m=>m.id!==mid)})));
  const handleAddM   =(rid)=>upd(gData.rounds.map(r=>r.id===rid?{...r,matches:[...r.matches,mkMatch()]}:r));
  const handleRename =(rid,name)=>upd(gData.rounds.map(r=>r.id===rid?{...r,name}:r));
  const handleAddR   =()=>upd([...gData.rounds,mkRound("Nova Fase")]);
  const handleRemoveR=(rid)=>{if(gData.rounds.length<=1)return;upd(gData.rounds.filter(r=>r.id!==rid));};
  const handleMoveR=(rid,dir)=>{
    const idx=gData.rounds.findIndex(r=>r.id===rid);
    if(dir==="left"&&idx===0) return;
    if(dir==="right"&&idx===gData.rounds.length-1) return;
    const nr=[...gData.rounds];
    const swap=dir==="left"?idx-1:idx+1;
    [nr[idx],nr[swap]]=[nr[swap],nr[idx]];
    upd(nr);
  };
  const handleSalvarGerador=(g, newRounds)=>{
    onChange({...mod,genders:{...mod.genders,[g]:{rounds:newRounds}}});
  };
  const handleBulk   =(players)=>{
    const ms=[];for(let i=0;i<players.length;i+=2)ms.push(mkMatch(players[i]||null,players[i+1]||null));
    const fid=gData.rounds[0]?.id;
    upd(gData.rounds.map(r=>r.id===fid?{...r,matches:[...r.matches,...ms]}:r));
  };
  return (
    <div>
      <div style={{position:"relative",overflow:"hidden",background:gbg,borderBottom:`3px solid ${gc}55`,padding:isMobile?"18px 14px":"24px"}}>
        <DecoSVG id={mod.id} gc={gc}/>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.09,pointerEvents:"none"}} viewBox="0 0 800 120" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="140" cy="60" rx="310" ry="50" fill={gc} transform="rotate(-10,140,60)"/>
          <ellipse cx="700" cy="65" rx="220" ry="40" fill="#FFDF00" transform="rotate(8,700,65)"/>
        </svg>
        <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",opacity:.05}}><BRFlag size={isMobile?48:76}/></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:isMobile?34:42,filter:`drop-shadow(0 0 12px ${gc})`}}>{mod.emoji}</span>
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?22:29,color:gc,letterSpacing:4,lineHeight:1,textShadow:`0 0 14px ${gc}55`}}>{mod.name}</div>
              <div style={{color:"rgba(255,255,255,.28)",fontSize:9,letterSpacing:3,marginTop:2}}>COPA SYLAS 2026 · CHAVEAMENTO</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:9,color:MGOLD,letterSpacing:3}}>★ ★ ★ ★ ★</span>
            <BRFlag size={20}/>
            {canEdit&&(
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setShowGerador(true)} style={{background:"linear-gradient(135deg,#FFDF00,#FFB800)",color:"#0a0f00",border:"none",borderRadius:6,padding:"6px 12px",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:"0 2px 10px rgba(255,223,0,.3)"}}>⚡ Gerar Chave</button>
                <button onClick={()=>setShowBulk(true)} style={{background:"rgba(255,255,255,.08)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"6px 12px",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>+ Jogadores</button>
              </div>
            )}
          </div>
        </div>
        {/* Tabs: gênero + campeão */}
        <div style={{display:"flex",marginTop:16,gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"2px solid rgba(255,255,255,.1)"}}>
            {["masculino","feminino"].map(g=>(
              <button key={g} onClick={()=>{setGender(g);setSubTab("chave");}} style={{padding:"8px 18px",border:"none",cursor:"pointer",background:gender===g&&subTab!=="campeao"?(g==="masculino"?M_COLOR:F_COLOR):"transparent",color:gender===g&&subTab!=="campeao"?"#fff":"rgba(255,255,255,.38)",fontWeight:800,fontSize:12,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Inter',sans-serif",transition:"all .2s"}}>
                {g==="masculino"?"♂ Masculino":"♀ Feminino"}
              </button>
            ))}
          </div>
          {/* Aba Campeão */}
          <button onClick={()=>setSubTab(subTab==="campeao"?"chave":"campeao")} style={{padding:"8px 16px",border:`2px solid ${subTab==="campeao"?"rgba(255,223,0,.5)":"rgba(255,223,0,.2)"}`,borderRadius:8,cursor:"pointer",background:subTab==="campeao"?"rgba(255,223,0,.15)":"transparent",color:subTab==="campeao"?MGOLD:"rgba(255,223,0,.4)",fontWeight:800,fontSize:12,letterSpacing:1,fontFamily:"'Inter',sans-serif",transition:"all .2s"}}>
            🏆 Campeão
          </button>
        </div>
      </div>

      {/* ABA CAMPEÃO */}
      {subTab==="campeao" && (
        <div style={{background:"linear-gradient(135deg,#0a0f00,#0d1a05)",minHeight:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 24px",gap:32}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:5,color:"rgba(255,255,255,.2)"}}>CAMPEÕES DA {mod.name.toUpperCase()}</div>
          <div style={{display:"flex",gap:32,flexWrap:"wrap",justifyContent:"center"}}>
            {["masculino","feminino"].map(g=>{
              const gd=mod.genders[g];
              const campeao=gd.rounds[gd.rounds.length-1]?.matches[0]?.winner;
              const gc2=g==="masculino"?M_COLOR:F_COLOR;
              return (
                <div key={g} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,minWidth:200}}>
                  <div style={{background:gc2,borderRadius:8,padding:"4px 14px",fontSize:11,fontWeight:800,color:"#fff",letterSpacing:2,textTransform:"uppercase"}}>
                    {g==="masculino"?"♂ Masculino":"♀ Feminino"}
                  </div>
                  {campeao ? (
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,animation:"fadeUp .5s ease"}}>
                      <div style={{fontSize:56,filter:"drop-shadow(0 0 20px rgba(255,223,0,.6))",animation:"floatUp 3s ease-in-out infinite"}}>🏆</div>
                      <div style={{background:"linear-gradient(135deg,#FFDF00,#FFB800,#cc8800)",color:"#0a0f00",borderRadius:12,padding:"16px 28px",fontWeight:900,fontSize:20,textAlign:"center",boxShadow:"0 0 40px rgba(255,223,0,.5)",border:"3px solid rgba(255,255,255,.3)",whiteSpace:"nowrap"}}>
                        {campeao}
                      </div>
                      <div style={{fontSize:16,letterSpacing:6,color:"rgba(255,223,0,.5)"}}>★ ★ ★ ★ ★</div>
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,opacity:.3}}>
                      <div style={{fontSize:48}}>🏆</div>
                      <div style={{color:"rgba(255,255,255,.3)",fontSize:12,letterSpacing:2}}>A DECIDIR</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA CHAVE */}
      {subTab!=="campeao" && (
        <div>
          {canEdit&&<div style={{margin:"10px 20px 0",fontSize:11,color:"rgba(255,223,0,.45)",padding:"5px 11px",background:"rgba(255,223,0,.04)",border:"1px solid rgba(255,223,0,.09)",borderRadius:6,display:"inline-block"}}>✏️ Clique no jogador para avançar · ✏️ no card para editar · ◀▶ para reordenar fases</div>}
          <div style={{background:gbg,minHeight:300,padding:isMobile?"14px":"20px 22px 44px"}}>
            <Bracket rounds={gData.rounds} gc={gc} canEdit={canEdit} onWin={handleWin} onEdit={setEditMatch} onAddMatch={handleAddM} onRename={handleRename} onAddRound={handleAddR} onRemoveRound={handleRemoveR} onMoveRound={handleMoveR}/>
          </div>
        </div>
      )}
      {editMatch&&<EditModal match={editMatch} onSave={handleSave} onRemove={handleRemove} onClose={()=>setEditMatch(null)}/>}
      {showBulk&&<BulkModal onAdd={handleBulk} onClose={()=>setShowBulk(false)}/>}
      {showGerador&&<GeradorChave mod={mod} onSalvar={handleSalvarGerador} onClose={()=>setShowGerador(false)}/>}
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({ data, setData }) {
  const [newMod,setNewMod]=useState("");
  const add=()=>{ if(!newMod.trim())return; const nd={...data,mods:[...data.mods,{id:uid(),name:newMod.trim(),emoji:"🏅",accent:"#FFDF00",ativo:false,genders:{masculino:mkGender("novo"),feminino:mkGender("novo")}}]}; setData(nd);saveData(nd);setNewMod(""); };
  const remove=(id)=>{ if(!window.confirm("Remover modalidade?"))return; const nd={...data,mods:data.mods.filter(m=>m.id!==id)}; setData(nd);saveData(nd); };
  const reset=()=>{ if(!window.confirm("Zerar todos os dados?"))return; setData(INITIAL);saveData(INITIAL); };
  const toggleAtivo=(id)=>{
    const nd={...data,mods:data.mods.map(m=>m.id===id?{...m,ativo:!m.ativo}:m)};
    setData(nd);saveData(nd);
  };
  return (
    <div style={{padding:24,maxWidth:"100%"}}>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:MGOLD,letterSpacing:3,marginBottom:20}}>⚙️ PAINEL ADMIN</div>

      {/* CONTROLE DO PLACAR PÚBLICO */}
      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,223,0,.15)",borderRadius:10,padding:18,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:16}}>📺</span>
          <div style={{color:MGOLD,fontSize:11,letterSpacing:3,textTransform:"uppercase",fontWeight:700}}>Placar Público — Controle por Modalidade</div>
        </div>
        <div style={{color:"rgba(255,255,255,.25)",fontSize:11,marginBottom:14}}>
          Ative apenas as modalidades que já começaram. As demais aparecem como "Em breve 🔒" no placar.
        </div>
        {data.mods.map(m=>{
          const isOn = m.ativo===true;
          return (
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,marginBottom:6,border:`1px solid ${isOn?m.accent+"55":"rgba(255,255,255,.07)"}`}}>
              <span style={{fontSize:20,filter:isOn?"none":"grayscale(1)"}}>{m.emoji}</span>
              <span style={{flex:1,fontSize:13,fontWeight:isOn?700:400,color:isOn?"#e2e8f0":"rgba(255,255,255,.4)"}}>{m.name}</span>
              {isOn
                ? <span style={{fontSize:10,color:MGREEN,background:"rgba(0,156,59,.15)",border:"1px solid rgba(0,156,59,.3)",borderRadius:4,padding:"2px 8px",letterSpacing:1}}>● AO VIVO</span>
                : <span style={{fontSize:10,color:"rgba(255,255,255,.25)",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,padding:"2px 8px",letterSpacing:1}}>🔒 EM BREVE</span>
              }
              {/* Toggle switch */}
              <div onClick={()=>toggleAtivo(m.id)} style={{width:44,height:24,borderRadius:12,background:isOn?"#009C3B":"rgba(255,255,255,.12)",cursor:"pointer",position:"relative",transition:"background .25s",flexShrink:0}}>
                <div style={{position:"absolute",top:3,left:isOn?20:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}/>
              </div>
            </div>
          );
        })}
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(0,156,59,.06)",border:"1px solid rgba(0,156,59,.15)",borderRadius:6,fontSize:11,color:"rgba(255,255,255,.35)"}}>
          💡 Link do placar público: <span style={{color:MGOLD,fontFamily:"monospace"}}>seu-site/placar.html</span>
        </div>
      </div>

      {/* MODALIDADES */}
      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:18,marginBottom:14}}>
        <div style={{color:"rgba(255,255,255,.3)",fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>Gerenciar Modalidades</div>
        {data.mods.map(m=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"rgba(255,255,255,.03)",borderRadius:6,marginBottom:5,border:`1px solid ${m.accent}18`}}>
            <span style={{fontSize:13}}>{m.emoji} {m.name}</span>
            <button onClick={()=>remove(m.id)} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:5,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>✕</button>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <input value={newMod} onChange={e=>setNewMod(e.target.value)} placeholder="Nova modalidade..."
            style={{flex:1,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"8px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif"}}/>
          <button onClick={add} style={{background:MGOLD,color:"#0a0f00",border:"none",borderRadius:6,padding:"8px 16px",fontWeight:800,fontSize:12,cursor:"pointer"}}>+ ADD</button>
        </div>
      </div>

      <div style={{background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.18)",borderRadius:10,padding:16}}>
        <div style={{color:"#ef4444",fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:7}}>⚠ ZONA DE PERIGO</div>
        <p style={{color:"rgba(255,255,255,.28)",fontSize:12,marginBottom:10}}>Apaga todos os resultados e restaura os dados iniciais.</p>
        <button onClick={reset} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:"pointer"}}>🔄 Resetar todos os dados</button>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
function App() {
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("home");
  const [data,setData]=useState(()=>loadData()||INITIAL);
  const [toast,setToast]=useState(null);
  const [sideOpen,setSideOpen]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const [isMobile,setIsMobile]=useState(false);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<=768);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2500);};
  const handleChange=(updated)=>{ const nd={...data,mods:data.mods.map(m=>m.id===updated.id?updated:m)}; setData(nd);saveData(nd);showToast("Salvo ✓"); };
  const navTo=(id)=>{setPage(id);if(isMobile)setSideOpen(false);};

  if(!user) return <Login onLogin={setUser}/>;

  const isAdmin=user.role==="admin";
  const canEdit=isAdmin||user.role==="editor";
  const curMod=data.mods.find(m=>m.id===page);

  return (
    <div className="shell">
      <header style={{background:"rgba(3,7,0,.97)",backdropFilter:"blur(16px)",borderBottom:"3px solid #FFDF00",padding:"0 13px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:200,boxShadow:"0 4px 28px rgba(255,223,0,.1)",flexShrink:0}}>
        <button onClick={()=>isMobile?setSideOpen(!sideOpen):setCollapsed(!collapsed)}
          style={{background:"none",border:"1px solid rgba(255,223,0,.25)",borderRadius:6,padding:"6px 10px",color:MGOLD,fontSize:16,cursor:"pointer",flexShrink:0,transition:"all .2s"}}
          title={isMobile?(sideOpen?"Fechar":"Menu"):(collapsed?"Expandir menu":"Recolher menu")}>
          {isMobile?(sideOpen?"✕":"☰"):(collapsed?"▶":"◀")}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:isMobile?1:"auto"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#009C3B,#002776)",border:"2px solid #FFDF00",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🏆</div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?15:18,letterSpacing:4,color:MGOLD,lineHeight:1}}>COPA SYLAS</div>
            <div style={{fontSize:7,color:"rgba(255,255,255,.22)",letterSpacing:3}}>2026 · COMPROMISSO EM CAMPO</div>
          </div>
        </div>
        {!isMobile&&(
          <div style={{display:"flex",flex:1,overflowX:"auto"}}>
            {[{id:"home",label:"🏠 Início"},...data.mods.map(m=>({id:m.id,label:`${m.emoji} ${m.name}`})),...(isAdmin?[{id:"admin",label:"⚙️ Admin"}]:[])].map(item=>(
              <button key={item.id} onClick={()=>navTo(item.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"15px 11px",borderBottom:page===item.id?"3px solid #FFDF00":"3px solid transparent",color:page===item.id?MGOLD:"rgba(255,255,255,.38)",fontWeight:page===item.id?800:500,fontSize:11,letterSpacing:1.2,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap",transition:"color .15s"}}>
                {item.label}
              </button>
            ))}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:isMobile?0:8}}>
          <BRFlag size={isMobile?17:20} style={{animation:"floatUp 2.5s ease-in-out infinite",borderRadius:2}}/>
          {!isMobile&&<div style={{fontSize:10,color:"rgba(255,255,255,.22)",textAlign:"right"}}><div style={{color:MGOLD,fontWeight:700,fontSize:11}}>{user.name}</div><div style={{cursor:"pointer"}} onClick={()=>setUser(null)}>Sair</div></div>}
        </div>
      </header>
      <div className="body-wrap">
        {isMobile&&sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:140}}/>}
        <Sidebar mods={data.mods} page={page} onNav={navTo} isOpen={sideOpen} isMobile={isMobile} user={user} onLogout={()=>setUser(null)} collapsed={collapsed}/>
        <main className="main-scroll">
          <div className="main-inner">
            {page==="home"&&<Home mods={data.mods} onNav={navTo} isMobile={isMobile}/>}
            {page==="admin"&&isAdmin&&<Admin data={data} setData={d=>{setData(d);saveData(d);}}/>}
            {curMod&&<ModalityPage key={page} mod={curMod} onChange={handleChange} canEdit={canEdit} isMobile={isMobile}/>}
          </div>
        </main>
      </div>
      {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#009C3B,#006622)",color:"#fff",borderRadius:8,padding:"10px 22px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,.5)",zIndex:999,border:"1px solid rgba(255,223,0,.25)",whiteSpace:"nowrap"}}>✓ {toast}</div>}
      <footer style={{background:"linear-gradient(135deg,#002776,#001a0a,#002776)",borderTop:"3px solid #FFDF00",padding:"14px 20px",textAlign:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
          <BRFlag size={17}/>
          <div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,letterSpacing:4,color:MGOLD}}>COPA SYLAS 2026</div><div style={{fontSize:9,color:"rgba(255,255,255,.18)",letterSpacing:2}}>E.E. SYLAS BALTAZAR DE ARAÚJO · MIRACATU – SP</div></div>
          <span style={{fontSize:17}}>🏆</span>
        </div>
        <div style={{marginTop:5,fontSize:11,color:"rgba(255,223,0,.25)",letterSpacing:5}}>★ ★ ★ ★ ★</div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
