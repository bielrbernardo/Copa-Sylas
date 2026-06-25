// dados.js
const MGOLD  = "#FFDF00";
const MGREEN = "#009C3B";
const M_COLOR = "#1565C0";
const F_COLOR = "#e91e8c";
const M_BG = "linear-gradient(160deg,#0a1628,#0d2137,#0a0f00)";
const F_BG = "linear-gradient(160deg,#1a0015,#2d0022,#0a0f00)";

const USERS = [
  { user:"admin",  pass:"gabriel", role:"admin",  name:"Administrador" },
  { user:"editor", pass:"sylas",   role:"editor", name:"Editor" },
];

const FLAGS = [
  {code:"BR",br:true},{code:"AR"},{code:"FR"},{code:"DE"},{code:"PT"},
  {code:"IT"},{code:"ES"},{code:"UY"},{code:"JP"},{code:"KR"},
  {code:"NL"},{code:"BE"},{code:"CR"},{code:"MX"},{code:"GH"},
  {code:"SN"},{code:"AU"},{code:"CH"},{code:"PL"},{code:"US"},
  {code:"HR"},{code:"BR",br:true},{code:"BR",br:true},
];

const MODS_META = [
  { id:"tenis",    name:"Tênis de Mesa", emoji:"🏓", accent:"#e91e8c", tipo:"nivel" },
  { id:"dama",     name:"Dama",          emoji:"♟️", accent:"#7c3aed", tipo:"nivel" },
  { id:"queimada", name:"Queimada",      emoji:"🔥", accent:"#ea580c", tipo:"misto" },
  { id:"volei",    name:"Vôlei",         emoji:"🏐", accent:"#0ea5e9", tipo:"misto" },
  { id:"futsal",   name:"Futsal",        emoji:"⚽", accent:"#009C3B", tipo:"misto" },
];

const uid = () => Math.random().toString(36).slice(2,9);
const mkMatch = (p1=null,p2=null) => ({ id:uid(), p1, p2, winner:null });
const mkRound = (name="Nova Fase", players=[]) => {
  const matches = [];
  for (let i=0; i<players.length; i+=2) matches.push(mkMatch(players[i]||null,players[i+1]||null));
  if (!matches.length) matches.push(mkMatch());
  return { id:uid(), name, matches };
};

const mkNivel = () => ({ rounds:[mkRound("Semifinal"),mkRound("Final")] });
const mkMisto = () => ({ rounds:[mkRound("Semifinal",["Time A","Time B","Time C","Time D"]),mkRound("Final")] });

const INITIAL = { mods: MODS_META.map(m => {
  if(m.tipo==="nivel") return { ...m, genders:{
    fund_masc:mkNivel(), fund_fem:mkNivel(),
    em_masc:mkNivel(),   em_fem:mkNivel(),
  }};
  return { ...m, genders:{ misto:mkMisto() }};
})};

