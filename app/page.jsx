"use client";

import { useEffect, useState } from "react";
import AuthGate from "../components/AuthGate";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabaseClient";
import { Package, ClipboardList, AlertTriangle, Wallet } from "lucide-react";

function fmtMoney(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
}

function PainelContent() {
  const [loading, setLoading] = useState(true);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [estoqueZerado, setEstoqueZerado] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [aReceber, setAReceber] = useState(0);

  async function loadDashboard() {
    setLoading(true);
    const [products, orders, financeiro] = await Promise.all([
      supabase.from("atacarejo_products").select("id, stock"),
      supabase.from("atacarejo_orders").select("id, status"),
      supabase.from("atacarejo_financial_transactions").select("type, amount, status").eq("type", "entrada").eq("status", "pendente"),
    ]);
    setTotalProdutos((products.data || []).length);
    setEstoqueZerado((products.data || []).filter((p) => p.stock === 0).length);
    setPedidosPendentes((orders.data || []).filter((o) => o.status === "pendente").length);
    setAReceber((financeiro.data || []).reduce((s, t) => s + Number(t.amount), 0));
    setLoading(false);
  }

  useEffect(() => { loadDashboard(); }, []);

  return (
    <div>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Painel — Atacarejo</h1>
        <p style={styles.subtitle}>Visão geral da loja</p>

        {loading ? (
          <p style={{ color: "#a3a3a3", fontSize: 13 }}>Carregando…</p>
        ) : (
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={{ ...styles.icon, background: "#f5f5f5" }}><Package size={18} color="#525252" /></div>
              <div style={styles.value}>{totalProdutos}</div>
              <div style={styles.label}>Produtos cadastrados</div>
            </div>
            <div style={{ ...styles.card, ...(estoqueZerado > 0 ? styles.cardAlert : {}) }}>
              <div style={{ ...styles.icon, background: "#fee2e2" }}><AlertTriangle size={18} color="#dc2626" /></div>
              <div style={styles.value}>{estoqueZerado}</div>
              <div style={styles.label}>Produto(s) com estoque zerado</div>
            </div>
            <div style={styles.card}>
              <div style={{ ...styles.icon, background: "#eff6ff" }}><ClipboardList size={18} color="#2563eb" /></div>
              <div style={styles.value}>{pedidosPendentes}</div>
              <div style={styles.label}>Pedidos pendentes</div>
            </div>
            <div style={styles.card}>
              <div style={{ ...styles.icon, background: "#f0fdf4" }}><Wallet size={18} color="#16a34a" /></div>
              <div style={styles.value}>{fmtMoney(aReceber)}</div>
              <div style={styles.label}>A receber (pendente)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PainelPage() {
  return (
    <AuthGate>
      <PainelContent />
    </AuthGate>
  );
}

const styles = {
  content: { padding: "24px 20px", maxWidth: 1000, margin: "0 auto" },
  title: { fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 13, color: "#737373", marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 18 },
  cardAlert: { background: "#fef2f2", borderColor: "#fecaca" },
  icon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  value: { fontSize: 22, fontWeight: 800 },
  label: { fontSize: 12, color: "#737373", marginTop: 2 },
};
