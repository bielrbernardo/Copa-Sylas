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

// ─── CHAVE EXATA COM OS 20 NOMES DO WHATSAPP (SEM BYES DISCREPANTES) ───
// Os 8 primeiros jogam a preliminar (Play-in). Os outros 12 entram direto na fase seguinte.
INITIAL.mods[0].genders.fund_masc.rounds = [
  {
    id: "tm_playin",
    name: "Play-in (Preliminar)",
    matches: [
      { id: "tp1", p1: "CHRISTOPHER", p2: "JOSÉ", winner: null },
      { id: "tp2", p1: "PAULO", p2: "JOÃO PEDRO", winner: null },
      { id: "tp3", p1: "VITOR", p2: "RUAN", winner: null },
      { id: "tp4", p1: "JULLIO", p2: "EDUARDO", winner: null }
    ]
  },
  {
    id: "tm_oitavas",
    name: "Fase Principal (Oitavas)",
    matches: [
      { id: "to1", p1: null, p2: "PEDRO V", winner: null }, // Vencedor tp1 pega Pedro V
      { id: "to2", p1: "LEO A", p2: "LUIZ H", winner: null },
      { id: "to3", p1: null, p2: "GUSTAVO", winner: null }, // Vencedor tp2 pega Gustavo
      { id: "to4", p1: "ENDREW", p2: "PIETRO", winner: null },
      { id: "to5", p1: null, p2: "MARCELO", winner: null }, // Vencedor tp3 pega Marcelo
      { id: "to6", p1: "DAVI", p2: "LEONARDO D", winner: null },
      { id: "to7", p1: null, p2: "ARTHUR", winner: null }, // Vencedor tp4 pega Arthur
      { id: "to8", p1: "HECTOR", p2: "MARCOS", winner: null }
    ]
  },
  {
    id: "tm_quartas",
    name: "Quartas de Final",
    matches: [
      { id: "tq1", p1: null, p2: null, winner: null },
      { id: "tq2", p1: null, p2: null, winner: null },
      { id: "tq3", p1: null, p2: null, winner: null },
      { id: "tq4", p1: null, p2: null, winner: null }
    ]
  },
  {
    id: "tm_semi",
    name: "Semifinal",
    matches: [
      { id: "ts1", p1: null, p2: null, winner: null },
      { id: "ts2", p1: null, p2: null, winner: null }
    ]
  },
  {
    id: "tm_final",
    name: "Final",
    matches: [
      { id: "tf_m", p1: null, p2: null, winner: null }
    ]
  }
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

window.USERS = USERS;
window.FLAGS = FLAGS;
window.MODS_META = MODS_META;
window.INITIAL = INITIAL;
window.uid = uid;
window.mkMatch = mkMatch;
window.mkRound = mkRound;
window.mkNivel = mkNivel;
window.mkMisto = mkMisto;
