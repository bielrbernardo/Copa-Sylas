// ═══════════════════════════════════════════════════════════════════════════════
// ROUNDROBIN.JS — Copa Sylas 2026
// Suporta dois modos: gols (Futsal) e sets (Vôlei)
// ═══════════════════════════════════════════════════════════════════════════════

const MGOLD = window.MGOLD;

// ─── CLASSIFICAÇÃO FUTSAL (gols) ──────────────────────────────────────────────
function calcClassificacao(teams, rounds) {
  const table = {};
  teams.forEach(t => table[t]={time:t,j:0,v:0,e:0,d:0,gp:0,gc:0,pts:0});
  rounds.forEach(r => r.matches.forEach(m => {
    const v1=m.gols1, v2=m.gols2;
    if(v1===null||v1===undefined||v1===""||v1==="null") return;
    if(v2===null||v2===undefined||v2===""||v2==="null") return;
    const g1=parseInt(v1), g2=parseInt(v2);
    if(isNaN(g1)||isNaN(g2)) return;
    if(!table[m.p1]||!table[m.p2]) return;
    table[m.p1].j++; table[m.p2].j++;
    table[m.p1].gp+=g1; table[m.p1].gc+=g2;
    table[m.p2].gp+=g2; table[m.p2].gc+=g1;
    if(g1>g2){table[m.p1].v++;table[m.p1].pts+=3;table[m.p2].d++;}
    else if(g2>g1){table[m.p2].v++;table[m.p2].pts+=3;table[m.p1].d++;}
    else{table[m.p1].e++;table[m.p1].pts++;table[m.p2].e++;table[m.p2].pts++;}
  }));
  return Object.values(table).sort((a,b)=>b.pts-a.pts||(b.gp-b.gc)-(a.gp-a.gc)||b.gp-a.gp);
}

// ─── CLASSIFICAÇÃO VÔLEI (sets) ───────────────────────────────────────────────
// 2x0 → vencedor 3pts / perdedor 0pts
// 2x1 → vencedor 2pts / perdedor 1pt
function calcClassificacaoSets(teams, rounds) {
  const table = {};
  teams.forEach(t => table[t]={time:t,j:0,v:0,d:0,sp:0,sc:0,pts:0});
  rounds.forEach(r => r.matches.forEach(m => {
    const v1=m.sets1, v2=m.sets2;
    if(v1===null||v1===undefined||v1===""||v1==="null") return;
    if(v2===null||v2===undefined||v2===""||v2==="null") return;
    const s1=parseInt(v1), s2=parseInt(v2);
    if(isNaN(s1)||isNaN(s2)) return;
    if(!table[m.p1]||!table[m.p2]) return;
    table[m.p1].j++; table[m.p2].j++;
    table[m.p1].sp+=s1; table[m.p1].sc+=s2;
    table[m.p2].sp+=s2; table[m.p2].sc+=s1;
    if(s1>s2){
      table[m.p1].v++;
      table[m.p2].d++;
      // 2x0 = 3pts/0pts | 2x1 = 2pts/1pt
      if(s2===0){ table[m.p1].pts+=3; }
      else      { table[m.p1].pts+=2; table[m.p2].pts+=1; }
    } else {
      table[m.p2].v++;
      table[m.p1].d++;
      if(s1===0){ table[m.p2].pts+=3; }
      else      { table[m.p2].pts+=2; table[m.p1].pts+=1; }
    }
  }));
  // Ordem: pts → saldo de sets → sets pró
  return Object.values(table).sort((a,b)=>
    b.pts-a.pts || (b.sp-b.sc)-(a.sp-a.sc) || b.sp-a.sp
  );
}

