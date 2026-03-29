import { useState, useEffect, useRef } from "react";

const STAGES = [
  { id: "interviewing", label: "面试中", color: "#F59E0B", emoji: "🎯" },
  { id: "offer", label: "已拿Offer", color: "#10B981", emoji: "🎉" },
  { id: "ended", label: "已结束", color: "#64748B", emoji: "📁" },
];

const PREP_LEVELS = [
  { value: 0, label: "未开始", color: "#9CA3AF" },
  { value: 1, label: "了解JD", color: "#F59E0B" },
  { value: 2, label: "已准备", color: "#3B82F6" },
  { value: 3, label: "充分准备", color: "#10B981" },
];

const SAMPLE_DATA = [
  {
    "id": "s1",
    "company": "Acme AI",
    "position": "AI Product Manager",
    "stage": "interviewing",
    "prepLevel": 2,
    "folderName": "acme",
    "rounds": [
      { "name": "Phone Screen", "date": "2026-03-10", "time": "11:30", "status": "done", "emailLink": "" },
      { "name": "Technical Interview", "date": "2026-03-17", "time": "11:00", "status": "done", "emailLink": "" },
      { "name": "Final Round", "date": "2026-03-24", "time": "14:00", "status": "scheduled", "emailLink": "" }
    ],
    "jd": "We're looking for an AI Product Manager to lead our LLM platform product line. You'll work closely with engineering to ship AI-powered features and drive product strategy.",
    "notes": "Prepare questions about team structure",
    "createdAt": 1773862932307
  },
  {
    "id": "s2",
    "company": "TechCorp",
    "position": "Senior Product Manager",
    "stage": "offer",
    "prepLevel": 3,
    "folderName": "techcorp",
    "rounds": [
      { "name": "HR Screen", "date": "2026-03-05", "time": "10:00", "status": "done", "emailLink": "" },
      { "name": "Hiring Manager", "date": "2026-03-12", "time": "14:00", "status": "done", "emailLink": "" },
      { "name": "Team Interview", "date": "2026-03-19", "time": "11:00", "status": "done", "emailLink": "" }
    ],
    "jd": "Lead product strategy for our developer tools platform. 3+ years of PM experience required.",
    "notes": "Offer received, negotiating compensation",
    "createdAt": 1773862932307
  },
  {
    "company": "StartupXYZ",
    "position": "Product Lead",
    "stage": "ended",
    "prepLevel": 1,
    "folderName": "startupxyz",
    "rounds": [
      { "name": "Intro Call", "date": "2026-03-08", "time": "15:00", "status": "done", "emailLink": "" },
      { "name": "Case Study", "date": "2026-03-15", "time": "13:00", "status": "done", "emailLink": "" }
    ],
    "jd": "Early-stage AI startup looking for a product lead to define and ship our core product.",
    "notes": "Position filled internally",
    "id": "mmwgsh6mmyp5g",
    "createdAt": 1773863941630
  }
];

function gid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

// Beijing (UTC+8) → LA local time
function toLocal(dateStr, timeStr) {
  if (!dateStr || !timeStr) return { date: dateStr, time: timeStr };
  try {
    const d = new Date(`${dateStr}T${timeStr}:00+08:00`);
    return {
      date: d.toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" }),
      time: d.toLocaleTimeString("en-GB", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: false }),
    };
  } catch { return { date: dateStr, time: timeStr }; }
}

function fmtTime(dateStr, timeStr, local) {
  if (!local) return { date: dateStr, time: timeStr };
  return toLocal(dateStr, timeStr);
}

const DL = "~/Downloads";

let _drag = null;

