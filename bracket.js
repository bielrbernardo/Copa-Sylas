// ═══════════════════════════════════════════════════════════════════════════════
// BRACKET.JS — Copa Sylas 2026
// Componentes de chaveamento: MatchCard, Bracket, EditModal, BulkModal, GeradorChave
// ═══════════════════════════════════════════════════════════════════════════════

const MGOLD   = window.MGOLD;
const M_COLOR = window.M_COLOR;
const F_COLOR = window.F_COLOR;

// ─── CONSTANTES DE LAYOUT ─────────────────────────────────────────────────────
const CARD_H=80, CARD_W=200, H_GAP=40, V_GAP=12;

function getMatchY(ri, mi, rounds) {
  if(rounds && rounds[0] && rounds[1] && rounds[0].matches.length < rounds[1].matches.length && ri===0) {
    return mi * (CARD_H+V_GAP) * 2 + (CARD_H+V_GAP) / 2;
  }
  const f = Math.pow(2, ri);
  return (f-1)*(CARD_H+V_GAP)/2 + mi*f*(CARD_H+V_GAP);
}

// ─── LINHA DO CARD (um jogador) ───────────────────────────────────────────────
function PlayerRow({ name, isWinner, gc, canEdit, onClick, showDivider }) {
  const isBye = name === "BYE";
  const isEmpty = !name;
  return (
    <div
      onClick={canEdit && name && !isBye ? onClick : undefined}
      style={{
        height: "50%",
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: showDivider ? "1px solid rgba(255,255,255,.06)" : "none",
        background: isWinner ? `${gc}22` : "transparent",
        cursor: canEdit && name && !isBye ? "pointer" : "default",
        transition: "background .15s",
        userSelect: "none",
      }}
    >
      {/* Indicador de winner */}
      <div style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
        background: isWinner ? gc : "rgba(255,255,255,.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, color: "#0a0f00", fontWeight: 900,
        transition: "background .15s",
        boxShadow: isWinner ? `0 0 8px ${gc}88` : "none",
      }}>
        {isWinner ? "✓" : ""}
      </div>
      <span style={{
        flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontSize: 12, fontWeight: isWinner ? 700 : 400,
        color: isWinner ? gc : isEmpty ? "rgba(255,255,255,.18)" : isBye ? "#475569" : "#cbd5e1",
        letterSpacing: isWinner ? .3 : 0,
        transition: "color .15s",
      }}>
        {name || "—"}
      </span>
      {isBye && <span style={{fontSize:9,color:"#334155",fontWeight:600}}>BYE</span>}
    </div>
  );
}

// ─── CARD DE CONFRONTO ────────────────────────────────────────────────────────
function MatchCard({ match, gc, canEdit, onWin, onEdit }) {
  const soloCard = match.p1 && !match.p2;
  const isEmpty  = !match.p1 && !match.p2;
  const isWon    = !!match.winner;

  return (
    <div style={{
      background: isEmpty ? "rgba(255,255,255,.02)" : "rgba(10,20,40,.6)",
      border: `1px solid ${isWon ? gc+"55" : "rgba(255,255,255,.09)"}`,
      borderRadius: 8,
      overflow: "hidden",
      position: "relative",
      opacity: isEmpty ? .3 : 1,
      boxShadow: isWon ? `0 0 16px ${gc}22, inset 0 0 0 1px ${gc}22` : "none",
      backdropFilter: "blur(4px)",
      transition: "box-shadow .2s, border-color .2s",
    }}>
      {canEdit && (
        <button onClick={()=>onEdit(match)} style={{
          position:"absolute", top:3, right:3, zIndex:1,
          background:"rgba(0,0,0,.4)", border:"none", borderRadius:3,
          color:"rgba(255,255,255,.35)", cursor:"pointer", fontSize:10,
          padding:"1px 5px", lineHeight:"16px",
        }}>✏</button>
      )}

      {soloCard ? (
        // Fase Inicial — card de um jogador só
        <div
          onClick={()=>canEdit && match.p1 && onWin(match.id, match.p1)}
          style={{
            height: CARD_H, padding: "0 12px",
            display: "flex", alignItems: "center", gap: 8,
            background: match.winner ? `${gc}22` : "transparent",
            cursor: canEdit && match.p1 ? "pointer" : "default",
          }}
        >
          <div style={{
            width:16, height:16, borderRadius:"50%", flexShrink:0,
            background: match.winner ? gc : "rgba(255,255,255,.06)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:8, color:"#0a0f00", fontWeight:900,
            boxShadow: match.winner ? `0 0 8px ${gc}88` : "none",
          }}>{match.winner ? "✓" : ""}</div>
          <span style={{
            flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            fontSize:13, fontWeight: match.winner ? 700 : 400,
            color: match.winner ? gc : "#cbd5e1",
          }}>{match.p1 || "—"}</span>
        </div>
      ) : (
        <>
          <PlayerRow
            name={match.p1} isWinner={match.winner===match.p1}
            gc={gc} canEdit={canEdit} showDivider
            onClick={()=>onWin(match.id, match.p1)}
          />
          <PlayerRow
            name={match.p2} isWinner={match.winner===match.p2}
            gc={gc} canEdit={canEdit} showDivider={false}
            onClick={()=>onWin(match.id, match.p2)}
          />
        </>
      )}
    </div>
  );
}