// ─── ROUND ROBIN FUTSAL ───────────────────────────────────────────────────────
function RoundRobin({ gData, gc, canEdit, onChange }) {
  const [rodada,setRodada]=React.useState(0);
  const [editGols,setEditGols]=React.useState(null);
  const [g1,setG1]=React.useState(""); const [g2,setG2]=React.useState("");

  const rounds = gData.rounds || [];
  const teams  = gData.teams  || [];
  const class_ = calcClassificacao(teams, rounds);

  const saveGols = () => {
    const newRounds = rounds.map(r => r.id===editGols.rid
      ? {...r, matches:r.matches.map(m => m.id===editGols.matchId
          ? {...m, gols1:g1, gols2:g2, winner:parseInt(g1)>parseInt(g2)?m.p1:parseInt(g2)>parseInt(g1)?m.p2:"empate"}
          : m)}
      : r);
    onChange({...gData, rounds:newRounds});
    setEditGols(null); setG1(""); setG2("");
  };

  const curRound = rounds[rodada];

  return (
    <div style={{padding:"16px 0"}}>
      {/* Tabs rodadas */}
      <div style={{display:"flex",overflowX:"auto",gap:4,marginBottom:20,paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
        {rounds.map((r,i)=>(
          <button key={r.id} onClick={()=>setRodada(i)} style={{
            flexShrink:0, padding:"7px 14px", borderRadius:6,
            border:`1px solid ${i===rodada?gc:"rgba(255,255,255,.1)"}`,
            background:i===rodada?`${gc}22`:"transparent",
            color:i===rodada?gc:"rgba(255,255,255,.4)",
            fontWeight:i===rodada?700:400, fontSize:11, cursor:"pointer",
            fontFamily:"'Inter',sans-serif", letterSpacing:1,
          }}>{r.name}</button>
        ))}
      </div>

      {/* Jogos da rodada atual */}
      {curRound&&(
        <div style={{marginBottom:24}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:gc,textTransform:"uppercase",marginBottom:10,padding:"3px 10px",background:`${gc}12`,borderRadius:4,display:"inline-block"}}>{curRound.name}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {curRound.matches.map(m=>{
              const done=m.gols1!==null&&m.gols1!==""&&m.gols2!==null&&m.gols2!=="";
              return (
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"rgba(255,255,255,.04)",border:`1px solid ${done?"rgba(255,223,0,.2)":"rgba(255,255,255,.08)"}`,borderRadius:8}}>
                  <span style={{flex:1,textAlign:"right",fontWeight:done&&m.winner===m.p1?800:400,color:done&&m.winner===m.p1?gc:"#e2e8f0",fontSize:13}}>{m.p1}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    {done ? (
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:MGOLD,minWidth:20,textAlign:"center"}}>{m.gols1}</span>
                        <span style={{color:"rgba(255,255,255,.3)",fontSize:14}}>×</span>
                        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:MGOLD,minWidth:20,textAlign:"center"}}>{m.gols2}</span>
                      </div>
                    ) : (
                      <span style={{color:"rgba(255,255,255,.2)",fontSize:12,padding:"2px 10px",border:"1px solid rgba(255,255,255,.1)",borderRadius:4}}>× × ×</span>
                    )}
                  </div>
                  <span style={{flex:1,fontWeight:done&&m.winner===m.p2?800:400,color:done&&m.winner===m.p2?gc:"#e2e8f0",fontSize:13}}>{m.p2}</span>
                  {canEdit&&(
                    <button onClick={()=>{setEditGols({matchId:m.id,rid:curRound.id});setG1(m.gols1??"");setG2(m.gols2??"");}}
                      style={{background:`${gc}22`,border:`1px solid ${gc}44`,borderRadius:5,padding:"4px 10px",color:gc,fontSize:11,cursor:"pointer",fontWeight:700,flexShrink:0}}>
                      {done?"✏️":"+ Gols"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela de classificação */}
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:MGOLD,textTransform:"uppercase",marginBottom:10,padding:"3px 10px",background:"rgba(255,223,0,.08)",borderRadius:4,display:"inline-block"}}>🏆 Classificação</div>
        <div style={{background:"rgba(255,255,255,.02)",borderRadius:10,overflowX:"auto",border:"1px solid rgba(255,255,255,.07)",WebkitOverflowScrolling:"touch"}}>
          <div style={{display:"grid",gridTemplateColumns:"32px 1fr 32px 32px 32px 32px 40px 40px 40px",minWidth:500,padding:"8px 12px",background:"rgba(255,255,255,.05)",fontSize:9,letterSpacing:2,color:"rgba(255,255,255,.35)",textTransform:"uppercase",gap:4}}>
            <span>#</span><span>Time</span>
            <span style={{textAlign:"center"}}>J</span><span style={{textAlign:"center"}}>V</span>
            <span style={{textAlign:"center"}}>E</span><span style={{textAlign:"center"}}>D</span>
            <span style={{textAlign:"center"}}>GP</span><span style={{textAlign:"center"}}>GC</span>
            <span style={{textAlign:"center",fontWeight:800,color:MGOLD}}>PTS</span>
          </div>
          {class_.map((t,i)=>(
            <div key={t.time} style={{display:"grid",gridTemplateColumns:"32px 1fr 32px 32px 32px 32px 40px 40px 40px",minWidth:500,padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,.04)",background:i===0?"rgba(255,223,0,.05)":i<3?"rgba(255,255,255,.02)":"transparent",gap:4,alignItems:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:i===0?MGOLD:i===1?"#94a3b8":i===2?"#cd7f32":"rgba(255,255,255,.3)",textAlign:"center"}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
              </span>
              <span style={{fontWeight:i===0?800:400,fontSize:13,color:i===0?MGOLD:"#e2e8f0"}}>{t.time}</span>
              {[t.j,t.v,t.e,t.d,t.gp,t.gc].map((v,vi)=>(
                <span key={vi} style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,.5)"}}>{v}</span>
              ))}
              <span style={{textAlign:"center",fontWeight:800,fontSize:15,color:i===0?MGOLD:"rgba(255,255,255,.7)"}}>{t.pts}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:8,fontSize:10,color:"rgba(255,255,255,.2)",letterSpacing:1}}>V=Vitória · E=Empate · D=Derrota · GP=Gols Pró · GC=Gols Contra · PTS=Pontos</div>
      </div>

      {/* Modal lançar gols */}
      {editGols&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0d1a05",border:`2px solid ${gc}44`,borderRadius:14,padding:28,width:"100%",maxWidth:360}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD,marginBottom:20}}>⚽ LANÇAR RESULTADO</div>
            {(()=>{
              const m=rounds.find(r=>r.id===editGols.rid)?.matches.find(m=>m.id===editGols.matchId);
              return m?(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                    <span style={{flex:1,textAlign:"right",fontWeight:700,fontSize:14}}>{m.p1}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <input value={g1} onChange={e=>setG1(e.target.value.replace(/\D/g,""))} placeholder="0"
                        style={{width:52,background:"rgba(255,255,255,.08)",border:`2px solid ${gc}55`,borderRadius:8,padding:"10px 0",color:MGOLD,fontSize:22,fontFamily:"'Bebas Neue',cursive",textAlign:"center",outline:"none"}}/>
                      <span style={{color:"rgba(255,255,255,.3)",fontSize:18,fontWeight:700}}>×</span>
                      <input value={g2} onChange={e=>setG2(e.target.value.replace(/\D/g,""))} placeholder="0"
                        style={{width:52,background:"rgba(255,255,255,.08)",border:`2px solid ${gc}55`,borderRadius:8,padding:"10px 0",color:MGOLD,fontSize:22,fontFamily:"'Bebas Neue',cursive",textAlign:"center",outline:"none"}}/>
                    </div>
                    <span style={{flex:1,fontWeight:700,fontSize:14}}>{m.p2}</span>
                  </div>
                  <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                    <button onClick={()=>{setEditGols(null);setG1("");setG2("");}} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.4)",borderRadius:6,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
                    <button onClick={saveGols} style={{background:`linear-gradient(135deg,${gc},${gc}bb)`,color:"#fff",border:"none",borderRadius:6,padding:"8px 20px",fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Salvar</button>
                  </div>
                </div>
              ):null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROUND ROBIN VÔLEI (sets) ─────────────────────────────────────────────────
function RoundRobinSets({ gData, gc, canEdit, onChange }) {
  const [rodada,setRodada]=React.useState(0);
  const [editSets,setEditSets]=React.useState(null);
  const [s1,setS1]=React.useState(""); const [s2,setS2]=React.useState("");

  const rounds = gData.rounds || [];
  const teams  = gData.teams  || [];
  const class_ = calcClassificacaoSets(teams, rounds);

  const saveSets = () => {
    const ns1=parseInt(s1), ns2=parseInt(s2);
    const winner = ns1>ns2 ? rounds.find(r=>r.id===editSets.rid)?.matches.find(m=>m.id===editSets.matchId)?.p1
                           : rounds.find(r=>r.id===editSets.rid)?.matches.find(m=>m.id===editSets.matchId)?.p2;
    const newRounds = rounds.map(r => r.id===editSets.rid
      ? {...r, matches:r.matches.map(m => m.id===editSets.matchId
          ? {...m, sets1:s1, sets2:s2, winner}
          : m)}
      : r);
    onChange({...gData, rounds:newRounds});
    setEditSets(null); setS1(""); setS2("");
  };

  // Valida: só aceita 2x0 ou 2x1 ou 0x2 ou 1x2
  const resultadoValido = () => {
    const ns1=parseInt(s1), ns2=parseInt(s2);
    if(isNaN(ns1)||isNaN(ns2)) return false;
    return (ns1===2&&(ns2===0||ns2===1)) || (ns2===2&&(ns1===0||ns1===1));
  };

  const curRound = rounds[rodada];

  return (
    <div style={{padding:"16px 0"}}>
      {/* Tabs rodadas */}
      <div style={{display:"flex",overflowX:"auto",gap:4,marginBottom:20,paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
        {rounds.map((r,i)=>(
          <button key={r.id} onClick={()=>setRodada(i)} style={{
            flexShrink:0, padding:"7px 14px", borderRadius:6,
            border:`1px solid ${i===rodada?gc:"rgba(255,255,255,.1)"}`,
            background:i===rodada?`${gc}22`:"transparent",
            color:i===rodada?gc:"rgba(255,255,255,.4)",
            fontWeight:i===rodada?700:400, fontSize:11, cursor:"pointer",
            fontFamily:"'Inter',sans-serif", letterSpacing:1,
          }}>{r.name}</button>
        ))}
      </div>

      {/* Folga da rodada */}
      {curRound?.folga&&(
        <div style={{marginBottom:10,fontSize:11,color:"rgba(255,255,255,.3)",padding:"4px 10px",background:"rgba(255,255,255,.03)",borderRadius:6,display:"inline-block",border:"1px solid rgba(255,255,255,.07)"}}>
          😴 Folga: <strong style={{color:"rgba(255,255,255,.5)"}}>{curRound.folga}</strong>
        </div>
      )}

      {/* Jogos da rodada atual */}
      {curRound&&(
        <div style={{marginBottom:24,marginTop:8}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:gc,textTransform:"uppercase",marginBottom:10,padding:"3px 10px",background:`${gc}12`,borderRadius:4,display:"inline-block"}}>{curRound.name}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {curRound.matches.map(m=>{
              const done=m.sets1!==null&&m.sets1!==""&&m.sets2!==null&&m.sets2!=="";
              const pts = done ? (
                parseInt(m.sets1)===2&&parseInt(m.sets2)===0 ? "3×0 pts" :
                parseInt(m.sets1)===2&&parseInt(m.sets2)===1 ? "2×1 pts" :
                parseInt(m.sets2)===2&&parseInt(m.sets1)===0 ? "0×3 pts" : "1×2 pts"
              ) : null;
              return (
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"rgba(255,255,255,.04)",border:`1px solid ${done?"rgba(255,223,0,.2)":"rgba(255,255,255,.08)"}`,borderRadius:8}}>
                  <span style={{flex:1,textAlign:"right",fontWeight:done&&m.winner===m.p1?800:400,color:done&&m.winner===m.p1?gc:"#e2e8f0",fontSize:13}}>{m.p1}</span>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
                    {done ? (
                      <>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:MGOLD,minWidth:20,textAlign:"center"}}>{m.sets1}</span>
                          <span style={{color:"rgba(255,255,255,.3)",fontSize:14}}>×</span>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:MGOLD,minWidth:20,textAlign:"center"}}>{m.sets2}</span>
                        </div>
                        <span style={{fontSize:9,color:"rgba(255,255,255,.25)",letterSpacing:1}}>{pts}</span>
                      </>
                    ) : (
                      <span style={{color:"rgba(255,255,255,.2)",fontSize:12,padding:"2px 10px",border:"1px solid rgba(255,255,255,.1)",borderRadius:4}}>× × ×</span>
                    )}
                  </div>
                  <span style={{flex:1,fontWeight:done&&m.winner===m.p2?800:400,color:done&&m.winner===m.p2?gc:"#e2e8f0",fontSize:13}}>{m.p2}</span>
                  {canEdit&&(
                    <button onClick={()=>{setEditSets({matchId:m.id,rid:curRound.id});setS1(m.sets1??"");setS2(m.sets2??"");}}
                      style={{background:`${gc}22`,border:`1px solid ${gc}44`,borderRadius:5,padding:"4px 10px",color:gc,fontSize:11,cursor:"pointer",fontWeight:700,flexShrink:0}}>
                      {done?"✏️":"+ Sets"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela de classificação */}
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:MGOLD,textTransform:"uppercase",marginBottom:10,padding:"3px 10px",background:"rgba(255,223,0,.08)",borderRadius:4,display:"inline-block"}}>🏆 Classificação</div>
        <div style={{background:"rgba(255,255,255,.02)",borderRadius:10,overflowX:"auto",border:"1px solid rgba(255,255,255,.07)",WebkitOverflowScrolling:"touch"}}>
          <div style={{display:"grid",gridTemplateColumns:"32px 1fr 32px 32px 32px 40px 40px 40px",minWidth:460,padding:"8px 12px",background:"rgba(255,255,255,.05)",fontSize:9,letterSpacing:2,color:"rgba(255,255,255,.35)",textTransform:"uppercase",gap:4}}>
            <span>#</span><span>Time</span>
            <span style={{textAlign:"center"}}>J</span>
            <span style={{textAlign:"center"}}>V</span>
            <span style={{textAlign:"center"}}>D</span>
            <span style={{textAlign:"center"}}>SP</span>
            <span style={{textAlign:"center"}}>SC</span>
            <span style={{textAlign:"center",fontWeight:800,color:MGOLD}}>PTS</span>
          </div>
          {class_.map((t,i)=>(
            <div key={t.time} style={{display:"grid",gridTemplateColumns:"32px 1fr 32px 32px 32px 40px 40px 40px",minWidth:460,padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,.04)",background:i===0?"rgba(255,223,0,.05)":i<3?"rgba(255,255,255,.02)":"transparent",gap:4,alignItems:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:i===0?MGOLD:i===1?"#94a3b8":i===2?"#cd7f32":"rgba(255,255,255,.3)",textAlign:"center"}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
              </span>
              <span style={{fontWeight:i===0?800:400,fontSize:13,color:i===0?MGOLD:"#e2e8f0"}}>{t.time}</span>
              {[t.j,t.v,t.d,t.sp,t.sc].map((v,vi)=>(
                <span key={vi} style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,.5)"}}>{v}</span>
              ))}
              <span style={{textAlign:"center",fontWeight:800,fontSize:15,color:i===0?MGOLD:"rgba(255,255,255,.7)"}}>{t.pts}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:8,fontSize:10,color:"rgba(255,255,255,.2)",letterSpacing:1}}>V=Vitória · D=Derrota · SP=Sets Pró · SC=Sets Contra · PTS=Pontos · 2×0=3pts · 2×1=2pts/1pt</div>
      </div>

      {/* Modal lançar sets */}
      {editSets&&(()=>{
        const m=rounds.find(r=>r.id===editSets.rid)?.matches.find(m=>m.id===editSets.matchId);
        return m?(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div style={{background:"#0d1a05",border:`2px solid ${gc}44`,borderRadius:14,padding:28,width:"100%",maxWidth:380}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:MGOLD,marginBottom:6}}>🏐 LANÇAR RESULTADO</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.3)",letterSpacing:1,marginBottom:20}}>MELHOR DE 3 SETS · QUEM FEZ 2 PRIMEIRO GANHA</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <span style={{flex:1,textAlign:"right",fontWeight:700,fontSize:14}}>{m.p1}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input value={s1} onChange={e=>setS1(e.target.value.replace(/\D/g,"").slice(0,1))} placeholder="0"
                    style={{width:52,background:"rgba(255,255,255,.08)",border:`2px solid ${gc}55`,borderRadius:8,padding:"10px 0",color:MGOLD,fontSize:22,fontFamily:"'Bebas Neue',cursive",textAlign:"center",outline:"none"}}/>
                  <span style={{color:"rgba(255,255,255,.3)",fontSize:18,fontWeight:700}}>×</span>
                  <input value={s2} onChange={e=>setS2(e.target.value.replace(/\D/g,"").slice(0,1))} placeholder="0"
                    style={{width:52,background:"rgba(255,255,255,.08)",border:`2px solid ${gc}55`,borderRadius:8,padding:"10px 0",color:MGOLD,fontSize:22,fontFamily:"'Bebas Neue',cursive",textAlign:"center",outline:"none"}}/>
                </div>
                <span style={{flex:1,fontWeight:700,fontSize:14}}>{m.p2}</span>
              </div>
              {/* Hint de resultados válidos */}
              <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
                {[["2","0"],["2","1"],["1","2"],["0","2"]].map(([a,b])=>(
                  <button key={a+b} onClick={()=>{setS1(a);setS2(b);}}
                    style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${s1===a&&s2===b?gc:"rgba(255,255,255,.15)"}`,background:s1===a&&s2===b?`${gc}22`:"transparent",color:s1===a&&s2===b?gc:"rgba(255,255,255,.4)",fontSize:12,cursor:"pointer",fontFamily:"'Bebas Neue',cursive",letterSpacing:1}}>
                    {a}×{b}
                  </button>
                ))}
              </div>
              {!resultadoValido()&&(s1!==""||s2!=="")&&(
                <div style={{fontSize:10,color:"#f87171",marginBottom:12,textAlign:"center"}}>⚠ Resultado inválido. Use 2×0, 2×1, 1×2 ou 0×2</div>
              )}
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>{setEditSets(null);setS1("");setS2("");}} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.4)",borderRadius:6,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
                <button onClick={saveSets} disabled={!resultadoValido()}
                  style={{background:resultadoValido()?`linear-gradient(135deg,${gc},${gc}bb)`:"rgba(255,255,255,.1)",color:resultadoValido()?"#fff":"rgba(255,255,255,.3)",border:"none",borderRadius:6,padding:"8px 20px",fontWeight:700,fontSize:12,cursor:resultadoValido()?"pointer":"not-allowed"}}>✓ Salvar</button>
              </div>
            </div>
          </div>
        ):null;
      })()}
    </div>
  );
}

// ─── WRAPPER — escolhe RoundRobin ou RoundRobinSets ──────────────────────────
function RoundRobinAuto(props) {
  if(props.gData && props.gData.subtipo==="sets") {
    return React.createElement(RoundRobinSets, props);
  }
  return React.createElement(RoundRobin, props);
}

// Expõe globalmente
window.calcClassificacao     = calcClassificacao;
window.calcClassificacaoSets = calcClassificacaoSets;
window.RoundRobin            = RoundRobinAuto;