export default function App({ user, token, onLogout }) {
  const [items, setItems] = useState([]);
  const [ok, setOk] = useState(false);
  const [edit, setEdit] = useState(null);
  const [add, setAdd] = useState(false);
  const [q, setQ] = useState("");
  const [hover, setHover] = useState(null);
  const [local, setLocal] = useState(false);
  const [page, setPage] = useState("board"); // board | prep | book
  const [showData, setShowData] = useState(false);
  const fileRef = useRef(null);
  const saveTimer = useRef(null);

  // Load items from API (or fall back to localStorage for offline/no-auth)
  useEffect(() => {
    if (token) {
      fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (d.items && d.items.length > 0) {
            setItems(d.items);
          } else {
            // New user: start with empty data
            setItems([]);
          }
        })
        .catch(() => { setItems([]); })
        .finally(() => setOk(true));
    } else {
      try {
        const r = localStorage.getItem("iv-v4");
        if (r) setItems(JSON.parse(r));
        else setItems(SAMPLE_DATA);
      } catch { setItems(SAMPLE_DATA); }
      setOk(true);
    }
  }, [token]);

  // Debounced save to API (and localStorage only if not logged in)
  useEffect(() => {
    if (!ok) return;
    if (!token) { try { localStorage.setItem("iv-v4", JSON.stringify(items)); } catch {} }
    if (token) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items }),
        }).catch(() => {});
      }, 1500);
    }
  }, [items, ok, token]);

  const ins = (d) => { setItems((p) => [...p, { ...d, id: gid(), createdAt: Date.now() }]); setAdd(false); };
  const upd = (id, d) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...d } : i)));
  const del = (id) => { if (confirm("确定删除？")) { setItems((p) => p.filter((i) => i.id !== id)); setEdit(null); } };
  const mv = (id, s) => upd(id, { stage: s });
  const [showExport, setShowExport] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const exportJSON = () => JSON.stringify(items, null, 2);

  const handleExportCopy = () => {
    navigator.clipboard.writeText(exportJSON()).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    });
  };

  const handleExportDownload = () => {
    try {
      const json = exportJSON();
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
      const a = document.createElement("a");
      a.href = dataUri;
      a.download = `interview-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch { alert("下载失败，请使用复制功能"); }
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          if (confirm(`将导入 ${data.length} 条面试记录，是否覆盖当前数据？\n（取消 = 合并追加）`)) {
            setItems(data);
          } else {
            const existIds = new Set(items.map((i) => i.id));
            const newItems = data.filter((d) => !existIds.has(d.id));
            setItems((p) => [...p, ...newItems]);
          }
        } else {
          alert("文件格式错误：需要 JSON 数组");
        }
      } catch { alert("JSON 解析失败，请检查文件内容"); }
      e.target.value = "";
      setShowData(false);
    };
    reader.readAsText(file);
  };

  const fl = items.filter((i) => i.company.toLowerCase().includes(q.toLowerCase()) || i.position.toLowerCase().includes(q.toLowerCase()));

  const soon = items
    .flatMap((i) => (i.rounds || []).filter((r) => r.status === "scheduled" && r.date).map((r) => ({ ...r, co: i.company, iid: i.id })))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (!ok) return <div style={S.ld}><div style={S.sp} /></div>;

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes si{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        .crd:hover{border-color:#475569!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.35)}
        .lb:hover{background:rgba(96,165,250,.18)!important}
        .drop-item:hover{background:#334155!important}
        input:focus,select:focus,textarea:focus{border-color:#3B82F6!important}
      `}</style>

      <header style={S.hd}>
        <div style={S.hl}>
          <h1 style={S.t}>🎯 面试追踪</h1>
          <div style={S.pageTabs}>
            <button style={{ ...S.pageTab, ...(page === "board" ? S.pageTabAct : {}) }} onClick={() => setPage("board")}>看板</button>
            <button style={{ ...S.pageTab, ...(page === "prep" ? S.pageTabAct : {}) }} onClick={() => setPage("prep")}>Mock 准备</button>
            <button style={{ ...S.pageTab, ...(page === "book" ? S.pageTabAct : {}) }} onClick={() => setPage("book")}>约面</button>
            <button style={{ ...S.pageTab, ...(page === "funnel" ? S.pageTabAct : {}) }} onClick={() => setPage("funnel")}>漏斗</button>
          </div>
          <span style={S.cnt}>{items.filter((i) => i.stage === "interviewing").length} 进行中</span>
        </div>
        <div style={S.hr}>
          <div style={S.sb}><span style={S.si}>⌕</span><input style={S.sin} placeholder="搜索..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button style={{ ...S.tzBtn, ...(local ? S.tzOn : {}) }} onClick={() => setLocal((v) => !v)}>
            🕐 {local ? "本地时间" : "北京时间"}
          </button>
          <div style={{ position: "relative" }}>
            <button style={S.dataBtn} onClick={() => setShowData((v) => !v)} title="数据管理">⚙️</button>
            {showData && (
              <>
                <div style={S.dropBg} onClick={() => setShowData(false)} />
                <div style={S.dropMenu}>
                  <div style={S.dropTitle}>数据管理</div>
                  <button className="drop-item" style={S.dropItem} onClick={() => { setShowData(false); setShowExport(true); }}>
                    <span>📥 导出 JSON</span>
                    <span style={S.dropHint}>{items.length} 条记录</span>
                  </button>
                  <button className="drop-item" style={S.dropItem} onClick={() => fileRef.current?.click()}>
                    <span>📤 导入 JSON</span>
                    <span style={S.dropHint}>覆盖或合并</span>
                  </button>
                  <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={importData} />
                  <button className="drop-item" style={{ ...S.dropItem, color: "#EF4444" }} onClick={() => { if (confirm("确定清空所有面试数据？此操作不可恢复！")) { setItems([]); setShowData(false); } }}>
                    <span>🗑 清空数据</span>
                    <span style={S.dropHint}>不可恢复</span>
                  </button>
                  <div style={S.dropNote}>导出会下载包含所有面试数据的 JSON 文件，可用于备份和迁移</div>
                </div>
              </>
            )}
          </div>
          <button style={S.ab} onClick={() => setAdd(true)}>＋ 新增</button>
          {user && (
            <div style={S.userWrap}>
              {user.avatar_url && <img src={user.avatar_url} style={S.avatar} referrerPolicy="no-referrer" />}
              <span style={S.userName}>{user.name}</span>
              <button style={S.logoutBtn} onClick={onLogout} title="退出登录">退出</button>
            </div>
          )}
        </div>
      </header>

      {page === "board" && <>
      {soon.length > 0 && (
        <div style={S.ub}>
          <span style={S.ul}>⏰ 即将面试</span>
          <div style={S.ucs}>{soon.map((u, i) => {
            const t = fmtTime(u.date, u.time, local);
            return (
              <span key={i} style={S.uc} onClick={() => setEdit(u.iid)}><b>{u.co}</b> · {u.name} · {t.date} {t.time}</span>
            );
          })}</div>
        </div>
      )}

      <div style={S.bd}>
        {STAGES.map((st) => {
          const cs = fl.filter((i) => i.stage === st.id);
          return (
            <div key={st.id} style={{ ...S.cl, ...(hover === st.id ? S.clo : {}) }}
              onDragOver={(e) => { e.preventDefault(); setHover(st.id); }}
              onDragLeave={() => setHover(null)}
              onDrop={() => { if (_drag) mv(_drag, st.id); _drag = null; setHover(null); }}
            >
              <div style={S.ch}>
                <span style={{ ...S.dt, background: st.color }} />
                <span style={S.cn}>{st.emoji} {st.label}</span>
                <span style={S.cc}>{cs.length}</span>
              </div>
              <div style={S.cls}>
                {cs.map((it) => <Card key={it.id} it={it} local={local} onEdit={() => setEdit(it.id)} />)}
                {cs.length === 0 && <div style={S.emp}>拖拽卡片到这里</div>}
              </div>
            </div>
          );
        })}
      </div>
      </>}

      {page === "prep" && <PrepView items={items} local={local} />}
      {page === "book" && <BookingView items={items} token={token} userId={user?.id} userSlug={user?.slug} />}
      {page === "funnel" && <FunnelView items={items} />}

      {add && <AddM onClose={() => setAdd(false)} onSave={ins} />}
      {edit && <EditM item={items.find((i) => i.id === edit)} local={local} onClose={() => setEdit(null)} onSave={(d) => { upd(edit, d); setEdit(null); }} onDel={() => del(edit)} />}

      {showExport && (
        <Ov onClose={() => setShowExport(false)} wide>
          <h2 style={S.mt}>📥 导出数据</h2>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 14px" }}>
            共 {items.length} 条面试记录。复制下方 JSON 或下载为文件。
          </p>
          <div style={S.exportBtns}>
            <button style={S.copyBtnLg} onClick={handleExportCopy}>
              {exportCopied ? "✓ 已复制到剪贴板" : "📋 复制 JSON"}
            </button>
            <button style={S.dlBtnLg} onClick={handleExportDownload}>
              💾 下载 .json 文件
            </button>
          </div>
          <textarea
            readOnly
            style={S.exportBox}
            rows={12}
            value={exportJSON()}
            onClick={(e) => e.target.select()}
          />
          <div style={S.ma}>
            <button style={S.cb} onClick={() => setShowExport(false)}>关闭</button>
          </div>
        </Ov>
      )}
    </div>
  );
}

