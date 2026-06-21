// ═══════════════════════════════════════════════════════════════════════════════
// UI.JS — Copa Sylas 2026
// Componentes visuais: BRFlag, FlagStrip, DecoSVG, Login, Sidebar, Home
// ═══════════════════════════════════════════════════════════════════════════════
const { useState, useEffect } = React;

const USERS    = window.USERS;
const FLAGS    = window.FLAGS;
const MGOLD    = window.MGOLD;
const MGREEN   = window.MGREEN;
const M_COLOR  = window.M_COLOR;
const F_COLOR  = window.F_COLOR;
const M_BG     = window.M_BG;
const F_BG     = window.F_BG;
const INITIAL  = window.INITIAL;

// ─── BANDEIRA BR ──────────────────────────────────────────────────────────────
function BRFlag({ size=24, style={} }) {
  return (
    <img
      src="https://flagsapi.com/BR/flat/64.png"
      alt="Brasil"
      onError={e=>{ e.target.src="https://flagcdn.com/w40/br.png"; }}
      style={{height:size, width:"auto", borderRadius:2, ...style}}
    />
  );
}

// ─── FAIXA DE BANDEIRAS ───────────────────────────────────────────────────────
function FlagStrip({ rev, speed=20, h=44 }) {
  const fwd=[...FLAGS,...FLAGS,...FLAGS,...FLAGS];
  const bwd=[...FLAGS].reverse().concat([...FLAGS].reverse()).concat([...FLAGS].reverse()).concat([...FLAGS].reverse());
  const all = rev ? bwd : fwd;
  return (
    <div style={{overflow:"hidden", height:h, flexShrink:0}}>
      <div style={{display:"flex", alignItems:"center",
        animation:`${rev?"flagScroll2":"flagScroll"} ${speed}s linear infinite`,
        width:"max-content", willChange:"transform"}}>
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

// ─── DECORAÇÃO SVG POR MODALIDADE ─────────────────────────────────────────────
function DecoSVG({ id, gc }) {
  const s = { position:"absolute", inset:0, width:"100%", height:"100%", opacity:.07, pointerEvents:"none" };
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
    return <svg style={{...s, opacity:.05}} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">{cells}</svg>;
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

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [show,setShow]=useState(false);
  const go=()=>{ const f=USERS.find(x=>x.user===u&&x.pass===p); f?onLogin(f):setErr("Usuário ou senha incorretos."); };
  return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#0a2200,#001a0a,#0a0f00)", fontFamily:"'Inter',sans-serif", position:"relative", overflow:"hidden"}}>
      <svg style={{position:"absolute", inset:0, width:"100%", height:"100%", opacity:.08, pointerEvents:"none"}} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="150" cy="150" rx="400" ry="80" fill="#FFDF00" transform="rotate(-15,150,150)"/>
        <ellipse cx="700" cy="450" rx="350" ry="70" fill="#009C3B" transform="rotate(-10,700,450)"/>
        <ellipse cx="400" cy="520" rx="300" ry="55" fill="#FFDF00" transform="rotate(5,400,520)"/>
      </svg>
      <div style={{position:"absolute", top:0, left:0, right:0}}><FlagStrip speed={25} h={36}/></div>
      <div style={{background:"rgba(0,10,0,.65)", backdropFilter:"blur(20px)", border:"2px solid rgba(255,223,0,.22)", borderRadius:16, padding:"44px 36px", width:"100%", maxWidth:360, position:"relative", zIndex:1, boxShadow:"0 0 80px rgba(255,223,0,.08)"}}>
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{fontSize:52, animation:"floatUp 3s ease-in-out infinite", filter:"drop-shadow(0 0 28px rgba(255,223,0,.6))"}}>🏆</div>
          <div style={{fontFamily:"'Bebas Neue',cursive", fontSize:33, letterSpacing:5, color:MGOLD, lineHeight:1}}>COPA SYLAS</div>
          <div style={{fontFamily:"'Bebas Neue',cursive", fontSize:21, letterSpacing:8, color:MGREEN, marginTop:2}}>2026</div>
          <div style={{fontSize:11, letterSpacing:5, color:"rgba(255,223,0,.35)", marginTop:5}}>★ ★ ★ ★ ★</div>
          <div style={{color:"rgba(255,255,255,.25)", fontSize:11, marginTop:3, letterSpacing:2}}>ÁREA RESTRITA</div>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          <input value={u} onChange={e=>setU(e.target.value)} placeholder="Usuário"
            style={{background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:6, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif"}}/>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Senha"
              style={{width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:6, padding:"9px 36px 9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box"}}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,.4)", cursor:"pointer", fontSize:13}}>{show?"🙈":"👁️"}</button>
          </div>
          {err&&<div style={{color:"#f87171", fontSize:12, textAlign:"center"}}>{err}</div>}
          <button onClick={go} style={{background:"linear-gradient(135deg,#FFDF00,#FFB800)", color:"#0a0f00", border:"none", borderRadius:8, padding:13, fontWeight:900, fontSize:14, cursor:"pointer", letterSpacing:1, textTransform:"uppercase", fontFamily:"'Inter',sans-serif", boxShadow:"0 4px 22px rgba(255,223,0,.3)", marginTop:4}}>
            ENTRAR →
          </button>
        </div>
        <div style={{textAlign:"center", marginTop:16, color:"rgba(255,255,255,.12)", fontSize:10, letterSpacing:2}}>
          <BRFlag size={14} style={{marginRight:4, verticalAlign:"middle"}}/> E.E. Sylas Baltazar de Araújo · Miracatu
        </div>
      </div>
      <div style={{position:"absolute", bottom:0, left:0, right:0}}><FlagStrip rev speed={30} h={36}/></div>
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ mods, page, onNav, isOpen, isMobile, user, onLogout, collapsed }) {
  const items=[{id:"home", label:"Início", emoji:"🏠"}, ...mods.map(m=>({id:m.id, label:m.name, emoji:m.emoji})), ...(user?.role==="admin"?[{id:"admin", label:"Admin", emoji:"⚙️"}]:[])];
  const W = isMobile ? 260 : (collapsed ? 56 : 220);
  return (
    <aside className={`sidebar${isMobile&&isOpen?" open":""}`}
      style={{width:W, position:isMobile?"fixed":"relative", top:0, left:0, bottom:0, zIndex:isMobile?150:"auto",
        transform:isMobile?(isOpen?"translateX(0)":"translateX(-100%)"):"none",
        transition:isMobile?"transform .25s":"width .25s cubic-bezier(.4,0,.2,1)"}}>
      {(!collapsed||isMobile)&&(
        <div style={{padding:"14px 12px 12px", borderBottom:"1px solid rgba(255,223,0,.1)", flexShrink:0}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <div style={{width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#009C3B,#002776)", border:"2px solid #FFDF00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0}}>🏆</div>
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive", fontSize:15, letterSpacing:3, color:MGOLD, lineHeight:1}}>COPA SYLAS</div>
              <div style={{fontSize:7, color:"rgba(255,255,255,.2)", letterSpacing:2}}>2026 · MIRACATU</div>
            </div>
          </div>
        </div>
      )}
      <nav style={{padding:collapsed&&!isMobile?"10px 4px":"10px 7px", flex:1, overflowY:"auto"}}>
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
                <span style={{fontSize:collapsed&&!isMobile?20:16, flexShrink:0, filter:active?("drop-shadow(0 0 5px "+ac+")"):"none"}}>{item.emoji}</span>
                {(!collapsed||isMobile)&&<span>{item.label}</span>}
              </button>
              {collapsed&&!isMobile&&<div className="tip">{item.label}</div>}
            </div>
          );
        })}
      </nav>
      {(!collapsed||isMobile)&&(
        <div style={{padding:"11px 13px", borderTop:"1px solid rgba(255,223,0,.08)", flexShrink:0}}>
          <div style={{fontSize:11, color:"rgba(255,255,255,.3)", marginBottom:6}}>
            <span style={{color:MGOLD, fontWeight:700}}>{user?.name}</span>
            <span style={{fontSize:9, marginLeft:5, color:"rgba(255,255,255,.2)"}}>{user?.role}</span>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:6, padding:"6px 12px", color:"rgba(255,255,255,.35)", fontSize:11, cursor:"pointer", fontFamily:"'Inter',sans-serif", width:"100%"}}>
            Sair →
          </button>
          <div style={{textAlign:"center", marginTop:8, fontSize:11, letterSpacing:5, color:"rgba(255,223,0,.22)"}}>★ ★ ★ ★ ★</div>
        </div>
      )}
    </aside>
  );
}

