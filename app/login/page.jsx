"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    router.replace("/");
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.title}>Atacarejo</h1>
        <p style={styles.subtitle}>Painel administrativo</p>
        <label style={styles.label}>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
        <label style={styles.label}>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button} disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", padding: 20 },
  card: { background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 360, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column" },
  title: { fontSize: 22, fontWeight: 800, textAlign: "center", margin: 0 },
  subtitle: { fontSize: 13, color: "#737373", textAlign: "center", marginTop: 4, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 600, color: "#525252", marginBottom: 4, marginTop: 12, display: "block" },
  input: { border: "1px solid #e5e5e5", borderRadius: 10, padding: "10px 12px", outline: "none", width: "100%" },
  error: { color: "#dc2626", fontSize: 12, marginTop: 10 },
  button: { border: "none", background: "#171717", color: "#fff", borderRadius: 10, padding: "12px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 20 },
};