// ═══════════════════════════════════════════════════════════════════════════════
// 🏓 TÊNIS DE MESA — ENSINO FUNDAMENTAL MASCULINO
// Estrutura exata: 20 jogadores, 5 fases
// Fase Inicial (20) → Oitavas (10 jogos) → Quartas (5 jogos) → Semi (2) → Final (1)
// ═══════════════════════════════════════════════════════════════════════════════
INITIAL.mods[0].genders.fund_masc.rounds = [
  {
    id:"tm_r0", name:"Fase Inicial",
    matches:[
      {id:"t01",p1:"CHRISTOPHER", p2:null, winner:null},
      {id:"t02",p1:"JOSÉ",        p2:null, winner:null},
      {id:"t03",p1:"PAULO",       p2:null, winner:null},
      {id:"t04",p1:"JOÃO PEDRO",  p2:null, winner:null},
      {id:"t05",p1:"VITOR",       p2:null, winner:null},
      {id:"t06",p1:"RUAN",        p2:null, winner:null},
      {id:"t07",p1:"JULLIO",      p2:null, winner:null},
      {id:"t08",p1:"EDUARDO",     p2:null, winner:null},
      {id:"t09",p1:"PEDRO V",     p2:null, winner:null},
      {id:"t10",p1:"LEO A",       p2:null, winner:null},
      {id:"t11",p1:"LUIZ H",      p2:null, winner:null},
      {id:"t12",p1:"GUSTAVO",     p2:null, winner:null},
      {id:"t13",p1:"ENDREW",      p2:null, winner:null},
      {id:"t14",p1:"PIETRO",      p2:null, winner:null},
      {id:"t15",p1:"MARCELO",     p2:null, winner:null},
      {id:"t16",p1:"DAVI",        p2:null, winner:null},
      {id:"t17",p1:"LEONARDO D",  p2:null, winner:null},
      {id:"t18",p1:"ARTHUR",      p2:null, winner:null},
      {id:"t19",p1:"HECTOR",      p2:null, winner:null},
      {id:"t20",p1:"MARCOS",      p2:null, winner:null},
    ]
  },
  {
    id:"tm_r1", name:"Oitavas de Final",
    matches:[
      {id:"t21",p1:"CHRISTOPHER", p2:"JOSÉ",       winner:null},
      {id:"t22",p1:"PAULO",       p2:"JOÃO PEDRO", winner:null},
      {id:"t23",p1:"VITOR",       p2:"RUAN",       winner:null},
      {id:"t24",p1:"JULLIO",      p2:"EDUARDO",    winner:null},
      {id:"t25",p1:"PEDRO V",     p2:"LEO A",      winner:null},
      {id:"t26",p1:"LUIZ H",      p2:"GUSTAVO",    winner:null},
      {id:"t27",p1:"ENDREW",      p2:"PIETRO",     winner:null},
      {id:"t28",p1:"MARCELO",     p2:"DAVI",       winner:null},
      {id:"t29",p1:"LEONARDO D",  p2:"ARTHUR",     winner:null},
      {id:"t30",p1:"HECTOR",      p2:"MARCOS",     winner:null},
    ]
  },
  {
    id:"tm_r2", name:"Quartas de Final",
    matches:[
      {id:"t31",p1:null,p2:null,winner:null},
      {id:"t32",p1:null,p2:null,winner:null},
      {id:"t33",p1:null,p2:null,winner:null},
      {id:"t34",p1:null,p2:null,winner:null},
      {id:"t35",p1:null,p2:null,winner:null},
    ]
  },
  {
    id:"tm_r3", name:"Semifinal",
    matches:[
      {id:"t36",p1:null,p2:null,winner:null},
      {id:"t37",p1:null,p2:null,winner:null},
    ]
  },
  {
    id:"tm_r4", name:"Final",
    matches:[
      {id:"t38",p1:null,p2:null,winner:null},
    ]
  },
];

// Fundamental Feminino Estável
INITIAL.mods[0].genders.fund_fem.rounds = [
  {id:"tf1",name:"Quartas de Final",matches:[
    {id:"f1",p1:"Ana Bella",   p2:"Vitória",      winner:null},
    {id:"f2",p1:"Thifany",     p2:"BYE",          winner:"Thifany"},
    {id:"f3",p1:"Milena",      p2:"Maria Cecília", winner:null},
    {id:"f4",p1:"Maria Vitória",p2:"BYE",         winner:"Maria Vitória"},
  ]},
  {id:"tf2",name:"Semifinal",matches:[{id:"f5",p1:null,p2:null,winner:null},{id:"f6",p1:null,p2:null,winner:null}]},
  {id:"tf3",name:"Final",    matches:[{id:"f7",p1:null,p2:null,winner:null}]},
];

// Futsal — Rodadas Round Robin
const FUTSAL_TEAMS = ["6ºA","6ºB","7ºA","8ºA","9ºA","1ºA","2ºA","3ºA"];
const FUTSAL_ROUNDS = [
  {name:"1ª Rodada", matches:[["6ºA","6ºB"],["7ºA","8ºA"],["9ºA","1ºA"],["3ºA","2ºA"]]},
  {name:"2ª Rodada", matches:[["6ºA","8ºA"],["6ºB","1ºA"],["7ºA","2ºA"],["9ºA","3ºA"]]},
  {name:"3ª Rodada", matches:[["6ºA","1ºA"],["8ºA","2ºA"],["6ºB","3ºA"],["7ºA","9ºA"]]},
  {name:"4ª Rodada", matches:[["6ºA","2ºA"],["1ºA","3ºA"],["8ºA","9ºA"],["6ºB","7ºA"]]},
  {name:"5ª Rodada", matches:[["6ºA","3ºA"],["2ºA","9ºA"],["1ºA","7ºA"],["8ºA","6ºB"]]},
  {name:"6ª Rodada", matches:[["6ºA","9ºA"],["3ºA","7ºA"],["2ºA","6ºB"],["1ºA","8ºA"]]},
  {name:"7ª Rodada", matches:[["6ºA","7ºA"],["9ºA","6ºB"],["3ºA","8ºA"],["2ºA","1ºA"]]},
];