function Card({ it, local, onEdit }) {
  const nr = (it.rounds || []).find((r) => r.status === "scheduled");
  const pr = PREP_LEVELS[it.prepLevel || 0];
  const tot = (it.rounds || []).length;
  const dn = (it.rounds || []).filter((r) => r.status === "done").length;
  const nrt = nr ? fmtTime(nr.date, nr.time, local) : null;

  const folderHref = it.folderName ? `vscode://file${encodeURI(`/Users/fanyi/Downloads/${it.folderName}`)}` : null;

  return (
    <div className="crd" style={S.card} draggable onDragStart={() => { _drag = it.id; }} onClick={onEdit}>
      <div style={S.r1}>
        <span style={S.co}>{it.company}</span>
        <span style={{ ...S.pl, background: pr.color + "20", color: pr.color }}>{pr.label}</span>
      </div>
      <div style={S.ps}>{it.position}</div>
      <div style={S.lr}>
        {it.folderName && (
          <a className="lb" href={folderHref} onClick={(e) => e.stopPropagation()} style={S.lb} title={`VSCode → ${DL}/${it.folderName}`}>
            📂 文件
          </a>
        )}
        {nr?.emailLink && (
          <a className="lb" href={nr.emailLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={S.lb} title="打开邮件">
            ✉️ 邮件
          </a>
        )}
      </div>
      {nrt && <div style={S.nx}>📅 {nrt.date} {nrt.time} — {nr.name}{local ? <span style={S.tzTag}> PDT</span> : <span style={S.tzTag}> 北京</span>}</div>}
      {tot > 0 && (
        <div style={S.pr}>
          <div style={S.ds}>{(it.rounds || []).map((r, i) => (
            <span key={i} style={{ ...S.dts, background: r.status === "done" ? "#10B981" : r.status === "scheduled" ? "#F59E0B" : "#475569" }} />
          ))}</div>
          <span style={S.pt}>{dn}/{tot}</span>
        </div>
      )}
    </div>
  );
}

function AddM({ onClose, onSave }) {
  const [f, sf] = useState({ company: "", position: "", stage: "interviewing", prepLevel: 0, folderName: "", rounds: [{ name: "", date: "", time: "", status: "pending", emailLink: "" }], jd: "", notes: "" });
  const s = (k, v) => sf((p) => ({ ...p, [k]: v }));
  return (
    <Ov onClose={onClose}>
      <h2 style={S.mt}>新增面试</h2>
      <div style={S.g2}>
        <In label="公司" value={f.company} onChange={(v) => s("company", v)} autoFocus />
        <In label="职位" value={f.position} onChange={(v) => s("position", v)} />
      </div>
      <In label={`本地文件夹名（${DL}/...）`} value={f.folderName} onChange={(v) => s("folderName", v)} placeholder="minimax、智谱..." hint="卡片上会显示 📂 按钮，点击用 VSCode 打开" />
      <label style={S.la}>JD</label>
      <textarea style={S.ta} rows={3} value={f.jd} onChange={(e) => s("jd", e.target.value)} placeholder="粘贴职位描述..." />
      <div style={S.ma}>
        <button style={S.cb} onClick={onClose}>取消</button>
        <button style={{ ...S.svb, opacity: f.company && f.position ? 1 : .4 }} disabled={!f.company || !f.position} onClick={() => onSave(f)}>保存</button>
      </div>
    </Ov>
  );
}

function EditM({ item, local, onClose, onSave, onDel }) {
  const [f, sf] = useState({ ...item });
  const [tab, setTab] = useState("rounds");
  if (!item) return null;
  const s = (k, v) => sf((p) => ({ ...p, [k]: v }));
  const ar = () => s("rounds", [...(f.rounds || []), { name: "", date: "", time: "", status: "pending", emailLink: "" }]);
  const ur = (i, k, v) => { const r = [...(f.rounds || [])]; r[i] = { ...r[i], [k]: v }; s("rounds", r); };
  const dr = (i) => s("rounds", (f.rounds || []).filter((_, x) => x !== i));

  const folderHref = f.folderName ? `vscode://file${encodeURI(`/Users/fanyi/Downloads/${f.folderName}`)}` : null;

  return (
    <Ov onClose={onClose} wide>
      <div style={S.eh}>
        <div style={{ flex: 1 }}>
          <h2 style={S.mt}>{f.company}</h2>
          <span style={S.es}>{f.position}</span>
        </div>
        {f.folderName && <a className="lb" href={folderHref} style={S.hl2}>📂 打开文件夹</a>}
        <button style={S.db} onClick={onDel}>🗑</button>
      </div>

      <div style={S.ts}>{[["rounds", "面试轮次"], ["info", "基本信息"], ["jd", "JD / 笔记"]].map(([id, l]) => (
        <button key={id} style={{ ...S.tb, ...(tab === id ? S.ta2 : {}) }} onClick={() => setTab(id)}>{l}</button>
      ))}</div>

      {tab === "rounds" && (
        <div style={S.tc}>
          {(f.rounds || []).length === 0 && <div style={S.eh2}>点击下方添加面试轮次</div>}
          {(f.rounds || []).map((r, i) => (
            <div key={i} style={S.rc}>
              <div style={S.rt}>
                <span style={S.rn}>第 {i + 1} 轮</span>
                <select style={{ ...S.ss, color: r.status === "done" ? "#10B981" : r.status === "scheduled" ? "#F59E0B" : "#94A3B8" }} value={r.status} onChange={(e) => ur(i, "status", e.target.value)}>
                  <option value="pending">⏳ 待定</option>
                  <option value="scheduled">📅 已排期</option>
                  <option value="done">✅ 已完成</option>
                </select>
                <button style={S.rd} onClick={() => dr(i)}>✕</button>
              </div>
              <div style={S.rf}>
                <input style={{ ...S.inp, flex: 2 }} placeholder="轮次名称（技术一面…）" value={r.name} onChange={(e) => ur(i, "name", e.target.value)} />
                <input style={{ ...S.inp, flex: 1 }} type="date" value={r.date} onChange={(e) => ur(i, "date", e.target.value)} />
                <input style={{ ...S.inp, flex: .6 }} type="time" value={r.time} onChange={(e) => ur(i, "time", e.target.value)} />
              </div>
              {local && r.date && r.time && (() => { const cv = toLocal(r.date, r.time); return (
                <div style={S.localHint}>🕐 本地时间：{cv.date} {cv.time} PDT</div>
              ); })()}
              <div style={S.er}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>✉️</span>
                <input style={{ ...S.inp, flex: 1 }} placeholder="粘贴面试邮件链接..." value={r.emailLink || ""} onChange={(e) => ur(i, "emailLink", e.target.value)} />
                {r.emailLink && <a className="lb" href={r.emailLink} target="_blank" rel="noreferrer" style={S.gl}>打开 ↗</a>}
              </div>
            </div>
          ))}
          <button style={S.arb} onClick={ar}>＋ 添加轮次</button>
        </div>
      )}

      {tab === "info" && (
        <div style={S.tc}>
          <div style={S.g2}>
            <In label="公司" value={f.company} onChange={(v) => s("company", v)} />
            <In label="职位" value={f.position} onChange={(v) => s("position", v)} />
          </div>
          <In label={`文件夹名（${DL}/...）`} value={f.folderName || ""} onChange={(v) => s("folderName", v)} placeholder="minimax、智谱..." />
          <div><label style={S.la}>阶段</label><select style={S.sel} value={f.stage} onChange={(e) => s("stage", e.target.value)}>{STAGES.map((st) => <option key={st.id} value={st.id}>{st.emoji} {st.label}</option>)}</select></div>
          <label style={{ ...S.la, marginTop: 12 }}>准备程度</label>
          <div style={S.prw}>{PREP_LEVELS.map((p) => (
            <button key={p.value} style={{ ...S.pb, background: f.prepLevel === p.value ? p.color + "20" : "transparent", borderColor: f.prepLevel === p.value ? p.color : "#334155", color: f.prepLevel === p.value ? p.color : "#64748B" }} onClick={() => s("prepLevel", p.value)}>{p.label}</button>
          ))}</div>
        </div>
      )}

      {tab === "jd" && (
        <div style={S.tc}>
          <label style={S.la}>JD / 职位描述</label>
          <textarea style={S.ta} rows={6} value={f.jd || ""} onChange={(e) => s("jd", e.target.value)} placeholder="粘贴完整 JD..." />
          <label style={{ ...S.la, marginTop: 14 }}>备注 & 复盘</label>
          <textarea style={S.ta} rows={4} value={f.notes || ""} onChange={(e) => s("notes", e.target.value)} placeholder="面试问题、复盘笔记..." />
        </div>
      )}

      <div style={S.ma}>
        <button style={S.cb} onClick={onClose}>取消</button>
        <button style={S.svb} onClick={() => onSave(f)}>保存修改</button>
      </div>
    </Ov>
  );
}

/* ── 约面 Booking View ── */
function BookingView({ items, token, userId, userSlug }) {
  const [startH, setStartH] = useState(9);
  const [endH, setEndH] = useState(15);
  const [days, setDays] = useState(14);
  const [includeWeekend, setIncWeekend] = useState(false);
  const [slotMin, setSlotMin] = useState(60);
  const [excluded, setExcluded] = useState(new Set());
  const [included, setIncluded] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("cn");
  // Publish & bookings state
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  const handlePublish = async () => {
    if (!token) return alert("请先登录");
    setPublishing(true);
    try {
      const availSlots = [];
      allDates.forEach(({ date }) => {
        getSlots(date).forEach((s) => {
          if (s.available) {
            availSlots.push({ date, start_min: s.startMin, duration_min: slotMin });
          }
        });
      });
      const r = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slots: availSlots }),
      });
      if (r.ok) {
        setPublished(true);
        setTimeout(() => setPublished(false), 5000);
      } else {
        const d = await r.json();
        alert(d.error || "Publish failed");
      }
    } catch { alert("Network error"); }
    setPublishing(false);
  };

  const loadBookings = async () => {
    if (!token) return alert("请先登录");
    setLoadingBookings(true);
    setShowBookings(true);
    try {
      const r = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        setBookings(d.bookings || []);
      } else {
        alert("Failed to load bookings");
      }
    } catch { alert("Network error"); }
    setLoadingBookings(false);
  };

  const WEEKDAYS_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const occupied = [];
  items.forEach((it) => {
    (it.rounds || []).forEach((r) => {
      if (r.status === "scheduled" && r.date && r.time) {
        const [h, m] = r.time.split(":").map(Number);
        occupied.push({ date: r.date, startMin: h * 60 + m, endMin: h * 60 + m + 60, company: it.company, name: r.name });
      }
    });
  });

  const isOccupied = (dateStr, slotStartMin) => {
    const slotEnd = slotStartMin + slotMin;
    return occupied.find((o) => o.date === dateStr && slotStartMin < o.endMin && slotEnd > o.startMin);
  };

  const allDates = [];
  // Use Beijing time (UTC+8) for date generation
  const nowBJT = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  for (let d = 0; d <= days; d++) {
    const dt = new Date(nowBJT);
    dt.setDate(nowBJT.getDate() + d);
    const dow = dt.getDay();
    if (!includeWeekend && (dow === 0 || dow === 6)) continue;
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const ds = `${yyyy}-${mm}-${dd}`;
    allDates.push({ date: ds, dow, dateObj: dt });
  }

  const getSlots = (dateStr) => {
    const slots = [];
    for (let m = startH * 60; m < endH * 60; m += slotMin) {
      const key = `${dateStr}-${m}`;
      const occ = isOccupied(dateStr, m);
      const blocked = !!occ;
      const manualOff = excluded.has(key);
      const manualOn = included.has(key);
      const available = blocked ? manualOn : !manualOff;
      slots.push({
        key,
        startMin: m,
        startStr: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
        endStr: `${String(Math.floor((m + slotMin) / 60)).padStart(2, "0")}:${String((m + slotMin) % 60).padStart(2, "0")}`,
        occupied: occ,
        blocked,
        available,
      });
    }
    return slots;
  };

  const toggleSlot = (key, blocked) => {
    if (blocked) {
      const n = new Set(included);
      n.has(key) ? n.delete(key) : n.add(key);
      setIncluded(n);
    } else {
      const n = new Set(excluded);
      n.has(key) ? n.delete(key) : n.add(key);
      setExcluded(n);
    }
  };

  const bjtToPdt = (dateStr, timeStr) => {
    try {
      const d = new Date(`${dateStr}T${timeStr}:00+08:00`);
      return {
        date: d.toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" }),
        time: d.toLocaleTimeString("en-GB", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: false }),
      };
    } catch { return { date: dateStr, time: timeStr }; }
  };

  const buildText = () => {
    const lines = [];
    if (lang === "cn") {
      lines.push("您好，以下是我近期可面试的时间段（北京时间）：\n");
    } else {
      lines.push("Hi, below are my available interview slots (Beijing Time):\n");
    }

    allDates.forEach(({ date, dow, dateObj }) => {
      const slots = getSlots(date).filter((s) => s.available);
      if (slots.length === 0) return;
      const mm = dateObj.getMonth() + 1;
      const dd = dateObj.getDate();
      const wdLabel = lang === "cn" ? WEEKDAYS_CN[dow] : WEEKDAYS_EN[dow];

      if (lang === "cn") {
        lines.push(`📅 ${mm}月${dd}日 ${wdLabel}`);
      } else {
        lines.push(`📅 ${date} (${wdLabel})`);
      }
      slots.forEach((s) => {
        const pdt1 = bjtToPdt(date, s.startStr);
        const pdt2 = bjtToPdt(date, s.endStr);
        if (lang === "cn") {
          lines.push(`  · ${s.startStr}-${s.endStr}（加州时间 ${pdt1.date.slice(5)} ${pdt1.time}-${pdt2.time}）`);
        } else {
          lines.push(`  · ${s.startStr}-${s.endStr} BJT (${pdt1.time}-${pdt2.time} PDT, ${pdt1.date})`);
        }
      });
      lines.push("");
    });

    if (lang === "cn") {
      lines.push("如以上时间不便，欢迎告知其他偏好，谢谢！");
    } else {
      lines.push("Please let me know if none of these work. Happy to accommodate other times. Thanks!");
    }
    return lines.join("\n");
  };

  const totalAvail = allDates.reduce((sum, { date }) => sum + getSlots(date).filter((s) => s.available).length, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={S.bkWrap}>
      <div style={S.bkHeader}>
        <div>
          <h2 style={S.prepTitle}>📆 约面时间</h2>
          <span style={S.prepSub}>根据已有面试自动排除冲突，生成可约时间段发给猎头</span>
        </div>
        <div style={S.prepActions}>
          <div style={S.langToggle}>
            <button style={{ ...S.langBtn, ...(lang === "cn" ? S.langAct : {}) }} onClick={() => setLang("cn")}>中文</button>
            <button style={{ ...S.langBtn, ...(lang === "en" ? S.langAct : {}) }} onClick={() => setLang("en")}>EN</button>
          </div>
          <span style={S.selCount}>{totalAvail} 个可用时段</span>
          <button style={{ ...S.copyBtnLg, ...(copied ? { background: "#10B98122", borderColor: "#10B981", color: "#10B981" } : {}) }} onClick={handleCopy}>
            {copied ? "✓ 已复制" : "📋 复制发给猎头"}
          </button>
          <button
            style={{ ...S.publishBtn, ...(published ? { background: "#10B98122", borderColor: "#10B981", color: "#10B981" } : {}) }}
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "⏳ 发布中..." : published ? "✓ 已发布" : "🚀 发布到预约页"}
          </button>
          <button style={S.shareBtn} onClick={() => {
            const link = `${window.location.origin}/book/${userSlug || "error"}`;
            navigator.clipboard.writeText(link).then(() => alert(`预约链接已复制：\n${link}`));
          }}>
            🔗 分享预约页
          </button>
        </div>
      </div>

      <div style={S.bkSettings}>
        <div style={S.bkSetItem}>
          <label style={S.la}>北京时间范围</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <select style={{ ...S.sel, width: 75 }} value={startH} onChange={(e) => setStartH(+e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
            </select>
            <span style={{ color: "#475569" }}>—</span>
            <select style={{ ...S.sel, width: 75 }} value={endH} onChange={(e) => setEndH(+e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
            </select>
          </div>
        </div>
        <div style={S.bkSetItem}>
          <label style={S.la}>每段时长</label>
          <select style={{ ...S.sel, width: 90 }} value={slotMin} onChange={(e) => setSlotMin(+e.target.value)}>
            <option value={30}>30 分钟</option>
            <option value={45}>45 分钟</option>
            <option value={60}>1 小时</option>
            <option value={90}>1.5 小时</option>
          </select>
        </div>
        <div style={S.bkSetItem}>
          <label style={S.la}>展望天数</label>
          <select style={{ ...S.sel, width: 75 }} value={days} onChange={(e) => setDays(+e.target.value)}>
            <option value={7}>7 天</option>
            <option value={14}>14 天</option>
            <option value={21}>21 天</option>
          </select>
        </div>
        <div style={S.bkSetItem}>
          <label style={S.la}>包含周末</label>
          <button
            style={{ ...S.wkBtn, ...(includeWeekend ? S.wkOn : {}) }}
            onClick={() => setIncWeekend((v) => !v)}
          >{includeWeekend ? "✓ 是" : "✕ 否"}</button>
        </div>
      </div>

      <div style={S.bkGrid}>
        {allDates.map(({ date, dow, dateObj }) => {
          const slots = getSlots(date);
          const mm = dateObj.getMonth() + 1;
          const dd = dateObj.getDate();
          const availCount = slots.filter((s) => s.available).length;
          return (
            <div key={date} style={S.bkDay}>
              <div style={S.bkDayHead}>
                <span style={S.bkDate}>{mm}/{dd}</span>
                <span style={S.bkDow}>{WEEKDAYS_CN[dow]}</span>
                <span style={S.bkAvail}>{availCount}/{slots.length}</span>
              </div>
              <div style={S.bkSlots}>
                {slots.map((s) => (
                  <button
                    key={s.key}
                    style={{
                      ...S.bkSlot,
                      ...(s.available ? S.bkSlotOn : S.bkSlotOff),
                      ...(s.blocked && !s.available ? S.bkSlotOcc : {}),
                    }}
                    onClick={() => toggleSlot(s.key, s.blocked)}
                    title={s.blocked ? "已占用，点击强制可用" : s.available ? "点击排除" : "点击恢复"}
                  >
                    <span style={S.bkSlotTime}>{s.startStr}</span>
                    {s.blocked && !s.available && <span style={S.bkSlotTag}>🔒 已占用</span>}
                    {s.blocked && s.available && <span style={S.bkSlotTag}>⚡ 已覆盖</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.previewWrap}>
        <div style={S.previewHead}>
          <span style={S.previewLabel}>📤 发送预览</span>
          <span style={S.previewCount}>{totalAvail} 个时段 · {lang === "cn" ? "中文" : "English"}</span>
        </div>
        <pre style={S.previewBox}>{buildText()}</pre>
      </div>

      {/* Published link hint */}
      {published && (
        <div style={S.publishHint}>
          ✅ 时间段已发布！把下面链接发给猎头即可预约：
          <div style={S.publishLink}>
            <code>{window.location.origin}/book/{userSlug || "error"}</code>
            <button style={S.copySmBtn} onClick={() => { navigator.clipboard.writeText(window.location.origin + "/book/" + (userSlug || "error")); }}>复制</button>
          </div>
        </div>
      )}

      {/* Bookings panel */}
      {showBookings && (
        <div style={S.previewWrap}>
          <div style={S.previewHead}>
            <span style={S.previewLabel}>📋 已收到的预约</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={S.previewCount}>{bookings.length} 条</span>
              <button style={S.refreshBtn} onClick={loadBookings}>🔄</button>
              <button style={S.refreshBtn} onClick={() => setShowBookings(false)}>✕</button>
            </div>
          </div>
          {loadingBookings && <div style={{ padding: 20, textAlign: "center", color: "#64748B" }}>加载中...</div>}
          {!loadingBookings && bookings.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#64748B" }}>暂无预约</div>}
          {!loadingBookings && bookings.map((b, i) => {
            const startH = String(Math.floor(b.start_min / 60)).padStart(2, "0");
            const startM = String(b.start_min % 60).padStart(2, "0");
            return (
              <div key={i} style={S.bookingRow}>
                <div style={S.bookingMain}>
                  <span style={S.bookingDate}>📅 {b.date} {startH}:{startM} BJT</span>
                  <span style={S.bookingName}>{b.booker_name}</span>
                  {b.booker_company && <span style={S.bookingCompany}>@ {b.booker_company}</span>}
                </div>
                <div style={S.bookingMeta}>
                  {b.booker_position && <span>💼 {b.booker_position}</span>}
                  <a href={`mailto:${b.booker_email}`} style={S.bookingEmail}>✉️ {b.booker_email}</a>
                  {b.notes && <span style={S.bookingNotes}>📝 {b.notes}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Mock 准备 View ── */
function PrepView({ items, local }) {
  const [sel, setSel] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const upcoming = items
    .filter((i) => i.stage === "interviewing")
    .map((i) => {
      const nextRound = (i.rounds || []).find((r) => r.status === "scheduled" && r.date);
      const allScheduled = (i.rounds || []).filter((r) => r.status === "scheduled" && r.date);
      return { ...i, nextRound, allScheduled };
    })
    .sort((a, b) => {
      const ad = a.nextRound ? a.nextRound.date + a.nextRound.time : "9999";
      const bd = b.nextRound ? b.nextRound.date + b.nextRound.time : "9999";
      return ad.localeCompare(bd);
    });

  const toggleAll = () => {
    if (sel.size === upcoming.length) setSel(new Set());
    else setSel(new Set(upcoming.map((i) => i.id)));
  };
  const toggle = (id) => {
    const n = new Set(sel);
    n.has(id) ? n.delete(id) : n.add(id);
    setSel(n);
  };

  const buildExport = () => {
    const selected = upcoming.filter((i) => sel.has(i.id));
    const divider = "═".repeat(50);

    return selected.map((it) => {
      const rounds = (it.allScheduled || []).map((r) => {
        const t = local ? toLocal(r.date, r.time) : { date: r.date, time: r.time };
        return `  · ${r.name}：${t.date} ${t.time}${local ? " (PDT)" : " (北京时间)"}`;
      }).join("\n");

      return [
        divider,
        `🏢 公司：${it.company}`,
        `💼 岗位：${it.position}`,
        `📂 本地文件：/Users/fanyi/Downloads/${it.folderName || "(未设置)"}`,
        rounds ? `📅 面试安排：\n${rounds}` : "📅 面试安排：暂无排期",
        it.jd ? `\n📋 JD：\n${it.jd}` : "📋 JD：（未填写）",
        divider,
      ].join("\n");
    }).join("\n\n");
  };

  const handleCopy = () => {
    const text = buildExport();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const text = buildExport();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-prep-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={S.prepWrap}>
      <div style={S.prepHeader}>
        <div>
          <h2 style={S.prepTitle}>📝 Mock 准备</h2>
          <span style={S.prepSub}>勾选即将面试的公司，导出信息用于 Mock 练习</span>
        </div>
        <div style={S.prepActions}>
          <span style={S.selCount}>{sel.size}/{upcoming.length} 已选</span>
          <button style={S.copyBtn} onClick={handleCopy} disabled={sel.size === 0}>
            {copied ? "✓ 已复制" : "📋 复制到剪贴板"}
          </button>
          <button style={{ ...S.dlBtn, opacity: sel.size > 0 ? 1 : 0.4 }} onClick={handleDownload} disabled={sel.size === 0}>
            💾 导出 .txt
          </button>
        </div>
      </div>

      <div style={S.prepTable}>
        <div style={S.prepRow0}>
          <div style={S.prepCk} onClick={toggleAll}>
            <span style={sel.size === upcoming.length && upcoming.length > 0 ? S.ckOn : S.ckOff}>
              {sel.size === upcoming.length && upcoming.length > 0 ? "☑" : "☐"}
            </span>
          </div>
          <span style={{ ...S.prepTh, flex: 1.5 }}>公司</span>
          <span style={{ ...S.prepTh, flex: 2 }}>岗位</span>
          <span style={{ ...S.prepTh, flex: 2 }}>下一轮面试</span>
          <span style={{ ...S.prepTh, flex: 1.2 }}>准备状态</span>
          <span style={{ ...S.prepTh, flex: 1.2 }}>文件夹</span>
        </div>

        {upcoming.length === 0 && <div style={S.prepEmpty}>暂无面试中的公司</div>}

        {upcoming.map((it) => {
          const checked = sel.has(it.id);
          const prep = PREP_LEVELS[it.prepLevel || 0];
          const nr = it.nextRound;
          const nrt = nr ? fmtTime(nr.date, nr.time, local) : null;
          return (
            <div key={it.id} style={{ ...S.prepRowItem, ...(checked ? S.prepRowSel : {}) }} onClick={() => toggle(it.id)}>
              <div style={S.prepCk}>
                <span style={checked ? S.ckOn : S.ckOff}>{checked ? "☑" : "☐"}</span>
              </div>
              <div style={{ flex: 1.5 }}>
                <div style={S.prepCo}>{it.company}</div>
              </div>
              <div style={{ flex: 2 }}>
                <div style={S.prepPos}>{it.position}</div>
              </div>
              <div style={{ flex: 2 }}>
                {nrt ? (
                  <div style={S.prepTime}>
                    📅 {nrt.date} {nrt.time} — {nr.name}
                    {local && <span style={S.tzTag}> PDT</span>}
                  </div>
                ) : <span style={S.prepNa}>—</span>}
              </div>
              <div style={{ flex: 1.2 }}>
                <span style={{ ...S.pl, background: prep.color + "20", color: prep.color }}>{prep.label}</span>
              </div>
              <div style={{ flex: 1.2 }}>
                {it.folderName ? (
                  <a
                    className="lb"
                    href={`vscode://file${encodeURI(`/Users/fanyi/Downloads/${it.folderName}`)}`}
                    onClick={(e) => e.stopPropagation()}
                    style={S.lb}
                  >📂 {it.folderName}</a>
                ) : <span style={S.prepNa}>未设置</span>}
              </div>
            </div>
          );
        })}
      </div>

      {sel.size > 0 && (
        <div style={S.previewWrap}>
          <div style={S.previewHead}>
            <span style={S.previewLabel}>📄 导出预览</span>
            <span style={S.previewCount}>{sel.size} 个公司</span>
          </div>
          <pre style={S.previewBox}>{buildExport()}</pre>
        </div>
      )}
    </div>
  );
}

/* ── 漏斗图 View ── */
function FunnelView({ items }) {
  const total = items.length;
  const interviewing = items.filter((i) => i.stage === "interviewing").length;
  const ended = items.filter((i) => i.stage === "ended").length;
  const offers = items.filter((i) => i.stage === "offer").length;

  // Count total rounds across all items
  const totalRounds = items.reduce((sum, i) => sum + (i.rounds || []).length, 0);
  const doneRounds = items.reduce((sum, i) => sum + (i.rounds || []).filter((r) => r.status === "done").length, 0);
  const scheduledRounds = items.reduce((sum, i) => sum + (i.rounds || []).filter((r) => r.status === "scheduled").length, 0);

  // Funnel stages with computed data
  const funnel = [
    { label: "投递/联系", value: total, color: "#6366F1", desc: "所有面试机会" },
    { label: "面试中", value: interviewing, color: "#F59E0B", desc: "正在进行的" },
    { label: "已完成轮次", value: doneRounds, color: "#3B82F6", desc: `共 ${totalRounds} 轮，${scheduledRounds} 轮待面` },
    { label: "已结束", value: ended, color: "#64748B", desc: "流程结束" },
    { label: "Offer", value: offers, color: "#10B981", desc: offers > 0 ? "🎉" : "继续加油！" },
  ];

  const maxVal = Math.max(...funnel.map((f) => f.value), 1);

  // Per-company breakdown
  const companyStats = items.map((it) => {
    const rounds = it.rounds || [];
    const done = rounds.filter((r) => r.status === "done").length;
    const total = rounds.length;
    return { company: it.company, position: it.position, stage: it.stage, done, total, prepLevel: it.prepLevel || 0 };
  }).sort((a, b) => b.done - a.done);

  return (
    <div style={S.prepWrap}>
      <div style={S.prepHeader}>
        <div>
          <h2 style={S.prepTitle}>📊 面试漏斗</h2>
          <span style={S.prepSub}>整体面试进度一览</span>
        </div>
      </div>

      {/* Funnel Chart */}
      <div style={S.funnelChart}>
        {funnel.map((f, i) => {
          const widthPct = Math.max((f.value / maxVal) * 100, 8);
          const rate = i > 0 && funnel[i - 1].value > 0 ? ((f.value / funnel[i - 1].value) * 100).toFixed(0) : null;
          return (
            <div key={i} style={S.funnelRow}>
              <div style={S.funnelLabel}>
                <span style={S.funnelName}>{f.label}</span>
                <span style={S.funnelDesc}>{f.desc}</span>
              </div>
              <div style={S.funnelBarWrap}>
                <div style={{
                  ...S.funnelBar,
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${f.color}, ${f.color}88)`,
                }}>
                  <span style={S.funnelVal}>{f.value}</span>
                </div>
                {rate !== null && (
                  <span style={S.funnelRate}>↓ {rate}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary cards */}
      <div style={S.funnelCards}>
        <div style={S.funnelCard}>
          <div style={S.funnelCardVal}>{total}</div>
          <div style={S.funnelCardLabel}>总机会</div>
        </div>
        <div style={S.funnelCard}>
          <div style={{ ...S.funnelCardVal, color: "#F59E0B" }}>{interviewing}</div>
          <div style={S.funnelCardLabel}>进行中</div>
        </div>
        <div style={S.funnelCard}>
          <div style={{ ...S.funnelCardVal, color: "#3B82F6" }}>{doneRounds}/{totalRounds}</div>
          <div style={S.funnelCardLabel}>完成轮次</div>
        </div>
        <div style={S.funnelCard}>
          <div style={{ ...S.funnelCardVal, color: "#10B981" }}>{offers}</div>
          <div style={S.funnelCardLabel}>Offer</div>
        </div>
        <div style={S.funnelCard}>
          <div style={{ ...S.funnelCardVal, color: "#8B5CF6" }}>{total > 0 ? ((offers / total) * 100).toFixed(1) : 0}%</div>
          <div style={S.funnelCardLabel}>转化率</div>
        </div>
      </div>

      {/* Per-company table */}
      <div style={{ ...S.prepTable, marginTop: 20 }}>
        <div style={S.prepRow0}>
          <span style={{ ...S.prepTh, flex: 1.5 }}>公司</span>
          <span style={{ ...S.prepTh, flex: 2 }}>岗位</span>
          <span style={{ ...S.prepTh, flex: 1 }}>阶段</span>
          <span style={{ ...S.prepTh, flex: 1 }}>轮次进度</span>
          <span style={{ ...S.prepTh, flex: 2 }}>进度条</span>
        </div>
        {companyStats.map((c, i) => {
          const stageInfo = STAGES.find((s) => s.id === c.stage) || STAGES[0];
          const pct = c.total > 0 ? (c.done / c.total) * 100 : 0;
          return (
            <div key={i} style={S.prepRowItem}>
              <div style={{ flex: 1.5 }}>
                <div style={S.prepCo}>{c.company}</div>
              </div>
              <div style={{ flex: 2 }}>
                <div style={S.prepPos}>{c.position}</div>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ ...S.pl, background: stageInfo.color + "20", color: stageInfo.color }}>{stageInfo.emoji} {stageInfo.label}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 600 }}>{c.done}/{c.total}</span>
              </div>
              <div style={{ flex: 2 }}>
                <div style={S.progressBg}>
                  <div style={{ ...S.progressFill, width: `${pct}%`, background: stageInfo.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Ov({ children, onClose, wide }) {
  return (
    <div style={S.ov} onClick={onClose}>
      <div style={{ ...S.md, ...(wide ? { maxWidth: 680 } : {}) }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function In({ label, value, onChange, placeholder, hint, autoFocus }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={S.la}>{label}</label>
      <input style={S.inp} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} autoFocus={autoFocus} />
      {hint && <div style={S.ht}>{hint}</div>}
    </div>
  );
}

const ff = "'DM Sans',system-ui,-apple-system,sans-serif";
const S = {
  app: { fontFamily: ff, minHeight: "100vh", background: "linear-gradient(160deg,#0c1222,#162032 50%,#0f1a2e)", color: "#E2E8F0", paddingBottom: 40 },
  ld: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  sp: { width: 28, height: 28, border: "3px solid #1e293b", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin .7s linear infinite" },
  hd: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid #1e293b55", background: "rgba(12,18,34,.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50, gap: 12, flexWrap: "wrap" },
  hl: { display: "flex", alignItems: "center", gap: 10 },
  hr: { display: "flex", alignItems: "center", gap: 10 },
  t: { margin: 0, fontSize: 18, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-.02em" },
  cnt: { fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#F59E0B18", color: "#F59E0B", fontWeight: 600 },
  sb: { position: "relative" },
  si: { position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 15 },
  sin: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "7px 10px 7px 28", color: "#E2E8F0", fontSize: 13, outline: "none", width: 150, fontFamily: ff },
  ab: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 10px #3B82F633" },
  tzBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", padding: "7px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s", whiteSpace: "nowrap" },
  tzOn: { background: "#3B82F618", borderColor: "#3B82F6", color: "#60A5FA" },
  dataBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", padding: "7px 10px", fontSize: 14, cursor: "pointer", transition: "all .15s", lineHeight: 1 },
  dropBg: { position: "fixed", inset: 0, zIndex: 60 },
  dropMenu: { position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#1a2744", border: "1px solid #2a3a55", borderRadius: 12, padding: "6px", minWidth: 240, zIndex: 61, boxShadow: "0 12px 36px rgba(0,0,0,.5)", animation: "fi .15s ease" },
  dropTitle: { fontSize: 11, fontWeight: 700, color: "#64748B", padding: "8px 12px 4px", textTransform: "uppercase", letterSpacing: ".04em" },
  dropItem: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "transparent", border: "none", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: ff, transition: "background .12s", textAlign: "left" },
  dropHint: { fontSize: 11, color: "#475569" },
  dropNote: { fontSize: 10, color: "#475569", padding: "8px 12px", lineHeight: 1.5, borderTop: "1px solid #1e293b" },
  exportBtns: { display: "flex", gap: 8, marginBottom: 12 },
  copyBtnLg: { flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  dlBtnLg: { flex: 1, background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 8px #3B82F633" },
  exportBox: { width: "100%", background: "#0c1222", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", color: "#94A3B8", fontSize: 11, fontFamily: "'DM Mono',monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 },
  tzTag: { fontSize: 9, opacity: 0.6, marginLeft: 2 },
  localHint: { fontSize: 11, color: "#60A5FA", background: "#3B82F610", borderRadius: 6, padding: "4px 9px", marginBottom: 6 },
  ub: { display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", background: "#F59E0B08", borderBottom: "1px solid #F59E0B15", flexWrap: "wrap" },
  ul: { fontSize: 11, fontWeight: 700, color: "#F59E0B", whiteSpace: "nowrap" },
  ucs: { display: "flex", gap: 8, flexWrap: "wrap" },
  uc: { fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "#F59E0B12", color: "#FCD34D", cursor: "pointer" },
  bd: { display: "flex", gap: 14, padding: "22px 18px", overflowX: "auto", minHeight: "calc(100vh - 140px)" },
  cl: { flex: "1 0 260px", maxWidth: 380, background: "rgba(22,32,50,.6)", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8, border: "1px solid #1e293b88", transition: "border-color .2s,background .2s" },
  clo: { borderColor: "#3B82F6", background: "rgba(59,130,246,.05)" },
  ch: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, borderBottom: "1px solid #1e293b66" },
  dt: { width: 8, height: 8, borderRadius: "50%" },
  cn: { fontSize: 13, fontWeight: 600, color: "#CBD5E1" },
  cc: { marginLeft: "auto", fontSize: 11, color: "#475569", background: "#0c1222", borderRadius: 10, padding: "2px 8px" },
  cls: { display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 60 },
  emp: { fontSize: 12, color: "#334155", textAlign: "center", padding: 24, border: "1px dashed #1e293b", borderRadius: 10 },
  card: { background: "#0f172a", borderRadius: 12, padding: "14px 16px 12px", cursor: "pointer", border: "1px solid #1e293b", transition: "all .2s", animation: "fi .3s ease" },
  r1: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  co: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  pl: { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 },
  ps: { fontSize: 12, color: "#94A3B8", marginBottom: 8 },
  lr: { display: "flex", gap: 6, marginBottom: 8 },
  lb: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#60A5FA", background: "rgba(59,130,246,.08)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", textDecoration: "none", fontFamily: ff, fontWeight: 500, transition: "background .15s" },
  nx: { fontSize: 11, color: "#94A3B8", background: "#1e293b", borderRadius: 7, padding: "5px 9px", marginBottom: 6 },
  pr: { display: "flex", alignItems: "center", gap: 8 },
  ds: { display: "flex", gap: 4 },
  dts: { width: 7, height: 7, borderRadius: "50%", transition: "background .2s" },
  pt: { fontSize: 10, color: "#475569" },
  ov: { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: 16 },
  md: { background: "#1a2744", borderRadius: 18, padding: "26px 26px 20px", width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", border: "1px solid #2a3a55", boxShadow: "0 24px 60px rgba(0,0,0,.5)", animation: "si .2s ease" },
  mt: { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" },
  eh: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  es: { fontSize: 13, color: "#94A3B8" },
  hl2: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#60A5FA", background: "rgba(59,130,246,.1)", borderRadius: 8, padding: "6px 12px", textDecoration: "none", fontFamily: ff, fontWeight: 500, whiteSpace: "nowrap", transition: "background .15s" },
  db: { background: "#EF444418", border: "none", borderRadius: 8, color: "#EF4444", fontSize: 14, padding: "6px 10px", cursor: "pointer" },
  ts: { display: "flex", gap: 3, background: "#0f172a", borderRadius: 10, padding: 3, marginBottom: 16 },
  tb: { flex: 1, background: "transparent", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 500, color: "#64748B", cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  ta2: { background: "#334155", color: "#E2E8F0" },
  tc: { minHeight: 180, animation: "fi .2s ease" },
  rc: { background: "#0f172a", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #1e293b" },
  rt: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  rn: { fontSize: 12, fontWeight: 700, color: "#94A3B8" },
  ss: { background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "3px 8px", fontSize: 11, outline: "none", fontFamily: ff },
  rd: { marginLeft: "auto", background: "none", border: "none", color: "#64748B", fontSize: 14, cursor: "pointer", padding: "2px 6px" },
  rf: { display: "flex", gap: 6, marginBottom: 6 },
  er: { display: "flex", alignItems: "center", gap: 6 },
  gl: { fontSize: 11, color: "#60A5FA", background: "#3B82F610", borderRadius: 6, padding: "5px 10px", textDecoration: "none", fontFamily: ff, fontWeight: 500, whiteSpace: "nowrap", transition: "background .15s" },
  eh2: { textAlign: "center", color: "#475569", fontSize: 13, padding: 32 },
  arb: { background: "none", border: "1px dashed #334155", borderRadius: 10, color: "#64748B", fontSize: 12, padding: 12, width: "100%", cursor: "pointer", fontFamily: ff, fontWeight: 500, marginTop: 4 },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  la: { display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em" },
  inp: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#E2E8F0", fontSize: 13, outline: "none", fontFamily: ff, boxSizing: "border-box", transition: "border-color .15s" },
  sel: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#E2E8F0", fontSize: 13, outline: "none", fontFamily: ff, boxSizing: "border-box" },
  ta: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: ff, boxSizing: "border-box", lineHeight: 1.5, transition: "border-color .15s" },
  ht: { fontSize: 11, color: "#475569", marginTop: 4 },
  prw: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  pb: { border: "1.5px solid", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, background: "transparent", transition: "all .15s" },
  ma: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px solid #2a3a55" },
  cb: { background: "#334155", border: "none", borderRadius: 8, color: "#94A3B8", padding: "9px 20px", fontSize: 13, cursor: "pointer", fontFamily: ff, fontWeight: 500 },
  svb: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 10px #3B82F633" },
  pageTabs: { display: "flex", background: "#1e293b", borderRadius: 8, overflow: "hidden", marginLeft: 4 },
  pageTab: { background: "transparent", border: "none", color: "#64748B", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: ff, fontWeight: 600, transition: "all .15s" },
  pageTabAct: { background: "#334155", color: "#F1F5F9" },
  prepWrap: { padding: "22px 22px 40px", animation: "fi .25s ease" },
  prepHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16, flexWrap: "wrap" },
  prepTitle: { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" },
  prepSub: { fontSize: 12, color: "#64748B" },
  prepActions: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  selCount: { fontSize: 12, color: "#94A3B8", fontWeight: 500 },
  copyBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  dlBtn: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 8px #3B82F633" },
  prepTable: { background: "rgba(22,32,50,.6)", borderRadius: 14, border: "1px solid #1e293b88", overflow: "hidden" },
  prepRow0: { display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #1e293b", gap: 8 },
  prepTh: { fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".04em" },
  prepRowItem: { display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #1e293b33", gap: 8, cursor: "pointer", transition: "background .15s" },
  prepRowSel: { background: "rgba(59,130,246,.06)" },
  prepCk: { width: 28, flexShrink: 0, display: "flex", justifyContent: "center", cursor: "pointer" },
  ckOff: { fontSize: 18, color: "#475569", lineHeight: 1 },
  ckOn: { fontSize: 18, color: "#3B82F6", lineHeight: 1 },
  prepCo: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  prepPos: { fontSize: 13, color: "#CBD5E1" },
  prepTime: { fontSize: 12, color: "#94A3B8" },
  prepNa: { fontSize: 12, color: "#475569" },
  prepEmpty: { padding: 40, textAlign: "center", color: "#475569", fontSize: 13 },
  previewWrap: { marginTop: 20, background: "rgba(22,32,50,.6)", borderRadius: 14, border: "1px solid #1e293b88", overflow: "hidden" },
  previewHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #1e293b" },
  previewLabel: { fontSize: 13, fontWeight: 600, color: "#CBD5E1" },
  previewCount: { fontSize: 11, color: "#64748B" },
  previewBox: { margin: 0, padding: 16, fontSize: 12, color: "#94A3B8", background: "#0c1222", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'DM Mono', monospace", lineHeight: 1.6, maxHeight: 400, overflowY: "auto" },
  bkWrap: { padding: "22px 22px 40px", animation: "fi .25s ease" },
  bkHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" },
  langToggle: { display: "flex", background: "#1e293b", borderRadius: 8, overflow: "hidden" },
  langBtn: { background: "transparent", border: "none", color: "#64748B", fontSize: 11, padding: "6px 12px", cursor: "pointer", fontFamily: ff, fontWeight: 600, transition: "all .15s" },
  langAct: { background: "#334155", color: "#F1F5F9" },
  bkSettings: { display: "flex", gap: 16, padding: "14px 18px", background: "rgba(22,32,50,.6)", borderRadius: 12, border: "1px solid #1e293b88", marginBottom: 18, flexWrap: "wrap", alignItems: "flex-end" },
  bkSetItem: { display: "flex", flexDirection: "column", gap: 4 },
  wkBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  wkOn: { background: "#10B98118", borderColor: "#10B981", color: "#10B981" },
  bkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 20 },
  bkDay: { background: "rgba(22,32,50,.6)", borderRadius: 12, border: "1px solid #1e293b88", overflow: "hidden" },
  bkDayHead: { display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderBottom: "1px solid #1e293b66" },
  bkDate: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  bkDow: { fontSize: 11, color: "#64748B", fontWeight: 500 },
  bkAvail: { marginLeft: "auto", fontSize: 10, color: "#475569", background: "#0c1222", borderRadius: 8, padding: "2px 7px" },
  bkSlots: { padding: 6, display: "flex", flexDirection: "column", gap: 4 },
  bkSlot: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, border: "1px solid transparent", cursor: "pointer", fontFamily: ff, fontSize: 12, transition: "all .12s" },
  bkSlotOn: { background: "#10B98112", border: "1px solid #10B98133", color: "#10B981" },
  bkSlotOff: { background: "#1e293b44", border: "1px solid #1e293b", color: "#475569" },
  bkSlotOcc: { background: "#EF444410", border: "1px solid #EF444425", color: "#EF4444" },
  bkSlotTime: { fontWeight: 600, fontSize: 12 },
  bkSlotTag: { fontSize: 10, opacity: .8 },
  /* funnel */
  funnelChart: { background: "rgba(22,32,50,.6)", borderRadius: 14, border: "1px solid #1e293b88", padding: "24px 20px", marginBottom: 16 },
  funnelRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  funnelLabel: { width: 120, flexShrink: 0, textAlign: "right" },
  funnelName: { display: "block", fontSize: 13, fontWeight: 700, color: "#F1F5F9" },
  funnelDesc: { display: "block", fontSize: 10, color: "#64748B", marginTop: 2 },
  funnelBarWrap: { flex: 1, display: "flex", alignItems: "center", gap: 8 },
  funnelBar: { height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12, minWidth: 40, transition: "width .5s ease" },
  funnelVal: { fontSize: 15, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.3)" },
  funnelRate: { fontSize: 11, color: "#64748B", fontWeight: 500, whiteSpace: "nowrap" },
  funnelCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 },
  funnelCard: { background: "rgba(22,32,50,.6)", borderRadius: 12, border: "1px solid #1e293b88", padding: "16px 14px", textAlign: "center" },
  funnelCardVal: { fontSize: 28, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 },
  funnelCardLabel: { fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" },
  progressBg: { height: 6, borderRadius: 3, background: "#1e293b", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width .4s ease" },
  /* user */
  userWrap: { display: "flex", alignItems: "center", gap: 8, marginLeft: 4, paddingLeft: 8, borderLeft: "1px solid #334155" },
  avatar: { width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #334155" },
  userName: { fontSize: 12, color: "#94A3B8", fontWeight: 500, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  logoutBtn: { background: "none", border: "1px solid #334155", borderRadius: 6, color: "#64748B", fontSize: 11, padding: "4px 8px", cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", transition: "all .15s" },
  /* publish & bookings */
  publishBtn: { background: "linear-gradient(135deg,#10B981,#059669)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: "0 2px 8px #10B98133", transition: "all .15s" },
  bookingsBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", transition: "all .15s" },
  shareBtn: { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: "0 2px 8px #6366F133", transition: "all .15s" },
  publishHint: { marginTop: 14, background: "#10B98115", border: "1px solid #10B98133", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#10B981", lineHeight: 1.8 },
  publishLink: { display: "flex", alignItems: "center", gap: 8, marginTop: 6, background: "#0f172a", borderRadius: 8, padding: "8px 12px" },
  copySmBtn: { background: "#334155", border: "none", borderRadius: 6, color: "#E2E8F0", padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: 600 },
  refreshBtn: { background: "none", border: "none", color: "#64748B", fontSize: 14, cursor: "pointer", padding: "2px 6px" },
  bookingRow: { padding: "12px 16px", borderBottom: "1px solid #1e293b33" },
  bookingMain: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" },
  bookingDate: { fontSize: 12, color: "#60A5FA", fontWeight: 600 },
  bookingName: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  bookingCompany: { fontSize: 12, color: "#94A3B8" },
  bookingMeta: { display: "flex", gap: 12, fontSize: 12, color: "#64748B", flexWrap: "wrap" },
  bookingEmail: { color: "#60A5FA", textDecoration: "none" },
  bookingNotes: { color: "#94A3B8", fontStyle: "italic" },
};
