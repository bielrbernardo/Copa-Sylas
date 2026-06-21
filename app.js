// ═══════════════════════════════════════════════════════════════════════════════
// APP.JS — Copa Sylas 2026
// Núcleo principal: propagate, resetarResultados, Admin, App
// ═══════════════════════════════════════════════════════════════════════════════

const MGOLD   = window.MGOLD;
const MGREEN  = window.MGREEN;
const INITIAL = window.INITIAL;

// ─── PROPAGAR VENCEDORES ENTRE FASES ─────────────────────────────────────────
function propagate(rounds) {
  const r = rounds.map(rn=>({...rn, matches:rn.matches.map(m=>({...m}))}));
  for(let ri=0;ri<r.length-1;ri++) {
    const cur=r[ri].matches, nxt=r[ri+1].matches;
    for(let mi=0;mi<cur.length;mi+=2) {
      const slot=Math.floor(mi/2);
      if(slot<nxt.length) {
        if(cur.length < nxt.length) {
          const targetSlot=mi*2;
          if(nxt[targetSlot]) nxt[targetSlot].p1=cur[mi]?.winner??nxt[targetSlot].p1;
          if(nxt[targetSlot+2]) nxt[targetSlot+2].p1=cur[mi+1]?.winner??nxt[targetSlot+2].p1;
          break;
        }
        nxt[slot]={...nxt[slot],p1:cur[mi]?.winner??nxt[slot].p1,p2:cur[mi+1]?.winner??nxt[slot].p2};
      }
    }
  }
  return r;
}
window.propagate = propagate;

