import { useState, useEffect, useRef, useCallback } from "react";

const SK = "qamer-brain-v3";

// ─── THEMES ────────────────────────────────────────────────────
const THEMES = {
  obsidian: { name:"Obsidian", icon:"⚫", bg:"#08080f", surf:"#0d0d1a", card:"#111120", border:"#1e1e32", accent:"#c9a84c", asoft:"rgba(201,168,76,0.08)", text:"#ede5d0", muted:"#5a5470", dim:"#22223a", success:"#22c55e", danger:"#ef4444", warn:"#f59e0b", glow:"rgba(201,168,76,0.15)" },
  aurora:   { name:"Aurora",   icon:"🌌", bg:"#04040f", surf:"#0a0a20", card:"#0e0e28", border:"#221644", accent:"#b06ef3", asoft:"rgba(176,110,243,0.08)", text:"#e6e0ff", muted:"#6a5a90", dim:"#1a1030", success:"#34d399", danger:"#f472b6", warn:"#a78bfa", glow:"rgba(176,110,243,0.2)" },
  cyber:    { name:"Cyber",    icon:"💚", bg:"#010a0a", surf:"#021212", card:"#031818", border:"#063a2a", accent:"#00e5a0", asoft:"rgba(0,229,160,0.07)", text:"#b8ffec", muted:"#336655", dim:"#0a2a20", success:"#00e5a0", danger:"#ff2266", warn:"#ffee00", glow:"rgba(0,229,160,0.2)" },
  sakura:   { name:"Sakura",   icon:"🌸", bg:"#fef5f8", surf:"#fff0f5", card:"#ffffff", border:"#fbc8dc", accent:"#d63384", asoft:"rgba(214,51,132,0.06)", text:"#2a0a18", muted:"#a06080", dim:"#f8dce8", success:"#0f7a50", danger:"#cc2244", warn:"#b06010", glow:"rgba(214,51,132,0.12)" },
  desert:   { name:"Desert",   icon:"🏜️", bg:"#0e0804", surf:"#160e08", card:"#1c1208", border:"#3c2412", accent:"#e8773a", asoft:"rgba(232,119,58,0.08)", text:"#f2dfc8", muted:"#7a5a40", dim:"#2a1808", success:"#8dbf2a", danger:"#e63a3a", warn:"#f5a820", glow:"rgba(232,119,58,0.18)" },
  ocean:    { name:"Ocean",    icon:"🌊", bg:"#010c18", surf:"#041622", card:"#061e2e", border:"#0a2e44", accent:"#22d3ee", asoft:"rgba(34,211,238,0.07)", text:"#b8e8f8", muted:"#3a6880", dim:"#081e2e", success:"#34d399", danger:"#f87171", warn:"#fbbf24", glow:"rgba(34,211,238,0.15)" },
};

const BG_OPTS = [
  { id:"particles", label:"Particles" },
  { id:"geometric", label:"Geometric" },
  { id:"grid",      label:"Grid" },
  { id:"stars",     label:"Stars" },
  { id:"waves",     label:"Waves" },
  { id:"none",      label:"Off" },
];

const TABS = [
  { id:"focus",    icon:"🎯", label:"Focus" },
  { id:"projects", icon:"🚀", label:"Projects" },
  { id:"brain",    icon:"⚡", label:"Brain" },
  { id:"revenue",  icon:"💰", label:"Revenue" },
  { id:"coach",    icon:"🤖", label:"Coach" },
];

const DEFAULT = {
  theme:"obsidian", bg:"geometric",
  focusProject:"RishtaAI", focusGoal:"", energy:3,
  projects:[
    { id:"p1", name:"RishtaAI",            emoji:"💍", status:"building", rev:85, action:"MVP form + OpenRouter live karo",       market:"South Asian Muslim families",   blocker:"Payoneer payment integration" },
    { id:"p2", name:"ClearDocs",           emoji:"📄", status:"building", rev:60, action:"KSA landing page launch",               market:"Pakistan + KSA (SECP/ZATCA)",   blocker:"No paying users yet" },
    { id:"p3", name:"AI Automation Studio",emoji:"⚡", status:"idea",     rev:30, action:"Land 1 client project first",           market:"KSA SMEs",                      blocker:"No positioning yet" },
  ],
  tasks:[], ideas:[], revenue:[], coachHistory:[],
};