// ─── BRACKET COM LINHAS SVG ───────────────────────────────────────────────────
function Bracket({ rounds, gc, canEdit, onWin, onEdit, onAddMatch, onRename, onAddRound, onRemoveRound, onMoveRound }) {
  const champ = rounds[rounds.length-1]?.matches[0]?.winner;
  const maxMatches = Math.max(...rounds.map(r=>r.matches.length));
  const totalH = maxMatches*(CARD_H+V_GAP) + 80;
  const totalW = rounds.length*(CARD_W+H_GAP) + (champ?240:40) + (canEdit?60:0);

  return (
    <div style={{overflowX:"auto", overflowY:"hidden", paddingBottom:24, WebkitOverflowScrolling:"touch", touchAction:"pan-x"}}>
      <div style={{position:"relative", width:totalW, height:totalH}}>

        {/* Linhas SVG conectoras */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible"}}>
          {rounds.map((round,ri)=>{
            if(ri===rounds.length-1) return null;
            return round.matches.map((match,mi)=>{
              const x1 = ri*(CARD_W+H_GAP)+CARD_W;
              const y1 = getMatchY(ri,mi,rounds)+CARD_H/2+24;
              const isPlayIn = round.matches.length < rounds[ri+1].matches.length;
              const nmi = isPlayIn ? mi*2 : Math.floor(mi/2);
              const x2 = (ri+1)*(CARD_W+H_GAP);
              const y2 = getMatchY(ri+1,nmi,rounds)+CARD_H/2+24;
              const mx = x1+H_GAP/2;
              const won = !!match.winner;
              const lc  = won ? gc : "rgba(255,255,255,.1)";
              const sw  = won ? 2 : 1.5;
              const da  = won ? "none" : "4,4";
              return (
                <g key={match.id}>
                  <line x1={x1} y1={y1} x2={mx} y2={y1} stroke={lc} strokeWidth={sw} strokeDasharray={da}/>
                  <line x1={mx} y1={y1} x2={mx} y2={y2} stroke={lc} strokeWidth={sw} strokeDasharray={da}/>
                  <line x1={mx} y1={y2} x2={x2} y2={y2} stroke={lc} strokeWidth={sw} strokeDasharray={da}/>
                  {won && <circle cx={x2} cy={y2} r={4} fill={gc} opacity={.9}/>}
                </g>
              );
            });
          })}
        </svg>

        {/* Cards por fase */}
        {rounds.map((round,ri)=>(
          <div key={round.id}>
            {/* Label da fase */}
            <div style={{position:"absolute", left:ri*(CARD_W+H_GAP), top:0, width:CARD_W,
              display:"flex", alignItems:"center", justifyContent:"center", gap:3}}>
              {canEdit&&ri>0&&(
                <button onClick={()=>onMoveRound(round.id,"left")}
                  style={{background:"none",border:"none",color:`${gc}77`,cursor:"pointer",fontSize:11,padding:"0 2px"}}>◀</button>
              )}
              {canEdit ? (
                <input value={round.name} onChange={e=>onRename(round.id,e.target.value)}
                  style={{background:"transparent",border:"none",borderBottom:`1px solid ${gc}33`,
                    color:gc,fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",
                    outline:"none",fontFamily:"'Inter',sans-serif",width:"62%",
                    padding:"2px 0",textAlign:"center"}}/>
              ) : (
                <span style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",
                  color:gc,padding:"3px 10px",background:`${gc}14`,borderRadius:4,display:"inline-block"}}>
                  {round.name}
                </span>
              )}
              {canEdit&&ri<rounds.length-1&&(
                <button onClick={()=>onMoveRound(round.id,"right")}
                  style={{background:"none",border:"none",color:`${gc}77`,cursor:"pointer",fontSize:11,padding:"0 2px"}}>▶</button>
              )}
              {canEdit&&(
                <button onClick={()=>onRemoveRound(round.id)}
                  style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:10,padding:"0 2px"}}>✕</button>
              )}
            </div>

            {round.matches.map((match,mi)=>{
              const x = ri*(CARD_W+H_GAP);
              const y = getMatchY(ri,mi,rounds)+24;
              return (
                <div key={match.id} style={{position:"absolute", left:x, top:y, width:CARD_W, height:CARD_H}}>
                  <MatchCard match={match} gc={gc} canEdit={canEdit}
                    onWin={onWin} onEdit={onEdit}/>
                </div>
              );
            })}

            {canEdit&&(
              <div style={{position:"absolute", left:ri*(CARD_W+H_GAP),
                top:getMatchY(ri,round.matches.length,rounds)+24+CARD_H+6}}>
                <button onClick={()=>onAddMatch(round.id)} style={{
                  background:"transparent", border:`1px dashed ${gc}33`,
                  borderRadius:6, padding:"4px 8px",
                  color:`${gc}66`, fontSize:10, cursor:"pointer",
                  fontFamily:"'Inter',sans-serif", width:CARD_W,
                }}>+ confronto</button>
              </div>
            )}
          </div>
        ))}

        {/* Botão nova fase */}
        {canEdit&&(
          <div style={{position:"absolute", left:rounds.length*(CARD_W+H_GAP)+4,
            top:getMatchY(0,0,rounds)+24}}>
            <button onClick={onAddRound} style={{
              background:"transparent", border:"1px dashed rgba(255,223,0,.22)",
              borderRadius:8, padding:"12px 9px",
              color:"rgba(255,223,0,.4)", fontSize:10, cursor:"pointer",
              fontFamily:"'Inter',sans-serif", writingMode:"vertical-rl",
            }}>+ Fase</button>
          </div>
        )}

        {/* Campeão */}
        {champ&&(
          <div style={{position:"absolute",
            left:rounds.length*(CARD_W+H_GAP)+(canEdit?52:8),
            top:getMatchY(rounds.length-1,0,rounds)+24,
            display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:MGOLD,opacity:.7}}>★ CAMPEÃO ★</div>
            <div style={{
              background:"linear-gradient(135deg,#FFDF00,#FFB800,#cc8800)",
              color:"#0a0f00", borderRadius:10, padding:"12px 20px",
              fontWeight:900, fontSize:14,
              boxShadow:"0 0 32px rgba(255,223,0,.4), 0 4px 20px rgba(0,0,0,.4)",
              border:"2px solid rgba(255,255,255,.2)",
              whiteSpace:"nowrap", textAlign:"center",
            }}>🏆 {champ}</div>
            <div style={{fontSize:11,color:"rgba(255,223,0,.3)"}}>★ ★ ★ ★ ★</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL EDITAR CONFRONTO ───────────────────────────────────────────────────
function EditModal({ match, onSave, onRemove, onClose }) {
  const [p1,setP1]=React.useState(match.p1||"");
  const [p2,setP2]=React.useState(match.p2||"");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0d1a05",border:"2px solid rgba(255,223,0,.25)",borderRadius:14,padding:28,width:"100%",maxWidth:340}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD,marginBottom:20}}>✏️ EDITAR CONFRONTO</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {[[p1,setP1,"Jogador 1"],[p2,setP2,"Jogador 2"]].map(([v,set,ph],i)=>(
            <input key={i} value={v} onChange={e=>set(e.target.value)} placeholder={ph}
              style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"9px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={()=>onRemove(match.id)} style={{background:"transparent",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444",borderRadius:6,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>Remover</button>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.4)",borderRadius:6,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
          <button onClick={()=>{onSave(match.id,p1||null,p2||null);onClose();}} style={{background:"linear-gradient(135deg,#009C3B,#006622)",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL JOGADORES EM MASSA ─────────────────────────────────────────────────
function BulkModal({ onAdd, onClose }) {
  const [raw,setRaw]=React.useState("");
  const add=()=>{
    const players=raw.split("\n").map(s=>s.trim()).filter(Boolean);
    if(players.length) onAdd(players);
    onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0d1a05",border:"2px solid rgba(255,223,0,.25)",borderRadius:14,padding:28,width:"100%",maxWidth:380}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD,marginBottom:16}}>+ ADICIONAR JOGADORES</div>
        <div style={{color:"rgba(255,255,255,.3)",fontSize:12,marginBottom:10}}>Um nome por linha — serão adicionados à primeira fase</div>
        <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"João\nPedro\nLucas\nGabriel"} rows={9}
          style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"10px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.4)",borderRadius:6,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
          <button onClick={add} style={{background:"linear-gradient(135deg,#009C3B,#006622)",color:"#fff",border:"none",borderRadius:6,padding:"8px 20px",fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Adicionar</button>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS GERADOR ──────────────────────────────────────────────────────────
function shuffleArr(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function nextPow2(n){ let p=1; while(p<n)p*=2; return p; }
function gerarChave(players, randomize) {
  const list = randomize ? shuffleArr(players) : [...players];
  const size = nextPow2(list.length);
  while(list.length<size) list.push("BYE");
  const rounds=[], firstMatches=[];
  for(let i=0;i<list.length;i+=2){
    const p1=list[i],p2=list[i+1];
    firstMatches.push({id:window.uid(),p1,p2,winner:p2==="BYE"?p1:null});
  }
  const firstName=size<=2?"Final":size<=4?"Semifinal":size<=8?"Quartas de Final":size<=16?"1ª Fase":"Fase Inicial";
  rounds.push({id:window.uid(),name:firstName,matches:firstMatches});
  let prev=firstMatches;
  while(prev.length>1){
    const next=[];
    for(let i=0;i<prev.length;i+=2) next.push({id:window.uid(),p1:prev[i]?.winner||null,p2:prev[i+1]?.winner||null,winner:null});
    const n=next.length;
    rounds.push({id:window.uid(),name:n===1?"Final":n===2?"Semifinal":n===4?"Quartas de Final":"Fase",matches:next});
    prev=next;
  }
  return rounds;
}

// ─── GERADOR DE CHAVES ────────────────────────────────────────────────────────
function GeradorChave({ mod, onSalvar, onClose, defaultCat, isNivel }) {
  const [raw,setRaw]=React.useState("");
  const [cat,setCat]=React.useState(defaultCat||"misto");
  const [randomize,setRandomize]=React.useState(true);
  const [rounds,setRounds]=React.useState(null);
  const players=raw.split("\n").map(s=>s.trim()).filter(Boolean);
  const NIVEL_TABS = window.NIVEL_TABS;
  const curT = isNivel ? (NIVEL_TABS||[]).find(t=>t.key===cat)||{gc:mod.accent,label:"Categoria",key:cat} : {gc:mod.accent,label:"⚡ Misto",key:"misto"};
  const gc=curT.gc;

  const gerar=()=>{ if(players.length<2)return; setRounds(gerarChave(players,randomize)); };
  const salvar=()=>{ if(!rounds)return; onSalvar(cat,rounds); onClose(); };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:400,display:"flex",alignItems:"stretch",justifyContent:"center"}}>
      <div style={{background:"#0a0f00",border:"2px solid rgba(255,223,0,.2)",width:"100%",maxWidth:1100,display:"flex",flexDirection:"column",maxHeight:"100vh",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"2px solid rgba(255,223,0,.15)",flexShrink:0}}>
          <span style={{fontSize:22}}>{mod.emoji}</span>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD}}>GERADOR DE CHAVES · {mod.name}</div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          {/* Painel esquerdo */}
          <div style={{width:280,flexShrink:0,borderRight:"1px solid rgba(255,255,255,.07)",padding:20,overflowY:"auto",background:"rgba(255,255,255,.02)"}}>
            <div style={{marginBottom:14}}>
              <div style={{color:"rgba(255,255,255,.35)",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Categoria</div>
              <div style={{display:"flex",borderRadius:7,overflow:"hidden",border:"2px solid rgba(255,255,255,.1)",flexWrap:"wrap"}}>
                {(isNivel ? (NIVEL_TABS||[]) : [{key:"misto",label:"⚡ Misto",gc:mod.accent}]).map(t=>(
                  <button key={t.key} onClick={()=>{setCat(t.key);setRounds(null);}}
                    style={{flex:1,padding:"8px 6px",border:"none",cursor:"pointer",background:cat===t.key?t.gc:"transparent",color:cat===t.key?"#fff":"rgba(255,255,255,.35)",fontWeight:800,fontSize:10,textTransform:"uppercase",fontFamily:"'Inter',sans-serif",transition:"all .2s",whiteSpace:"nowrap"}}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{color:"rgba(255,255,255,.35)",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
                Atletas — um por linha <span style={{color:gc,fontWeight:700}}>({players.length})</span>
              </div>
              <textarea value={raw} onChange={e=>setRaw(e.target.value)} rows={12}
                placeholder={"João Silva\nPedro Santos\nLucas Oliveira"}
                style={{width:"100%",background:"rgba(255,255,255,.05)",border:`1px solid ${gc}33`,borderRadius:6,padding:"9px 11px",color:"#e2e8f0",fontSize:12,outline:"none",fontFamily:"'Inter',sans-serif",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>
            </div>
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
            {players.length>=2&&(
              <div style={{padding:"10px 12px",background:`${gc}12`,border:`1px solid ${gc}28`,borderRadius:6,marginBottom:14,fontSize:11}}>
                <div style={{color:gc,fontWeight:700,marginBottom:4}}>📐 Estrutura</div>
                <div style={{color:"rgba(255,255,255,.45)"}}>{players.length} atletas → {nextPow2(players.length)} vagas</div>
                <div style={{color:"rgba(255,255,255,.45)"}}>{nextPow2(players.length)-players.length} BYE(s) automáticos</div>
                <div style={{color:"rgba(255,255,255,.45)"}}>{Math.log2(nextPow2(players.length))} fases até o campeão</div>
              </div>
            )}
            <button onClick={gerar} disabled={players.length<2}
              style={{width:"100%",background:players.length>=2?`linear-gradient(135deg,${gc},${gc}bb)`:"rgba(255,255,255,.07)",color:players.length>=2?"#fff":"rgba(255,255,255,.2)",border:"none",borderRadius:8,padding:"12px",fontWeight:900,fontSize:13,cursor:players.length>=2?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif",marginBottom:8}}>
              ⚡ GERAR CHAVE
            </button>
            {rounds&&(
              <>
                <button onClick={()=>setRounds(gerarChave(players,randomize))}
                  style={{width:"100%",background:"transparent",border:`1px solid ${gc}44`,color:gc,borderRadius:8,padding:"9px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif",marginBottom:8}}>
                  🎲 Novo sorteio
                </button>
                <button onClick={salvar}
                  style={{width:"100%",background:"linear-gradient(135deg,#FFDF00,#FFB800)",color:"#0a0f00",border:"none",borderRadius:8,padding:"12px",fontWeight:900,fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:"0 4px 18px rgba(255,223,0,.3)"}}>
                  💾 SALVAR NO SITE
                </button>
              </>
            )}
          </div>
          {/* Painel direito */}
          <div style={{flex:1,padding:24,overflowX:"auto",overflowY:"auto"}}>
            {!rounds ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,opacity:.35}}>
                <div style={{fontSize:56}}>🏆</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:4,color:MGOLD}}>CONFIGURE E GERE A CHAVE</div>
              </div>
            ) : (
              <div>
                <div style={{marginBottom:20}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:MGOLD,letterSpacing:4}}>{mod.name}</div>
                  <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
                    <div style={{background:gc,borderRadius:4,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#fff"}}>{curT.label}</div>
                    <div style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{players.length} atletas · {rounds.length} fases</div>
                  </div>
                </div>
                <Bracket rounds={rounds} gc={gc} canEdit={false} onWin={()=>{}} onEdit={()=>{}} onAddMatch={()=>{}} onRename={()=>{}} onAddRound={()=>{}} onRemoveRound={()=>{}} onMoveRound={()=>{}}/>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Expõe globalmente
window.MatchCard    = MatchCard;
window.Bracket      = Bracket;
window.EditModal    = EditModal;
window.BulkModal    = BulkModal;
window.GeradorChave = GeradorChave;
window.getMatchY    = getMatchY;
window.CARD_H=CARD_H; window.CARD_W=CARD_W; window.H_GAP=H_GAP; window.V_GAP=V_GAP;


function getMatchY(ri, mi, rounds) {
  if(rounds && rounds[0] && rounds[1] && rounds[0].matches.length < rounds[1].matches.length && ri===0) {
    return mi * (CARD_H+V_GAP) * 2 + (CARD_H+V_GAP) / 2;
  }
  const f = Math.pow(2, ri);
  return (f-1)*(CARD_H+V_GAP)/2 + mi*f*(CARD_H+V_GAP);
}
