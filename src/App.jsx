import { useState, useMemo, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── ESTILOS GLOBALES RESPONSIVE ───────────────────────────────────────────────
const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; -webkit-tap-highlight-color: transparent; overscroll-behavior: none; }
  input, select, textarea, button { font-family: inherit; }
  input, select, textarea { font-size: 16px !important; } /* Prevent iOS zoom */
  button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  @media (max-width: 767px) {
    .grid-2col { grid-template-columns: 1fr !important; }
    .grid-3col { grid-template-columns: 1fr auto !important; }
    .hide-mobile { display: none !important; }
    .show-mobile { display: flex !important; }
    .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    table { min-width: 480px; }
    .modal-inner { border-radius: 0 !important; max-width: 100% !important; width: 100% !important; min-height: 100vh !important; padding: 20px 16px 32px !important; }
    .modal-wrap { align-items: flex-start !important; padding: 0 !important; }
  }
`;
if (!document.getElementById("proobras-css")) {
  const style = document.createElement("style");
  style.id = "proobras-css";
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}
// Asegurar viewport correcto para móvil
if (!document.querySelector('meta[name="viewport"]')) {
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
  document.head.appendChild(meta);
}

const supabase = createClient(
  "https://ryffncnsslnonynnrdda.supabase.co",
  "sb_publishable_Et9XPPUM0HndFcffM2eXxA_zhGR11u4"
);

const C = {
  bg:"#F4F5F7", surface:"#FFFFFF", navy:"#0F1E2E", navyMid:"#1A3148",
  navyBord:"#243D55", amber:"#F59E0B", teal:"#0D9488", red:"#DC2626",
  green:"#16A34A", blue:"#2563EB", muted:"#6B7280", border:"#E5E7EB",
  text:"#111827", textSm:"#374151",
};

const PROVEEDORES_INIT = [];
const CATALOGO_INIT = [];
const OBRAS_INIT = [];

const OBRAS_STATIC = [
  { id:"AA25000270", nombre:"La Garriga, C/del Centre 49 (DIBA)" },
  { id:"AA25000463", nombre:"Terrassa, Rambla Francesc Macia (25047)" },
  { id:"AA25000489", nombre:"Sabadell, Via Aurelia 62 (25022)" },
  { id:"AA25000631", nombre:"La Granada, C/Pedraforca (25009)" },
  { id:"AA26000032", nombre:"Sant Adria B., Varias Direcciones (25064)" },
  { id:"AA26000059", nombre:"St. Pere Riudebittles, Rotonda C-15 (25065)" },
  { id:"AA26000095", nombre:"Badalona, C/Guell i Ferrer 34 (25063)" },
  { id:"AA26000096", nombre:"Berga, C/Climent Peix (25023)" },
  { id:"AA26000108", nombre:"Badalona, Turo den Caritg (Parking GU)" },
  { id:"AA26000129", nombre:"Sabadell, Ronda Collsalarca (Asfalto)" },
];

const PEDIDOS_INIT = [
  { id:"CC25041713", prov_id:"P1", obra_id:"AA25000270", fecha:"2025-05-20", estado:"en_obra", items:[{mid:"M01",ci:"INT-0031"},{mid:"M02",ci:"INT-0032"}] },
  { id:"CC25044908", prov_id:"P1", obra_id:"AA25000489", fecha:"2025-10-30", estado:"en_obra", items:[{mid:"M03",ci:"INT-0041"}] },
  { id:"CC26046214", prov_id:"P1", obra_id:"AA25000489", fecha:"2026-01-08", estado:"en_obra", items:[{mid:"M06",ci:"INT-0051"},{mid:"M08",ci:"INT-0052"},{mid:"M16",ci:"INT-0053"},{mid:"M07",ci:"INT-0054"}] },
  { id:"CC26047361", prov_id:"P1", obra_id:"AA25000463", fecha:"2026-02-23", estado:"en_obra", items:[{mid:"M04",ci:"INT-0061"}] },
  { id:"CC26046303", prov_id:"P1", obra_id:"AA26000032", fecha:"2026-01-13", estado:"en_obra", items:[{mid:"M17",ci:"INT-0071"}] },
  { id:"CC26047053", prov_id:"P1", obra_id:"AA26000096", fecha:"2026-02-10", estado:"en_obra", items:[{mid:"M05",ci:"INT-0081"},{mid:"M06",ci:"INT-0082"},{mid:"M10",ci:"INT-0083"},{mid:"M14",ci:"INT-0084"},{mid:"M07",ci:"INT-0085"}] },
  { id:"CC26045793", prov_id:"P1", obra_id:"AA26000032", fecha:"2026-01-12", estado:"en_obra", items:[{mid:"M06",ci:"INT-0091"},{mid:"M15",ci:"INT-0092"},{mid:"M07",ci:"INT-0093"}] },
  { id:"CC25045903", prov_id:"P1", obra_id:"AA25000631", fecha:"2025-12-03", estado:"en_obra", items:[{mid:"M12",ci:"INT-0101"},{mid:"M23",ci:"INT-0102"}] },
  { id:"CC26046790", prov_id:"P1", obra_id:"AA26000129", fecha:"2026-03-03", estado:"en_obra", items:[{mid:"M13",ci:"INT-0111"},{mid:"M23",ci:"INT-0112"}] },
  { id:"CC26047150", prov_id:"P2", obra_id:"AA26000059", fecha:"2026-03-09", estado:"en_obra", items:[{mid:"M19",ci:"INT-0121"}] },
  { id:"CC26047370", prov_id:"P1", obra_id:"AA26000095", fecha:"2026-02-25", estado:"en_obra", items:[{mid:"M11",ci:"INT-0131"}] },
  { id:"CC26046774", prov_id:"P2", obra_id:"AA26000108", fecha:"2026-02-20", estado:"en_obra", items:[{mid:"M18",ci:"INT-0141"},{mid:"M21",ci:"INT-0142"}] },
  { id:"CC26047201", prov_id:"P1", obra_id:"AA26000108", fecha:"2026-03-10", estado:"en_obra", items:[{mid:"M20",ci:"INT-0151"}] },
  { id:"CC26046911", prov_id:"P1", obra_id:"AA26000095", fecha:"2026-02-11", estado:"en_obra", items:[{mid:"M22",ci:"INT-0161"}] },
  { id:"CC26999018", prov_id:"P1", obra_id:"AA26000032", fecha:"2026-01-08", estado:"en_obra", items:[{mid:"M09",ci:"INT-0171"}] },
];

const OFERTAS_INIT = [
  { id:"OF-001", prov_id:"P1", obra_id:"AA26000032", fecha:"2026-01-10", estado:"aceptada", items:[{mid:"M17",qty:1,precio:90}], obs:"Entrega inmediata" },
  { id:"OF-002", prov_id:"P2", obra_id:"AA26000108", fecha:"2026-02-18", estado:"aceptada", items:[{mid:"M18",qty:1,precio:145},{mid:"M21",qty:1,precio:60}], obs:"" },
  { id:"OF-003", prov_id:"P1", obra_id:"AA26000059", fecha:"2026-03-05", estado:"pendiente", items:[{mid:"M19",qty:1,precio:null}], obs:"Esperando precio" },
];

const ESTADO_P = {
  borrador:   { l:"Borrador",   c:"#6B7280", bg:"#F3F4F6" },
  solicitado: { l:"Solicitado", c:"#D97706", bg:"#FEF3C7" },
  en_obra:    { l:"En Obra",    c:"#2563EB", bg:"#DBEAFE" },
  devuelto:   { l:"Devuelto",   c:"#16A34A", bg:"#DCFCE7" },
};
const ESTADO_O = {
  pendiente:  { l:"Pendiente",  c:"#D97706", bg:"#FEF3C7" },
  aceptada:   { l:"Aceptada",   c:"#16A34A", bg:"#DCFCE7" },
  rechazada:  { l:"Rechazada",  c:"#DC2626", bg:"#FEE2E2" },
};

const PERMISOS_LABELS = {
  ver_pedidos: "Ver pedidos",
  crear_pedidos: "Crear/editar pedidos",
  ver_catalogo: "Ver catalogo",
  ver_proveedores: "Ver proveedores",
  importar_excel: "Importar Excel",
  entradas_devoluciones: "Entradas y devoluciones",
};
const PERMISOS_DEFAULT = { ver_pedidos:true, crear_pedidos:false, ver_catalogo:true, ver_proveedores:true, importar_excel:false, entradas_devoluciones:false };

const fmt = n => n == null ? "-" : new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
const diasDesde = f => Math.floor((Date.now() - new Date(f)) / 86400000);

function Badge({ txt, color, bg }) {
  return <span style={{fontSize:11,fontWeight:700,color,background:bg,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{txt}</span>;
}
function Cod({ txt, bg="#EFF6FF", color="#2563EB" }) {
  return <code style={{background:bg,color,padding:"2px 7px",borderRadius:4,fontSize:12,fontWeight:700,fontFamily:"'Courier New',monospace"}}>{txt}</code>;
}

// Mobile-friendly card for list items (replaces table rows on mobile)
function MobileCard({ children, onClick, style={} }) {
  return (
    <div onClick={onClick} style={{background:"#FFF",borderRadius:10,border:"1px solid #E5E7EB",padding:"14px 16px",marginBottom:10,cursor:onClick?"pointer":"default",WebkitTapHighlightColor:"transparent",...style}}>
      {children}
    </div>
  );
}

// Big action button for mobile (touch-friendly)
function BigBtn({ label, icon, variant="primary", onClick, fullWidth=false }) {
  const base = S.btn(variant);
  return (
    <button onClick={onClick} style={{...base, padding:"14px 20px", fontSize:15, width:fullWidth?"100%":"auto", justifyContent:"center", borderRadius:10, minHeight:52}}>
      {icon && <span style={{fontSize:18}}>{icon}</span>}{label}
    </button>
  );
}

const S = {
  card:  { background:"#FFFFFF", borderRadius:10, border:"1px solid #E5E7EB", padding:20, marginBottom:16 },
  table: { width:"100%", borderCollapse:"collapse", fontSize:13 },
  th:    { padding:"9px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"2px solid #E5E7EB", whiteSpace:"nowrap" },
  td:    { padding:"11px 12px", borderBottom:"1px solid #F3F4F6", color:"#374151", verticalAlign:"middle" },
  inp:   { padding:"11px 14px", borderRadius:8, border:"1px solid #E5E7EB", fontSize:16, background:"#FAFAFA", outline:"none", fontFamily:"inherit", WebkitAppearance:"none" },
  btn: (v="primary") => ({
    display:"inline-flex", alignItems:"center", gap:6, padding:"11px 18px",
    borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:14, border:"none", fontFamily:"inherit",
    ...(v==="primary" && { background:"#F59E0B", color:"#0F1E2E" }),
    ...(v==="navy"    && { background:"#0F1E2E", color:"#FFF" }),
    ...(v==="green"   && { background:"#16A34A", color:"#FFF" }),
    ...(v==="red"     && { background:"#DC2626", color:"#FFF" }),
    ...(v==="ghost"   && { background:"transparent", color:"#6B7280", border:"1px solid #E5E7EB" }),
    ...(v==="teal"    && { background:"#0D9488", color:"#FFF" }),
  }),
};

function downloadCSV(filename, headers, rows) {
  const content = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + content], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.trim().toLowerCase().replace(/\s+/g,"_"));
  return lines.slice(1).map(line => {
    const vals = line.split(";").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] || "");
    return obj;
  });
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    const { data, error: err } = await supabase.from("usuarios").select("*")
      .eq("username", username).eq("password", password).eq("activo", true).single();
    if (err || !data) { setError("Usuario o contrasena incorrectos"); }
    else { onLogin(data); }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0F1E2E",fontFamily:"'Segoe UI',system-ui,sans-serif",padding:16}}>
      <div style={{background:"#FFFFFF",borderRadius:16,padding:"32px 28px",width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src="/logo.png" alt="ProObras" style={{width:72,height:72,borderRadius:14,objectFit:"cover",margin:"0 auto 12px",display:"block"}}/>
          <h1 style={{margin:"0 0 4px",fontSize:22,fontWeight:800,color:"#0F1E2E"}}>ProObras</h1>
          <p style={{margin:0,fontSize:13,color:"#6B7280"}}>Gestion de alquiler de maquinaria</p>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Usuario</label>
          <input style={{...S.inp,width:"100%",fontSize:16,padding:"12px 14px"}} placeholder="Introduce tu usuario" value={username} autoCapitalize="none" autoCorrect="off"
            onChange={e => { setUsername(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={{marginBottom:22}}>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Contrasena</label>
          <input type="password" style={{...S.inp,width:"100%",fontSize:16,padding:"12px 14px"}} placeholder="Introduce tu contrasena" value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {error && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"10px 14px",fontSize:13,marginBottom:16,fontWeight:600}}>{error}</div>}
        <button style={{...S.btn("navy"),width:"100%",justifyContent:"center",padding:"14px 16px",fontSize:15,opacity:loading?0.7:1,borderRadius:9}} onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

// ── GESTION USUARIOS ──────────────────────────────────────────────────────────
function PanelUsuarios({ usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ username:"", password:"", nombre:"", rol:"user", activo:true, permisos:PERMISOS_DEFAULT });
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState([]);
  const [msg, setMsg] = useState("");

  const cargar = async () => {
    setLoading(true);
    const { data: u } = await supabase.from("usuarios").select("*").order("created_at");
    const { data: o } = await supabase.from("obras").select("*").order("numero");
    setUsuarios(u || []);
    setObras(o || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = async (u) => {
    setForm(u ? {...u} : { username:"", password:"", nombre:"", rol:"user", activo:true, permisos:PERMISOS_DEFAULT });
    setMsg("");
    if (u) {
      const { data } = await supabase.from("usuario_obras").select("obra_id").eq("usuario_id", u.id);
      setObrasSeleccionadas((data||[]).map(x => x.obra_id));
    } else {
      setObrasSeleccionadas([]);
    }
    setModal(u ? u.id : "nuevo");
  };

  const toggleObra = (obraId) => {
    setObrasSeleccionadas(prev => prev.includes(obraId) ? prev.filter(x => x !== obraId) : [...prev, obraId]);
  };

  const guardar = async () => {
    setMsg("");
    if (!form.username || !form.password || !form.nombre) { setMsg("Rellena todos los campos obligatorios."); return; }
    let userId = modal;
    if (modal === "nuevo") {
      const { data, error } = await supabase.from("usuarios").insert([form]).select().single();
      if (error) { setMsg("Error: " + error.message); return; }
      userId = data.id;
    } else {
      const { error } = await supabase.from("usuarios").update(form).eq("id", modal);
      if (error) { setMsg("Error: " + error.message); return; }
    }
    await supabase.from("usuario_obras").delete().eq("usuario_id", userId);
    if (obrasSeleccionadas.length > 0) {
      await supabase.from("usuario_obras").insert(obrasSeleccionadas.map(oid => ({ usuario_id: userId, obra_id: oid })));
    }
    setModal(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (!window.confirm("Eliminar este usuario?")) return;
    await supabase.from("usuarios").delete().eq("id", id);
    cargar();
  };

  const invitar = () => {
    const lineas = [
      "Hola,", "",
      "Te invitamos a acceder a MaquilERP, nuestra plataforma de gestion de alquiler de maquinaria.", "",
      "Accede en: https://maquil-erp.vercel.app", "",
      "Tu usuario y contrasena te los facilitaremos por separado.", "",
      "Saludos,", "BARCINO GRUP"
    ];
    const asunto = encodeURIComponent("Invitacion a MaquilERP");
    const cuerpo = encodeURIComponent(lineas.join("\n"));
    window.open("mailto:?subject=" + asunto + "&body=" + cuerpo);
  };

  return (
    <div style={{marginBottom:32}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:800,color:"#0F1E2E",borderBottom:"2px solid #F59E0B",paddingBottom:4}}>Gestion de Usuarios</h3>
        <div style={{display:"flex",gap:8}}>
          <button style={S.btn("ghost")} onClick={invitar}>Invitar usuario</button>
          <button style={S.btn("primary")} onClick={() => abrirModal(null)}>+ Nuevo usuario</button>
        </div>
      </div>

      {loading ? <p style={{color:"#6B7280"}}>Cargando...</p> : (
        <div style={S.card}>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>{["Usuario","Nombre","Rol","Estado","Permisos",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={S.td}><code style={{fontWeight:700}}>{u.username}</code></td>
                    <td style={{...S.td,fontWeight:600}}>{u.nombre}</td>
                    <td style={S.td}><Badge txt={u.rol==="admin"?"Admin":"Usuario"} color={u.rol==="admin"?"#D97706":"#2563EB"} bg={u.rol==="admin"?"#FEF3C7":"#DBEAFE"}/></td>
                    <td style={S.td}><Badge txt={u.activo?"Activo":"Inactivo"} color={u.activo?"#16A34A":"#6B7280"} bg={u.activo?"#DCFCE7":"#F3F4F6"}/></td>
                    <td style={{...S.td,fontSize:11,color:"#6B7280"}}>{Object.entries(u.permisos||{}).filter(([,v])=>v).map(([k])=>PERMISOS_LABELS[k]||k).join(", ")||"Ninguno"}</td>
                    <td style={S.td}>
                      <div style={{display:"flex",gap:6}}>
                        <button style={{...S.btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={() => abrirModal(u)}>Editar</button>
                        {u.id !== usuarioActual.id && <button style={{...S.btn("red"),padding:"4px 10px",fontSize:12}} onClick={() => eliminar(u.id)}>Borrar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
          <div style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:580,maxHeight:"90vh",overflow:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>{modal==="nuevo"?"Nuevo usuario":"Editar usuario"}</h3>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={()=>setModal(null)}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[["Usuario","username","text"],["Contrasena","password","password"],["Nombre completo","nombre","text"]].map(([l,k,t])=>(
                <div key={k} style={k==="nombre"?{gridColumn:"1/-1"}:{}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>{l}</label>
                  <input type={t} style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Rol</label>
                <select style={{...S.inp,width:"100%"}} value={form.rol} onChange={e=>setForm(f=>({...f,rol:e.target.value}))}>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Estado</label>
                <select style={{...S.inp,width:"100%"}} value={form.activo?"si":"no"} onChange={e=>setForm(f=>({...f,activo:e.target.value==="si"}))}>
                  <option value="si">Activo</option>
                  <option value="no">Inactivo</option>
                </select>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:8,textTransform:"uppercase"}}>Permisos generales</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:12,background:"#F8FAFC",borderRadius:8}}>
                {Object.entries(PERMISOS_LABELS).map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
                    <input type="checkbox" checked={form.permisos?.[k]||false} onChange={e=>setForm(f=>({...f,permisos:{...f.permisos,[k]:e.target.checked}}))}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>
            {form.rol !== "admin" && (
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:8,textTransform:"uppercase"}}>Obras que puede ver ({obrasSeleccionadas.length} seleccionadas)</label>
                <div style={{maxHeight:200,overflowY:"auto",border:"1px solid #E5E7EB",borderRadius:8,padding:8}}>
                  {obras.map(o=>(
                    <label key={o.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:6,cursor:"pointer",background:obrasSeleccionadas.includes(o.id)?"#DCFCE7":"transparent",marginBottom:2}}>
                      <input type="checkbox" checked={obrasSeleccionadas.includes(o.id)} onChange={()=>toggleObra(o.id)}/>
                      <span style={{fontSize:12}}><strong>{o.numero}</strong> - {o.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {msg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{msg}</div>}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setModal(null)}>Cancelar</button>
              <button style={S.btn("green")} onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GESTION OBRAS ─────────────────────────────────────────────────────────────
function PanelObras({ usuario, esAdmin }) {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ numero:"", nombre:"", cliente:"", direccion:"", estado:"activa", responsable:"" });
  const [msg, setMsg] = useState("");
  const [asignModal, setAsignModal] = useState(null);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [obrasUsuario, setObrasUsuario] = useState([]);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");
  const importRef = useRef();

  const cargarObras = async () => {
    setLoading(true);
    if (esAdmin) {
      const { data } = await supabase.from("obras").select("*").order("numero");
      setObras(data || []);
    } else {
      const { data } = await supabase.from("usuario_obras").select("obra_id, obras(*)").eq("usuario_id", usuario.id);
      setObras((data || []).map(r => r.obras).filter(Boolean));
    }
    setLoading(false);
  };

  const cargarAsignaciones = async (obraId) => {
    const { data: users } = await supabase.from("usuarios").select("id, username, nombre");
    setTodosUsuarios(users || []);
    const { data: asig } = await supabase.from("usuario_obras").select("usuario_id").eq("obra_id", obraId);
    setObrasUsuario((asig || []).map(a => a.usuario_id));
  };

  useEffect(() => { cargarObras(); }, []);

  const guardar = async () => {
    setMsg("");
    if (!form.numero || !form.nombre) { setMsg("Numero y nombre son obligatorios."); return; }
    if (modal === "nuevo") {
      const { error } = await supabase.from("obras").insert([form]);
      if (error) { setMsg("Error: " + error.message); return; }
    } else {
      const { error } = await supabase.from("obras").update(form).eq("id", modal);
      if (error) { setMsg("Error: " + error.message); return; }
    }
    setModal(null);
    cargarObras();
  };

  const guardarAsignaciones = async (obraId) => {
    await supabase.from("usuario_obras").delete().eq("obra_id", obraId);
    if (obrasUsuario.length > 0) {
      await supabase.from("usuario_obras").insert(obrasUsuario.map(uid => ({ usuario_id: uid, obra_id: obraId })));
    }
    setAsignModal(null);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:800,color:"#0F1E2E",borderBottom:"2px solid #F59E0B",paddingBottom:4}}>Gestion de Obras</h3>
        {esAdmin && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button style={S.btn("teal")} onClick={() => { setImportError(""); setImportPreview(null); importRef.current.click(); }}>Importar CSV</button>
            <button style={{...S.btn("ghost"),fontSize:12}} onClick={() => downloadCSV("plantilla_obras.csv",
              ["numero","nombre","cliente","direccion","responsable","estado"],
              [["AA26000001","Obra Ejemplo Barcelona","BARCINO GRUP","Barcelona","Carles","activa"]]
            )}>Plantilla CSV</button>
            <input ref={importRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e => {
              const file = e.target.files[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                const rows = parseCSV(ev.target.result);
                if (!rows.length || !rows[0].numero) { setImportError("Formato incorrecto. Necesitas columnas: numero, nombre..."); return; }
                setImportPreview(rows); setImportError("");
              };
              reader.readAsText(file, "utf-8");
              e.target.value = "";
            }}/>
            <button style={S.btn("primary")} onClick={() => { setForm({ numero:"", nombre:"", cliente:"", direccion:"", estado:"activa", responsable:"" }); setModal("nuevo"); setMsg(""); }}>+ Nueva obra</button>
          </div>
        )}
      </div>

      {importError && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{importError}</div>}

      {importPreview && (
        <div style={{...S.card,borderLeft:"4px solid #0D9488",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{margin:0,fontWeight:700,color:"#0F1E2E"}}>Vista previa - {importPreview.length} obra(s)</p>
            <button style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}} onClick={()=>setImportPreview(null)}>x</button>
          </div>
          <div style={{overflowX:"auto",marginBottom:12}}>
            <table style={S.table}>
              <thead><tr>{["Numero","Nombre","Cliente","Direccion","Responsable","Estado"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {importPreview.slice(0,5).map((r,i)=>(
                  <tr key={i}>
                    <td style={S.td}>{r.numero}</td>
                    <td style={{...S.td,fontWeight:600}}>{r.nombre}</td>
                    <td style={S.td}>{r.cliente}</td>
                    <td style={S.td}>{r.direccion}</td>
                    <td style={S.td}>{r.responsable}</td>
                    <td style={S.td}>{r.estado||"activa"}</td>
                  </tr>
                ))}
                {importPreview.length > 5 && <tr><td colSpan={6} style={{...S.td,color:"#6B7280",textAlign:"center",fontStyle:"italic"}}>... y {importPreview.length-5} mas</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={S.btn("ghost")} onClick={()=>setImportPreview(null)}>Cancelar</button>
            <button style={S.btn("green")} onClick={async () => {
              const inserts = importPreview.map(r => ({ numero:r.numero, nombre:r.nombre, cliente:r.cliente||"", direccion:r.direccion||"", responsable:r.responsable||"", estado:r.estado||"activa" }));
              const { error } = await supabase.from("obras").insert(inserts);
              if (error) { setImportError("Error al importar: " + error.message); }
              else { setImportPreview(null); cargarObras(); }
            }}>Importar {importPreview.length} obras</button>
          </div>
        </div>
      )}

      {loading ? <p style={{color:"#6B7280"}}>Cargando obras...</p> : obras.length === 0 ? (
        <div style={{...S.card,textAlign:"center",padding:40,color:"#6B7280"}}>No tienes obras asignadas.</div>
      ) : (
        <div style={S.card}>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>{["Numero","Nombre","Cliente","Direccion","Responsable","Estado",...(esAdmin?["Acciones"]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {obras.map(o => (
                  <tr key={o.id}>
                    <td style={S.td}><Cod txt={o.numero} bg="#F3F4F6" color="#374151"/></td>
                    <td style={{...S.td,fontWeight:700,color:"#0F1E2E"}}>{o.nombre}</td>
                    <td style={S.td}>{o.cliente}</td>
                    <td style={S.td}>{o.direccion}</td>
                    <td style={S.td}>{o.responsable}</td>
                    <td style={S.td}><Badge txt={o.estado==="activa"?"Activa":"Cerrada"} color={o.estado==="activa"?"#16A34A":"#6B7280"} bg={o.estado==="activa"?"#DCFCE7":"#F3F4F6"}/></td>
                    {esAdmin && (
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6}}>
                          <button style={{...S.btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={() => { setForm({...o}); setModal(o.id); setMsg(""); }}>Editar</button>
                          <button style={{...S.btn("teal"),padding:"4px 10px",fontSize:12}} onClick={() => { setAsignModal(o); cargarAsignaciones(o.id); }}>Usuarios</button>
                          <button style={{...S.btn("red"),padding:"4px 10px",fontSize:12}} onClick={async () => { if (!window.confirm("Borrar esta obra?")) return; await supabase.from("obras").delete().eq("id",o.id); cargarObras(); }}>Borrar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
          <div style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>{modal==="nuevo"?"Nueva obra":"Editar obra"}</h3>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={()=>setModal(null)}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[["Numero de obra","numero"],["Responsable","responsable"]].map(([l,k])=>(
                <div key={k}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>{l}</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
              {[["Nombre/descripcion","nombre"],["Cliente","cliente"],["Direccion","direccion"]].map(([l,k])=>(
                <div key={k} style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>{l}</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Estado</label>
                <select style={{...S.inp,width:"100%"}} value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>
                  <option value="activa">Activa</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </div>
            </div>
            {msg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{msg}</div>}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setModal(null)}>Cancelar</button>
              <button style={S.btn("green")} onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {asignModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
          <div style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h3 style={{margin:"0 0 4px",fontSize:17,fontWeight:800,color:"#0F1E2E"}}>Usuarios con acceso</h3>
                <p style={{margin:0,fontSize:12,color:"#6B7280"}}>Obra: <strong>{asignModal.numero} - {asignModal.nombre}</strong></p>
              </div>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={()=>setAsignModal(null)}>x</button>
            </div>
            <div style={{marginBottom:20}}>
              {todosUsuarios.filter(u=>u.id!==usuario.id).map(u=>(
                <label key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:7,cursor:"pointer",marginBottom:6,background:obrasUsuario.includes(u.id)?"#DCFCE7":"#F8FAFC",border:"1px solid " + (obrasUsuario.includes(u.id)?"#16A34A":"#E5E7EB")}}>
                  <input type="checkbox" checked={obrasUsuario.includes(u.id)} onChange={() => setObrasUsuario(prev => prev.includes(u.id) ? prev.filter(x=>x!==u.id) : [...prev, u.id])}/>
                  <div>
                    <p style={{margin:0,fontWeight:700,fontSize:13}}>{u.nombre}</p>
                    <p style={{margin:0,fontSize:11,color:"#6B7280"}}>{u.username}</p>
                  </div>
                </label>
              ))}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setAsignModal(null)}>Cancelar</button>
              <button style={S.btn("green")} onClick={()=>guardarAsignaciones(asignModal.id)}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MODALES IMPORTAR ──────────────────────────────────────────────────────────
function ModalImportProveedores({ onClose, onImport }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target.result);
      if (!rows.length) { setError("Archivo vacio o formato incorrecto."); return; }
      const missing = ["codigo","nombre"].filter(r => !(r in rows[0]));
      if (missing.length) { setError("Faltan columnas: " + missing.join(", ")); return; }
      setPreview(rows); setError("");
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}} onClick={onClose}>
      <div style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:620,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>Importar Proveedores desde CSV</h3>
          <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={onClose}>x</button>
        </div>
        <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:14,marginBottom:16,fontSize:13,color:"#1E40AF"}}>
          Formato CSV con punto y coma (;). Columnas: codigo;nombre;contacto;tel;movil;email;comentarios;activo
        </div>
        <button style={{...S.btn("ghost"),marginBottom:16,fontSize:12}} onClick={() => downloadCSV("plantilla_proveedores.csv",
          ["codigo","nombre","contacto","tel","movil","email","comentarios","activo"],
          [["PROV01","Empresa Ejemplo S.L.","Contacto","93 000 00 00","600 000 000","email@empresa.es","comentario","si"]]
        )}>Descargar plantilla CSV</button>
        <div style={{border:"2px dashed #E5E7EB",borderRadius:8,padding:24,textAlign:"center",cursor:"pointer",marginBottom:16,background:"#FAFAFA"}} onClick={() => fileRef.current.click()}>
          <p style={{margin:0,fontSize:13,color:"#6B7280"}}>Clic para seleccionar archivo CSV</p>
          <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleFile}/>
        </div>
        {error && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{error}</div>}
        {preview && (
          <div>
            <p style={{margin:"0 0 8px",fontSize:13,fontWeight:700,color:"#0F1E2E"}}>Vista previa - {preview.length} proveedor(es):</p>
            <div style={{overflowX:"auto",marginBottom:16}}>
              <table style={S.table}>
                <thead><tr>{["Codigo","Nombre","Contacto","Tel","Email","Activo"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {preview.slice(0,5).map((r,i)=>(
                    <tr key={i}>
                      <td style={S.td}><Cod txt={r.codigo} bg="#F3F4F6" color="#374151"/></td>
                      <td style={{...S.td,fontWeight:600}}>{r.nombre}</td>
                      <td style={S.td}>{r.contacto}</td>
                      <td style={S.td}>{r.tel}</td>
                      <td style={{...S.td,color:"#2563EB"}}>{r.email}</td>
                      <td style={S.td}>{r.activo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={onClose}>Cancelar</button>
              <button style={S.btn("green")} onClick={() => onImport(preview)}>Importar {preview.length} proveedores</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalImportCatalogo({ onClose, onImport }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target.result);
      if (!rows.length) { setError("Archivo vacio o formato incorrecto."); return; }
      const missing = ["cod_prov","descripcion"].filter(r => !(r in rows[0]));
      if (missing.length) { setError("Faltan columnas: " + missing.join(", ")); return; }
      setPreview(rows); setError("");
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}} onClick={onClose}>
      <div style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:640,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>Importar Catalogo desde CSV</h3>
          <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={onClose}>x</button>
        </div>
        <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:14,marginBottom:16,fontSize:13,color:"#1E40AF"}}>
          Formato CSV con punto y coma (;). Columnas: cod_prov;descripcion;tipo;precio_dia
        </div>
        <button style={{...S.btn("ghost"),marginBottom:16,fontSize:12}} onClick={() => downloadCSV("plantilla_catalogo.csv",
          ["cod_prov","descripcion","tipo","precio_dia"],
          [["BI-110","Deposito 1000 Lts.","Almacenaje","18"],["A-966","Amoladora 2000 W","Herramienta","12"]]
        )}>Descargar plantilla CSV</button>
        <div style={{border:"2px dashed #E5E7EB",borderRadius:8,padding:24,textAlign:"center",cursor:"pointer",marginBottom:16,background:"#FAFAFA"}} onClick={() => fileRef.current.click()}>
          <p style={{margin:0,fontSize:13,color:"#6B7280"}}>Clic para seleccionar archivo CSV</p>
          <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleFile}/>
        </div>
        {error && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{error}</div>}
        {preview && (
          <div>
            <p style={{margin:"0 0 8px",fontSize:13,fontWeight:700,color:"#0F1E2E"}}>Vista previa - {preview.length} articulo(s):</p>
            <div style={{overflowX:"auto",marginBottom:16}}>
              <table style={S.table}>
                <thead><tr>{["Cod.Prov","Descripcion","Tipo","Euros/dia"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {preview.slice(0,5).map((r,i)=>(
                    <tr key={i}>
                      <td style={S.td}><Cod txt={r.cod_prov}/></td>
                      <td style={{...S.td,fontWeight:600}}>{r.descripcion}</td>
                      <td style={S.td}>{r.tipo}</td>
                      <td style={{...S.td,fontWeight:700,color:"#0D9488"}}>{fmt(parseFloat(r.precio_dia)||0)}/dia</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={onClose}>Cancelar</button>
              <button style={S.btn("green")} onClick={() => onImport(preview)}>Importar {preview.length} articulos</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("pedidos");
  const [pedidos, setPedidos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [obrasPermitidas, setObrasPermitidas] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario) return;
      let obraIds = null;
      if (!esAdmin) {
        const { data: asig } = await supabase.from("usuario_obras").select("obra_id").eq("usuario_id", usuario.id);
        obraIds = (asig||[]).map(a => a.obra_id);
        setObrasPermitidas(obraIds);
      } else {
        setObrasPermitidas(null);
      }
      const { data: peds } = await supabase.from("pedidos").select("*").order("fecha", {ascending:false});
      const { data: ofs } = await supabase.from("ofertas").select("*").order("fecha", {ascending:false});
      if (obraIds) {
        setPedidos((peds||[]).filter(p => obraIds.includes(p.obra_id)));
        setOfertas((ofs||[]).filter(o => obraIds.includes(o.obra_id)));
      } else {
        setPedidos(peds||[]);
        setOfertas(ofs||[]);
      }
    };
    cargarDatos();
  }, [usuario]);
  const [modal, setModal] = useState(null);
  const [busq, setBusq] = useState("");
  const [provFil, setProvFil] = useState("todos");
  const [sideOpen, setSideOpen] = useState(true);

  const esAdmin = usuario?.rol === "admin";
  const perm = (key) => esAdmin || (usuario?.permisos?.[key] === true);

  const stats = useMemo(() => {
    const enObra = pedidos.filter(p => p.estado === "en_obra");
    const totalItems = enObra.reduce((a,p) => a + p.items.length, 0);
    const costoDia = enObra.reduce((a,p) => a + p.items.reduce((b,it) => b + 0, 0), 0);
    const masde30 = enObra.filter(p => diasDesde(p.fecha) > 30).length;
    const ofPend = ofertas.filter(o => o.estado === "pendiente").length;
    return { totalItems, costoDia, masde30, ofPend };
  }, [pedidos, ofertas]);

  if (!usuario) return <LoginScreen onLogin={setUsuario}/>;

  const NAV = [
    { id:"proveedores", label:"Proveedores", icon:"P" },
    { id:"catalogo",    label:"Catalogo",    icon:"C" },
    { id:"ofertas",     label:"Solicitud de Oferta", icon:"O", badge: stats.ofPend },
    { id:"pedidos",     label:"Pedidos",     icon:"D" },
    { id:"entrada",     label:"Entrada en Obra", icon:"E" },
    { id:"devolucion",  label:"Devolucion",  icon:"R" },
    { id:"incidencias", label:"Incidencias", icon:"!" },
    ...(esAdmin ? [{ id:"gestion", label:"Gestion", icon:"G" }] : []),
  ];

  // ── VISTA PROVEEDORES ───────────────────────────────────────────────────────
  const ViewProveedores = () => {
    const [provDB, setProvDB] = useState([]);
    const [loadingProv, setLoadingProv] = useState(true);
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [provMsg, setProvMsg] = useState("");

    useEffect(() => {
      supabase.from("proveedores").select("*").order("nombre").then(({data}) => { setProvDB(data||[]); setLoadingProv(false); });
    }, []);

    const recargar = async () => {
      const {data} = await supabase.from("proveedores").select("*").order("nombre");
      setProvDB(data||[]);
    };

    const guardarProv = async () => {
      setProvMsg("");
      if (!editForm.codigo || !editForm.nombre) { setProvMsg("Codigo y nombre son obligatorios."); return; }
      if (editModal === "nuevo") {
        const { error } = await supabase.from("proveedores").insert([editForm]);
        if (error) { setProvMsg("Error: " + error.message); return; }
      } else {
        const { error } = await supabase.from("proveedores").update(editForm).eq("id", editModal);
        if (error) { setProvMsg("Error: " + error.message); return; }
      }
      await recargar(); setEditModal(null);
    };

    const borrarProv = async (id) => {
      if (!window.confirm("Borrar este proveedor?")) return;
      await supabase.from("proveedores").delete().eq("id", id);
      setProvDB(prev => prev.filter(p => p.id !== id));
    };

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {perm("importar_excel") && (
              <>
                <button style={S.btn("teal")} onClick={() => setModal({tipo:"import_proveedores"})}>Importar CSV</button>
                <button style={{...S.btn("ghost"),fontSize:12}} onClick={() => downloadCSV("plantilla_proveedores.csv",
                  ["codigo","nombre","contacto","tel","movil","email","comentarios","activo"],
                  [["PROV01","Empresa S.L.","Contacto","93 000 00 00","600 000 000","email@empresa.es","","si"]]
                )}>Plantilla CSV</button>
              </>
            )}
          </div>
          {esAdmin && <button style={S.btn("primary")} onClick={() => { setEditForm({codigo:"",nombre:"",contacto:"",tel:"",movil:"",email:"",comentarios:"",activo:true}); setEditModal("nuevo"); setProvMsg(""); }}>+ Nuevo proveedor</button>}
        </div>
        {loadingProv ? <p style={{color:"#6B7280"}}>Cargando...</p> : (
          isMobile ? (
            <div>
              {provDB.map(p=>(
                <MobileCard key={p.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:15,color:"#0F1E2E"}}>{p.nombre}</div>
                      <Cod txt={p.codigo} bg="#F3F4F6" color="#374151"/>
                    </div>
                    <Badge txt={p.activo?"Activo":"Inactivo"} color={p.activo?"#16A34A":"#6B7280"} bg={p.activo?"#DCFCE7":"#F3F4F6"}/>
                  </div>
                  {p.contacto && <div style={{fontSize:13,color:"#374151",marginBottom:4}}>👤 {p.contacto}</div>}
                  <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:"#6B7280",marginBottom:esAdmin?10:0}}>
                    {p.tel && <span>📞 {p.tel}</span>}
                    {p.movil && <span>📱 {p.movil}</span>}
                    {p.email && <span style={{color:"#2563EB"}}>✉️ {p.email}</span>}
                  </div>
                  {esAdmin && (
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"10px"}} onClick={() => { setEditForm({...p}); setEditModal(p.id); setProvMsg(""); }}>✏️ Editar</button>
                      <button style={{...S.btn("red"),flex:1,justifyContent:"center",padding:"10px"}} onClick={() => borrarProv(p.id)}>🗑 Borrar</button>
                    </div>
                  )}
                </MobileCard>
              ))}
            </div>
          ) : (
          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead><tr>{["Codigo","Nombre","Contacto","Telefono","Movil","Email","Estado",...(esAdmin?["Acciones"]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {provDB.map(p=>(
                    <tr key={p.id}>
                      <td style={S.td}><Cod txt={p.codigo} bg="#F3F4F6" color="#374151"/></td>
                      <td style={{...S.td,fontWeight:700,color:"#0F1E2E"}}>{p.nombre}</td>
                      <td style={S.td}>{p.contacto}</td>
                      <td style={S.td}>{p.tel}</td>
                      <td style={S.td}>{p.movil}</td>
                      <td style={{...S.td,color:"#2563EB"}}>{p.email}</td>
                      <td style={S.td}><Badge txt={p.activo?"Activo":"Inactivo"} color={p.activo?"#16A34A":"#6B7280"} bg={p.activo?"#DCFCE7":"#F3F4F6"}/></td>
                      {esAdmin && (
                        <td style={S.td}>
                          <div style={{display:"flex",gap:6}}>
                            <button style={{...S.btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={() => { setEditForm({...p}); setEditModal(p.id); setProvMsg(""); }}>Editar</button>
                            <button style={{...S.btn("red"),padding:"4px 10px",fontSize:12}} onClick={() => borrarProv(p.id)}>Borrar</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )
        )}
        {editModal && (
          <div className="modal-wrap" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
            <div className="modal-inner" style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>{editModal==="nuevo"?"Nuevo proveedor":"Editar proveedor"}</h3>
                <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={()=>setEditModal(null)}>x</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[["Codigo","codigo"],["Nombre","nombre"],["Contacto","contacto"],["Telefono fijo","tel"],["Movil","movil"],["Email","email"]].map(([l,k])=>(
                  <div key={k}>
                    <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>{l}</label>
                    <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editForm[k]||""} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}/>
                  </div>
                ))}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Comentarios (solo admin)</label>
                  <textarea style={{...S.inp,width:"100%",boxSizing:"border-box",minHeight:80,resize:"vertical"}} value={editForm.comentarios||""} onChange={e=>setEditForm(f=>({...f,comentarios:e.target.value}))}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Estado</label>
                  <select style={{...S.inp,width:"100%"}} value={editForm.activo?"si":"no"} onChange={e=>setEditForm(f=>({...f,activo:e.target.value==="si"}))}>
                    <option value="si">Activo</option>
                    <option value="no">Inactivo</option>
                  </select>
                </div>
              </div>
              {provMsg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{provMsg}</div>}
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button style={S.btn("ghost")} onClick={()=>setEditModal(null)}>Cancelar</button>
                <button style={S.btn("green")} onClick={guardarProv}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── VISTA CATALOGO ──────────────────────────────────────────────────────────
  const ViewCatalogo = () => {
    const [catDB, setCatDB] = useState([]);
    const [provsDB, setProvsDB] = useState([]);
    const [loadingCat, setLoadingCat] = useState(true);
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [catMsg, setCatMsg] = useState("");
    const [filtroBusq, setFiltroBusq] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    useEffect(() => {
      supabase.from("catalogo").select("*").order("tipo").then(({data}) => { setCatDB(data||[]); setLoadingCat(false); });
      supabase.from("proveedores").select("*").eq("activo",true).order("nombre").then(({data}) => setProvsDB(data||[]));
    }, []);

    const recargar = async () => {
      const {data} = await supabase.from("catalogo").select("*").order("tipo");
      setCatDB(data||[]);
    };

    const guardarCat = async () => {
      setCatMsg("");
      if (!editForm.cod_prov || !editForm.descripcion) { setCatMsg("Codigo y descripcion son obligatorios."); return; }
      if (editModal === "nuevo") {
        const { error } = await supabase.from("catalogo").insert([editForm]);
        if (error) { setCatMsg("Error: " + error.message); return; }
      } else {
        const { error } = await supabase.from("catalogo").update(editForm).eq("id", editModal);
        if (error) { setCatMsg("Error: " + error.message); return; }
      }
      await recargar(); setEditModal(null);
    };

    const borrarCat = async (id) => {
      if (!window.confirm("Borrar este producto?")) return;
      await supabase.from("catalogo").delete().eq("id", id);
      setCatDB(prev => prev.filter(m => m.id !== id));
    };

    const tipos = [...new Set(catDB.map(m=>m.tipo).filter(Boolean))];
    const filtered = catDB.filter(m => {
      const mt = filtroTipo === "todos" || m.tipo === filtroTipo;
      const provNombre = provsDB.find(p=>p.id===m.proveedor_id)?.nombre?.toLowerCase()||"";
      const mb = !filtroBusq || m.descripcion?.toLowerCase().includes(filtroBusq.toLowerCase()) || m.cod_prov?.toLowerCase().includes(filtroBusq.toLowerCase()) || provNombre.includes(filtroBusq.toLowerCase());
      return mt && mb;
    });

    const [catTab, setCatTab] = useState("lista");

    return (
      <div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button style={{...S.btn(catTab==="lista"?"navy":"ghost"),padding:"8px 16px"}} onClick={()=>setCatTab("lista")}>Lista de productos</button>
          <button style={{...S.btn(catTab==="proveedor"?"navy":"ghost"),padding:"8px 16px"}} onClick={()=>setCatTab("proveedor")}>Buscar por proveedor</button>
        </div>

        {catTab==="proveedor" ? <ViewPorProveedor/> : <div>
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <input style={{...S.inp,flex:1,minWidth:200}} placeholder="Buscar maquina o codigo..." value={filtroBusq} onChange={e=>setFiltroBusq(e.target.value)}/>
          <select style={{...S.inp,width:"auto"}} value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            {tipos.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          {perm("importar_excel") && (
            <>
              <button style={S.btn("teal")} onClick={() => setModal({tipo:"import_catalogo"})}>Importar CSV</button>
              <button style={{...S.btn("ghost"),fontSize:12}} onClick={() => downloadCSV("plantilla_catalogo.csv",
                ["cod_prov","descripcion","tipo","precio_dia"],
                [["BI-110","Deposito 1000 Lts.","Almacenaje","18"]]
              )}>Plantilla CSV</button>
            </>
          )}
          {esAdmin && <button style={S.btn("primary")} onClick={() => { setEditForm({cod_prov:"",descripcion:"",tipo:"",proveedor_id:"",precio_dia:0,comentarios:""}); setEditModal("nuevo"); setCatMsg(""); }}>+ Añadir producto</button>}
        </div>
        {loadingCat ? <p style={{color:"#6B7280"}}>Cargando...</p> : (
          isMobile ? (
            <div>
              {filtered.map(m=>{
                const tipoBg = {"Generador":"#F0FDF4","Herramienta":"#EFF6FF","Accesorio":"#FFF7ED","Almacenaje":"#F5F3FF","Transporte":"#FEF2F2","Elevacion":"#ECFDF5","Compactacion":"#FFFBEB"}[m.tipo]||"#F3F4F6";
                const prov = provsDB.find(p=>p.id===m.proveedor_id);
                return (
                  <MobileCard key={m.id}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{flex:1,marginRight:10}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#0F1E2E",marginBottom:4}}>{m.descripcion}</div>
                        <Cod txt={m.cod_prov}/>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:800,fontSize:16,color:"#0D9488"}}>{fmt(m.precio_dia)}/d</div>
                        <span style={{fontSize:11,fontWeight:700,color:"#0F1E2E",background:tipoBg,padding:"2px 8px",borderRadius:10,marginTop:4,display:"inline-block"}}>{m.tipo}</span>
                      </div>
                    </div>
                    {prov && <div style={{fontSize:12,color:"#6B7280"}}>🏢 {prov.nombre.split(",")[0]}</div>}
                    {esAdmin && (
                      <div style={{display:"flex",gap:8,marginTop:10}}>
                        <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"10px"}} onClick={() => { setEditForm({...m}); setEditModal(m.id); setCatMsg(""); }}>✏️ Editar</button>
                        <button style={{...S.btn("red"),flex:1,justifyContent:"center",padding:"10px"}} onClick={() => borrarCat(m.id)}>🗑 Borrar</button>
                      </div>
                    )}
                  </MobileCard>
                );
              })}
            </div>
          ) : (
          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead><tr>{["Cod.Prov","Descripcion","Tipo","Proveedor","Euros/dia",...(esAdmin?["Acciones"]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(m=>{
                    const tipoBg = {"Generador":"#F0FDF4","Herramienta":"#EFF6FF","Accesorio":"#FFF7ED","Almacenaje":"#F5F3FF","Transporte":"#FEF2F2","Elevacion":"#ECFDF5","Compactacion":"#FFFBEB"}[m.tipo]||"#F3F4F6";
                    const prov = provsDB.find(p=>p.id===m.proveedor_id);
                    return (
                      <tr key={m.id}>
                        <td style={S.td}><Cod txt={m.cod_prov}/></td>
                        <td style={{...S.td,fontWeight:600}}>{m.descripcion}</td>
                        <td style={S.td}><span style={{fontSize:11,fontWeight:700,color:"#0F1E2E",background:tipoBg,padding:"2px 8px",borderRadius:10}}>{m.tipo}</span></td>
                        <td style={S.td}>{prov?.nombre?.split(",")[0]||"-"}</td>
                        <td style={{...S.td,fontWeight:700,color:"#0D9488"}}>{fmt(m.precio_dia)}/dia</td>
                        {esAdmin && (
                          <td style={S.td}>
                            <div style={{display:"flex",gap:6}}>
                              <button style={{...S.btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={() => { setEditForm({...m}); setEditModal(m.id); setCatMsg(""); }}>Editar</button>
                              <button style={{...S.btn("red"),padding:"4px 10px",fontSize:12}} onClick={() => borrarCat(m.id)}>Borrar</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )
        )}
        {editModal && (
          <div className="modal-wrap" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
            <div className="modal-inner" style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>{editModal==="nuevo"?"Nuevo producto":"Editar producto"}</h3>
                <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={()=>setEditModal(null)}>x</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Cod. Proveedor</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editForm.cod_prov||""} onChange={e=>setEditForm(f=>({...f,cod_prov:e.target.value}))}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Tipo</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editForm.tipo||""} onChange={e=>setEditForm(f=>({...f,tipo:e.target.value}))} placeholder="Herramienta, Generador..."/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Descripcion</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editForm.descripcion||""} onChange={e=>setEditForm(f=>({...f,descripcion:e.target.value}))}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                  <select style={{...S.inp,width:"100%"}} value={editForm.proveedor_id||""} onChange={e=>setEditForm(f=>({...f,proveedor_id:e.target.value}))}>
                    <option value="">Sin asignar</option>
                    {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Precio/dia (EUR)</label>
                  <input type="number" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editForm.precio_dia||0} onChange={e=>setEditForm(f=>({...f,precio_dia:parseFloat(e.target.value)||0}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Comentarios (solo admin)</label>
                  <textarea style={{...S.inp,width:"100%",boxSizing:"border-box",minHeight:70,resize:"vertical"}} value={editForm.comentarios||""} onChange={e=>setEditForm(f=>({...f,comentarios:e.target.value}))}/>
                </div>
              </div>
              {catMsg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{catMsg}</div>}
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button style={S.btn("ghost")} onClick={()=>setEditModal(null)}>Cancelar</button>
                <button style={S.btn("green")} onClick={guardarCat}>Guardar</button>
              </div>
            </div>
          </div>
        )}
        </div>}
      </div>
    );
  };

  // ── VISTA OFERTAS ───────────────────────────────────────────────────────────
  const ViewOfertas = () => {
    const [showForm, setShowForm] = useState(false);
    const [obrasDB, setObrasDB] = useState([]);
    const [provsDB, setProvsDB] = useState([]);
    const [catDB, setCatDB] = useState([]);
    const [form, setForm] = useState({ prov_id:"", obra_id:"", fecha_inicio:"", fecha_fin:"", obs:"" });
    const [maqSel, setMaqSel] = useState([]);

    useEffect(() => {
      if (esAdmin) {
        supabase.from("obras").select("*").eq("estado","activa").order("numero").then(({data}) => setObrasDB(data||[]));
      } else {
        supabase.from("usuario_obras").select("obra_id, obras(*)").eq("usuario_id", usuario.id).then(({data}) => setObrasDB((data||[]).map(r=>r.obras).filter(o=>o&&o.estado==="activa")));
      }
      supabase.from("proveedores").select("*").eq("activo",true).order("nombre").then(({data}) => setProvsDB(data||[]));
      supabase.from("catalogo").select("*").order("tipo").then(({data}) => setCatDB(data||[]));
    }, []);

    const toggleMaq = (m) => setMaqSel(prev => prev.find(x=>x.id===m.id) ? prev.filter(x=>x.id!==m.id) : [...prev, m]);

    const enviarCorreo = async () => {
      const prov = provsDB.find(p=>p.id===form.prov_id);
      const obra = obrasDB.find(o=>o.id===form.obra_id);
      if (!prov || !obra || maqSel.length===0) { alert("Rellena proveedor, obra y selecciona al menos una maquina."); return; }
      const lineas = [
        "Estimados Sres.,", "",
        "Les solicitamos oferta de alquiler de maquinaria para la siguiente obra:", "",
        "OBRA: " + obra.numero + " - " + obra.nombre,
        "CLIENTE: " + (obra.cliente||""),
        "DIRECCION: " + (obra.direccion||""),
      ];
      if (form.fecha_inicio) lineas.push("FECHA INICIO PREVISTA: " + form.fecha_inicio);
      if (form.fecha_fin) lineas.push("FECHA FIN PREVISTA: " + form.fecha_fin);
      lineas.push("", "MAQUINARIA SOLICITADA:");
      maqSel.forEach((m,i) => lineas.push((i+1) + ". " + m.cod_prov + " - " + m.descripcion));
      if (form.obs) { lineas.push("", "OBSERVACIONES:", form.obs); }
      lineas.push("", "Quedamos a su disposicion para cualquier consulta.", "", "Atentamente,", "BARCINO GRUP");
      const asunto = encodeURIComponent("Solicitud de oferta - Obra " + obra.numero + " " + obra.nombre);
      const cuerpo = encodeURIComponent(lineas.join("\n"));
      window.open("mailto:" + (prov.email||"") + "?subject=" + asunto + "&body=" + cuerpo);
      const nuevaOferta = { id:"OF-"+Date.now(), prov_id:form.prov_id, obra_id:form.obra_id, fecha:new Date().toISOString().split("T")[0], estado:"pendiente", items:maqSel.map(m=>({mid:m.id,qty:1,precio:null})), obs:form.obs };
      await supabase.from("ofertas").insert([nuevaOferta]);
      setOfertas(prev => [nuevaOferta, ...prev]);
      setShowForm(false); setForm({prov_id:"",obra_id:"",fecha_inicio:"",fecha_fin:"",obs:""}); setMaqSel([]);
    };

    const catFiltrado = form.prov_id ? catDB.filter(m=>m.proveedor_id===form.prov_id) : catDB;

    return (
      <div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
          {perm("crear_pedidos") && <button style={S.btn("primary")} onClick={()=>setShowForm(true)}>+ Nueva solicitud de oferta</button>}
        </div>
        {showForm && (
          <div style={{...S.card,borderLeft:"4px solid #F59E0B",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F1E2E"}}>Nueva solicitud de oferta</h3>
              <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6B7280"}} onClick={()=>setShowForm(false)}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                <select style={{...S.inp,width:"100%"}} value={form.prov_id} onChange={e=>setForm(f=>({...f,prov_id:e.target.value}))}>
                  <option value="">Selecciona proveedor...</option>
                  {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Obra</label>
                <select style={{...S.inp,width:"100%"}} value={form.obra_id} onChange={e=>setForm(f=>({...f,obra_id:e.target.value}))}>
                  <option value="">Selecciona obra...</option>
                  {obrasDB.map(o=><option key={o.id} value={o.id}>{o.numero} - {o.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha inicio prevista</label>
                <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.fecha_inicio} onChange={e=>setForm(f=>({...f,fecha_inicio:e.target.value}))}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha fin prevista</label>
                <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.fecha_fin} onChange={e=>setForm(f=>({...f,fecha_fin:e.target.value}))}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Observaciones</label>
                <textarea style={{...S.inp,width:"100%",boxSizing:"border-box",minHeight:60,resize:"vertical"}} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))} placeholder="Notas adicionales..."/>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:8}}>MAQUINARIA SOLICITADA {form.prov_id && "(filtrada por proveedor)"}</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8,maxHeight:260,overflowY:"auto",padding:4}}>
                {catFiltrado.map(m=>{
                  const sel = maqSel.find(x=>x.id===m.id);
                  return (
                    <div key={m.id} onClick={()=>toggleMaq(m)} style={{border:"2px solid "+(sel?"#F59E0B":"#E5E7EB"),borderRadius:8,padding:"10px 12px",cursor:"pointer",background:sel?"#FFFBEB":"#FAFAFA"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <Cod txt={m.cod_prov}/>
                        <span style={{fontSize:12,fontWeight:700,color:"#0D9488"}}>{fmt(m.precio_dia)}/dia</span>
                      </div>
                      <p style={{margin:0,fontSize:12,fontWeight:600,color:"#0F1E2E"}}>{m.descripcion}</p>
                    </div>
                  );
                })}
              </div>
              {maqSel.length > 0 && (
                <div style={{marginTop:10,padding:"8px 12px",background:"#FEF3C7",borderRadius:7,fontSize:12,color:"#92400E"}}>
                  Seleccionadas: {maqSel.map(m=>m.cod_prov).join(", ")}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button style={{...S.btn("primary"),fontSize:14}} onClick={enviarCorreo}>Abrir correo y enviar solicitud</button>
            </div>
          </div>
        )}
        {isMobile ? (
          <div>
            {ofertas.map(of=>{
              const est = ESTADO_O[of.estado]||ESTADO_O.pendiente;
              const total = of.items.reduce((a,it)=>a+(it.precio||0),0);
              const obraData = obrasDB.find(o=>o.id===of.obra_id) || OBRAS_STATIC.find(o=>o.id===of.obra_id) || {};
              const provData = provsDB.find(p=>p.id===of.prov_id) || {};
              return (
                <MobileCard key={of.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:14,color:"#2563EB"}}>#{of.id}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#0F1E2E"}}>{provData.nombre?.split(",")[0]||of.prov_id}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <Badge txt={est.l} color={est.c} bg={est.bg}/>
                      <div style={{fontSize:14,fontWeight:800,color:total>0?"#0D9488":"#6B7280",marginTop:4}}>{total>0?fmt(total)+"/dia":"Pend."}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#6B7280",marginBottom:6}}>{(obraData.nombre||"")?.substring(0,40)} • {of.fecha}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:of.estado==="pendiente"&&esAdmin?10:0}}>
                    {of.items.map((it,i)=><Cod key={i} txt={catDB.find(m=>m.id===it.mid)?.cod_prov||it.mid}/>)}
                  </div>
                  {of.estado==="pendiente" && esAdmin && (
                    <div style={{display:"flex",gap:8}}>
                      <button style={{...S.btn("green"),flex:1,justifyContent:"center",padding:"10px"}} onClick={async()=>{await supabase.from("ofertas").update({estado:"aceptada"}).eq("id",of.id);setOfertas(prev=>prev.map(o=>o.id===of.id?{...o,estado:"aceptada"}:o));}}>✓ Aceptar</button>
                      <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"10px"}} onClick={async()=>{await supabase.from("ofertas").update({estado:"rechazada"}).eq("id",of.id);setOfertas(prev=>prev.map(o=>o.id===of.id?{...o,estado:"rechazada"}:o));}}>✗ Rechazar</button>
                    </div>
                  )}
                </MobileCard>
              );
            })}
          </div>
        ) : (
        <div style={S.card}>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>{["Ref.","Proveedor","Obra","Fecha","Maquinas","Precio ofert.","Estado","Acc."].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {ofertas.map(of=>{
                  const est = ESTADO_O[of.estado]||ESTADO_O.pendiente;
                  const total = of.items.reduce((a,it)=>a+(it.precio||0),0);
                  const obraData = obrasDB.find(o=>o.id===of.obra_id) || OBRAS_STATIC.find(o=>o.id===of.obra_id) || {};
                  const provData = provsDB.find(p=>p.id===of.prov_id) || {};
                  return (
                    <tr key={of.id}>
                      <td style={S.td}><span style={{fontWeight:700,color:"#2563EB"}}>#{of.id}</span></td>
                      <td style={S.td}>{provData.nombre?.split(",")[0]||of.prov_id}</td>
                      <td style={{...S.td,fontSize:12}}>{(obraData.nombre||"")?.substring(0,34)}</td>
                      <td style={{...S.td,color:"#6B7280",fontSize:12}}>{of.fecha}</td>
                      <td style={S.td}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{of.items.map((it,i)=><Cod key={i} txt={catDB.find(m=>m.id===it.mid)?.cod_prov||it.mid}/>)}</div></td>
                      <td style={{...S.td,fontWeight:700,color:total>0?"#0D9488":"#6B7280"}}>{total>0?fmt(total)+"/dia":"Pendiente"}</td>
                      <td style={S.td}><Badge txt={est.l} color={est.c} bg={est.bg}/></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {of.estado==="pendiente" && esAdmin && (
                            <>
                              <button style={{...S.btn("green"),padding:"5px 10px",fontSize:12}} onClick={async()=>{await supabase.from("ofertas").update({estado:"aceptada"}).eq("id",of.id);setOfertas(prev=>prev.map(o=>o.id===of.id?{...o,estado:"aceptada"}:o));}}>Aceptar</button>
                              <button style={{...S.btn("ghost"),padding:"5px 10px",fontSize:12}} onClick={async()=>{await supabase.from("ofertas").update({estado:"rechazada"}).eq("id",of.id);setOfertas(prev=>prev.map(o=>o.id===of.id?{...o,estado:"rechazada"}:o));}}>Rechazar</button>
                            </>
                          )}
                          {esAdmin && <button style={{...S.btn("red"),padding:"5px 10px",fontSize:12}} onClick={async()=>{if(!window.confirm("Borrar esta solicitud?"))return;await supabase.from("ofertas").delete().eq("id",of.id);setOfertas(prev=>prev.filter(o=>o.id!==of.id));}}>Borrar</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    );
  };

  // ── VISTA PEDIDOS ───────────────────────────────────────────────────────────
  const ViewPedidos = () => {
    const [provsDB, setProvsDB] = useState([]);
    const [obrasDB, setObrasDB] = useState([]);
    const [catDB, setCatDB] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({id:"",prov_id:"",obra_id:"",fecha:new Date().toISOString().split("T")[0],items:[]});
    const [formMsg, setFormMsg] = useState("");
    const [editPedModal, setEditPedModal] = useState(null);
    const [editPedForm, setEditPedForm] = useState({});
    const [editPedMsg, setEditPedMsg] = useState("");
    const [importPreview, setImportPreview] = useState(null);
    const [importMsg, setImportMsg] = useState("");
    const importPedRef = useRef();

    useEffect(() => {
      supabase.from("proveedores").select("*").eq("activo",true).order("nombre").then(({data}) => setProvsDB(data||[]));
      supabase.from("catalogo").select("*").order("tipo").then(({data}) => setCatDB(data||[]));
      if (esAdmin) {
        supabase.from("obras").select("*").eq("estado","activa").order("numero").then(({data}) => setObrasDB(data||[]));
      } else {
        supabase.from("usuario_obras").select("obra_id, obras(*)").eq("usuario_id", usuario.id).then(({data}) => setObrasDB((data||[]).map(r=>r.obras).filter(Boolean)));
      }
    }, []);

    const addItem = () => setForm(f=>({...f, items:[...f.items, {mid:"",ci:""}]}));
    const updateItem = (i,k,v) => setForm(f=>({...f, items:f.items.map((it,idx)=>idx===i?{...it,[k]:v}:it)}));
    const removeItem = (i) => setForm(f=>({...f, items:f.items.filter((_,idx)=>idx!==i)}));

    const guardarPedido = async () => {
      setFormMsg("");
      if (!form.id || !form.prov_id || !form.obra_id || !form.fecha) { setFormMsg("Rellena todos los campos obligatorios."); return; }
      if (form.items.length===0) { setFormMsg("Añade al menos una maquina."); return; }
      const nuevo = { id:form.id, prov_id:form.prov_id, obra_id:form.obra_id, fecha:form.fecha, estado:"en_obra", items:form.items };
      const { error } = await supabase.from("pedidos").insert([nuevo]);
      if (error) { setFormMsg("Error: " + error.message); return; }
      setPedidos(prev => [nuevo, ...prev]);
      setShowForm(false);
      setForm({id:"",prov_id:"",obra_id:"",fecha:new Date().toISOString().split("T")[0],items:[]});
    };

    const filtrados = pedidos.filter(p => {
      const mp = provFil==="todos" || p.prov_id===provFil;
      const mb = !busq || p.id.toLowerCase().includes(busq.toLowerCase());
      return mp && mb;
    });

    return (
    <div>
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center",flexDirection:isMobile?"column":"row"}}>
          <input style={{...S.inp,flex:1,width:isMobile?"100%":"auto",minWidth:isMobile?"100%":200}} placeholder="Buscar albaran u obra..." value={busq} onChange={e=>setBusq(e.target.value)}/>
          <div style={{display:"flex",gap:8,width:isMobile?"100%":"auto",flexWrap:"wrap"}}>
            <select style={{...S.inp,flex:1}} value={provFil} onChange={e=>setProvFil(e.target.value)}>
              <option value="todos">Todos los proveedores</option>
              {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
            </select>
            {perm("crear_pedidos") && <button style={{...S.btn("primary"),flex:isMobile?1:undefined,justifyContent:"center"}} onClick={()=>setShowForm(true)}>+ Nuevo</button>}
          </div>
          {!isMobile && esAdmin && (
            <>
              <button style={S.btn("teal")} onClick={()=>{setImportMsg("");setImportPreview(null);importPedRef.current.click();}}>Importar Excel/CSV</button>
              <button style={{...S.btn("ghost"),fontSize:12}} onClick={()=>downloadCSV("plantilla_pedidos.csv",
                ["albaran","proveedor","obra","fecha","maquina","codigo_interno","cantidad"],
                [["CC26000001","RAMAQ","AA26000032","2026-03-01","BI-110","INT-0001","1"],["CC26000001","RAMAQ","AA26000032","2026-03-01","A-966","INT-0002","1"]]
              )}>Plantilla CSV</button>
              <input ref={importPedRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>{
                const file = e.target.files[0]; if(!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const rows = parseCSV(ev.target.result);
                  if(!rows.length){setImportMsg("Archivo vacio o formato incorrecto.");return;}
                  if(!rows[0].albaran){setImportMsg("Falta columna: albaran");return;}
                  const grouped = {};
                  rows.forEach(r=>{
                    if(!grouped[r.albaran]) grouped[r.albaran]={id:r.albaran,prov_id:r.proveedor||"",obra_id:r.obra||"",fecha:r.fecha||new Date().toISOString().split("T")[0],estado:"en_obra",items:[]};
                    if(r.maquina) grouped[r.albaran].items.push({mid:r.maquina,ci:r.codigo_interno||"",qty:parseInt(r.cantidad)||1});
                  });
                  setImportPreview(Object.values(grouped));
                  setImportMsg("");
                };
                reader.readAsText(file,"utf-8");
                e.target.value="";
              }}/>
            </>
          )}
        </div>

        {importMsg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{importMsg}</div>}

        {importPreview && (
          <div style={{...S.card,borderLeft:"4px solid #0D9488",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <p style={{margin:0,fontWeight:700,color:"#0F1E2E"}}>Vista previa - {importPreview.length} pedido(s) encontrados</p>
              <button style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}} onClick={()=>setImportPreview(null)}>x</button>
            </div>
            <div style={{overflowX:"auto",marginBottom:12}}>
              <table style={S.table}>
                <thead><tr>{["Albaran","Proveedor","Obra","Fecha","Maquinas","Estado"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {importPreview.slice(0,10).map((p,i)=>(
                    <tr key={i}>
                      <td style={S.td}><Cod txt={p.id} bg="#EFF6FF" color="#2563EB"/></td>
                      <td style={S.td}>{p.prov_id}</td>
                      <td style={S.td}>{p.obra_id}</td>
                      <td style={{...S.td,color:"#6B7280",fontSize:12}}>{p.fecha}</td>
                      <td style={S.td}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{p.items.map((it,j)=><Cod key={j} txt={it.mid}/>)}</div></td>
                      <td style={S.td}><Badge txt="Pendiente revision" color="#D97706" bg="#FEF3C7"/></td>
                    </tr>
                  ))}
                  {importPreview.length>10 && <tr><td colSpan={6} style={{...S.td,color:"#6B7280",textAlign:"center",fontStyle:"italic"}}>... y {importPreview.length-10} mas</td></tr>}
                </tbody>
              </table>
            </div>
            <p style={{margin:"0 0 12px",fontSize:12,color:"#6B7280"}}>El encargado podra confirmar cada pedido uno a uno desde la pestana Entrada en Obra.</p>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setImportPreview(null)}>Cancelar</button>
              <button style={S.btn("green")} onClick={async()=>{
                let ok=0,err=0;
                for(const p of importPreview){
                  const {error} = await supabase.from("pedidos").upsert([p]);
                  if(error) err++; else ok++;
                }
                setPedidos(prev=>{
                  const ids=importPreview.map(p=>p.id);
                  return [...importPreview,...prev.filter(p=>!ids.includes(p.id))];
                });
                setImportPreview(null);
                setImportMsg(err>0?err+" pedidos con error, "+ok+" importados correctamente.":"");
              }}>Importar {importPreview.length} pedidos</button>
            </div>
          </div>
        )}

        {showForm && (
          <div style={{...S.card,borderLeft:"4px solid #F59E0B",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F1E2E"}}>Nuevo pedido</h3>
              <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6B7280"}} onClick={()=>setShowForm(false)}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Num. Albaran</label>
                <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="CC26XXXXXX" value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha</label>
                <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                <select style={{...S.inp,width:"100%"}} value={form.prov_id} onChange={e=>setForm(f=>({...f,prov_id:e.target.value}))}>
                  <option value="">Selecciona proveedor...</option>
                  {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Obra</label>
                <select style={{...S.inp,width:"100%"}} value={form.obra_id} onChange={e=>setForm(f=>({...f,obra_id:e.target.value}))}>
                  <option value="">Selecciona obra...</option>
                  {obrasDB.map(o=><option key={o.id} value={o.numero}>{o.numero} - {o.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <label style={{fontSize:12,fontWeight:700,color:"#6B7280",textTransform:"uppercase"}}>Maquinas</label>
                <button style={{...S.btn("teal"),padding:"4px 12px",fontSize:12}} onClick={addItem}>+ Añadir maquina</button>
              </div>
              {form.items.map((it,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
                  <select style={{...S.inp,width:"100%"}} value={it.mid} onChange={e=>updateItem(i,"mid",e.target.value)}>
                    <option value="">Selecciona maquina...</option>
                    {catDB.map(m=><option key={m.id} value={m.id}>{m.cod_prov} - {m.descripcion}</option>)}
                  </select>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Cod. interno (INT-XXXX)" value={it.ci} onChange={e=>updateItem(i,"ci",e.target.value)}/>
                  <button style={{...S.btn("red"),padding:"4px 8px",fontSize:12}} onClick={()=>removeItem(i)}>x</button>
                </div>
              ))}
              {form.items.length===0 && <p style={{color:"#6B7280",fontSize:13,margin:0}}>Pulsa "Añadir maquina" para agregar maquinaria al pedido.</p>}
            </div>
            {formMsg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{formMsg}</div>}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button style={S.btn("green")} onClick={guardarPedido}>Guardar pedido</button>
            </div>
          </div>
        )}
        {isMobile ? (
          <div>
            {filtrados.map(p=>{
              const est = ESTADO_P[p.estado]||ESTADO_P.borrador;
              const d = diasDesde(p.fecha);
              const prov = provsDB.find(x=>x.id===p.prov_id);
              const obra = OBRAS_STATIC.find(o=>o.id===p.obra_id);
              return (
                <MobileCard key={p.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:15,color:"#2563EB"}}>{p.id}</div>
                      <div style={{fontSize:12,color:"#6B7280"}}>{prov?.nombre?.split(",")[0]||p.prov_id}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <Badge txt={est.l} color={est.c} bg={est.bg}/>
                      {p.estado==="en_obra"&&d>30&&<div style={{fontSize:11,color:"#DC2626",fontWeight:700,marginTop:4}}>⚠️ {d} dias</div>}
                    </div>
                  </div>
                  <div style={{fontSize:13,color:"#374151",marginBottom:6,fontWeight:600}}>{(obra?.nombre||p.obra_id)?.substring(0,45)}</div>
                  <div style={{fontSize:12,color:"#6B7280",marginBottom:8}}>📅 {p.fecha}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                    {p.items.map((it,i)=><Cod key={i} txt={it.mid}/>)}
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"10px",fontSize:13}} onClick={()=>setModal({tipo:"detalle",datos:p})}>👁 Ver</button>
                    {perm("entradas_devoluciones") && p.estado==="en_obra" && (
                      <button style={{...S.btn("teal"),flex:1,justifyContent:"center",padding:"10px",fontSize:13}} onClick={async()=>{
                        if(!window.confirm("Confirmar entrada en obra?"))return;
                        const entrada = {pedido_id:p.id, fecha_entrada:new Date().toISOString().split("T")[0], proveedor_id:p.prov_id, observaciones:"Confirmado", confirmado:true, foto_url:"", usuario_id:usuario.id};
                        await supabase.from("entradas_obra").insert([entrada]);
                        alert("Entrada registrada.");
                      }}>✓ Confirmar</button>
                    )}
                    {esAdmin && <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"10px",fontSize:13}} onClick={()=>{setEditPedForm({...p,estado:p.estado});setEditPedModal(p.id);setEditPedMsg("");}}>✏️ Editar</button>}
                  </div>
                </MobileCard>
              );
            })}
          </div>
        ) : (
        <div style={S.card}>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>{["Albaran","Proveedor","Obra","Fecha","Articulos","Euros/dia","Estado",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtrados.map(p=>{
                  const est = ESTADO_P[p.estado]||ESTADO_P.borrador;
                  const d = diasDesde(p.fecha);
                  const prov = provsDB.find(x=>x.id===p.prov_id);
                  const obra = OBRAS_STATIC.find(o=>o.id===p.obra_id);
                  return (
                    <tr key={p.id}>
                      <td style={S.td}><span style={{fontWeight:700,color:"#2563EB"}}>{p.id}</span></td>
                      <td style={S.td}>{prov?.nombre?.split(",")[0]||p.prov_id}</td>
                      <td style={{...S.td,fontSize:12}}>{(obra?.nombre||p.obra_id)?.substring(0,30)}</td>
                      <td style={{...S.td,color:"#6B7280",fontSize:12}}>{p.fecha}</td>
                      <td style={S.td}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{p.items.map((it,i)=><Cod key={i} txt={it.mid}/>)}</div></td>
                      <td style={{...S.td,fontWeight:700,color:"#0D9488"}}>-</td>
                      <td style={S.td}><Badge txt={est.l} color={est.c} bg={est.bg}/></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <button style={{...S.btn("ghost"),padding:"5px 10px",fontSize:12}} onClick={()=>setModal({tipo:"detalle",datos:p})}>Ver</button>
                          {esAdmin && <button style={{...S.btn("ghost"),padding:"5px 10px",fontSize:12}} onClick={()=>{setEditPedForm({...p,estado:p.estado});setEditPedModal(p.id);setEditPedMsg("");}}>Editar</button>}
                          {perm("entradas_devoluciones") && p.estado==="en_obra" && (
                            <button style={{...S.btn("teal"),padding:"5px 10px",fontSize:12}} onClick={async()=>{
                              if(!window.confirm("Confirmar entrada en obra de este pedido?"))return;
                              const entrada = {pedido_id:p.id, fecha_entrada:new Date().toISOString().split("T")[0], proveedor_id:p.prov_id, observaciones:"Confirmado desde importacion", confirmado:true, foto_url:"", usuario_id:usuario.id};
                              await supabase.from("entradas_obra").insert([entrada]);
                              alert("Entrada registrada correctamente.");
                            }}>Confirmar entrada</button>
                          )}
                          {esAdmin && <button style={{...S.btn("red"),padding:"5px 10px",fontSize:12}} onClick={async()=>{if(!window.confirm("Borrar este pedido?"))return;await supabase.from("pedidos").delete().eq("id",p.id);setPedidos(prev=>prev.filter(x=>x.id!==p.id));}}>Borrar</button>}
                          {p.estado==="en_obra"&&d>30&&<span style={{fontSize:10,color:"#DC2626",fontWeight:700}}>⚠{d}d</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

      {editPedModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
          <div style={{background:"#FFFFFF",borderRadius:14,padding:28,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>Editar pedido</h3>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#6B7280"}} onClick={()=>setEditPedModal(null)}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                <select style={{...S.inp,width:"100%"}} value={editPedForm.prov_id||""} onChange={e=>setEditPedForm(f=>({...f,prov_id:e.target.value}))}>
                  <option value="">Selecciona...</option>
                  {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha</label>
                <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editPedForm.fecha||""} onChange={e=>setEditPedForm(f=>({...f,fecha:e.target.value}))}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Obra</label>
                <select style={{...S.inp,width:"100%"}} value={editPedForm.obra_id||""} onChange={e=>setEditPedForm(f=>({...f,obra_id:e.target.value}))}>
                  <option value="">Selecciona...</option>
                  {obrasDB.map(o=><option key={o.id} value={o.numero}>{o.numero} - {o.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Estado</label>
                <select style={{...S.inp,width:"100%"}} value={editPedForm.estado||"en_obra"} onChange={e=>setEditPedForm(f=>({...f,estado:e.target.value}))}>
                  <option value="en_obra">En Obra</option>
                  <option value="devuelto">Devuelto</option>
                  <option value="borrador">Borrador</option>
                </select>
              </div>
            </div>
            {editPedMsg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"9px 14px",fontSize:13,marginBottom:14}}>{editPedMsg}</div>}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("ghost")} onClick={()=>setEditPedModal(null)}>Cancelar</button>
              <button style={S.btn("green")} onClick={async()=>{
                const {error} = await supabase.from("pedidos").update({prov_id:editPedForm.prov_id,obra_id:editPedForm.obra_id,fecha:editPedForm.fecha,estado:editPedForm.estado}).eq("id",editPedModal);
                if(error){setEditPedMsg("Error: "+error.message);return;}
                setPedidos(prev=>prev.map(p=>p.id===editPedModal?{...p,...editPedForm}:p));
                setEditPedModal(null);
              }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  // ── VISTA ENTRADA ───────────────────────────────────────────────────────────
  const ViewEntrada = () => {
    const [provsDB, setProvsDB] = useState([]);
    const [obrasDB, setObrasDB] = useState([]);
    const [entradas, setEntradas] = useState([]);
    const [modal, setModal] = useState(null);
    const [editForm, setEditForm] = useState({ pedido_id:"", fecha_entrada:new Date().toISOString().split("T")[0], proveedor_id:"", observaciones:"", confirmado:false, foto_url:"" });
    const [msg, setMsg] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const fotoRef = useRef();

    const recargar = async () => {
      const {data} = await supabase.from("entradas_obra").select("*").order("created_at", {ascending:false});
      setEntradas(data||[]);
    };

    useEffect(() => {
      supabase.from("proveedores").select("*").then(({data}) => setProvsDB(data||[]));
      supabase.from("obras").select("*").then(({data}) => setObrasDB(data||[]));
      recargar();
    }, []);

    const handleFoto = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { setFotoPreview(ev.target.result); setEditForm(f=>({...f, foto_url:ev.target.result})); };
      reader.readAsDataURL(file);
    };

    const abrirModal = (e) => {
      if (e) {
        setEditForm({...e});
        setFotoPreview(e.foto_url||"");
      } else {
        setEditForm({ pedido_id:"", fecha_entrada:new Date().toISOString().split("T")[0], proveedor_id:"", observaciones:"", confirmado:false, foto_url:"" });
        setFotoPreview("");
      }
      setModal(e ? e.id : "nuevo");
      setMsg("");
    };

    const guardar = async () => {
      setMsg("");
      if (!editForm.pedido_id || !editForm.fecha_entrada) { setMsg("Numero de pedido y fecha son obligatorios."); return; }
      if (modal === "nuevo") {
        const { error } = await supabase.from("entradas_obra").insert([{...editForm, usuario_id:usuario.id}]);
        if (error) { setMsg("Error: " + error.message); return; }
      } else {
        const { error } = await supabase.from("entradas_obra").update(editForm).eq("id", modal);
        if (error) { setMsg("Error: " + error.message); return; }
      }
      await recargar();
      setModal(null);
    };

    const borrar = async (id) => {
      if (!window.confirm("Borrar esta entrada?")) return;
      await supabase.from("entradas_obra").delete().eq("id", id);
      setEntradas(prev => prev.filter(e => e.id !== id));
    };

    const pedidosEnObra = pedidos.filter(p=>p.estado==="en_obra");

    const getObra = (pedidoId) => {
      const p = pedidos.find(x=>x.id===pedidoId);
      if (!p) return "-";
      return obrasDB.find(o=>o.numero===p.obra_id)?.numero || p.obra_id || "-";
    };

    return (
      <div>
        {isMobile ? (
          <div style={{marginBottom:16}}>
            {perm("entradas_devoluciones") && (
              <button style={{...S.btn("primary"),width:"100%",justifyContent:"center",padding:"16px",fontSize:16,borderRadius:12,marginBottom:12}} onClick={()=>abrirModal(null)}>
                📥 Registrar entrada en obra
              </button>
            )}
            <p style={{color:"#6B7280",fontSize:13,margin:0,textAlign:"center"}}>{entradas.length} entrada(s) registrada(s)</p>
          </div>
        ) : (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{color:"#6B7280",fontSize:13,margin:0}}>Registra la llegada de maquinaria a obra.</p>
            {perm("entradas_devoluciones") && (
              <button style={S.btn("primary")} onClick={()=>abrirModal(null)}>+ Registrar entrada</button>
            )}
          </div>
        )}

        {entradas.length === 0 ? (
          <div style={{...S.card,textAlign:"center",padding:40,color:"#6B7280"}}>No hay entradas registradas.</div>
        ) : isMobile ? (
          <div>
            {entradas.map(e=>{
              const prov = provsDB.find(p=>p.id===e.proveedor_id);
              const numObra = getObra(e.pedido_id);
              const ped = pedidos.find(p=>p.id===e.pedido_id);
              return (
                <MobileCard key={e.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <Cod txt={e.pedido_id} bg="#EFF6FF" color="#2563EB"/>
                      <div style={{fontSize:12,color:"#6B7280",marginTop:4}}>Obra: {numObra}</div>
                    </div>
                    {e.confirmado ? <Badge txt="Confirmado" color="#16A34A" bg="#DCFCE7"/> : <Badge txt="Pendiente" color="#D97706" bg="#FEF3C7"/>}
                  </div>
                  <div style={{fontSize:13,color:"#374151",marginBottom:4}}>🏢 {prov?.nombre?.split(",")[0]||"-"} • 📅 {e.fecha_entrada}</div>
                  {ped?.items?.length > 0 && <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>{ped.items.map((it,j)=><Cod key={j} txt={it.mid||"?"}/>)}</div>}
                  {e.observaciones && <div style={{fontSize:12,color:"#6B7280",marginBottom:6}}>💬 {e.observaciones}</div>}
                  {e.foto_url && <img src={e.foto_url} alt="foto" style={{width:"100%",maxHeight:160,objectFit:"cover",borderRadius:8,marginBottom:6,cursor:"pointer"}} onClick={()=>window.open(e.foto_url)}/>}
                  {esAdmin && (
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"10px"}} onClick={()=>abrirModal(e)}>✏️ Editar</button>
                      <button style={{...S.btn("red"),flex:1,justifyContent:"center",padding:"10px"}} onClick={()=>borrar(e.id)}>🗑 Borrar</button>
                    </div>
                  )}
                </MobileCard>
              );
            })}
          </div>
        ) : (
          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead><tr>{["Pedido","Num. Obra","Maquinas","Fecha entrada","Proveedor","Observaciones","Confirmado","Foto",...(esAdmin?["Acciones"]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {entradas.map(e=>{
                    const prov = provsDB.find(p=>p.id===e.proveedor_id);
                    const numObra = getObra(e.pedido_id);
                    return (
                      <tr key={e.id}>
                        <td style={S.td}><Cod txt={e.pedido_id} bg="#EFF6FF" color="#2563EB"/></td>
                        <td style={S.td}><Cod txt={numObra} bg="#F3F4F6" color="#374151"/></td>
                        <td style={S.td}>
                          {(() => {
                            const ped = pedidos.find(p=>p.id===e.pedido_id);
                            if(!ped||!ped.items||!ped.items.length) return <span style={{color:"#6B7280",fontSize:12}}>-</span>;
                            return <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{ped.items.map((it,j)=><Cod key={j} txt={it.mid||it.cod_prov||"?"}/>)}</div>;
                          })()}
                        </td>
                        <td style={S.td}>{e.fecha_entrada}</td>
                        <td style={S.td}>{prov?.nombre?.split(",")[0]||"-"}</td>
                        <td style={{...S.td,fontSize:12,color:"#6B7280"}}>{e.observaciones||"-"}</td>
                        <td style={S.td}>
                          {e.confirmado
                            ? <Badge txt="Confirmado" color="#16A34A" bg="#DCFCE7"/>
                            : <Badge txt="Pendiente" color="#D97706" bg="#FEF3C7"/>}
                        </td>
                        <td style={S.td}>
                          {e.foto_url
                            ? <img src={e.foto_url} alt="foto" style={{width:50,height:50,objectFit:"cover",borderRadius:6,cursor:"pointer"}} onClick={()=>window.open(e.foto_url)}/>
                            : <span style={{color:"#6B7280",fontSize:12}}>Sin foto</span>}
                        </td>
                        {esAdmin && (
                          <td style={S.td}>
                            <div style={{display:"flex",gap:6}}>
                              <button style={{...S.btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={()=>abrirModal(e)}>Editar</button>
                              <button style={{...S.btn("red"),padding:"4px 10px",fontSize:12}} onClick={()=>borrar(e.id)}>Borrar</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal && (
          <div className="modal-wrap" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:isMobile?0:16}}>
            <div className="modal-inner" style={{background:"#FFFFFF",borderRadius:isMobile?0:14,padding:isMobile?"20px 16px 40px":28,width:"100%",maxWidth:520,maxHeight:isMobile?"100vh":"90vh",overflow:"auto",height:isMobile?"100vh":"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,alignItems:"center"}}>
                <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>{modal==="nuevo"?"📥 Registrar entrada":"Editar entrada"}</h3>
                <button style={{background:"none",border:"none",fontSize:26,cursor:"pointer",color:"#6B7280",padding:"4px 8px"}} onClick={()=>setModal(null)}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Num. Pedido / Albaran</label>
                  <select style={{...S.inp,width:"100%"}} value={editForm.pedido_id} onChange={e=>{
                    const p = pedidos.find(x=>x.id===e.target.value);
                    const prov = provsDB.find(x=>x.id===p?.prov_id);
                    setEditForm(f=>({...f, pedido_id:e.target.value, proveedor_id:prov?.id||f.proveedor_id}));
                  }}>
                    <option value="">Selecciona pedido...</option>
                    {pedidosEnObra.map(p=>{
                      const obra = obrasDB.find(o=>o.numero===p.obra_id);
                      return <option key={p.id} value={p.id}>{p.id} {obra ? "- "+obra.numero : ""}</option>;
                    })}
                  </select>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha entrada real</label>
                  <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={editForm.fecha_entrada} onChange={e=>setEditForm(f=>({...f,fecha_entrada:e.target.value}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                  <select style={{...S.inp,width:"100%"}} value={editForm.proveedor_id} onChange={e=>setEditForm(f=>({...f,proveedor_id:e.target.value}))}>
                    <option value="">Selecciona proveedor...</option>
                    {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Observaciones</label>
                  <textarea style={{...S.inp,width:"100%",boxSizing:"border-box",minHeight:70,resize:"vertical"}} value={editForm.observaciones} onChange={e=>setEditForm(f=>({...f,observaciones:e.target.value}))} placeholder="Notas sobre la entrada..."/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:8}}>📷 Foto (opcional)</label>
                  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                    <button style={{...S.btn("ghost"),padding:"12px 18px"}} onClick={()=>fotoRef.current.click()}>
                      {isMobile ? "📷 Hacer foto / Galería" : "Subir foto"}
                    </button>
                    <input ref={fotoRef} type="file" accept="image/*" capture={isMobile?"environment":undefined} style={{display:"none"}} onChange={handleFoto}/>
                    {fotoPreview && <img src={fotoPreview} alt="preview" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"2px solid #E5E7EB"}}/>}
                  </div>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontSize:15,padding:"16px",background:"#F0FDF4",borderRadius:10,border:"2px solid #16A34A"}}>
                    <input type="checkbox" checked={editForm.confirmado} onChange={e=>setEditForm(f=>({...f,confirmado:e.target.checked}))} style={{width:20,height:20,accentColor:"#16A34A"}}/>
                    <span><strong>Confirmo</strong> que la maquinaria ha llegado a obra</span>
                  </label>
                </div>
              </div>
              {msg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"12px 14px",fontSize:14,marginBottom:14}}>{msg}</div>}
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"14px"}} onClick={()=>setModal(null)}>Cancelar</button>
                <button style={{...S.btn("green"),flex:2,justifyContent:"center",padding:"14px",fontSize:15}} onClick={guardar}>✓ Guardar entrada</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // ── VISTA DEVOLUCION ────────────────────────────────────────────────────────
  const ViewDevolucion = () => {
    const [provsDB, setProvsDB] = useState([]);
    const [obrasDB, setObrasDB] = useState([]);
    const [devoluciones, setDevoluciones] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ pedido_id:"", proveedor_id:"", obra_id:"", maquina_cod:"", fecha_devolucion:new Date().toISOString().split("T")[0], cantidad:1, observaciones:"", foto_url:"", confirmado:false });
    const [msg, setMsg] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const fotoRef = useRef();

    useEffect(() => {
      supabase.from("proveedores").select("*").eq("activo",true).order("nombre").then(({data}) => setProvsDB(data||[]));
      supabase.from("obras").select("*").order("numero").then(({data}) => setObrasDB(data||[]));
      supabase.from("devoluciones").select("*").order("created_at", {ascending:false}).then(({data}) => setDevoluciones(data||[]));
    }, []);

    const handleFoto = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { setFotoPreview(ev.target.result); setForm(f=>({...f,foto_url:ev.target.result})); };
      reader.readAsDataURL(file);
    };

    const guardar = async () => {
      setMsg("");
      if (!form.pedido_id || !form.fecha_devolucion) { setMsg("Albaran y fecha son obligatorios."); return; }
      const nueva = {...form, usuario_id:usuario.id};
      const {data, error} = await supabase.from("devoluciones").insert([nueva]).select().single();
      if (error) { setMsg("Error: " + error.message); return; }
      if (form.confirmado) {
        const prov = provsDB.find(p=>p.id===form.proveedor_id);
        const obra = obrasDB.find(o=>o.id===form.obra_id);
        if (prov?.email) {
          const lineas = [
            "Estimados Sres.,", "",
            "Les comunicamos la devolucion de la siguiente maquinaria:", "",
            "Albaran: " + form.pedido_id,
            "Maquina: " + form.maquina_cod,
            "Cantidad: " + form.cantidad,
            "Obra: " + (obra?.numero||form.obra_id),
            "Fecha devolucion: " + form.fecha_devolucion,
            ...(form.observaciones ? ["", "Observaciones:", form.observaciones] : []),
            "", "Quedamos a su disposicion.", "", "Atentamente,", "BARCINO GRUP"
          ];
          const asunto = encodeURIComponent("Devolucion maquinaria - Albaran " + form.pedido_id);
          const cuerpo = encodeURIComponent(lineas.join("\n"));
          window.open("mailto:" + prov.email + "?subject=" + asunto + "&body=" + cuerpo);
        }
      }
      setDevoluciones(prev => [data, ...prev]);
      setModal(null);
      setForm({ pedido_id:"", proveedor_id:"", obra_id:"", maquina_cod:"", fecha_devolucion:new Date().toISOString().split("T")[0], cantidad:1, observaciones:"", foto_url:"", confirmado:false });
      setFotoPreview("");
    };

    const borrar = async (id) => {
      if (!window.confirm("Borrar esta devolucion?")) return;
      await supabase.from("devoluciones").delete().eq("id", id);
      setDevoluciones(prev => prev.filter(d => d.id !== id));
    };

    const selPedido = (pedidoId) => {
      const p = pedidos.find(x=>x.id===pedidoId);
      if (!p) return;
      const prov = provsDB.find(x=>x.id===p.prov_id);
      const obra = obrasDB.find(o=>o.numero===p.obra_id);
      setForm(f=>({...f, pedido_id:pedidoId, proveedor_id:prov?.id||"", obra_id:obra?.id||"", maquina_cod:p.items?.[0]?.mid||""}));
    };

    return (
      <div>
        {isMobile ? (
          <div style={{marginBottom:16}}>
            {perm("entradas_devoluciones") && (
              <button style={{...S.btn("primary"),width:"100%",justifyContent:"center",padding:"16px",fontSize:16,borderRadius:12,marginBottom:12}} onClick={()=>setModal("nuevo")}>
                ↩️ Registrar devolucion
              </button>
            )}
            <p style={{color:"#6B7280",fontSize:13,margin:0,textAlign:"center"}}>{devoluciones.length} devolucion(es) registrada(s)</p>
          </div>
        ) : (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{color:"#6B7280",fontSize:13,margin:0}}>Registra la devolucion de maquinaria al proveedor.</p>
            {perm("entradas_devoluciones") && <button style={S.btn("primary")} onClick={()=>setModal("nuevo")}>+ Registrar devolucion</button>}
          </div>
        )}

        {devoluciones.length === 0 ? (
          <div style={{...S.card,textAlign:"center",padding:40,color:"#6B7280"}}>No hay devoluciones registradas.</div>
        ) : isMobile ? (
          <div>
            {devoluciones.map(d=>{
              const prov = provsDB.find(p=>p.id===d.proveedor_id);
              const obra = obrasDB.find(o=>o.id===d.obra_id);
              return (
                <MobileCard key={d.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <Cod txt={d.pedido_id} bg="#EFF6FF" color="#2563EB"/>
                      <div style={{fontSize:12,color:"#6B7280",marginTop:4}}>{obra?.numero||"-"}</div>
                    </div>
                    {d.confirmado ? <Badge txt="Confirmado" color="#16A34A" bg="#DCFCE7"/> : <Badge txt="Pendiente" color="#D97706" bg="#FEF3C7"/>}
                  </div>
                  <div style={{fontSize:13,color:"#374151",marginBottom:4}}>
                    🏢 {prov?.nombre?.split(",")[0]||"-"} • <Cod txt={d.maquina_cod||"-"}/> × {d.cantidad}
                  </div>
                  <div style={{fontSize:12,color:"#6B7280",marginBottom:d.foto_url?8:0}}>📅 {d.fecha_devolucion}</div>
                  {d.foto_url && <img src={d.foto_url} alt="foto" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:8,cursor:"pointer"}} onClick={()=>window.open(d.foto_url)}/>}
                  {esAdmin && <button style={{...S.btn("red"),width:"100%",justifyContent:"center",padding:"10px",marginTop:8}} onClick={()=>borrar(d.id)}>🗑 Borrar</button>}
                </MobileCard>
              );
            })}
          </div>
        ) : (
          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead><tr>{["Albaran","Proveedor","Obra","Maquina","Cantidad","Fecha dev.","Confirmado","Foto",...(esAdmin?["Acc."]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {devoluciones.map(d=>{
                    const prov = provsDB.find(p=>p.id===d.proveedor_id);
                    const obra = obrasDB.find(o=>o.id===d.obra_id);
                    return (
                      <tr key={d.id}>
                        <td style={S.td}><Cod txt={d.pedido_id} bg="#EFF6FF" color="#2563EB"/></td>
                        <td style={S.td}>{prov?.nombre?.split(",")[0]||"-"}</td>
                        <td style={S.td}>{obra?.numero||"-"}</td>
                        <td style={S.td}><Cod txt={d.maquina_cod||"-"}/></td>
                        <td style={S.td}>{d.cantidad}</td>
                        <td style={S.td}>{d.fecha_devolucion}</td>
                        <td style={S.td}>{d.confirmado ? <Badge txt="Confirmado" color="#16A34A" bg="#DCFCE7"/> : <Badge txt="Pendiente" color="#D97706" bg="#FEF3C7"/>}</td>
                        <td style={S.td}>{d.foto_url ? <img src={d.foto_url} alt="foto" style={{width:40,height:40,objectFit:"cover",borderRadius:6,cursor:"pointer"}} onClick={()=>window.open(d.foto_url)}/> : <span style={{color:"#6B7280",fontSize:12}}>-</span>}</td>
                        {esAdmin && <td style={S.td}><button style={{...S.btn("red"),padding:"4px 8px",fontSize:12}} onClick={()=>borrar(d.id)}>Borrar</button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal && (
          <div className="modal-wrap" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:isMobile?0:16}}>
            <div className="modal-inner" style={{background:"#FFFFFF",borderRadius:isMobile?0:14,padding:isMobile?"20px 16px 40px":28,width:"100%",maxWidth:540,maxHeight:isMobile?"100vh":"90vh",overflow:"auto",height:isMobile?"100vh":"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,alignItems:"center"}}>
                <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>↩️ Registrar devolucion</h3>
                <button style={{background:"none",border:"none",fontSize:26,cursor:"pointer",color:"#6B7280",padding:"4px 8px"}} onClick={()=>setModal(null)}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Num. Albaran / Pedido</label>
                  <select style={{...S.inp,width:"100%"}} value={form.pedido_id} onChange={e=>selPedido(e.target.value)}>
                    <option value="">Selecciona pedido...</option>
                    {pedidos.filter(p=>p.estado==="en_obra").map(p=><option key={p.id} value={p.id}>{p.id}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                  <select style={{...S.inp,width:"100%"}} value={form.proveedor_id} onChange={e=>setForm(f=>({...f,proveedor_id:e.target.value}))}>
                    <option value="">Selecciona...</option>
                    {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Obra</label>
                  <select style={{...S.inp,width:"100%"}} value={form.obra_id} onChange={e=>setForm(f=>({...f,obra_id:e.target.value}))}>
                    <option value="">Selecciona...</option>
                    {obrasDB.map(o=><option key={o.id} value={o.id}>{o.numero} - {o.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Cod. Maquina</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Ej: BI-110" value={form.maquina_cod} onChange={e=>setForm(f=>({...f,maquina_cod:e.target.value}))}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Cantidad</label>
                  <input type="number" min="1" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.cantidad} onChange={e=>setForm(f=>({...f,cantidad:parseInt(e.target.value)||1}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha devolucion</label>
                  <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.fecha_devolucion} onChange={e=>setForm(f=>({...f,fecha_devolucion:e.target.value}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Observaciones</label>
                  <textarea style={{...S.inp,width:"100%",boxSizing:"border-box",minHeight:60,resize:"vertical"}} value={form.observaciones} onChange={e=>setForm(f=>({...f,observaciones:e.target.value}))} placeholder="Notas sobre la devolucion..."/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:8}}>📷 Foto (opcional)</label>
                  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                    <button style={{...S.btn("ghost"),padding:"12px 18px"}} onClick={()=>fotoRef.current.click()}>
                      {isMobile ? "📷 Hacer foto / Galería" : "Subir foto"}
                    </button>
                    <input ref={fotoRef} type="file" accept="image/*" capture={isMobile?"environment":undefined} style={{display:"none"}} onChange={handleFoto}/>
                    {fotoPreview && <img src={fotoPreview} alt="preview" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"2px solid #E5E7EB"}}/>}
                  </div>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontSize:15,padding:"16px",background:"#F0FDF4",borderRadius:10,border:"2px solid #16A34A"}}>
                    <input type="checkbox" checked={form.confirmado} onChange={e=>setForm(f=>({...f,confirmado:e.target.checked}))} style={{width:20,height:20,accentColor:"#16A34A"}}/>
                    <span><strong>Confirmar devolucion</strong> y enviar correo al proveedor</span>
                  </label>
                </div>
              </div>
              {msg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"12px 14px",fontSize:14,marginBottom:14}}>{msg}</div>}
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"14px"}} onClick={()=>setModal(null)}>Cancelar</button>
                <button style={{...S.btn("green"),flex:2,justifyContent:"center",padding:"14px",fontSize:15}} onClick={guardar}>✓ Guardar devolucion</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── VISTA INCIDENCIAS ────────────────────────────────────────────────────────
  const ViewIncidencias = () => {
    const [provsDB, setProvsDB] = useState([]);
    const [obrasDB, setObrasDB] = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ pedido_id:"", proveedor_id:"", obra_id:"", maquina_cod:"", tipo:"Averia", descripcion:"", foto_url:"", fecha:new Date().toISOString().split("T")[0], enviar_correo:true });
    const [msg, setMsg] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const fotoRef = useRef();

    useEffect(() => {
      supabase.from("proveedores").select("*").eq("activo",true).order("nombre").then(({data}) => setProvsDB(data||[]));
      supabase.from("obras").select("*").order("numero").then(({data}) => setObrasDB(data||[]));
      supabase.from("incidencias").select("*").order("created_at", {ascending:false}).then(({data}) => setIncidencias(data||[]));
    }, []);

    const handleFoto = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { setFotoPreview(ev.target.result); setForm(f=>({...f,foto_url:ev.target.result})); };
      reader.readAsDataURL(file);
    };

    const guardar = async () => {
      setMsg("");
      if (!form.fecha || !form.tipo) { setMsg("Fecha y tipo son obligatorios."); return; }
      const nueva = {...form, usuario_id:usuario.id};
      const {data, error} = await supabase.from("incidencias").insert([nueva]).select().single();
      if (error) { setMsg("Error: " + error.message); return; }
      if (form.enviar_correo) {
        const prov = provsDB.find(p=>p.id===form.proveedor_id);
        const obra = obrasDB.find(o=>o.id===form.obra_id);
        if (prov?.email) {
          const lineas = [
            "Estimados Sres.,", "",
            "Les comunicamos la siguiente incidencia con maquinaria en obra:", "",
            "Tipo: " + form.tipo,
            ...(form.pedido_id ? ["Albaran: " + form.pedido_id] : []),
            ...(form.maquina_cod ? ["Maquina: " + form.maquina_cod] : []),
            ...(obra ? ["Obra: " + obra.numero + " - " + obra.nombre] : []),
            "Fecha: " + form.fecha,
            ...(form.descripcion ? ["", "Descripcion:", form.descripcion] : []),
            "", "Quedamos a su disposicion para resolver la incidencia.", "", "Atentamente,", "BARCINO GRUP"
          ];
          const asunto = encodeURIComponent("Incidencia " + form.tipo + " - " + (form.maquina_cod||"maquinaria") + (form.pedido_id ? " (Albaran " + form.pedido_id + ")" : ""));
          const cuerpo = encodeURIComponent(lineas.join("\n"));
          window.open("mailto:" + prov.email + "?subject=" + asunto + "&body=" + cuerpo);
        }
      }
      setIncidencias(prev => [data, ...prev]);
      setModal(null);
      setForm({ pedido_id:"", proveedor_id:"", obra_id:"", maquina_cod:"", tipo:"Averia", descripcion:"", foto_url:"", fecha:new Date().toISOString().split("T")[0], enviar_correo:true });
      setFotoPreview("");
    };

    const borrar = async (id) => {
      if (!window.confirm("Borrar esta incidencia?")) return;
      await supabase.from("incidencias").delete().eq("id", id);
      setIncidencias(prev => prev.filter(i => i.id !== id));
    };

    const TIPOS = ["Averia","Robo","Perdida","Dano"];
    const TIPO_COLORS = {"Averia":["#D97706","#FEF3C7"],"Robo":["#DC2626","#FEE2E2"],"Perdida":["#7C3AED","#EDE9FE"],"Dano":["#0369A1","#E0F2FE"]};

    return (
      <div>
        {isMobile ? (
          <div style={{marginBottom:16}}>
            <button style={{...S.btn("primary"),width:"100%",justifyContent:"center",padding:"16px",fontSize:16,borderRadius:12,marginBottom:12}} onClick={()=>setModal("nuevo")}>
              ⚠️ Nueva incidencia
            </button>
            <p style={{color:"#6B7280",fontSize:13,margin:0,textAlign:"center"}}>{incidencias.length} incidencia(s) registrada(s)</p>
          </div>
        ) : (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{color:"#6B7280",fontSize:13,margin:0}}>Registra averias, robos, perdidas o danos de maquinaria.</p>
            <button style={S.btn("primary")} onClick={()=>setModal("nuevo")}>+ Nueva incidencia</button>
          </div>
        )}

        {incidencias.length === 0 ? (
          <div style={{...S.card,textAlign:"center",padding:40,color:"#6B7280"}}>No hay incidencias registradas.</div>
        ) : isMobile ? (
          <div>
            {incidencias.map(inc=>{
              const prov = provsDB.find(p=>p.id===inc.proveedor_id);
              const obra = obrasDB.find(o=>o.id===inc.obra_id);
              const [c,bg] = TIPO_COLORS[inc.tipo]||["#6B7280","#F3F4F6"];
              return (
                <MobileCard key={inc.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <Badge txt={inc.tipo} color={c} bg={bg}/>
                      {inc.pedido_id && <span style={{marginLeft:8}}><Cod txt={inc.pedido_id} bg="#EFF6FF" color="#2563EB"/></span>}
                    </div>
                    <div style={{fontSize:12,color:"#6B7280"}}>{inc.fecha}</div>
                  </div>
                  <div style={{fontSize:13,color:"#374151",marginBottom:4}}>
                    🏢 {prov?.nombre?.split(",")[0]||"-"} • 🏗 {obra?.numero||"-"}
                  </div>
                  {inc.maquina_cod && <div style={{marginBottom:4}}><Cod txt={inc.maquina_cod}/></div>}
                  {inc.descripcion && <div style={{fontSize:13,color:"#6B7280",marginBottom:6}}>💬 {inc.descripcion}</div>}
                  {inc.foto_url && <img src={inc.foto_url} alt="foto" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:8,cursor:"pointer",marginBottom:6}} onClick={()=>window.open(inc.foto_url)}/>}
                  {esAdmin && <button style={{...S.btn("red"),width:"100%",justifyContent:"center",padding:"10px",marginTop:6}} onClick={()=>borrar(inc.id)}>🗑 Borrar</button>}
                </MobileCard>
              );
            })}
          </div>
        ) : (
          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead><tr>{["Albaran","Tipo","Proveedor","Obra","Maquina","Descripcion","Fecha","Foto",...(esAdmin?["Acc."]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {incidencias.map(inc=>{
                    const prov = provsDB.find(p=>p.id===inc.proveedor_id);
                    const obra = obrasDB.find(o=>o.id===inc.obra_id);
                    const [c,bg] = TIPO_COLORS[inc.tipo]||["#6B7280","#F3F4F6"];
                    return (
                      <tr key={inc.id}>
                        <td style={S.td}><Cod txt={inc.pedido_id||"-"} bg="#EFF6FF" color="#2563EB"/></td>
                        <td style={S.td}><Badge txt={inc.tipo} color={c} bg={bg}/></td>
                        <td style={S.td}>{prov?.nombre?.split(",")[0]||"-"}</td>
                        <td style={S.td}>{obra?.numero||"-"}</td>
                        <td style={S.td}><Cod txt={inc.maquina_cod||"-"}/></td>
                        <td style={{...S.td,fontSize:12,color:"#6B7280",maxWidth:200}}>{inc.descripcion||"-"}</td>
                        <td style={S.td}>{inc.fecha}</td>
                        <td style={S.td}>{inc.foto_url ? <img src={inc.foto_url} alt="foto" style={{width:40,height:40,objectFit:"cover",borderRadius:6,cursor:"pointer"}} onClick={()=>window.open(inc.foto_url)}/> : <span style={{color:"#6B7280",fontSize:12}}>-</span>}</td>
                        {esAdmin && <td style={S.td}><button style={{...S.btn("red"),padding:"4px 8px",fontSize:12}} onClick={()=>borrar(inc.id)}>Borrar</button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal && (
          <div className="modal-wrap" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:isMobile?0:16}}>
            <div className="modal-inner" style={{background:"#FFFFFF",borderRadius:isMobile?0:14,padding:isMobile?"20px 16px 40px":28,width:"100%",maxWidth:540,maxHeight:isMobile?"100vh":"90vh",overflow:"auto",height:isMobile?"100vh":"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,alignItems:"center"}}>
                <h3 style={{margin:0,fontSize:17,fontWeight:800,color:"#0F1E2E"}}>⚠️ Nueva incidencia</h3>
                <button style={{background:"none",border:"none",fontSize:26,cursor:"pointer",color:"#6B7280",padding:"4px 8px"}} onClick={()=>setModal(null)}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Albaran / Pedido</label>
                  <select style={{...S.inp,width:"100%"}} value={form.pedido_id} onChange={e=>{
                    const p = pedidos.find(x=>x.id===e.target.value);
                    const prov = provsDB.find(x=>x.id===p?.prov_id);
                    const obra = obrasDB.find(o=>o.numero===p?.obra_id);
                    setForm(f=>({...f,pedido_id:e.target.value,proveedor_id:prov?.id||"",obra_id:obra?.id||"",maquina_cod:p?.items?.[0]?.mid||""}));
                  }}>
                    <option value="">Selecciona pedido...</option>
                    {pedidos.map(p=><option key={p.id} value={p.id}>{p.id}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Tipo incidencia</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {TIPOS.map(t=>{
                      const [tc,tbg] = TIPO_COLORS[t]||["#6B7280","#F3F4F6"];
                      return (
                        <button key={t} onClick={()=>setForm(f=>({...f,tipo:t}))} style={{
                          padding:"10px 16px",borderRadius:8,border:"2px solid "+(form.tipo===t?tc:"#E5E7EB"),
                          background:form.tipo===t?tbg:"#FFF",color:form.tipo===t?tc:"#6B7280",
                          fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"
                        }}>{t}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Proveedor</label>
                  <select style={{...S.inp,width:"100%"}} value={form.proveedor_id} onChange={e=>setForm(f=>({...f,proveedor_id:e.target.value}))}>
                    <option value="">Selecciona...</option>
                    {provsDB.map(p=><option key={p.id} value={p.id}>{p.nombre.split(",")[0]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Obra</label>
                  <select style={{...S.inp,width:"100%"}} value={form.obra_id} onChange={e=>setForm(f=>({...f,obra_id:e.target.value}))}>
                    <option value="">Selecciona...</option>
                    {obrasDB.map(o=><option key={o.id} value={o.id}>{o.numero} - {o.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Cod. Maquina</label>
                  <input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="Ej: BI-110" value={form.maquina_cod} onChange={e=>setForm(f=>({...f,maquina_cod:e.target.value}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Fecha</label>
                  <input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:4}}>Descripcion</label>
                  <textarea style={{...S.inp,width:"100%",boxSizing:"border-box",minHeight:70,resize:"vertical"}} value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Describe la incidencia..."/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:"#6B7280",marginBottom:8}}>📷 Foto (opcional)</label>
                  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                    <button style={{...S.btn("ghost"),padding:"12px 18px"}} onClick={()=>fotoRef.current.click()}>
                      {isMobile ? "📷 Hacer foto / Galería" : "Subir foto"}
                    </button>
                    <input ref={fotoRef} type="file" accept="image/*" capture={isMobile?"environment":undefined} style={{display:"none"}} onChange={handleFoto}/>
                    {fotoPreview && <img src={fotoPreview} alt="preview" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:"2px solid #E5E7EB"}}/>}
                  </div>
                </div>
              </div>
              {msg && <div style={{background:"#FEE2E2",color:"#DC2626",borderRadius:7,padding:"12px 14px",fontSize:14,marginBottom:14}}>{msg}</div>}
              <div style={{marginBottom:12}}>
                <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontSize:15,padding:"16px",background:"#FEF3C7",borderRadius:10,border:"2px solid #F59E0B"}}>
                  <input type="checkbox" checked={form.enviar_correo} onChange={e=>setForm(f=>({...f,enviar_correo:e.target.checked}))} style={{width:20,height:20,accentColor:"#F59E0B"}}/>
                  <span><strong>Notificar al proveedor</strong> por correo al guardar</span>
                </label>
              </div>
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button style={{...S.btn("ghost"),flex:1,justifyContent:"center",padding:"14px"}} onClick={()=>setModal(null)}>Cancelar</button>
                <button style={{...S.btn("primary"),flex:2,justifyContent:"center",padding:"14px",fontSize:15}} onClick={guardar}>✓ Guardar incidencia</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // ── VISTA POR PROVEEDOR ─────────────────────────────────────────────────────
  const ViewPorProveedor = () => {
    const [provsDB, setProvsDB] = useState([]);
    const [catDB, setCatDB] = useState([]);
    const [selProv, setSelProv] = useState(null);
    useEffect(() => {
      Promise.all([
        supabase.from("proveedores").select("*").eq("activo",true).order("nombre"),
        supabase.from("catalogo").select("*").order("tipo")
      ]).then(([{data:provs},{data:cat}]) => {
        setProvsDB(provs||[]);
        setCatDB(cat||[]);
        if(provs&&provs[0]) setSelProv(provs[0].id);
      });
    }, []);
    const maqProv = catDB.filter(m=>m.proveedor_id===selProv);
    const tipos = [...new Set(maqProv.map(m=>m.tipo).filter(Boolean))];
    return (
      <div>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {provsDB.map(p=>(
            <button key={p.id} style={{...S.btn(selProv===p.id?"navy":"ghost"),padding:"8px 16px"}} onClick={()=>setSelProv(p.id)}>
              {p.nombre.split(",")[0]}
            </button>
          ))}
        </div>
        {maqProv.length === 0 && selProv && (
          <div style={{...S.card,textAlign:"center",padding:40,color:"#6B7280"}}>
            Este proveedor no tiene productos asignados en el catalogo.
          </div>
        )}
        {tipos.map(tipo=>(
          <div key={tipo} style={{marginBottom:24}}>
            <p style={{margin:"0 0 10px",fontSize:11,fontWeight:800,color:"#0F1E2E",textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:"2px solid #F59E0B",paddingBottom:4,display:"inline-block"}}>{tipo}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))",gap:10}}>
              {maqProv.filter(m=>m.tipo===tipo).map(m=>(
                <div key={m.id} style={{...S.card,margin:0,padding:14,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <Cod txt={m.cod_prov}/>
                    <span style={{fontSize:14,fontWeight:800,color:"#0D9488"}}>{fmt(m.precio_dia)}/d</span>
                  </div>
                  <p style={{margin:0,fontSize:13,fontWeight:600,color:"#0F1E2E",lineHeight:1.3}}>{m.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── VISTA GESTION ───────────────────────────────────────────────────────────
  const ViewGestion = () => (
    <div>
      <PanelUsuarios usuarioActual={usuario}/>
      <PanelObras usuario={usuario} esAdmin={esAdmin}/>
    </div>
  );

  const VIEWS = {
    proveedores: ViewProveedores,
    catalogo: ViewCatalogo,
    ofertas: ViewOfertas,
    pedidos: ViewPedidos,
    entrada: ViewEntrada,
    devolucion: ViewDevolucion,
    incidencias: ViewIncidencias,
    gestion: ViewGestion,
  };

  const ActiveView = VIEWS[tab] || ViewPedidos;
  const tabLabel = NAV.find(n=>n.id===tab)?.label;

  // Icons for mobile nav
  const NAV_ICONS = {
    proveedores:"🏢", catalogo:"📦", ofertas:"📋", pedidos:"📄",
    entrada:"📥", devolucion:"↩️", incidencias:"⚠️", gestion:"⚙️"
  };

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#F4F5F7",overflow:"hidden",flexDirection: isMobile ? "column" : "row"}}>

      {/* ── SIDEBAR (solo desktop) ── */}
      {!isMobile && (
        <div style={{width:sideOpen?230:60,minWidth:sideOpen?230:60,background:"#0F1E2E",display:"flex",flexDirection:"column",transition:"width 0.2s",overflow:"hidden",flexShrink:0}}>
          <div style={{padding:"14px 12px",borderBottom:"1px solid #243D55",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSideOpen(o=>!o)}>
            <img src="/logo.png" alt="ProObras" style={{width:32,height:32,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
            {sideOpen && <div><p style={{margin:0,fontWeight:800,fontSize:14,color:"#FFF"}}>ProObras</p><p style={{margin:0,fontSize:10,color:"#7A8DA0"}}>Gestion de alquiler</p></div>}
          </div>
          {sideOpen && (
            <div style={{padding:"8px 10px",borderBottom:"1px solid #243D55",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[[stats.totalItems,"Maquinas","#2563EB"],[fmt(stats.costoDia),"Euros/dia","#0D9488"],[stats.masde30,"+30 dias",stats.masde30>0?"#DC2626":"#16A34A"],[stats.ofPend,"Ofertas pend.",stats.ofPend>0?"#F59E0B":"#6B7280"]].map(([v,l,c])=>(
                <div key={l} style={{background:"#1A3148",borderRadius:6,padding:"7px 9px"}}>
                  <p style={{margin:"0 0 1px",fontSize:10,color:"#7A8DA0"}}>{l}</p>
                  <p style={{margin:0,fontSize:16,fontWeight:800,color:c}}>{v}</p>
                </div>
              ))}
            </div>
          )}
          <nav style={{flex:1,padding:"6px 0",overflowY:"auto"}}>
            {NAV.map(item=>(
              <div key={item.id} onClick={()=>{setTab(item.id);setBusq("");setProvFil("todos");}}
                style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",margin:"1px 8px",borderRadius:6,
                  background:tab===item.id?"rgba(245,158,11,0.12)":"transparent",
                  color:tab===item.id?"#F59E0B":"#9BA8BA",
                  fontWeight:tab===item.id?700:400,fontSize:13}}>
                <span style={{fontSize:16,flexShrink:0}}>{NAV_ICONS[item.id]||item.icon}</span>
                {sideOpen && <><span style={{flex:1}}>{item.label}</span>{item.badge>0&&<span style={{background:"#DC2626",color:"#FFF",borderRadius:10,fontSize:10,fontWeight:800,padding:"1px 6px"}}>{item.badge}</span>}</>}
              </div>
            ))}
          </nav>
          {sideOpen && (
            <div style={{padding:"10px 14px",borderTop:"1px solid #243D55"}}>
              <div style={{fontSize:11,color:"#7A8DA0",marginBottom:8}}>
                <span>{usuario.rol==="admin"?"Admin":"Usuario"}: {usuario.nombre}</span>
                {usuario.rol==="admin" && <span style={{marginLeft:6,background:"#F59E0B",color:"#0F1E2E",fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:10}}>ADMIN</span>}
              </div>
              <button style={{...S.btn("ghost"),width:"100%",justifyContent:"center",fontSize:11,padding:"6px 10px"}} onClick={() => setUsuario(null)}>Cerrar sesion</button>
              <div style={{fontSize:10,color:"#4A5E72",lineHeight:1.8,marginTop:8}}>Cliente: BARCINO GRUP</div>
            </div>
          )}
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minHeight:0}}>
        {/* Header */}
        <div style={{background:"#FFFFFF",borderBottom:"1px solid #E5E7EB",padding: isMobile ? "12px 16px" : "13px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,gap:8}}>
          {isMobile && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <img src="/logo.png" alt="ProObras" style={{width:28,height:28,borderRadius:6,objectFit:"cover"}}/>
            </div>
          )}
          <h2 style={{margin:0,fontSize: isMobile ? 15 : 17,fontWeight:800,color:"#0F1E2E",flex:1}}>{tabLabel}</h2>
          {isMobile ? (
            <button style={{background:"none",border:"1px solid #E5E7EB",borderRadius:7,padding:"6px 10px",fontSize:11,color:"#6B7280",cursor:"pointer",fontFamily:"inherit"}} onClick={() => setUsuario(null)}>Salir</button>
          ) : (
            <span style={{fontSize:12,color:"#6B7280"}}>{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
          )}
        </div>

        {/* Vista activa */}
        <div style={{padding: isMobile ? "12px 12px 80px" : 24, flex:1}}><ActiveView/></div>
      </div>

      {/* ── BOTTOM NAV (solo móvil) ── */}
      {isMobile && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0F1E2E",borderTop:"1px solid #243D55",display:"flex",zIndex:50,height:60}}>
          {NAV.slice(0, 5).map(item => (
            <div key={item.id}
              onClick={()=>{setTab(item.id);setBusq("");setProvFil("todos");}}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",
                color: tab===item.id ? "#F59E0B" : "#7A8DA0",
                background: tab===item.id ? "rgba(245,158,11,0.08)" : "transparent",
                borderTop: tab===item.id ? "2px solid #F59E0B" : "2px solid transparent",
                fontSize:9,fontWeight:tab===item.id?700:400,transition:"all 0.15s",position:"relative"}}>
              <span style={{fontSize:18,lineHeight:1}}>{NAV_ICONS[item.id]||item.icon}</span>
              <span style={{fontSize:9,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:56,textAlign:"center"}}>{item.label}</span>
              {item.badge>0 && <span style={{position:"absolute",top:6,right:"calc(50% - 18px)",background:"#DC2626",color:"#FFF",borderRadius:8,fontSize:9,fontWeight:800,padding:"0 4px",minWidth:14,textAlign:"center"}}>{item.badge}</span>}
            </div>
          ))}
          {/* Botón "Más" para el resto */}
          {NAV.length > 5 && (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",
              color: NAV.slice(5).some(n=>n.id===tab) ? "#F59E0B" : "#7A8DA0",
              borderTop: NAV.slice(5).some(n=>n.id===tab) ? "2px solid #F59E0B" : "2px solid transparent",
              fontSize:9,fontWeight:400,position:"relative"}}
              onClick={()=>{
                const next = NAV.slice(5).find(n=>n.id!==tab) || NAV[5];
                setTab(next.id); setBusq(""); setProvFil("todos");
              }}>
              <span style={{fontSize:18,lineHeight:1}}>☰</span>
              <span style={{fontSize:9}}>Más</span>
            </div>
          )}
        </div>
      )}

      {modal?.tipo==="detalle" && (() => {
        const p = modal.datos;
        const est = ESTADO_P[p.estado]||ESTADO_P.borrador;
        const d = diasDesde(p.fecha);
        const obra = OBRAS_STATIC.find(o=>o.id===p.obra_id);
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:isMobile?"flex-start":"center",justifyContent:"center",zIndex:100,padding:isMobile?0:16}} onClick={()=>setModal(null)}>
            <div style={{background:"#FFFFFF",borderRadius:isMobile?0:14,padding:isMobile?"20px 16px 40px":24,width:"100%",maxWidth:560,maxHeight:isMobile?"100vh":"90vh",overflow:"auto",height:isMobile?"100vh":"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                <div><p style={{margin:"0 0 6px",fontWeight:800,fontSize:20,color:"#0F1E2E"}}>{p.id}</p><Badge txt={est.l} color={est.c} bg={est.bg}/></div>
                <button style={{background:"none",border:"none",fontSize:26,cursor:"pointer",color:"#6B7280",padding:"4px 8px"}} onClick={()=>setModal(null)}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16,fontSize:14}}>
                {[["Obra",obra?.nombre||p.obra_id],["Fecha entrada",p.fecha],["Dias en obra",d+" dias"]].map(([l,v])=>(
                  <div key={l} style={{gridColumn:l==="Obra"?"1/-1":"auto",background:"#F8FAFC",borderRadius:8,padding:"10px 12px"}}>
                    <p style={{margin:"0 0 2px",fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase"}}>{l}</p>
                    <p style={{margin:0,fontWeight:700,color:"#0F1E2E"}}>{v}</p>
                  </div>
                ))}
              </div>
              <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.05em"}}>Maquinaria</p>
              {isMobile ? (
                <div>
                  {p.items.map((it,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",background:"#F8FAFC",borderRadius:8,marginBottom:8}}>
                      <Cod txt={it.mid}/>
                      <Cod txt={it.ci} bg="#F3F4F6" color="#374151"/>
                    </div>
                  ))}
                </div>
              ) : (
              <table style={S.table}>
                <thead><tr>{["Cod.","Cod.Interno"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {p.items.map((it,i)=>(
                    <tr key={i}>
                      <td style={S.td}><Cod txt={it.mid}/></td>
                      <td style={S.td}><Cod txt={it.ci} bg="#F3F4F6" color="#374151"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
              {isMobile && <button style={{...S.btn("ghost"),width:"100%",justifyContent:"center",padding:"14px",marginTop:20}} onClick={()=>setModal(null)}>Cerrar</button>}
            </div>
          </div>
        );
      })()}

      {modal?.tipo==="import_proveedores" && (
        <ModalImportProveedores
          onClose={() => setModal(null)}
          onImport={async (rows) => {
            const inserts = rows.map(r => ({ codigo:r.codigo, nombre:r.nombre, contacto:r.contacto||"", tel:r.tel||r.telefono||"", movil:r.movil||"", email:r.email||"", comentarios:r.comentarios||"", activo:r.activo?.toLowerCase()!=="no" }));
            await supabase.from("proveedores").insert(inserts);
            setModal(null);
          }}
        />
      )}

      {modal?.tipo==="import_catalogo" && (
        <ModalImportCatalogo
          onClose={() => setModal(null)}
          onImport={async (rows) => {
            const inserts = rows.map(r => ({ cod_prov:r.cod_prov, descripcion:r.descripcion, tipo:r.tipo||"", precio_dia:parseFloat(r.precio_dia)||0, comentarios:"" }));
            await supabase.from("catalogo").insert(inserts);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