// ─── 3D CANVAS BACKGROUND ────────────────────────────────────────
function Background({ style, accent }) {
  const ref = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || style === "none") return;
    const ctx = c.getContext("2d");
    let W, H, frame = 0;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const hex2rgb = h => ({ r:parseInt(h.slice(1,3),16), g:parseInt(h.slice(3,5),16), b:parseInt(h.slice(5,7),16) });
    const { r, g, b } = hex2rgb(accent);
    const rgb = `${r},${g},${b}`;

    // particles
    let pts = [], shapes3d = [];

    if (style === "particles") {
      pts = Array.from({length:70}, () => ({ x:Math.random()*1920, y:Math.random()*1080, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, r:Math.random()*2+.5 }));
    }
    if (style === "stars") {
      pts = Array.from({length:180}, () => ({ x:Math.random()*1920, y:Math.random()*1080, r:Math.random()*1.5+.2, t:Math.random()*Math.PI*2, s:Math.random()*.025+.005 }));
    }
    if (style === "geometric") {
      const types = ["cube","octa","tetra"];
      shapes3d = Array.from({length:5}, (_,i) => ({ x:160+i*380+(Math.random()-.5)*120, y:300+(Math.random()-.5)*200, rx:Math.random()*6.28, ry:Math.random()*6.28, drx:(Math.random()-.5)*.006, dry:(Math.random()-.5)*.006, size:50+Math.random()*70, type:types[i%3] }));
    }

    const rotX = ([x,y,z],a) => [x, y*Math.cos(a)-z*Math.sin(a), y*Math.sin(a)+z*Math.cos(a)];
    const rotY = ([x,y,z],a) => [x*Math.cos(a)+z*Math.sin(a), y, -x*Math.sin(a)+z*Math.cos(a)];
    const proj = ([x,y,z],cx,cy) => { const f=320/(320+z); return [cx+x*f, cy+y*f, (z+200)/400]; };

    const CUBE_V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const CUBE_E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const OCTA_V = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    const OCTA_E = [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
    const TETRA_V = [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]];
    const TETRA_E = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (style === "particles") {
        pts.forEach(p => { p.x += p.vx; p.y += p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; });
        for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
          if(d<130){ ctx.strokeStyle=`rgba(${rgb},${(1-d/130)*.12})`; ctx.lineWidth=.6; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); }
        }
        pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28); ctx.fillStyle=`rgba(${rgb},.5)`; ctx.fill(); });
      }

      if (style === "geometric") {
        shapes3d.forEach(sh => {
          sh.rx += sh.drx; sh.ry += sh.dry;
          let verts, edges;
          if(sh.type==="cube"){verts=CUBE_V;edges=CUBE_E;}
          else if(sh.type==="octa"){verts=OCTA_V;edges=OCTA_E;}
          else{verts=TETRA_V;edges=TETRA_E;}
          const scaled = verts.map(v=>[v[0]*sh.size,v[1]*sh.size,v[2]*sh.size]);
          const rotated = scaled.map(v=>rotY(rotX(v,sh.rx),sh.ry));
          const projected = rotated.map(v=>proj(v,sh.x,sh.y));
          edges.forEach(([a,bb])=>{
            const depth=(projected[a][2]+projected[bb][2])/2;
            ctx.strokeStyle=`rgba(${rgb},${depth*.18})`;
            ctx.lineWidth=.8;
            ctx.beginPath(); ctx.moveTo(projected[a][0],projected[a][1]); ctx.lineTo(projected[bb][0],projected[bb][1]); ctx.stroke();
          });
          const cx=projected.reduce((s,v)=>s+v[0],0)/projected.length;
          const cy=projected.reduce((s,v)=>s+v[1],0)/projected.length;
          ctx.beginPath(); ctx.arc(cx,cy,2,0,6.28); ctx.fillStyle=`rgba(${rgb},.15)`; ctx.fill();
        });
      }

      if (style === "grid") {
        const vx=W/2, vy=H*.45, t=(frame*.004)%1;
        ctx.lineWidth=.5;
        for(let i=0;i<=24;i++){
          const y=vy+(H*.55*i/24);
          const sp=(y-vy)/(H*.55)*W*.9;
          ctx.strokeStyle=`rgba(${rgb},${.04+((i===Math.floor(t*24))?.2:0)})`;
          ctx.beginPath(); ctx.moveTo(vx-sp,y); ctx.lineTo(vx+sp,y); ctx.stroke();
        }
        for(let i=-20;i<=20;i++){
          const xB=vx+(W*.9/20)*i;
          ctx.strokeStyle=`rgba(${rgb},.04)`;
          ctx.beginPath(); ctx.moveTo(vx,vy); ctx.lineTo(xB,H); ctx.stroke();
        }
        const mY=vy+H*.55*t;
        const mSp=(mY-vy)/(H*.55)*W*.9;
        ctx.strokeStyle=`rgba(${rgb},.35)`;
        ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(vx-mSp,mY); ctx.lineTo(vx+mSp,mY); ctx.stroke();
      }

      if (style === "stars") {
        pts.forEach(p => {
          p.t += p.s;
          const op=.15+Math.sin(p.t)*.15;
          const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
          grd.addColorStop(0,`rgba(${rgb},${op*2})`);
          grd.addColorStop(1,`rgba(${rgb},0)`);
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,6.28); ctx.fillStyle=grd; ctx.fill();
        });
      }

      if (style === "waves") {
        const t=frame*.018;
        [0,1,2].forEach(w=>{
          ctx.beginPath();
          ctx.strokeStyle=`rgba(${rgb},${.06+w*.04})`;
          ctx.lineWidth=1.2;
          for(let x=0;x<=W;x+=4){
            const y=H/2+Math.sin(x*.004+t+w*2.1)*70+Math.sin(x*.009+t*1.4+w)*35+Math.sin(x*.002+t*.7)*50;
            x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
          }
          ctx.stroke();
        });
      }
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [style, accent]);

  if (style === "none") return null;
  return <canvas ref={ref} style={{ position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:0,pointerEvents:"none" }} />;
}