// ─── RESETAR SÓ RESULTADOS (mantém jogadores) ────────────────────────────────
function resetarResultados(data) {
  return {
    ...data,
    mods: data.mods.map(mod=>({
      ...mod,
      genders: Object.fromEntries(
        Object.entries(mod.genders).map(([gKey,gVal])=>{
          if(gVal.tipo==="roundrobin") return [gKey,{...gVal,
            rounds:gVal.rounds.map(r=>({...r,matches:r.matches.map(m=>({...m,winner:null,gols1:null,gols2:null}))}))
          }];
          return [gKey,{...gVal,
            rounds:gVal.rounds.map(r=>({...r,matches:r.matches.map(m=>({...m,winner:null}))}))
          }];
        })
      )
    }))
  };
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({ data, setData }) {
  const [newMod,setNewMod]=React.useState("");
  const fb=(nd)=>{ setData(nd); if(window._fbSet)window._fbSet(nd); };
  const add=()=>{
    if(!newMod.trim())return;
    const isMistoType=newMod.toLowerCase().includes("futsal")||newMod.toLowerCase().includes("vôlei")||newMod.toLowerCase().includes("queimada");
    fb({...data,mods:[...data.mods,{id:window.uid(),name:newMod.trim(),emoji:"🏅",accent:"#FFDF00",ativo:false,
      genders:isMistoType?{misto:window.mkMisto()}:{fund_masc:window.mkNivel(),fund_fem:window.mkNivel(),em_masc:window.mkNivel(),em_fem:window.mkNivel()}}]});
    setNewMod("");
  };
  const remove=(id)=>{if(!window.confirm("Remover modalidade?"))return;fb({...data,mods:data.mods.filter(m=>m.id!==id)});};
  const reset=()=>{if(!window.confirm("Zerar TUDO? Volta ao estado inicial do código."))return;fb(INITIAL);};
  const resetRes=()=>{if(!window.confirm("Apagar só os resultados? Nomes e estrutura são mantidos."))return;fb(resetarResultados(data));};
  const toggleAtivo=(id)=>fb({...data,mods:data.mods.map(m=>m.id===id?{...m,ativo:!m.ativo}:m)});

  return (
    <div style={{padding:24,maxWidth:"100%"}}>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:MGOLD,letterSpacing:3,marginBottom:20}}>⚙️ PAINEL ADMIN</div>

      {/* Controle Placar Público */}
      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,223,0,.15)",borderRadius:10,padding:18,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:16}}>📺</span>
          <div style={{color:MGOLD,fontSize:11,letterSpacing:3,textTransform:"uppercase",fontWeight:700}}>Placar Público — Controle por Modalidade</div>
        </div>
        <div style={{color:"rgba(255,255,255,.25)",fontSize:11,marginBottom:14}}>Ative as modalidades que já começaram. As demais aparecem como "Em breve 🔒".</div>
        {data.mods.map(m=>{
          const isOn=m.ativo===true;
          return (
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(255,255,255,.03)",borderRadius:8,marginBottom:6,border:`1px solid ${isOn?m.accent+"55":"rgba(255,255,255,.07)"}`}}>
              <span style={{fontSize:20,filter:isOn?"none":"grayscale(1)"}}>{m.emoji}</span>
              <span style={{flex:1,fontSize:13,fontWeight:isOn?700:400,color:isOn?"#e2e8f0":"rgba(255,255,255,.4)"}}>{m.name}</span>
              {isOn
                ?<span style={{fontSize:10,color:MGREEN,background:"rgba(0,156,59,.15)",border:"1px solid rgba(0,156,59,.3)",borderRadius:4,padding:"2px 8px",letterSpacing:1}}>● AO VIVO</span>
                :<span style={{fontSize:10,color:"rgba(255,255,255,.25)",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,padding:"2px 8px",letterSpacing:1}}>🔒 EM BREVE</span>
              }
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

      {/* Gerenciar modalidades */}
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

      {/* Zona de perigo */}
      <div style={{background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.18)",borderRadius:10,padding:16}}>
        <div style={{color:"#ef4444",fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:12}}>⚠ ZONA DE PERIGO</div>
        <div style={{marginBottom:14,padding:"12px 14px",background:"rgba(255,150,0,.06)",border:"1px solid rgba(255,150,0,.2)",borderRadius:8}}>
          <div style={{color:"#fb923c",fontSize:12,fontWeight:700,marginBottom:4}}>🔄 Resetar só os resultados</div>
          <p style={{color:"rgba(255,255,255,.3)",fontSize:11,marginBottom:10}}>Apaga gols e vencedores mas <strong style={{color:"rgba(255,255,255,.6)"}}>mantém os nomes</strong> e estrutura das chaves.</p>
          <button onClick={resetRes} style={{background:"#fb923c",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:"pointer"}}>🔄 Resetar Resultados</button>
        </div>
        <div>
          <div style={{color:"#ef4444",fontSize:12,fontWeight:700,marginBottom:4}}>💣 Resetar TUDO</div>
          <p style={{color:"rgba(255,255,255,.28)",fontSize:11,marginBottom:10}}>Apaga tudo e volta ao estado inicial do código.</p>
          <button onClick={reset} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:"pointer"}}>💣 Resetar Tudo</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
function App() {
  const [user,setUser]=React.useState(null);
  const [page,setPage]=React.useState("home");
  const [data,setData]=React.useState(null);
  const [toast,setToast]=React.useState(null);
  const [sideOpen,setSideOpen]=React.useState(false);
  const [collapsed,setCollapsed]=React.useState(false);
  const [isMobile,setIsMobile]=React.useState(false);

  // Firebase — fonte única de verdade
  React.useEffect(()=>{
    const tryListen=()=>{
      if(window._fbListen){
        window._fbListen((fbData)=>{
          if(fbData&&fbData.mods) setData(fbData);
          else { setData(INITIAL); if(window._fbSet)window._fbSet(INITIAL); }
        });
        return true;
      }
      return false;
    };
    if(!tryListen()){
      const iv=setInterval(()=>{if(tryListen())clearInterval(iv);},200);
      return()=>clearInterval(iv);
    }
  },[]);

  React.useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<=768);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2500);};
  const handleChange=(updated)=>{
    const nd={...data,mods:data.mods.map(m=>m.id===updated.id?updated:m)};
    setData(nd);
    if(window._fbSet)window._fbSet(nd).catch(e=>console.warn("Firebase:",e));
    showToast("Salvo ✓");
  };
  const navTo=(id)=>{setPage(id);if(isMobile)setSideOpen(false);};

  // Pega componentes dos outros arquivos
  const Login        = window.Login;
  const Sidebar      = window.Sidebar;
  const Home         = window.Home;
  const BRFlag       = window.BRFlag;
  const ModalityPage = window.ModalityPage;

  if(!user) return <Login onLogin={setUser}/>;
  if(!data) return (
    <div style={{minHeight:"100vh",background:"#0a0f00",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'Inter',sans-serif"}}>
      <div style={{fontSize:52,animation:"floatUp 1.5s ease-in-out infinite"}}>🏆</div>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,letterSpacing:4,color:MGOLD}}>COPA SYLAS 2026</div>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",background:MGOLD,animation:`pulse 1s ${i*.2}s ease-in-out infinite`}}/>
        ))}
      </div>
      <div style={{fontSize:11,color:"rgba(255,255,255,.25)",letterSpacing:2}}>Conectando ao Firebase...</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );

  const isAdmin=user.role==="admin";
  const canEdit=isAdmin||user.role==="editor";
  const curMod=data.mods.find(m=>m.id===page);

  return (
    <div className="shell">
      <header style={{background:"rgba(3,7,0,.97)",backdropFilter:"blur(16px)",borderBottom:"3px solid #FFDF00",padding:"0 13px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:200,boxShadow:"0 4px 28px rgba(255,223,0,.1)",flexShrink:0}}>
        <button onClick={()=>isMobile?setSideOpen(!sideOpen):setCollapsed(!collapsed)}
          style={{background:"none",border:"1px solid rgba(255,223,0,.25)",borderRadius:6,padding:"6px 10px",color:MGOLD,fontSize:16,cursor:"pointer",flexShrink:0,transition:"all .2s"}}>
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
              <button key={item.id} onClick={()=>navTo(item.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"15px 11px",borderBottom:page===item.id?"3px solid #FFDF00":"3px solid transparent",color:page===item.id?MGOLD:"rgba(255,255,255,.38)",fontWeight:page===item.id?800:500,fontSize:11,letterSpacing:1.2,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap"}}>
                {item.label}
              </button>
            ))}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <BRFlag size={isMobile?17:20} style={{animation:"floatUp 2.5s ease-in-out infinite",borderRadius:2}}/>
        </div>
      </header>
      <div className="body-wrap">
        {isMobile&&sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:140}}/>}
        <Sidebar mods={data.mods} page={page} onNav={navTo} isOpen={sideOpen} isMobile={isMobile} user={user} onLogout={()=>setUser(null)} collapsed={collapsed}/>
        <main className="main-scroll" style={{WebkitOverflowScrolling:"touch"}}>
          <div className="main-inner">
            {page==="home"&&<Home mods={data.mods} onNav={navTo} isMobile={isMobile}/>}
            {page==="admin"&&isAdmin&&<Admin data={data} setData={d=>{setData(d);if(window._fbSet)window._fbSet(d);}}/>}
            {curMod&&<ModalityPage key={page} mod={curMod} onChange={handleChange} canEdit={canEdit} isMobile={isMobile}/>}
          </div>
        </main>
      </div>
      {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#009C3B,#006622)",color:"#fff",borderRadius:8,padding:"10px 22px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,.5)",zIndex:999,border:"1px solid rgba(255,223,0,.25)"}}>{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
