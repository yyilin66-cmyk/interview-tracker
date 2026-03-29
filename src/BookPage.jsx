import { useState, useEffect } from "react";

const WEEKDAYS_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function minToStr(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function bjtToLocal(dateStr, timeStr) {
  try {
    const d = new Date(`${dateStr}T${timeStr}:00+08:00`);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      date: d.toLocaleDateString("sv-SE", { timeZone: tz }),
      time: d.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }),
      tz: tz.split("/").pop().replace(/_/g, " "),
    };
  } catch {
    return { date: dateStr, time: timeStr, tz: "" };
  }
}

export default function BookPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", position: "", meetingLink: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // booking result
  const [lang, setLang] = useState("cn");
  const [userName, setUserName] = useState("");

  // Get slug from URL: /book/abc123xy
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const slug = pathParts[1] || "";

  useEffect(() => {
    if (!slug) {
      setError(lang === "cn" ? "无效的预约链接，请联系候选人获取正确链接" : "Invalid booking link. Please ask the candidate for the correct URL.");
      setLoading(false);
      return;
    }
    fetch(`/api/slots?slug=${slug}`)
      .then((r) => {
        if (r.status === 404) throw new Error("not found");
        return r.json();
      })
      .then((d) => { setSlots(d.slots || []); setUserName(d.userName || ""); setLoading(false); })
      .catch(() => { setError(lang === "cn" ? "无效的预约链接" : "Invalid booking link"); setLoading(false); });
  }, [slug]);

  const grouped = {};
  slots.forEach((s) => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });
  const dates = Object.keys(grouped).sort();

  const handleBook = async () => {
    if (!selected || !form.name || !form.email) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_id: selected.id, name: form.name, email: form.email, company: form.company, position: form.position, meeting_link: form.meetingLink, notes: form.notes }),
      });
      const d = await r.json();
      if (r.ok) {
        setDone(d.booking);
        setSlots((prev) => prev.filter((s) => s.id !== selected.id));
        setSelected(null);
      } else {
        alert(d.error || "Booking failed");
      }
    } catch {
      alert("Network error");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div style={P.page}>
        <div style={P.card}>
          <div style={P.successIcon}>✅</div>
          <h2 style={P.successTitle}>{lang === "cn" ? "预约成功！" : "Booking Confirmed!"}</h2>
          <div style={P.successDetail}>
            <p><b>{lang === "cn" ? "日期" : "Date"}:</b> {done.date}</p>
            <p><b>{lang === "cn" ? "时间" : "Time"}:</b> {done.time} (Beijing Time)</p>
            <p><b>{lang === "cn" ? "姓名" : "Name"}:</b> {done.name}</p>
            {done.company && <p><b>{lang === "cn" ? "公司" : "Company"}:</b> {done.company}</p>}
          </div>
          <p style={P.successNote}>
            {lang === "cn"
              ? "候选人会收到邮件通知，请留意后续沟通。"
              : "The candidate has been notified. They will follow up with you shortly."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={P.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0}
        body{margin:0;background:#0c1222}
        .slot-btn:hover{border-color:#3B82F6!important;transform:translateY(-1px);box-shadow:0 4px 12px rgba(59,130,246,.2)}
        .slot-btn.sel{border-color:#3B82F6!important;background:#3B82F620!important}
        input:focus,textarea:focus{border-color:#3B82F6!important;outline:none}
        @keyframes si{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
      `}</style>

      <header style={P.header}>
        <div>
          <h1 style={P.title}>📅 {lang === "cn" ? `预约面试 — ${userName}` : `Book Interview — ${userName}`}</h1>
          <p style={P.subtitle}>
            {lang === "cn"
              ? "请选择一个可用时间段，填写信息后提交预约"
              : "Select an available time slot below and fill in your details"}
          </p>
        </div>
        <div style={P.langToggle}>
          <button style={{ ...P.langBtn, ...(lang === "cn" ? P.langAct : {}) }} onClick={() => setLang("cn")}>中文</button>
          <button style={{ ...P.langBtn, ...(lang === "en" ? P.langAct : {}) }} onClick={() => setLang("en")}>EN</button>
        </div>
      </header>

      {loading && <div style={P.loading}><div style={P.spinner} /></div>}
      {error && <div style={P.error}>{error}</div>}

      {!loading && dates.length === 0 && (
        <div style={P.empty}>
          <span style={{ fontSize: 40 }}>📭</span>
          <p>{lang === "cn" ? "暂无可约时间，请稍后再试" : "No available slots at the moment. Please check back later."}</p>
        </div>
      )}

      <div style={P.grid}>
        {dates.map((date) => {
          const daySlots = grouped[date];
          // Parse date parts directly to avoid timezone issues
          const [yyyy, mo, da] = date.split("-").map(Number);
          const bjtDate = new Date(Date.UTC(yyyy, mo - 1, da));
          const dow = bjtDate.getUTCDay();
          const mm = mo;
          const dd = da;

          return (
            <div key={date} style={P.dayCard}>
              <div style={P.dayHead}>
                <span style={P.dayDate}>{lang === "cn" ? `${mm}月${dd}日` : date}</span>
                <span style={P.dayDow}>{lang === "cn" ? WEEKDAYS_CN[dow] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow]}</span>
                <span style={P.dayCount}>{daySlots.length} {lang === "cn" ? "可约" : "available"}</span>
              </div>
              <div style={P.daySlots}>
                {daySlots.map((s) => {
                  const startStr = minToStr(s.start_min);
                  const endStr = minToStr(s.start_min + s.duration_min);
                  const localStart = bjtToLocal(date, startStr);
                  const localEnd = bjtToLocal(date, endStr);
                  const isSel = selected?.id === s.id;

                  return (
                    <button
                      key={s.id}
                      className={`slot-btn${isSel ? " sel" : ""}`}
                      style={{ ...P.slot, ...(isSel ? P.slotSel : {}) }}
                      onClick={() => setSelected(isSel ? null : s)}
                    >
                      <div style={P.slotMain}>
                        <span style={P.slotTime}>{startStr} - {endStr}</span>
                        <span style={P.slotTz}>{lang === "cn" ? "北京时间" : "BJT"}</span>
                      </div>
                      <div style={P.slotLocal}>
                        ≈ {localStart.time} - {localEnd.time} {localStart.tz}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking form modal */}
      {selected && (
        <div style={P.overlay} onClick={() => setSelected(null)}>
          <div style={P.modal} onClick={(e) => e.stopPropagation()}>
            <button style={P.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <h3 style={P.formTitle}>
              {lang === "cn" ? "填写预约信息" : "Enter Your Details"}
            </h3>
            <div style={P.formSelected}>
              📅 {selected.date} {minToStr(selected.start_min)}-{minToStr(selected.start_min + selected.duration_min)} {lang === "cn" ? "北京时间" : "BJT"}
            </div>

            <div style={P.formGrid}>
              <div>
                <label style={P.label}>{lang === "cn" ? "姓名 *" : "Name *"}</label>
                <input style={P.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "cn" ? "您的姓名" : "Your name"} autoFocus />
              </div>
              <div>
                <label style={P.label}>{lang === "cn" ? "邮箱 *" : "Email *"}</label>
                <input style={P.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={lang === "cn" ? "your@email.com" : "your@email.com"} />
              </div>
              <div>
                <label style={P.label}>{lang === "cn" ? "公司" : "Company"}</label>
                <input style={P.input} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder={lang === "cn" ? "公司名称" : "Company name"} />
              </div>
              <div>
                <label style={P.label}>{lang === "cn" ? "招聘职位" : "Position"}</label>
                <input style={P.input} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder={lang === "cn" ? "招聘的岗位名称" : "Position title"} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={P.label}>{lang === "cn" ? "面试链接 *" : "Meeting Link *"}</label>
              <input style={P.input} value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder={lang === "cn" ? "Zoom / 飞书 / 腾讯会议链接" : "Zoom / Teams / Meet link"} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={P.label}>{lang === "cn" ? "备注" : "Notes"}</label>
              <textarea style={P.textarea} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={lang === "cn" ? "面试形式等补充信息..." : "Interview format, additional info..."} />
            </div>

            <div style={P.formActions}>
              <button style={P.cancelBtn} onClick={() => setSelected(null)}>
                {lang === "cn" ? "取消" : "Cancel"}
              </button>
              <button
                style={{ ...P.submitBtn, opacity: form.name && form.email && form.meetingLink ? 1 : 0.4 }}
                disabled={!form.name || !form.email || !form.meetingLink || submitting}
                onClick={handleBook}
              >
                {submitting
                  ? (lang === "cn" ? "提交中..." : "Booking...")
                  : (lang === "cn" ? "确认预约" : "Confirm Booking")}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={P.footer}>
        <span>{lang === "cn" ? "所有时间均为北京时间 (UTC+8)，括号内为您本地时间" : "All times shown in Beijing Time (UTC+8). Local time shown in parentheses."}</span>
      </footer>
    </div>
  );
}

const ff = "'DM Sans',system-ui,-apple-system,sans-serif";
const P = {
  page: { fontFamily: ff, minHeight: "100vh", background: "linear-gradient(160deg,#0c1222,#162032 50%,#0f1a2e)", color: "#E2E8F0", padding: "0 0 40px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "32px 24px 24px", maxWidth: 900, margin: "0 auto", gap: 16, flexWrap: "wrap" },
  title: { fontSize: 24, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748B", lineHeight: 1.5 },
  langToggle: { display: "flex", background: "#1e293b", borderRadius: 8, overflow: "hidden", flexShrink: 0 },
  langBtn: { background: "transparent", border: "none", color: "#64748B", fontSize: 12, padding: "8px 14px", cursor: "pointer", fontFamily: ff, fontWeight: 600, transition: "all .15s" },
  langAct: { background: "#334155", color: "#F1F5F9" },
  loading: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 28, height: 28, border: "3px solid #1e293b", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin .7s linear infinite" },
  error: { textAlign: "center", color: "#EF4444", padding: 40, fontSize: 14 },
  empty: { textAlign: "center", padding: "60px 20px", color: "#64748B", fontSize: 15, lineHeight: 2 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, padding: "0 24px", maxWidth: 900, margin: "0 auto" },
  dayCard: { background: "rgba(22,32,50,.7)", borderRadius: 14, border: "1px solid #1e293b88", overflow: "hidden" },
  dayHead: { display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid #1e293b66" },
  dayDate: { fontSize: 15, fontWeight: 700, color: "#F1F5F9" },
  dayDow: { fontSize: 12, color: "#64748B", fontWeight: 500 },
  dayCount: { marginLeft: "auto", fontSize: 11, color: "#10B981", background: "#10B98115", borderRadius: 8, padding: "3px 8px", fontWeight: 600 },
  daySlots: { padding: 8, display: "flex", flexDirection: "column", gap: 6 },
  slot: { display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #1e293b", background: "#0f172a", cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  slotSel: { borderColor: "#3B82F6", background: "rgba(59,130,246,.08)" },
  slotMain: { display: "flex", alignItems: "center", gap: 6, marginBottom: 3 },
  slotTime: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  slotTz: { fontSize: 10, color: "#64748B", fontWeight: 500 },
  slotLocal: { fontSize: 11, color: "#64748B" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: 16 },
  modal: { position: "relative", background: "#1a2744", borderRadius: 18, border: "1px solid #2a3a55", padding: "28px 26px 22px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.5)", animation: "si .2s ease" },
  closeBtn: { position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "#64748B", fontSize: 18, cursor: "pointer", padding: "4px 8px", borderRadius: 6, transition: "color .15s" },
  formTitle: { fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 },
  formSelected: { fontSize: 13, color: "#60A5FA", background: "#3B82F615", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontWeight: 500 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em" },
  input: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: ff, boxSizing: "border-box", transition: "border-color .15s" },
  textarea: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: ff, boxSizing: "border-box", resize: "vertical", lineHeight: 1.5, transition: "border-color .15s" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px solid #2a3a55" },
  cancelBtn: { background: "#334155", border: "none", borderRadius: 8, color: "#94A3B8", padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: ff, fontWeight: 500 },
  submitBtn: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 10px #3B82F633", transition: "opacity .15s" },

  successIcon: { fontSize: 48, textAlign: "center", marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: 700, color: "#F1F5F9", textAlign: "center", marginBottom: 16 },
  successDetail: { background: "#0f172a", borderRadius: 12, padding: "16px 20px", marginBottom: 16, fontSize: 14, lineHeight: 2, color: "#CBD5E1" },
  successNote: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 1.6 },
  card: { background: "#1a2744", borderRadius: 18, border: "1px solid #2a3a55", padding: "40px 32px", maxWidth: 460, margin: "80px auto", boxShadow: "0 24px 60px rgba(0,0,0,.5)" },

  footer: { textAlign: "center", padding: "32px 24px 0", fontSize: 11, color: "#475569", maxWidth: 900, margin: "0 auto" },
};