// ─── 3D TILT CARD ───────────────────────────────────────────────
function Card3D({ children, T, style={}, className="" }) {
  const ref = useRef(null);
  const onMove = e => {
    const c = ref.current; if(!c) return;
    const rect = c.getBoundingClientRect();
    const cx = (e.clientX||e.touches?.[0]?.clientX||0)-rect.left;
    const cy = (e.clientY||e.touches?.[0]?.clientY||0)-rect.top;
    const rx = -((cy/rect.height)-.5)*12;
    const ry = ((cx/rect.width)-.5)*12;
    c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    c.style.boxShadow = `0 20px 60px ${T.glow}, 0 0 0 1px ${T.border}`;
  };
  const onLeave = () => {
    const c = ref.current; if(!c) return;
    c.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
    c.style.boxShadow = `0 2px 20px rgba(0,0,0,.3), 0 0 0 1px ${T.border}`;
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onTouchMove={onMove} onTouchEnd={onLeave}
      style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:20,
        transition:"transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow:`0 2px 20px rgba(0,0,0,.3), 0 0 0 1px ${T.border}`,
        transformStyle:"preserve-3d", willChange:"transform", ...style }}
      className={className}
    >
      {children}
    </div>
  );
}

// ─── ANIMATED COUNTER ───────────────────────────────────────────
function Counter({ value, prefix="", suffix="" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = parseFloat(value)||0; if(start===end) return;
    const step = end/30; let cur = 0;
    const t = setInterval(() => { cur+=step; if(cur>=end){cur=end;clearInterval(t);} setDisplay(Math.floor(cur)); }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <span>{prefix}{display}{suffix}</span>;
}

// ─── MAIN APP ───────────────────────────────────────────────────
export default function App() {
  const [S, setS] = useState(DEFAULT);
  const [tab, setTab] = useState("focus");
  const [loaded, setLoaded] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newPro, setNewPro] = useState({ name:"", emoji:"🚀", status:"idea", rev:10, action:"", market:"", blocker:"" });
  const [ideaInput, setIdeaInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [revInput, setRevInput] = useState({ note:"", amount:"" });
  const [coachQ, setCoachQ] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const coachBottom = useRef(null);
  const T = THEMES[S.theme];

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(SK); if(r?.value) setS(JSON.parse(r.value)); } catch{}
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    window.storage.set(SK, JSON.stringify(S)).catch(()=>{});
  }, [S, loaded]);
  useEffect(() => { coachBottom.current?.scrollIntoView({ behavior:"smooth" }); }, [S.coachHistory]);

  const up = patch => setS(s => ({...s,...patch}));
  const totalRev = S.revenue.reduce((a,r)=>a+(r.amount||0),0);
  const doneTasks = S.tasks.filter(t=>t.done).length;

  const addProject = () => {
    if (!newPro.name.trim()) return;
    const p = { ...newPro, id:`p${Date.now()}` };
    up({ projects:[...S.projects, p] });
    setNewPro({ name:"", emoji:"🚀", status:"idea", rev:10, action:"", market:"", blocker:"" });
    setAddModal(false);
  };
  const deleteProject = id => up({ projects: S.projects.filter(p=>p.id!==id) });
  const updateProject = (id, patch) => up({ projects: S.projects.map(p=>p.id===id?{...p,...patch}:p) });

  const askCoach = async () => {
    if (!coachQ.trim()||coachLoading) return;
    const q = coachQ.trim(); setCoachQ(""); setCoachLoading(true);
    const hist = [...S.coachHistory, { role:"user", text:q }];
    up({ coachHistory: hist });
    const sys = `You are Qamer's sharp personal AI coach. You know him deeply:
- Solo builder, Bahawalpur Pakistan, smartphone-first
- Projects: RishtaAI (💍 biodata generator, ${S.projects.find(p=>p.name==="RishtaAI")?.rev||85}% revenue-ready), ClearDocs (📄 doc analyzer, ${S.projects.find(p=>p.name==="ClearDocs")?.rev||60}% ready), AI Automation Studio (⚡ ${S.projects.find(p=>p.name==="AI Automation Studio")?.rev||30}% ready)
- Biggest gap: execution & distribution. Great at building, weak at selling.
- Collaborators: Uzair (CPO/creative), Arham (CEO/strategic)
- Stack: React + OpenRouter + Vercel. Payments: Payoneer+SadaBiz
- Today energy: ${S.energy}/5, Focus goal: "${S.focusGoal||'not set'}", Revenue logged: $${totalRev}
Be brutally direct. Mix Roman Urdu naturally. Under 130 words. Focus on revenue path.`;
    try {
      const msgs = S.coachHistory.map(m=>({ role:m.role==="user"?"user":"assistant", content:m.text }));
      msgs.push({ role:"user", content:q });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sys, messages:msgs })
      });
      const d = await res.json();
      const reply = d.content?.map(c=>c.text||"").join("")||"Network error.";
      up({ coachHistory:[...hist,{role:"assistant",text:reply}] });
    } catch { up({ coachHistory:[...hist,{role:"assistant",text:"Error. Try again."}] }); }
    setCoachLoading(false);
  };

  const GS = { // global styles
    fontBody: "'Georgia', 'Times New Roman', serif",
    fontMono: "'Courier New', monospace",
  };

  const btnBase = { border:"none", cursor:"pointer", fontFamily:GS.fontBody, transition:"all .15s" };
  const inp = { width:"100%", background:T.surf, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontFamily:"'Courier New', monospace", fontSize:13, padding:"10px 14px", outline:"none", boxSizing:"border-box" };

  const readColor = v => v>=70?T.success:v>=40?T.warn:T.danger;
  const statusMap = { building:[T.warn,"Building"], live:[T.success,"Live"], idea:[T.muted,"Idea"], paused:[T.danger,"Paused"] };

  if (!loaded) return (
    <div style={{ background:THEMES.obsidian.bg, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:THEMES.obsidian.accent, fontFamily:"serif", fontSize:16, letterSpacing:2 }}>
        <span style={{ animation:"pulse 1s infinite" }}>●</span> Loading Brain...
      </div>
    </div>
  );

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:GS.fontBody, color:T.text, position:"relative", transition:"background .4s, color .4s" }}>
      <Background style={S.bg} accent={T.accent} />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @keyframes barFill { from{width:0} }
        .tab-content { animation: fadeUp .3s ease forwards; }
        .card-enter { animation: scaleIn .25s ease forwards; }
        .project-card { animation: fadeUp .3s ease forwards; }
        .btn-press:active { transform: scale(.95) !important; }
        .stat-card:hover { transform: translateY(-3px); }
        input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 2px ${T.glow}; }
        select:focus { border-color: ${T.accent} !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${T.dim}; border-radius:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        * { box-sizing:border-box; }
        .floating { animation: floatY 4s ease-in-out infinite; }
      `}</style>

      {/* ─── HEADER ─────────────────────────────────────── */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:`${T.bg}ee`, backdropFilter:"blur(20px)", borderBottom:`1px solid ${T.border}`, padding:"12px 20px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, animation:"floatY 3s ease-in-out infinite", boxShadow:`0 0 20px ${T.glow}` }}>🧠</div>
            <div>
              <div style={{ fontSize:14, fontWeight:"bold", color:T.text, letterSpacing:.5 }}>Second Brain</div>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace" }}>Qamer's Command Center</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {/* Theme picker */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>{setShowThemes(!showThemes);setShowBg(false);}} className="btn-press"
                style={{ ...btnBase, background:T.surf, border:`1px solid ${T.border}`, color:T.text, borderRadius:10, padding:"7px 12px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
                {T.icon} {T.name} <span style={{ color:T.muted, fontSize:10 }}>▾</span>
              </button>
              {showThemes && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:10, zIndex:200, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, minWidth:220, boxShadow:`0 20px 60px rgba(0,0,0,.5)`, animation:"scaleIn .15s ease" }}>
                  {Object.entries(THEMES).map(([k,th])=>(
                    <button key={k} onClick={()=>{up({theme:k});setShowThemes(false);}} className="btn-press"
                      style={{ ...btnBase, background:k===S.theme?T.asoft:"transparent", border:`1px solid ${k===S.theme?T.accent:T.border}`, borderRadius:10, padding:"8px 12px", color:k===S.theme?T.accent:T.muted, fontSize:12, display:"flex", alignItems:"center", gap:6, textAlign:"left" }}>
                      {th.icon} {th.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BG picker */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>{setShowBg(!showBg);setShowThemes(false);}} className="btn-press"
                style={{ ...btnBase, background:T.surf, border:`1px solid ${T.border}`, color:T.text, borderRadius:10, padding:"7px 12px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
                ✦ BG <span style={{ color:T.muted, fontSize:10 }}>▾</span>
              </button>
              {showBg && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:10, zIndex:200, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, minWidth:180, boxShadow:`0 20px 60px rgba(0,0,0,.5)`, animation:"scaleIn .15s ease" }}>
                  {BG_OPTS.map(b=>(
                    <button key={b.id} onClick={()=>{up({bg:b.id});setShowBg(false);}} className="btn-press"
                      style={{ ...btnBase, background:b.id===S.bg?T.asoft:"transparent", border:`1px solid ${b.id===S.bg?T.accent:T.border}`, borderRadius:10, padding:"7px 10px", color:b.id===S.bg?T.accent:T.muted, fontSize:11, textAlign:"center" }}>
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 16px 80px" }}>

        {/* ─── STATS ROW ────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, padding:"20px 0 16px" }}>
          {[
            { label:"Projects", value:S.projects.length, color:T.accent, icon:"🚀" },
            { label:"Tasks Done", value:`${doneTasks}/${S.tasks.length}`, color:T.success, icon:"✓" },
            { label:"Revenue", value:`$${totalRev}`, color:T.success, icon:"💰" },
            { label:"Ideas", value:S.ideas.length, color:T.warn, icon:"💡" },
          ].map((st,i) => (
            <div key={i} className="stat-card" style={{ background:T.surf, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px", cursor:"default", transition:"transform .2s, box-shadow .2s", animationDelay:`${i*.05}s` }}>
              <div style={{ fontSize:18, marginBottom:6 }}>{st.icon}</div>
              <div style={{ fontSize:20, fontWeight:"bold", color:st.color }}>{st.value}</div>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"monospace", marginTop:2 }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* ─── TABS ─────────────────────────────────────── */}
        <div style={{ display:"flex", gap:4, background:T.surf, border:`1px solid ${T.border}`, borderRadius:16, padding:6, marginBottom:24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="btn-press"
              style={{ ...btnBase, flex:1, padding:"10px 6px", borderRadius:12, background:tab===t.id?T.card:"transparent",
                border:`1px solid ${tab===t.id?T.accent:"transparent"}`,
                color:tab===t.id?T.accent:T.muted, fontSize:12,
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                boxShadow:tab===t.id?`0 0 16px ${T.glow}`:"none", transition:"all .2s" }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <span style={{ fontSize:10, letterSpacing:1, textTransform:"uppercase", fontFamily:"monospace" }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ─── CONTENT ──────────────────────────────────── */}
        <div key={tab} className="tab-content">

          {/* ══ FOCUS ══════════════════════════════════════ */}
          {tab === "focus" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card3D T={T} style={{ gridColumn:"1/-1" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace" }}>Active Focus</div>
                    <div style={{ fontSize:22, marginTop:4 }}>
                      {S.projects.find(p=>p.name===S.focusProject)?.emoji||"🎯"} {S.focusProject}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:T.muted, fontFamily:"monospace", marginBottom:6 }}>ENERGY</div>
                    <div style={{ display:"flex", gap:5 }}>
                      {[1,2,3,4,5].map(n=>(
                        <div key={n} onClick={()=>up({energy:n})} style={{ width:28, height:8, borderRadius:4, cursor:"pointer", background:n<=S.energy?(n<=2?T.danger:n<=3?T.warn:T.success):T.dim, transition:"all .2s", transform:n<=S.energy?"scaleY(1.3)":"scaleY(1)" }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                  {S.projects.map(p=>(
                    <button key={p.id} onClick={()=>up({focusProject:p.name})} className="btn-press"
                      style={{ ...btnBase, padding:"6px 14px", borderRadius:20, border:`1px solid ${S.focusProject===p.name?T.accent:T.border}`, background:S.focusProject===p.name?T.asoft:"transparent", color:S.focusProject===p.name?T.accent:T.muted, fontSize:12 }}>
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
                {(() => { const fp = S.projects.find(p=>p.name===S.focusProject); return fp && (
                  <div style={{ background:T.surf, borderRadius:12, padding:14, marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:12, color:T.accent, fontFamily:"monospace" }}>Revenue Readiness</span>
                      <span style={{ fontSize:14, fontWeight:"bold", color:readColor(fp.rev) }}>{fp.rev}%</span>
                    </div>
                    <div style={{ height:6, background:T.dim, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${fp.rev}%`, background:`linear-gradient(90deg,${readColor(fp.rev)}88,${readColor(fp.rev)})`, borderRadius:3, animation:"barFill .6s ease" }} />
                    </div>
                    <div style={{ marginTop:10, fontSize:12, color:T.muted, fontFamily:"monospace" }}>
                      <span style={{ color:T.accent }}>▸ </span>{fp.action}
                    </div>
                    <div style={{ marginTop:6, fontSize:12, color:T.danger, fontFamily:"monospace" }}>
                      <span>⚠ </span>{fp.blocker}
                    </div>
                  </div>
                ); })()}
                <div style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"monospace", marginBottom:8 }}>Today's One Goal</div>
                <input value={S.focusGoal} onChange={e=>up({focusGoal:e.target.value})} placeholder="Aaj sirf yeh karna hai..." style={inp} />
              </Card3D>

              {/* Tasks column */}
              <Card3D T={T}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace" }}>Tasks</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:"monospace" }}>{doneTasks}/{S.tasks.length}</div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  <input value={taskInput} onChange={e=>setTaskInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&taskInput.trim()){up({tasks:[...S.tasks,{id:Date.now(),text:taskInput,done:false}]});setTaskInput("");}}} placeholder="Add task..." style={{ ...inp, margin:0, flex:1 }} />
                  <button onClick={()=>{if(taskInput.trim()){up({tasks:[...S.tasks,{id:Date.now(),text:taskInput,done:false}]});setTaskInput("");}}} className="btn-press"
                    style={{ ...btnBase, background:T.accent, color:T.bg, borderRadius:10, width:38, fontWeight:"bold", fontSize:18 }}>+</button>
                </div>
                <div style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                  {S.tasks.length===0 && <div style={{ color:T.dim, fontSize:12, fontFamily:"monospace", textAlign:"center", padding:20 }}>No tasks. Add one above.</div>}
                  {S.tasks.map(t=>(
                    <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:T.surf, borderRadius:10, border:`1px solid ${T.border}`, transition:"all .2s" }}>
                      <div onClick={()=>up({tasks:S.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)})}
                        style={{ width:20, height:20, borderRadius:6, border:`1px solid ${t.done?T.accent:T.dim}`, background:t.done?T.asoft:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
                        {t.done && <span style={{ color:T.accent, fontSize:12 }}>✓</span>}
                      </div>
                      <span style={{ flex:1, fontSize:13, color:t.done?T.muted:T.text, textDecoration:t.done?"line-through":"none", transition:"all .2s" }}>{t.text}</span>
                      <button onClick={()=>up({tasks:S.tasks.filter(x=>x.id!==t.id)})} style={{ ...btnBase, background:"none", color:T.dim, fontSize:16, padding:0, width:20 }}>×</button>
                    </div>
                  ))}
                </div>
              </Card3D>

              {/* Energy + focus tip */}
              <Card3D T={T}>
                <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:16 }}>Focus Score</div>
                <div style={{ textAlign:"center", padding:"10px 0" }}>
                  <div style={{ fontSize:56, fontWeight:"bold", color:S.energy>=4?T.success:S.energy>=3?T.warn:T.danger, lineHeight:1 }}>{S.energy}</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:"monospace", marginTop:4 }}>/5 Energy Today</div>
                </div>
                <div style={{ background:T.surf, borderRadius:12, padding:12, marginTop:12, fontSize:12, color:T.muted, fontFamily:"monospace", lineHeight:1.8 }}>
                  {S.energy>=4 && <span style={{ color:T.success }}>💚 Peak mode. Ship something today.</span>}
                  {S.energy===3 && <span style={{ color:T.warn }}>🟡 Decent energy. Focus on one task.</span>}
                  {S.energy<=2 && <span style={{ color:T.danger }}>🔴 Low energy. Admin/planning only.</span>}
                </div>
              </Card3D>
            </div>
          )}

          {/* ══ PROJECTS ═══════════════════════════════════ */}
          {tab === "projects" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div style={{ fontSize:10, color:T.muted, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace" }}>{S.projects.length} Active Projects</div>
                <button onClick={()=>setAddModal(true)} className="btn-press"
                  style={{ ...btnBase, background:T.accent, color:T.bg, borderRadius:12, padding:"10px 18px", fontWeight:"bold", fontSize:13, display:"flex", alignItems:"center", gap:6, boxShadow:`0 0 20px ${T.glow}` }}>
                  + New Project
                </button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
                {S.projects.map((p,i) => (
                  <div key={p.id} className="project-card" style={{ animationDelay:`${i*.08}s` }}>
                    <Card3D T={T}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                        <div>
                          <div style={{ fontSize:24, marginBottom:4 }}>{p.emoji}</div>
                          <div style={{ fontSize:18, color:T.text }}>{p.name}</div>
                          <div style={{ display:"inline-block", marginTop:6, fontSize:10, fontFamily:"monospace", color:statusMap[p.status]?.[0]||T.muted, border:`1px solid ${statusMap[p.status]?.[0]||T.muted}44`, borderRadius:20, padding:"2px 10px" }}>
                            {statusMap[p.status]?.[1]||p.status}
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:22, fontWeight:"bold", color:readColor(p.rev) }}>{p.rev}%</div>
                          <div style={{ fontSize:9, color:T.muted, fontFamily:"monospace", marginTop:2 }}>REV READY</div>
                          <div style={{ width:60, height:4, background:T.dim, borderRadius:2, overflow:"hidden", marginTop:6 }}>
                            <div style={{ height:"100%", width:`${p.rev}%`, background:readColor(p.rev), borderRadius:2 }} />
                          </div>
                        </div>
                      </div>

                      {editId === p.id ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          <input defaultValue={p.name} onChange={e=>updateProject(p.id,{name:e.target.value})} placeholder="Project name" style={inp} />
                          <input defaultValue={p.action} onChange={e=>updateProject(p.id,{action:e.target.value})} placeholder="Next action" style={inp} />
                          <input defaultValue={p.blocker} onChange={e=>updateProject(p.id,{blocker:e.target.value})} placeholder="Blocker" style={inp} />
                          <input defaultValue={p.market} onChange={e=>updateProject(p.id,{market:e.target.value})} placeholder="Market" style={inp} />
                          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                            <span style={{ fontSize:11, color:T.muted, fontFamily:"monospace", whiteSpace:"nowrap" }}>Rev %:</span>
                            <input type="range" min={0} max={100} value={p.rev} onChange={e=>updateProject(p.id,{rev:+e.target.value})} style={{ flex:1, accentColor:T.accent }} />
                            <span style={{ color:T.accent, fontSize:13, fontFamily:"monospace", minWidth:32 }}>{p.rev}%</span>
                          </div>
                          <select value={p.status} onChange={e=>updateProject(p.id,{status:e.target.value})} style={{ ...inp, cursor:"pointer" }}>
                            {["idea","building","live","paused"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={()=>setEditId(null)} className="btn-press"
                            style={{ ...btnBase, background:T.accent, color:T.bg, borderRadius:10, padding:"10px", fontWeight:"bold" }}>
                            Save ✓
                          </button>
                        </div>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          <div style={{ background:T.surf, borderRadius:10, padding:10 }}>
                            <div style={{ fontSize:9, color:T.muted, fontFamily:"monospace", letterSpacing:1, marginBottom:4 }}>NEXT ACTION</div>
                            <div style={{ fontSize:12, color:T.accent }}>{p.action||"—"}</div>
                          </div>
                          <div style={{ background:T.surf, borderRadius:10, padding:10 }}>
                            <div style={{ fontSize:9, color:T.muted, fontFamily:"monospace", letterSpacing:1, marginBottom:4 }}>BLOCKER</div>
                            <div style={{ fontSize:12, color:T.danger }}>{p.blocker||"—"}</div>
                          </div>
                          <div style={{ background:T.surf, borderRadius:10, padding:10 }}>
                            <div style={{ fontSize:9, color:T.muted, fontFamily:"monospace", letterSpacing:1, marginBottom:4 }}>MARKET</div>
                            <div style={{ fontSize:12, color:T.text }}>{p.market||"—"}</div>
                          </div>
                          <div style={{ display:"flex", gap:8 }}>
                            <button onClick={()=>setEditId(p.id)} className="btn-press"
                              style={{ ...btnBase, flex:1, background:T.surf, border:`1px solid ${T.border}`, color:T.muted, borderRadius:10, padding:9, fontSize:12 }}>
                              ✏️ Edit
                            </button>
                            <button onClick={()=>deleteProject(p.id)} className="btn-press"
                              style={{ ...btnBase, background:`${T.danger}14`, border:`1px solid ${T.danger}44`, color:T.danger, borderRadius:10, padding:9, fontSize:12, width:42 }}>
                              🗑
                            </button>
                          </div>
                        </div>
                      )}
                    </Card3D>
                  </div>
                ))}
              </div>

              {/* Add Project Modal */}
              {addModal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(10px)" }} onClick={e=>{if(e.target===e.currentTarget)setAddModal(false);}}>
                  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:28, width:"100%", maxWidth:440, animation:"scaleIn .2s ease", boxShadow:`0 40px 100px rgba(0,0,0,.5)` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                      <div style={{ fontSize:18, color:T.text }}>New Project</div>
                      <button onClick={()=>setAddModal(false)} style={{ ...btnBase, background:"none", color:T.muted, fontSize:20 }}>×</button>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <div style={{ display:"flex", gap:10 }}>
                        <input value={newPro.emoji} onChange={e=>setNewPro(p=>({...p,emoji:e.target.value}))} style={{ ...inp, width:60, textAlign:"center", fontSize:20 }} />
                        <input value={newPro.name} onChange={e=>setNewPro(p=>({...p,name:e.target.value}))} placeholder="Project name *" style={{ ...inp, flex:1 }} />
                      </div>
                      <input value={newPro.action} onChange={e=>setNewPro(p=>({...p,action:e.target.value}))} placeholder="Next action" style={inp} />
                      <input value={newPro.market} onChange={e=>setNewPro(p=>({...p,market:e.target.value}))} placeholder="Target market" style={inp} />
                      <input value={newPro.blocker} onChange={e=>setNewPro(p=>({...p,blocker:e.target.value}))} placeholder="Main blocker" style={inp} />
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ fontSize:11, color:T.muted, fontFamily:"monospace", whiteSpace:"nowrap" }}>Rev Ready:</span>
                        <input type="range" min={0} max={100} value={newPro.rev} onChange={e=>setNewPro(p=>({...p,rev:+e.target.value}))} style={{ flex:1, accentColor:T.accent }} />
                        <span style={{ color:T.accent, fontFamily:"monospace", minWidth:32 }}>{newPro.rev}%</span>
                      </div>
                      <button onClick={addProject} className="btn-press"
                        style={{ ...btnBase, background:T.accent, color:T.bg, borderRadius:12, padding:12, fontWeight:"bold", fontSize:14, marginTop:4, boxShadow:`0 0 20px ${T.glow}` }}>
                        Add Project →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ BRAIN DUMP ══════════════════════════════════ */}
          {tab === "brain" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card3D T={T} style={{ gridColumn:"1/-1" }}>
                <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>Brain Dump — Capture Everything</div>
                <div style={{ fontSize:12, color:T.muted, fontFamily:"monospace", marginBottom:14, lineHeight:1.8 }}>
                  Jo bhi dimag mein aaye — idea, problem, observation, quote — foran dump karo. Filter baad mein. Inbox zero mentality.
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={ideaInput} onChange={e=>setIdeaInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&ideaInput.trim()){up({ideas:[{id:Date.now(),text:ideaInput,date:new Date().toLocaleDateString("en-PK")},...S.ideas]});setIdeaInput("");}}}
                    placeholder="Idea, insight, problem, anything..." style={{ ...inp, margin:0, flex:1 }} />
                  <button onClick={()=>{if(ideaInput.trim()){up({ideas:[{id:Date.now(),text:ideaInput,date:new Date().toLocaleDateString("en-PK")},...S.ideas]});setIdeaInput("");}}} className="btn-press"
                    style={{ ...btnBase, background:T.accent, color:T.bg, borderRadius:10, width:44, fontSize:20, fontWeight:"bold" }}>+</button>
                </div>
              </Card3D>

              <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:10 }}>
                {S.ideas.length===0 && (
                  <div style={{ textAlign:"center", padding:40, color:T.dim, fontFamily:"monospace", fontSize:13 }}>
                    Brain is empty. Start dumping ideas above ↑
                  </div>
                )}
                {S.ideas.map((idea,i) => (
                  <div key={idea.id} className="card-enter" style={{ animationDelay:`${i*.04}s` }}>
                    <Card3D T={T} style={{ padding:"14px 18px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, color:T.text, lineHeight:1.6 }}>{idea.text}</div>
                          <div style={{ fontSize:10, color:T.dim, fontFamily:"monospace", marginTop:6 }}>{idea.date}</div>
                        </div>
                        <button onClick={()=>up({ideas:S.ideas.filter(x=>x.id!==idea.id)})}
                          style={{ ...btnBase, background:"none", color:T.dim, fontSize:18, flexShrink:0 }}>×</button>
                      </div>
                    </Card3D>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ REVENUE ═════════════════════════════════════ */}
          {tab === "revenue" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card3D T={T} style={{ gridColumn:"1/-1", textAlign:"center", padding:32 }}>
                <div style={{ fontSize:10, color:T.muted, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>Total Revenue Logged</div>
                <div style={{ fontSize:56, fontWeight:"bold", color:T.success, lineHeight:1, textShadow:`0 0 40px ${T.success}44` }}>
                  $<Counter value={totalRev} />
                </div>
                <div style={{ fontSize:12, color:T.muted, fontFamily:"monospace", marginTop:8 }}>{S.revenue.length} entries · {S.revenue.filter(r=>r.amount>0).length} payments</div>
                <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:20 }}>
                  {S.projects.map(p => {
                    const proj_rev = S.revenue.filter(r=>r.project===p.id).reduce((a,r)=>a+(r.amount||0),0);
                    return (
                      <div key={p.id} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:18 }}>{p.emoji}</div>
                        <div style={{ fontSize:14, color:T.success, fontWeight:"bold" }}>${proj_rev}</div>
                        <div style={{ fontSize:9, color:T.muted, fontFamily:"monospace" }}>{p.name.split(" ")[0]}</div>
                      </div>
                    );
                  })}
                </div>
              </Card3D>

              <Card3D T={T}>
                <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:14 }}>Log Entry</div>
                <input value={revInput.note} onChange={e=>setRevInput(r=>({...r,note:e.target.value}))} placeholder="Client / project / note" style={inp} />
                <input value={revInput.amount} onChange={e=>setRevInput(r=>({...r,amount:e.target.value}))} placeholder="Amount in $ (0 for lead)" type="number" style={inp} />
                <select value={revInput.project||""} onChange={e=>setRevInput(r=>({...r,project:e.target.value}))} style={{ ...inp }}>
                  <option value="">Select project</option>
                  {S.projects.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                </select>
                <button onClick={()=>{if(revInput.note.trim()){up({revenue:[{id:Date.now(),...revInput,amount:parseFloat(revInput.amount)||0,date:new Date().toLocaleDateString("en-PK")},...S.revenue]});setRevInput({note:"",amount:""});}}} className="btn-press"
                  style={{ ...btnBase, width:"100%", background:T.accent, color:T.bg, borderRadius:12, padding:12, fontWeight:"bold", fontSize:14, boxShadow:`0 0 20px ${T.glow}` }}>
                  Log Entry →
                </button>
              </Card3D>

              <Card3D T={T}>
                <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:14 }}>History</div>
                <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
                  {S.revenue.length===0 && <div style={{ color:T.dim, fontSize:12, fontFamily:"monospace", textAlign:"center", padding:20 }}>No entries yet. First client lao.</div>}
                  {S.revenue.map(r=>(
                    <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:T.surf, borderRadius:10, border:`1px solid ${T.border}` }}>
                      <div>
                        <div style={{ fontSize:13, color:T.text }}>{r.note}</div>
                        <div style={{ fontSize:10, color:T.dim, fontFamily:"monospace", marginTop:2 }}>{r.date}</div>
                      </div>
                      <div style={{ fontSize:16, fontWeight:"bold", color:r.amount>0?T.success:T.muted }}>
                        {r.amount>0?`$${r.amount}`:"Lead"}
                      </div>
                    </div>
                  ))}
                </div>
              </Card3D>
            </div>
          )}

          {/* ══ AI COACH ════════════════════════════════════ */}
          {tab === "coach" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>
              <Card3D T={T} style={{ display:"flex", flexDirection:"column" }}>
                <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:14 }}>AI Coach — Context-Aware</div>
                <div style={{ flex:1, minHeight:360, maxHeight:440, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:14 }}>
                  {S.coachHistory.length===0 && (
                    <div style={{ textAlign:"center", padding:"40px 20px", color:T.muted, fontFamily:"monospace", fontSize:13, lineHeight:2.2 }}>
                      Main jaanta hoon: <span style={{ color:T.accent }}>RishtaAI, ClearDocs,</span><br/>
                      tera execution gap, distribution struggle,<br/>
                      Bahawalpur base, smartphone-first life.<br/>
                      <span style={{ color:T.text }}>Seedha pooch. Main seedha bolunga.</span>
                    </div>
                  )}
                  {S.coachHistory.map((m,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                      <div style={{ maxWidth:"80%", padding:"12px 16px", borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                        background:m.role==="user"?T.asoft:T.surf, border:`1px solid ${m.role==="user"?T.accent:T.border}`,
                        fontSize:13, fontFamily:"monospace", lineHeight:1.7, color:m.role==="user"?T.accent:T.text,
                        animation:"fadeUp .2s ease" }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {coachLoading && (
                    <div style={{ display:"flex", gap:8, alignItems:"center", color:T.accent, fontFamily:"monospace", fontSize:12, padding:"8px 0" }}>
                      <div style={{ display:"flex", gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:T.accent, animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}</div>
                      Soch raha hoon...
                    </div>
                  )}
                  <div ref={coachBottom} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={coachQ} onChange={e=>setCoachQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askCoach()} placeholder="Kuch bhi pooch..." style={{ ...inp, margin:0, flex:1 }} disabled={coachLoading} />
                  <button onClick={askCoach} disabled={coachLoading} className="btn-press"
                    style={{ ...btnBase, background:coachLoading?T.dim:T.accent, color:T.bg, borderRadius:12, padding:"0 18px", fontWeight:"bold", fontSize:16, opacity:coachLoading?.6:1 }}>
                    →
                  </button>
                </div>
              </Card3D>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Card3D T={T}>
                  <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>Quick Questions</div>
                  {["Kaunsa project pehle launch karo?","Pehla paying client kaise loon?","Aaj kya karna chahiye?","Distribution strategy kya ho?","RishtaAI ka pricing kya ho?","30 din mein revenue kaise?"].map(q=>(
                    <button key={q} onClick={()=>setCoachQ(q)} className="btn-press"
                      style={{ ...btnBase, display:"block", width:"100%", textAlign:"left", background:T.surf, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 12px", color:T.muted, fontSize:11, fontFamily:"monospace", marginBottom:6, lineHeight:1.4 }}>
                      {q}
                    </button>
                  ))}
                </Card3D>

                <Card3D T={T}>
                  <div style={{ fontSize:10, color:T.accent, letterSpacing:3, textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>Context</div>
                  {[
                    [`Focus`, S.focusProject],
                    [`Energy`, `${S.energy}/5`],
                    [`Revenue`, `$${totalRev}`],
                    [`Open Tasks`, S.tasks.filter(t=>!t.done).length],
                    [`Ideas`, S.ideas.length],
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.dim}`, fontSize:12, fontFamily:"monospace" }}>
                      <span style={{ color:T.muted }}>{k}</span>
                      <span style={{ color:T.text }}>{v}</span>
                    </div>
                  ))}
                </Card3D>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
