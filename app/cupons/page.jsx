"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabaseClient";
import { Plus, Tag } from "lucide-react";

function fmtDate(d) {
  if (!d) return "Sem validade";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function CuponsContent() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  async function loadCoupons() {
    setLoading(true);
    const { data } = await supabase.from("atacarejo_coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }

  useEffect(() => { loadCoupons(); }, []);

  function resetForm() {
    setCode(""); setDiscountType("percentage"); setDiscountValue(""); setMinOrderValue("0"); setMaxUses(""); setValidUntil("");
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;
    setSaving(true);

    const { error } = await supabase.from("atacarejo_coupons").insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_value: parseFloat(minOrderValue) || 0,
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
      valid_until: validUntil || null,
    });

    if (error) alert(`Erro ao criar cupom: ${error.message}`);

    resetForm();
    setShowForm(false);
    setSaving(false);
    loadCoupons();
  }

  async function handleToggleActive(id, active) {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)));
    await supabase.from("atacarejo_coupons").update({ active: !active }).eq("id", id);
  }

  return (
    <div>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Cupons</h1>
        <p style={styles.subtitle}>Códigos de desconto para o checkout</p>

        <button onClick={() => setShowForm((v) => !v)} style={styles.newButton}>
          <Plus size={16} /> Novo cupom
        </button>

        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Código *</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} style={styles.input} placeholder="Ex: BEMVINDO10" required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Tipo de desconto</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={styles.input}>
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </div>
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Valor do desconto *</label>
                <input type="number" step="0.01" min="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} style={styles.input} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Pedido mínimo (R$)</label>
                <input type="number" step="0.01" min="0" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} style={styles.input} />
              </div>
            </div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Limite de uso (vazio = ilimitado)</label>
                <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} style={styles.input} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Válido até (vazio = sem prazo)</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} style={styles.input} />
              </div>
            </div>
            <button type="submit" style={styles.saveButton} disabled={saving}>{saving ? "Salvando…" : "Cadastrar cupom"}</button>
          </form>
        )}

        {loading ? (
          <p style={styles.empty}>Carregando…</p>
        ) : coupons.length === 0 ? (
          <p style={styles.empty}>Nenhum cupom cadastrado ainda.</p>
        ) : (
          <div style={styles.list}>
            {coupons.map((c) => (
              <div key={c.id} style={{ ...styles.row2, ...(!c.active ? { opacity: 0.5 } : {}) }}>
                <div style={styles.iconBox}><Tag size={15} /></div>
                <div style={{ flex: 1 }}>
                  <div style={styles.code}>{c.code}</div>
                  <div style={styles.desc}>
                    {c.discount_type === "percentage" ? `${c.discount_value}% de desconto` : `R$ ${Number(c.discount_value).toFixed(2).replace(".", ",")} de desconto`}
                    {c.min_order_value > 0 && ` · mínimo R$ ${Number(c.min_order_value).toFixed(2).replace(".", ",")}`}
                    {c.max_uses && ` · usado ${c.used_count}/${c.max_uses}`}
                    {!c.max_uses && ` · usado ${c.used_count}x`}
                    {" · "}{fmtDate(c.valid_until)}
                  </div>
                </div>
                <button onClick={() => handleToggleActive(c.id, c.active)} style={styles.toggleButton}>
                  {c.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CuponsPage() {
  return (
    <AuthGate>
      <CuponsContent />
    </AuthGate>
  );
}

const styles = {
  content: { padding: "24px 20px", maxWidth: 800, margin: "0 auto" },
  title: { fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 13, color: "#737373", marginBottom: 16 },
  newButton: { display: "flex", alignItems: "center", gap: 6, background: "#171717", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", marginBottom: 14 },
  form: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", maxWidth: 480 },
  row: { display: "flex", gap: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#525252", marginBottom: 4, marginTop: 12, display: "block" },
  input: { border: "1px solid #e5e5e5", borderRadius: 10, padding: "9px 12px", outline: "none", width: "100%", font: "inherit" },
  saveButton: { border: "none", background: "#171717", color: "#fff", borderRadius: 10, padding: "11px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 16 },
  empty: { color: "#a3a3a3", fontSize: 13, padding: 24, textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  row2: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 9, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  code: { fontSize: 13, fontWeight: 700, letterSpacing: 0.3 },
  desc: { fontSize: 11.5, color: "#a3a3a3", marginTop: 2 },
  toggleButton: { border: "1px solid #e5e5e5", background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" },
};
