// ═══════════════════════════════════════════════════════════════════════════════
// MODALITY.JS — Copa Sylas 2026
// Página de cada modalidade: NIVEL_TABS, migrarGenders, ModalityPage
// ═══════════════════════════════════════════════════════════════════════════════

const MGOLD   = window.MGOLD;
const M_COLOR = window.M_COLOR;
const F_COLOR = window.F_COLOR;
const M_BG    = window.M_BG;
const F_BG    = window.F_BG;

// ─── ABAS POR NÍVEL ───────────────────────────────────────────────────────────
const NIVEL_TABS = [
  {key:"fund_masc", label:"📚 Fund. Masc", short:"F.Masc", gc:M_COLOR,  gbg:M_BG},
  {key:"fund_fem",  label:"📚 Fund. Fem",  short:"F.Fem",  gc:F_COLOR,  gbg:F_BG},
  {key:"em_masc",   label:"🎓 EM Masc",    short:"EM.M",   gc:"#0ea5e9", gbg:"linear-gradient(160deg,#001a28,#002038,#0a0f00)"},
  {key:"em_fem",    label:"🎓 EM Fem",     short:"EM.F",   gc:"#a855f7", gbg:"linear-gradient(160deg,#1a0028,#280038,#0a0f00)"},
];
window.NIVEL_TABS = NIVEL_TABS;

// ─── MIGRAÇÃO DE DADOS ANTIGOS ────────────────────────────────────────────────
function migrarGenders(mod) {
  if(mod.tipo==="nivel") {
    const g = mod.genders||{};
    if(g.masculino && !g.fund_masc) {
      return { ...mod, genders:{
        fund_masc: g.masculino,
        fund_fem:  g.feminino || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
        em_masc:   g.em_masc  || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
        em_fem:    g.em_fem   || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
      }};
    }
    return { ...mod, genders:{
      fund_masc: g.fund_masc || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
      fund_fem:  g.fund_fem  || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
      em_masc:   g.em_masc   || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
      em_fem:    g.em_fem    || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]},
    }};
  }
  if(mod.tipo==="misto") {
    const g = mod.genders||{};
    // Preserva roundrobin
    if(g.misto && g.misto.tipo==="roundrobin") return mod;
    if(!g.misto) {
      const first = g.masculino || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]};
      return { ...mod, genders:{ misto: first }};
    }
  }
  return mod;
}

