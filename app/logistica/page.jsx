"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabaseClient";
import { Truck } from "lucide-react";

const STATUS_FLOW = [
  { id: "aguardando_separacao", label: "Aguardando Separação" },
  { id: "em_separacao", label: "Em Separação" },
  { id: "saiu_para_entrega", label: "Saiu para Entrega" },
  { id: "entregue", label: "Entregue" },
  { id: "problema", label: "Problema na Entrega" },
];

function LogisticaContent() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");

  async function loadDeliveries() {
    setLoading(true);
    const { data } = await supabase
      .from("atacarejo_deliveries")
      .select("*, atacarejo_orders(order_number, total, atacarejo_customers(name, phone))")
      .order("created_at", { ascending: false });
    setDeliveries(data || []);
    setLoading(false);
  }

  useEffect(() => { loadDeliveries(); }, []);

  async function handleUpdate(id, field, value) {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    await supabase.from("atacarejo_deliveries").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
  }

  const filtered = deliveries.filter((d) => statusFilter === "todos" || d.status === statusFilter);

  return (
    <div>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Logística</h1>
        <p style={styles.subtitle}>Controle o andamento da entrega de cada pedido</p>

        <div style={styles.filters}>
          <button onClick={() => setStatusFilter("todos")} style={{ ...styles.chip, ...(statusFilter === "todos" ? styles.chipActive : {}) }}>Todos</button>
          {STATUS_FLOW.map((s) => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)} style={{ ...styles.chip, ...(statusFilter === s.id ? styles.chipActive : {}) }}>
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.empty}>Carregando…</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>Nenhuma entrega encontrada.</p>
        ) : (
          <div style={styles.list}>
            {filtered.map((d) => (
              <div key={d.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconBox}><Truck size={16} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.pedidoNumero}>Pedido #{d.atacarejo_orders?.order_number}</div>
                    <div style={styles.clienteInfo}>{d.atacarejo_orders?.atacarejo_customers?.name} · {d.atacarejo_orders?.atacarejo_customers?.phone}</div>
                  </div>
                  <select value={d.status} onChange={(e) => handleUpdate(d.id, "status", e.target.value)} style={styles.statusSelect}>
                    {STATUS_FLOW.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Transportadora</label>
                    <input value={d.carrier || ""} onChange={(e) => handleUpdate(d.id, "carrier", e.target.value)} style={styles.input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Código de rastreio</label>
                    <input value={d.tracking_code || ""} onChange={(e) => handleUpdate(d.id, "tracking_code", e.target.value)} style={styles.input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Previsão</label>
                    <input type="date" value={d.estimated_date || ""} onChange={(e) => handleUpdate(d.id, "estimated_date", e.target.value)} style={styles.input} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogisticaPage() {
  return (
    <AuthGate>
      <LogisticaContent />
    </AuthGate>
  );
}

const styles = {
  content: { padding: "24px 20px", maxWidth: 1000, margin: "0 auto" },
  title: { fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 13, color: "#737373", marginBottom: 16 },
  filters: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  chip: { border: "1px solid #e5e5e5", background: "#fff", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#737373" },
  chipActive: { background: "#171717", color: "#fff", borderColor: "#171717" },
  empty: { color: "#a3a3a3", fontSize: 13, padding: 24, textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 16 },
  cardHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  iconBox: { width: 34, height: 34, borderRadius: 10, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pedidoNumero: { fontWeight: 700, fontSize: 13.5 },
  clienteInfo: { fontSize: 11.5, color: "#a3a3a3", marginTop: 1 },
  statusSelect: { border: "1px solid #e5e5e5", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600 },
  row: { display: "flex", gap: 10 },
  label: { fontSize: 10.5, fontWeight: 600, color: "#525252", marginBottom: 4, display: "block" },
  input: { border: "1px solid #e5e5e5", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, width: "100%" },
};