// ─── HOME ──────────────────────────────────────────────────────────────────────
function Home({ mods, onNav, isMobile }) {
  return (
    <div>
      <div style={{position:"relative", minHeight:isMobile?400:550, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background:"linear-gradient(160deg,#0a2200,#0f3300,#001a0a,#0a0f00)"}}>
        <div style={{position:"absolute", inset:0, opacity:.06, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px)", backgroundSize:"60px 60px", pointerEvents:"none"}}/>
        <svg style={{position:"absolute", inset:0, width:"100%", height:"100%", opacity:.13, pointerEvents:"none"}} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="180" cy="140" rx="380" ry="75" fill="#FFDF00" transform="rotate(-14,180,140)"/>
          <ellipse cx="1020" cy="460" rx="340" ry="68" fill="#FFDF00" transform="rotate(-9,1020,460)"/>
          <ellipse cx="600" cy="75" rx="290" ry="52" fill="#009C3B" transform="rotate(4,600,75)"/>
          <ellipse cx="80" cy="510" rx="260" ry="50" fill="#009C3B" transform="rotate(-18,80,510)"/>
        </svg>
        <div style={{position:"absolute", top:0, left:0, right:0}}><FlagStrip speed={18} h={isMobile?34:50}/></div>
        <div style={{position:"absolute", bottom:0, left:0, right:0}}><FlagStrip rev speed={24} h={isMobile?34:50}/></div>
        <div style={{position:"relative", zIndex:3, textAlign:"center", padding:isMobile?"60px 16px":"90px 24px"}}>
          <div className="fu1" style={{fontSize:11, letterSpacing:7, color:MGOLD, marginBottom:5}}>★ ★ ★ ★ ★</div>
          <div style={{lineHeight:1, marginBottom:4, animation:"floatUp 3s ease-in-out infinite", filter:"drop-shadow(0 0 25px rgba(0,156,59,.9))"}}><BRFlag size={isMobile?64:86}/></div>
          <div className="fu2" style={{fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(58px,11vw,120px)", letterSpacing:6, lineHeight:.88, background:"linear-gradient(180deg,#FFDF00,#FFB800,#cc8800,#FFDF00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"transparent"}}>
            COPA<br/>SYLAS
          </div>
          <div className="fu2" style={{fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(32px,6vw,66px)", letterSpacing:12, color:MGREEN, marginTop:4}}>2026</div>
          <div className="fu3" style={{fontSize:"clamp(10px,1.8vw,13px)", letterSpacing:5, textTransform:"uppercase", color:"rgba(255,255,255,.45)", marginTop:10, fontStyle:"italic"}}>Compromisso em Campo</div>
          <div className="fu3" style={{display:"inline-flex", alignItems:"center", gap:8, marginTop:16, background:"linear-gradient(135deg,rgba(0,39,118,.9),rgba(0,80,30,.9))", border:"1px solid rgba(255,223,0,.4)", borderRadius:30, padding:isMobile?"8px 18px":"10px 28px"}}>
            <span>⚽</span>
            <span style={{fontSize:isMobile?9:11, letterSpacing:2, color:MGOLD, fontWeight:800}}>PEI · SYLAS BALTAZAR · MIRACATU · SP</span>
            <span>🏆</span>
          </div>
          <div className="fu3" style={{marginTop:14}}>
            <a href="placar.html" target="_blank" rel="noopener"
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,rgba(0,156,59,.25),rgba(0,156,59,.1))",border:"2px solid rgba(0,156,59,.5)",borderRadius:30,padding:isMobile?"10px 22px":"12px 32px",textDecoration:"none"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:"#009C3B",animation:"pulse 1s ease-in-out infinite",display:"inline-block"}}/>
              <span style={{fontSize:isMobile?11:13,fontWeight:900,color:"#fff",letterSpacing:2,fontFamily:"'Bebas Neue',cursive"}}>📺 PLACAR AO VIVO</span>
            </a>
          </div>
        </div>
        <div style={{position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(transparent,#0a0f00)", pointerEvents:"none"}}/>
      </div>
      <div style={{height:4, background:"linear-gradient(90deg,#002776,#009C3B,#FFDF00,#009C3B,#002776)"}}/>
      <div style={{background:"linear-gradient(180deg,#0a0f00,#0d1a05)", padding:isMobile?"28px 14px":"44px 48px"}}>
        <div style={{textAlign:"center", marginBottom:26}}>
          <div style={{fontFamily:"'Bebas Neue',cursive", fontSize:26, letterSpacing:6, color:MGOLD, borderBottom:"3px solid #009C3B", display:"inline-block", paddingBottom:5}}>MODALIDADES 2026</div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:`repeat(auto-fit,minmax(${isMobile?140:158}px,1fr))`, gap:12}}>
          {mods.map(mod=>(
            <div key={mod.id} className="mcard" onClick={()=>onNav(mod.id)} style={{border:`1px solid ${mod.accent}44`, boxShadow:`0 4px 18px ${mod.accent}14`}}>
              <div style={{position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${mod.accent},transparent)`}}/>
              <span style={{fontSize:35, filter:`drop-shadow(0 0 8px ${mod.accent}88)`}}>{mod.emoji}</span>
              <span style={{color:mod.accent, fontWeight:800, fontSize:12, letterSpacing:2, textTransform:"uppercase", textAlign:"center", lineHeight:1.3}}>{mod.name}</span>
              <div style={{display:"flex", gap:5}}>
                <div style={{background:"#1565C022", border:"1px solid #1565C055", borderRadius:4, padding:"3px 7px", fontSize:10, color:"#64b5f6", fontWeight:700}}>♂</div>
                <div style={{background:"#e91e8c22", border:"1px solid #e91e8c55", borderRadius:4, padding:"3px 7px", fontSize:10, color:"#f48fb1", fontWeight:700}}>♀</div>
              </div>
              <div style={{fontSize:10, color:"rgba(255,255,255,.2)"}}>Ver chave →</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,223,0,.07)"}}><FlagStrip speed={14} h={40}/></div>
      <div style={{background:"linear-gradient(135deg,#001a0a,#002776,#001a0a)", padding:isMobile?"26px 16px":"36px 48px", textAlign:"center", position:"relative", overflow:"hidden"}}>
        <div style={{position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:20, flexWrap:"wrap"}}>
          <div style={{animation:"floatUp 3s ease-in-out infinite", filter:"drop-shadow(0 0 18px rgba(0,156,59,.8))"}}><BRFlag size={isMobile?46:60}/></div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive", fontSize:isMobile?22:28, letterSpacing:5, color:MGOLD}}>ORGULHO DO BRASIL</div>
            <div style={{color:"rgba(255,255,255,.3)", fontSize:11, letterSpacing:3, marginTop:4}}>★ ★ ★ ★ ★ · PENTACAMPEÕES</div>
            <div style={{color:"rgba(255,255,255,.15)", fontSize:10, letterSpacing:2, marginTop:2}}>E.E. Sylas Baltazar de Araújo · Miracatu, SP</div>
          </div>
          <div style={{fontSize:isMobile?46:60, animation:"floatUp 3s ease-in-out infinite", animationDelay:".5s", filter:"drop-shadow(0 0 14px rgba(255,223,0,.6))"}}>🏆</div>
        </div>
      </div>
    </div>
  );
}

// Expõe globalmente
window.BRFlag    = BRFlag;
window.FlagStrip = FlagStrip;
window.DecoSVG   = DecoSVG;
window.Login     = Login;
window.Sidebar   = Sidebar;
window.Home      = Home;
