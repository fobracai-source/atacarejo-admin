"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabaseClient";
import { Shield, Info } from "lucide-react";

const ROLES = ["Administrador", "Gerente", "Operador"];

function TiContent() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEmployees() {
    setLoading(true);
    const { data } = await supabase.from("atacarejo_employees").select("*").eq("status", "ativo").order("name");
    setEmployees(data || []);
    setLoading(false);
  }

  useEffect(() => { loadEmployees(); }, []);

  async function handleUpdateRole(id, role) {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, system_role: role } : e)));
    await supabase.from("atacarejo_employees").update({ system_role: role }).eq("id", id);
  }

  return (
    <div>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>TI</h1>
        <p style={styles.subtitle}>Usuários do sistema e seus papéis</p>

        <p style={styles.infoBox}>
          <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          Por enquanto, o papel de cada pessoa aqui é só uma etiqueta — ainda não existe uma trava
          técnica real que impeça, por exemplo, um "Operador" de acessar uma tela restrita a
          "Administrador". Isso está na lista de melhorias futuras do sistema.
        </p>

        {loading ? (
          <p style={styles.empty}>Carregando…</p>
        ) : employees.length === 0 ? (
          <p style={styles.empty}>Nenhuma pessoa ativa cadastrada no RH ainda.</p>
        ) : (
          <div style={styles.list}>
            {employees.map((emp) => (
              <div key={emp.id} style={styles.row}>
                <div style={styles.iconBox}><Shield size={15} /></div>
                <div style={{ flex: 1 }}>
                  <div style={styles.name}>{emp.name}</div>
                  <div style={styles.dept}>{emp.department}</div>
                </div>
                <select value={emp.system_role || "Operador"} onChange={(e) => handleUpdateRole(emp.id, e.target.value)} style={styles.select}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TiPage() {
  return (
    <AuthGate>
      <TiContent />
    </AuthGate>
  );
}

const styles = {
  content: { padding: "24px 20px", maxWidth: 800, margin: "0 auto" },
  title: { fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 13, color: "#737373", marginBottom: 16 },
  infoBox: { display: "flex", gap: 8, fontSize: 12, color: "#525252", background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 10, padding: "10px 14px", marginBottom: 18, lineHeight: 1.5 },
  empty: { color: "#a3a3a3", fontSize: 13, padding: 24, textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  row: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 9, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  name: { fontSize: 13, fontWeight: 600 },
  dept: { fontSize: 11, color: "#a3a3a3" },
  select: { border: "1px solid #e5e5e5", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600 },
};
