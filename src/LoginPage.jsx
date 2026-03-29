import { useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage({ onLogin }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google?.accounts.id.renderButton(btnRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 300,
      });
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await r.json();
      if (r.ok && data.token) {
        localStorage.setItem("auth-token", data.token);
        localStorage.setItem("auth-user", JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        alert("Login failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error during login");
    }
  };

  return (
    <div style={L.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0}
        body{margin:0;background:#0c1222}
      `}</style>
      <div style={L.card}>
        <div style={L.logo}>🎯</div>
        <h1 style={L.title}>面试追踪</h1>
        <p style={L.subtitle}>Interview Tracker</p>
        <p style={L.desc}>管理面试进度、发布可约时间、让猎头在线约面</p>

        <div style={L.features}>
          <div style={L.feature}>📋 看板管理面试进度</div>
          <div style={L.feature}>📆 发布可约时间给猎头</div>
          <div style={L.feature}>✉️ 预约自动邮件通知</div>
          <div style={L.feature}>📝 Mock 面试准备导出</div>
        </div>

        <div style={L.divider} />

        {GOOGLE_CLIENT_ID ? (
          <div ref={btnRef} style={L.gBtn} />
        ) : (
          <div style={L.noKey}>
            <p>⚠️ Google Client ID 未配置</p>
            <p style={{ fontSize: 11, marginTop: 6 }}>
              请在 Vercel 环境变量中添加 VITE_GOOGLE_CLIENT_ID
            </p>
          </div>
        )}

        <p style={L.footer}>使用 Google 账号登录，数据云端同步</p>
      </div>
    </div>
  );
}

const ff = "'DM Sans',system-ui,-apple-system,sans-serif";
const L = {
  page: { fontFamily: ff, minHeight: "100vh", background: "linear-gradient(160deg,#0c1222,#162032 50%,#0f1a2e)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 },
  card: { background: "#1a2744", borderRadius: 20, border: "1px solid #2a3a55", padding: "40px 36px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,.5)" },
  logo: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748B", marginBottom: 16 },
  desc: { fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginBottom: 20 },
  features: { display: "grid", gap: 8, marginBottom: 20, textAlign: "left" },
  feature: { fontSize: 12, color: "#CBD5E1", background: "#0f172a", borderRadius: 8, padding: "8px 12px" },
  divider: { height: 1, background: "#2a3a55", marginBottom: 24 },
  gBtn: { display: "flex", justifyContent: "center", marginBottom: 16 },
  noKey: { color: "#F59E0B", fontSize: 13, background: "#F59E0B15", borderRadius: 10, padding: 16, marginBottom: 16 },
  footer: { fontSize: 11, color: "#475569" },
};