// ─── PÁGINA DE MODALIDADE ─────────────────────────────────────────────────────
function ModalityPage({ mod: modRaw, onChange, canEdit, isMobile }) {
  const mod       = migrarGenders(modRaw);
  const isNivel   = mod.tipo==="nivel";
  const defaultTab = isNivel?"fund_masc":"misto";
  const [catTab,setCatTab]   = React.useState(defaultTab);
  const [subTab,setSubTab]   = React.useState("chave");
  const [editMatch,setEditMatch] = React.useState(null);
  const [showBulk,setShowBulk]   = React.useState(false);
  const [showGerador,setShowGerador] = React.useState(false);

  const curNivel = isNivel ? NIVEL_TABS.find(t=>t.key===catTab) : null;
  const gc  = isNivel ? (curNivel?.gc||M_COLOR) : mod.accent;
  const gbg = isNivel ? (curNivel?.gbg||M_BG)   : "linear-gradient(160deg,#0a1628,#0d2137,#0a0f00)";
  const gData = mod.genders[catTab] || {rounds:[window.mkRound("Semifinal"),window.mkRound("Final")]};

  const upd=(newRounds)=>onChange({...modRaw,...mod,genders:{...mod.genders,[catTab]:{...gData,rounds:window.propagate(newRounds)}}});
  const handleWin    =(mid,w)=>upd(gData.rounds.map(r=>({...r,matches:r.matches.map(m=>m.id===mid?{...m,winner:w}:m)})));
  const handleSave   =(mid,p1,p2)=>upd(gData.rounds.map(r=>({...r,matches:r.matches.map(m=>m.id===mid?{...m,p1,p2,winner:null}:m)})));
  const handleRemove =(mid)=>upd(gData.rounds.map(r=>({...r,matches:r.matches.filter(m=>m.id!==mid)})));
  const handleAddM   =(rid)=>upd(gData.rounds.map(r=>r.id===rid?{...r,matches:[...r.matches,window.mkMatch()]}:r));
  const handleRename =(rid,name)=>upd(gData.rounds.map(r=>r.id===rid?{...r,name}:r));
  const handleAddR   =()=>upd([...gData.rounds,window.mkRound("Nova Fase")]);
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
  const handleSalvarGerador=(g,newRounds)=>{
    onChange({...mod,genders:{...mod.genders,[g]:{...mod.genders[g],rounds:newRounds}}});
  };
  const handleBulk=(players)=>{
    const ms=[]; for(let i=0;i<players.length;i+=2)ms.push(window.mkMatch(players[i]||null,players[i+1]||null));
    const fid=gData.rounds[0]?.id;
    upd(gData.rounds.map(r=>r.id===fid?{...r,matches:[...r.matches,...ms]}:r));
  };

  // Pega componentes do window (carregados pelos arquivos anteriores)
  const Bracket     = window.Bracket;
  const EditModal   = window.EditModal;
  const BulkModal   = window.BulkModal;
  const GeradorChave= window.GeradorChave;
  const RoundRobin  = window.RoundRobin;
  const DecoSVG     = window.DecoSVG;
  const BRFlag      = window.BRFlag;

  return (
    <div>
      {/* Cabeçalho da modalidade */}
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
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?22:29,color:gc,letterSpacing:4,lineHeight:1}}>{mod.name}</div>
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

        {/* Tabs por nível/misto + aba campeão */}
        <div style={{display:"flex",marginTop:16,gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:"2px solid rgba(255,255,255,.1)"}}>
            {isNivel ? NIVEL_TABS.map(t=>(
              <button key={t.key} onClick={()=>{setCatTab(t.key);setSubTab("chave");}}
                style={{padding:"8px 14px",border:"none",cursor:"pointer",
                  background:catTab===t.key&&subTab!=="campeao"?t.gc:"transparent",
                  color:catTab===t.key&&subTab!=="campeao"?"#fff":"rgba(255,255,255,.38)",
                  fontWeight:800,fontSize:isMobile?10:12,letterSpacing:.5,
                  textTransform:"uppercase",fontFamily:"'Inter',sans-serif",transition:"all .2s",whiteSpace:"nowrap"}}>
                {isMobile?t.short:t.label}
              </button>
            )) : (
              <button style={{padding:"8px 18px",border:"none",background:mod.accent,color:"#fff",fontWeight:800,fontSize:12,textTransform:"uppercase",fontFamily:"'Inter',sans-serif"}}>
                ⚡ Misto
              </button>
            )}
          </div>
          <button onClick={()=>setSubTab(subTab==="campeao"?"chave":"campeao")}
            style={{padding:"8px 14px",border:`2px solid ${subTab==="campeao"?"rgba(255,223,0,.5)":"rgba(255,223,0,.2)"}`,borderRadius:8,cursor:"pointer",
              background:subTab==="campeao"?"rgba(255,223,0,.15)":"transparent",
              color:subTab==="campeao"?MGOLD:"rgba(255,223,0,.4)",fontWeight:800,fontSize:12,
              letterSpacing:1,fontFamily:"'Inter',sans-serif",transition:"all .2s",whiteSpace:"nowrap"}}>
            🏆 Campeão
          </button>
        </div>
      </div>

      {/* ABA CAMPEÃO */}
      {subTab==="campeao"&&(
        <div style={{background:"linear-gradient(135deg,#0a0f00,#0d1a05)",minHeight:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 24px",gap:32}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:5,color:"rgba(255,255,255,.2)"}}>CAMPEÕES DA {mod.name.toUpperCase()}</div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center"}}>
            {(isNivel?NIVEL_TABS:[{key:"misto",label:"⚡ Misto",gc:mod.accent}]).map(t=>{
              const gd=mod.genders[t.key];
              if(!gd) return null;
              const campeao=gd.tipo==="roundrobin"?null:gd.rounds[gd.rounds.length-1]?.matches[0]?.winner;
              return (
                <div key={t.key} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,minWidth:180}}>
                  <div style={{background:t.gc,borderRadius:8,padding:"4px 14px",fontSize:11,fontWeight:800,color:"#fff",letterSpacing:1,textTransform:"uppercase",textAlign:"center"}}>{t.label}</div>
                  {campeao?(
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                      <div style={{fontSize:52,filter:"drop-shadow(0 0 20px rgba(255,223,0,.6))",animation:"floatUp 3s ease-in-out infinite"}}>🏆</div>
                      <div style={{background:"linear-gradient(135deg,#FFDF00,#FFB800,#cc8800)",color:"#0a0f00",borderRadius:12,padding:"14px 24px",fontWeight:900,fontSize:18,textAlign:"center",boxShadow:"0 0 40px rgba(255,223,0,.5)",border:"3px solid rgba(255,255,255,.3)",whiteSpace:"nowrap"}}>{campeao}</div>
                      <div style={{fontSize:14,letterSpacing:5,color:"rgba(255,223,0,.5)"}}>★ ★ ★ ★ ★</div>
                    </div>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,opacity:.3}}>
                      <div style={{fontSize:44}}>🏆</div>
                      <div style={{color:"rgba(255,255,255,.3)",fontSize:11,letterSpacing:2}}>A DECIDIR</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA CHAVE / ROUND ROBIN */}
      {subTab!=="campeao"&&(
        <div>
          {gData.tipo==="roundrobin"?(
            <div style={{background:gbg,minHeight:300,padding:isMobile?"14px":"20px 24px 44px"}}>
              <RoundRobin gData={gData} gc={gc} canEdit={canEdit}
                onChange={(newGData)=>onChange({...mod,genders:{...mod.genders,[catTab]:newGData}})}/>
            </div>
          ):(
            <div>
              {canEdit&&<div style={{margin:"10px 20px 0",fontSize:11,color:"rgba(255,223,0,.45)",padding:"5px 11px",background:"rgba(255,223,0,.04)",border:"1px solid rgba(255,223,0,.09)",borderRadius:6,display:"inline-block"}}>✏️ Clique no jogador para avançar · ✏️ no card para editar · ◀▶ para reordenar fases</div>}
              <div style={{background:gbg,minHeight:300,padding:isMobile?"14px":"20px 22px 44px"}}>
                <Bracket rounds={gData.rounds} gc={gc} canEdit={canEdit}
                  onWin={handleWin} onEdit={setEditMatch}
                  onAddMatch={handleAddM} onRename={handleRename}
                  onAddRound={handleAddR} onRemoveRound={handleRemoveR} onMoveRound={handleMoveR}/>
              </div>
            </div>
          )}
        </div>
      )}

      {editMatch&&<EditModal match={editMatch} onSave={handleSave} onRemove={handleRemove} onClose={()=>setEditMatch(null)}/>}
      {showBulk&&<BulkModal onAdd={handleBulk} onClose={()=>setShowBulk(false)}/>}
      {showGerador&&<GeradorChave mod={mod} onSalvar={handleSalvarGerador} onClose={()=>setShowGerador(false)} defaultCat={catTab} isNivel={isNivel}/>}
    </div>
  );
}

window.NIVEL_TABS   = NIVEL_TABS;
window.migrarGenders = migrarGenders;
window.ModalityPage  = ModalityPage;