INITIAL.mods[4].genders.misto = {
  tipo:"roundrobin",
  teams: FUTSAL_TEAMS,
  rounds: FUTSAL_ROUNDS.map(r=>({
    id:uid(), name:r.name,
    matches:r.matches.map(([p1,p2])=>({id:uid(),p1,p2,winner:null,gols1:null,gols2:null}))
  })),
  classificacao: FUTSAL_TEAMS.map(t=>({time:t,j:0,v:0,e:0,d:0,gp:0,gc:0,pts:0})),
};

// Vôlei — Rodadas Round Robin (11 times, 11 rodadas, formato sets)
const VOLEI_TEAMS = ["1ºA","2ºA","3ºA","6ºA","7ºA","8ºA","9ºA","1ºB","3ºB","8ºB","9ºB"];
const VOLEI_ROUNDS = [
  {name:"1ª Rodada",  folga:"6ºA", matches:[["7ºA","8ºA"],["8ºB","9ºA"],["9ºB","1ºA"],["1ºB","3ºA"],["3ºB","2ºA"]]},
  {name:"2ª Rodada",  folga:"8ºA", matches:[["6ºA","9ºA"],["7ºA","1ºA"],["8ºB","3ºA"],["9ºB","2ºA"],["1ºB","3ºB"]]},
  {name:"3ª Rodada",  folga:"9ºA", matches:[["8ºA","1ºA"],["6ºA","3ºA"],["7ºA","2ºA"],["8ºB","3ºB"],["9ºB","1ºB"]]},
  {name:"4ª Rodada",  folga:"1ºA", matches:[["9ºA","3ºA"],["8ºA","2ºA"],["6ºA","3ºB"],["7ºA","1ºB"],["8ºB","9ºB"]]},
  {name:"5ª Rodada",  folga:"3ºA", matches:[["1ºA","2ºA"],["9ºA","3ºB"],["8ºA","1ºB"],["6ºA","9ºB"],["7ºA","8ºB"]]},
  {name:"6ª Rodada",  folga:"2ºA", matches:[["3ºA","3ºB"],["1ºA","1ºB"],["9ºA","9ºB"],["8ºA","8ºB"],["6ºA","7ºA"]]},
  {name:"7ª Rodada",  folga:"3ºB", matches:[["2ºA","1ºB"],["3ºA","9ºB"],["1ºA","8ºB"],["9ºA","7ºA"],["1ºA","6ºA"]]},
  {name:"8ª Rodada",  folga:"1ºB", matches:[["3ºB","9ºB"],["2ºA","8ºB"],["3ºA","7ºA"],["1ºA","6ºA"],["9ºA","8ºA"]]},
  {name:"9ª Rodada",  folga:"9ºB", matches:[["1ºB","8ºB"],["3ºB","7ºA"],["2ºA","6ºA"],["3ºA","8ºA"],["1ºA","9ºA"]]},
  {name:"10ª Rodada", folga:"8ºB", matches:[["9ºB","7ºA"],["1ºB","6ºA"],["3ºB","2ºA"],["2ºA","9ºA"],["3ºA","1ºA"]]},
  {name:"11ª Rodada", folga:"7ºA", matches:[["8ºB","6ºA"],["9ºB","8ºA"],["1ºB","9ºA"],["3ºB","1ºA"],["2ºA","3ºA"]]},
];

INITIAL.mods[3].genders.misto = {
  tipo:"roundrobin",
  subtipo:"sets",
  teams: VOLEI_TEAMS,
  rounds: VOLEI_ROUNDS.map(r=>({
    id:uid(), name:r.name, folga:r.folga,
    matches:r.matches.map(([p1,p2])=>({id:uid(),p1,p2,winner:null,sets1:null,sets2:null}))
  })),
};

window.USERS    = USERS;
window.FLAGS    = FLAGS;
window.MODS_META= MODS_META;
window.INITIAL  = INITIAL;
window.uid      = uid;
window.mkMatch  = mkMatch;
window.mkRound  = mkRound;
window.mkNivel  = mkNivel;
window.mkMisto  = mkMisto;
// Cores globais
window.MGOLD    = MGOLD;
window.MGREEN   = MGREEN;
window.M_COLOR  = M_COLOR;
window.F_COLOR  = F_COLOR;
window.M_BG     = M_BG;
window.F_BG     = F_BG;
