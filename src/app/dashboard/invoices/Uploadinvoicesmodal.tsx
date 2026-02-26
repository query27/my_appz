"use client";
import { useState, useRef, useCallback } from "react";
import {
  Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2,
  AlertTriangle, Loader2, ChevronRight, Edit3, Check,
  SkipForward, Info, FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ParsedRow {
  _id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  amount: string;
  due_date: string;
  status: string;
  description: string;
  notes: string;
  // validation
  errors: Record<string, string>;
  isDuplicate: boolean;
  isEditing: boolean;
}

interface Props {
  onClose: () => void;
  onImported: (invoices: any[]) => void;
  userId: string;
  existingInvoiceNumbers: string[];
}

const C = {
  card:    "#0f1f18",
  bg:      "#0c1d16",
  border:  "rgba(255,255,255,0.06)",
  emerald: "#34d399",
  red:     "#f87171",
  amber:   "#fbbf24",
  blue:    "#60a5fa",
  gray500: "#6b7280",
  gray400: "#9ca3af",
};

// ── Column aliases for auto-detection ─────────────────────────────────────────
const COLUMN_MAP: Record<string, string> = {
  // client_name
  "client": "client_name", "client name": "client_name", "name": "client_name",
  "customer": "client_name", "customer name": "client_name", "bill to": "client_name",
  // amount
  "amount": "amount", "total": "amount", "price": "amount", "value": "amount",
  "invoice amount": "amount", "cost": "amount", "fee": "amount", "charge": "amount",
  // due_date
  "due date": "due_date", "due": "due_date", "date": "due_date",
  "payment due": "due_date", "due by": "due_date", "expiry": "due_date",
  // invoice_number
  "invoice number": "invoice_number", "invoice #": "invoice_number",
  "inv #": "invoice_number", "inv number": "invoice_number", "number": "invoice_number",
  "invoice no": "invoice_number", "reference": "invoice_number",
  // status
  "status": "status", "payment status": "status", "state": "status",
  // description
  "description": "description", "desc": "description", "service": "description",
  "details": "description", "notes": "notes", "note": "notes", "memo": "notes",
  // email
  "email": "client_email", "client email": "client_email", "e-mail": "client_email",
  "customer email": "client_email", "contact email": "client_email",
  // phone
  "phone": "client_phone", "phone number": "client_phone", "mobile": "client_phone",
  "tel": "client_phone", "telephone": "client_phone", "contact": "client_phone",
  "client phone": "client_phone", "customer phone": "client_phone",
};

const REQUIRED = ["client_name", "amount", "due_date"];

const autoInvoiceNum = () => `INV-${Math.floor(1000 + Math.random() * 9000)}`;

const normalizeDate = (val: string): string => {
  if (!val) return "";
  // Excel serial date
  if (/^\d{4,5}$/.test(val.trim())) {
    const date = XLSX.SSF.parse_date_code(parseInt(val));
    if (date) return `${date.y}-${String(date.m).padStart(2,"0")}-${String(date.d).padStart(2,"0")}`;
  }
  // Try parsing
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return val;
};

const normalizeStatus = (val: string): string => {
  const v = val?.toLowerCase().trim();
  if (["paid", "complete", "completed", "done"].includes(v)) return "paid";
  if (["overdue", "late", "expired"].includes(v)) return "overdue";
  return "pending";
};

const validateRow = (row: Omit<ParsedRow, "errors" | "isDuplicate" | "isEditing">): Record<string, string> => {
  const errors: Record<string, string> = {};
  // Hard errors — blocks import
  if (!row.client_name?.trim()) errors.client_name = "Required";
  if (!row.amount?.trim() || isNaN(Number(row.amount))) errors.amount = "Must be a number";
  if (!row.due_date?.trim()) errors.due_date = "Required";
  else if (isNaN(new Date(row.due_date).getTime())) errors.due_date = "Invalid date";
  // Contact: both missing = hard block, one missing = soft warning only
  const hasEmail = !!row.client_email?.trim();
  const hasPhone = !!row.client_phone?.trim();
  if (!hasEmail && !hasPhone) {
    errors.client_email = "Required (email or phone)";
    errors.client_phone = "Required (email or phone)";
  } else {
    if (!hasEmail) errors.client_email = "⚠ Missing";
    if (!hasPhone) errors.client_phone = "⚠ Missing";
  }
  return errors;
};

// Only hard errors block import — warnings starting with ⚠ are allowed through
const isHardError = (errors: Record<string, string>): boolean => {
  const hardFields = ["client_name", "amount", "due_date"];
  return hardFields.some((f) => !!errors[f]);
};

// ── Step indicators ───────────────────────────────────────────────────────────
const steps = ["Upload", "Preview & Edit", "Import"];

// ── Main Component ────────────────────────────────────────────────────────────
export default function UploadInvoicesModal({ onClose, onImported, userId, existingInvoiceNumbers }: Props) {
  const [step, setStep]           = useState<0 | 1 | 2>(0);
  const [rows, setRows]           = useState<ParsedRow[]>([]);
  const [fileName, setFileName]   = useState("");
  const [dragOver, setDragOver]   = useState(false);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; newClients: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowserClient();

  // ── Parse file ──────────────────────────────────────────────────────────────
  const parseFile = useCallback((file: File) => {
    setParseError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: "array", cellDates: false });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (raw.length < 2) { setParseError("File appears to be empty or has no data rows."); return; }

        // Map headers
        const headers: string[] = (raw[0] as any[]).map((h) => String(h).toLowerCase().trim());
        const fieldMap: Record<number, string> = {};
        headers.forEach((h, i) => {
          const mapped = COLUMN_MAP[h];
          if (mapped) fieldMap[i] = mapped;
        });

        // Build rows
        const parsed: ParsedRow[] = raw.slice(1)
          .filter((r) => r.some((c: any) => String(c).trim()))
          .map((r) => {
            const obj: any = {
              _id: Math.random().toString(36).slice(2),
              invoice_number: "", client_name: "", client_email: "", client_phone: "",
              amount: "", due_date: "", status: "pending", description: "", notes: "",
            };
            Object.entries(fieldMap).forEach(([idx, field]) => {
              let val = String(r[parseInt(idx)] ?? "").trim();
              if (field === "due_date") val = normalizeDate(val);
              if (field === "status") val = normalizeStatus(val);
              obj[field] = val;
            });
            if (!obj.invoice_number) obj.invoice_number = autoInvoiceNum();
            const errors = validateRow(obj);
            const isDuplicate = existingInvoiceNumbers.includes(obj.invoice_number);
            return { ...obj, errors, isDuplicate, isEditing: false };
          });

        setRows(parsed);
        setFileName(file.name);
        setStep(1);
      } catch (err) {
        setParseError("Could not read file. Make sure it's a valid CSV or Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [existingInvoiceNumbers]);

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      setParseError("Only CSV and Excel (.xlsx, .xls) files are supported.");
      return;
    }
    parseFile(file);
  };

  // ── Inline edit ─────────────────────────────────────────────────────────────
  const updateCell = (id: string, field: string, value: string) => {
    setRows((prev) => prev.map((r) => {
      if (r._id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.errors = validateRow(updated);
      updated.isDuplicate = existingInvoiceNumbers.includes(updated.invoice_number);
      return updated;
    }));
  };

  const toggleEdit = (id: string) => {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, isEditing: !r.isEditing } : r));
  };

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r._id !== id));

  // ── Validation summary ───────────────────────────────────────────────────────
  const invalidRows    = rows.filter((r) => isHardError(r.errors));
  const duplicateRows  = rows.filter((r) => r.isDuplicate);
  const validRows      = rows.filter((r) => !isHardError(r.errors));
  const canImport      = invalidRows.length === 0 && rows.length > 0;  // warnings allowed

  // ── Import ───────────────────────────────────────────────────────────────────
  const doImport = async () => {
    if (!canImport || importing) return; // double-click guard
    setImporting(true);
    setStep(2); // immediately go to loading screen — blocks any further clicks

    const validToInsert = rows.filter((r) => !r.isDuplicate);
    const skipped = rows.filter((r) => r.isDuplicate).length;

    // ── Step 1: Fetch existing clients for this user ──────────────────────────
    const { data: existingClients } = await supabase
      .from("clients")
      .select("id, name, email, phone")
      .eq("user_id", userId);

    const clientMap = new Map<string, string>(); // name.toLowerCase() → client_id
    (existingClients || []).forEach((c) => clientMap.set(c.name.toLowerCase().trim(), c.id));

    // ── Step 2: Upsert clients (create new ones, skip existing) ──────────────
    let newClientsCount = 0;
    const uniqueClients = new Map<string, { name: string; email: string; phone: string }>();

    validToInsert.forEach((r) => {
      const key = r.client_name.toLowerCase().trim();
      if (!clientMap.has(key) && !uniqueClients.has(key)) {
        uniqueClients.set(key, {
          name:  r.client_name.trim(),
          email: r.client_email?.trim() || "",
          phone: r.client_phone?.trim() || "",
        });
      }
    });

    if (uniqueClients.size > 0) {
      const clientsToCreate = Array.from(uniqueClients.values()).map((c) => ({
        user_id: userId,
        name:    c.name,
        email:   c.email || null,
        phone:   c.phone || null,
        status:  "active",
      }));

      const { data: createdClients } = await supabase
        .from("clients")
        .insert(clientsToCreate)
        .select("id, name");

      (createdClients || []).forEach((c) => {
        clientMap.set(c.name.toLowerCase().trim(), c.id);
        newClientsCount++;
      });
    }

    // ── Step 3: Bulk insert invoices with client_id linked ────────────────────
    const toInsert = validToInsert.map((r) => ({
      user_id:        userId,
      invoice_number: r.invoice_number,
      client_name:    r.client_name.trim(),
      client_id:      clientMap.get(r.client_name.toLowerCase().trim()) || null,
      client_email:   r.client_email || null,
      client_phone:   r.client_phone || null,
      amount:         parseFloat(r.amount),
      due_date:       r.due_date,
      status:         r.status || "pending",
      description:    r.description || null,
      notes:          r.notes || null,
    }));

    const { data } = await supabase
      .from("invoices")
      .insert(toInsert)
      .select();

    const inserted = data || [];
    setImportResult({
      imported:   inserted.length,
      skipped:    skipped + (toInsert.length - inserted.length),
      newClients: newClientsCount,
    });
    setImporting(false);
    if (inserted.length > 0) onImported(inserted);
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    background: hasError ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${hasError ? "rgba(248,113,113,0.4)" : C.border}`,
    borderRadius: 6, padding: "4px 8px", fontSize: 12,
    color: "#fff", outline: "none", fontFamily: "Inter,sans-serif",
    width: "100%", boxSizing: "border-box" as const,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .upl * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        .upl-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .upl-scrollbar::-webkit-scrollbar-thumb { background: #1a3a26; border-radius: 2px; }
        .upl-drop { transition: border-color 0.2s, background 0.2s; }
        .upl-drop:hover { border-color: rgba(52,211,153,0.4) !important; background: rgba(52,211,153,0.04) !important; }
        .upl-row-invalid { background: rgba(248,113,113,0.03); }
        .upl-row-dup { background: rgba(251,191,36,0.03); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .upl-fade { animation: fadeIn 0.2s ease forwards; }
      `}</style>

      <div className="upl" style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}>

        <div className="upl-fade" style={{ background: "#0c1d16", border: `1px solid ${C.border}`, borderRadius: 24, width: "100%", maxWidth: step === 1 ? 900 : 520, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 100px rgba(0,0,0,0.7)", overflow: "hidden" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Import Invoices</h2>
              <p style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>Upload a CSV or Excel file to bulk import</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 7, cursor: "pointer", color: C.gray500, display: "flex" }}>
              <X size={16} />
            </button>
          </div>

          {/* ── Step indicators ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "16px 28px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                    background: i < step ? C.emerald : i === step ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)",
                    color: i < step ? "#0a1a14" : i === step ? C.emerald : C.gray500,
                    border: i === step ? `1px solid ${C.emerald}` : "none",
                  }}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: i === step ? 600 : 400, color: i === step ? "#fff" : C.gray500 }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={14} color="#374151" style={{ margin: "0 12px" }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 0: Upload ── */}
          {step === 0 && (
            <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Drop zone */}
              <div
                className="upl-drop"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? C.emerald : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16, padding: "48px 24px",
                  textAlign: "center", cursor: "pointer",
                  background: dragOver ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Upload size={24} color={C.emerald} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Drop your file here</p>
                <p style={{ fontSize: 13, color: C.gray500, marginBottom: 16 }}>or click to browse</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {[".csv", ".xlsx", ".xls"].map((ext) => (
                    <span key={ext} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: C.gray400 }}>{ext}</span>
                  ))}
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {parseError && (
                <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, color: C.red, fontSize: 13 }}>
                  <AlertCircle size={15} /> {parseError}
                </div>
              )}

              {/* Expected format hint */}
              <div style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Info size={14} color={C.blue} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>Expected columns</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { col: "Client Name *",    hint: "or 'Customer', 'Bill To'" },
                    { col: "Amount *",         hint: "or 'Total', 'Price', 'Fee'" },
                    { col: "Due Date *",       hint: "or 'Due', 'Payment Due'" },
                    { col: "Email *",          hint: "or 'Client Email', 'E-mail'" },
                    { col: "Phone *",          hint: "or 'Mobile', 'Tel', 'Telephone'" },
                    { col: "Invoice Number",   hint: "Auto-generated if missing" },
                    { col: "Status",           hint: "paid / pending / overdue" },
                    { col: "Description",      hint: "or 'Service', 'Details'" },
                  ].map(({ col, hint }) => (
                    <div key={col} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", minWidth: 110 }}>{col}</span>
                      <span style={{ fontSize: 11, color: C.gray500 }}>{hint}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: C.gray500, marginTop: 10 }}>* Required — column names are case-insensitive</p>
              </div>
            </div>
          )}

          {/* ── Step 1: Preview & Edit ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              {/* Summary bar */}
              <div style={{ padding: "12px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FileSpreadsheet size={14} color={C.emerald} />
                  <span style={{ fontSize: 12, color: C.gray400 }}>{fileName}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
                  <span style={{ fontSize: 12, color: C.emerald }}>{validRows.length} valid</span>
                  {invalidRows.length > 0 && <span style={{ fontSize: 12, color: C.red }}>{invalidRows.length} invalid</span>}
                  {duplicateRows.length > 0 && <span style={{ fontSize: 12, color: C.amber }}>{duplicateRows.length} duplicate</span>}
                  <span style={{ fontSize: 12, color: C.gray500 }}>{rows.length} total</span>
                </div>
              </div>

              {/* Validation banner */}
              {invalidRows.length > 0 && (
                <div style={{ margin: "12px 28px 0", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.red, flexShrink: 0 }}>
                  <AlertCircle size={14} />
                  <strong>{invalidRows.length} row{invalidRows.length > 1 ? "s" : ""} have errors.</strong> Fix all errors before importing. Click the ✏️ icon to edit a row.
                </div>
              )}
              {invalidRows.length === 0 && rows.some((r) => Object.keys(r.errors).length > 0) && (
                <div style={{ margin: "12px 28px 0", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.amber, flexShrink: 0 }}>
                  <AlertTriangle size={14} />
                  Some rows have missing contact info (email or phone). They will still be imported — you can fill in the details later on the Clients page.
                </div>
              )}
              {duplicateRows.length > 0 && invalidRows.length === 0 && (
                <div style={{ margin: "12px 28px 0", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.amber, flexShrink: 0 }}>
                  <AlertTriangle size={14} />
                  <strong>{duplicateRows.length} duplicate invoice number{duplicateRows.length > 1 ? "s" : ""} detected.</strong> These will be skipped during import. Remove or edit them if needed.
                </div>
              )}

              {/* Table */}
              <div className="upl-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: "12px 28px 0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 900 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["#", "Invoice #", "Client Name *", "Email *", "Phone *", "Amount *", "Due Date *", "Status", "Description", ""].map((h) => (
                        <th key={h} style={{ textAlign: "left", fontSize: 10, color: "#4b5563", fontWeight: 500, padding: "8px 8px", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row._id}
                        className={row.isDuplicate ? "upl-row-dup" : Object.keys(row.errors).length > 0 ? "upl-row-invalid" : ""}
                        style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>

                        {/* Row number */}
                        <td style={{ padding: "8px 8px", color: C.gray500, fontSize: 11 }}>{idx + 1}</td>

                        {/* Invoice number */}
                        <td style={{ padding: "8px 8px", minWidth: 100 }}>
                          {row.isEditing ? (
                            <input value={row.invoice_number} onChange={(e) => updateCell(row._id, "invoice_number", e.target.value)} style={inputStyle(false)} />
                          ) : (
                            <span style={{ fontFamily: "monospace", color: row.isDuplicate ? C.amber : "#fff", fontSize: 11 }}>
                              {row.invoice_number}
                              {row.isDuplicate && <span style={{ marginLeft: 4, fontSize: 9, color: C.amber }}>DUP</span>}
                            </span>
                          )}
                        </td>

                        {/* Client name */}
                        <td style={{ padding: "8px 8px", minWidth: 130 }}>
                          {row.isEditing ? (
                            <input value={row.client_name} onChange={(e) => updateCell(row._id, "client_name", e.target.value)} style={inputStyle(!!row.errors.client_name)} placeholder="Required" />
                          ) : (
                            <span style={{ color: row.errors.client_name ? C.red : "#fff" }}>
                              {row.client_name || <span style={{ color: C.red, fontStyle: "italic" }}>Missing</span>}
                            </span>
                          )}
                          {row.errors.client_name && !row.isEditing && <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>{row.errors.client_name}</div>}
                        </td>

                        {/* Email */}
                        <td style={{ padding: "8px 8px", minWidth: 140 }}>
                          {row.isEditing ? (
                            <input type="email" value={row.client_email} onChange={(e) => updateCell(row._id, "client_email", e.target.value)} style={inputStyle(!!row.errors.client_email && !row.errors.client_email.startsWith("⚠"))} placeholder="email@example.com" />
                          ) : (
                            <span style={{ color: !row.errors.client_email ? C.gray400 : row.errors.client_email.startsWith("⚠") ? C.amber : C.red, fontSize: 11 }}>
                              {row.client_email || <span style={{ fontStyle: "italic" }}>—</span>}
                            </span>
                          )}
                          {row.errors.client_email && !row.isEditing && (
                            <div style={{ fontSize: 10, color: row.errors.client_email.startsWith("⚠") ? C.amber : C.red, marginTop: 2 }}>{row.errors.client_email}</div>
                          )}
                        </td>

                        {/* Phone */}
                        <td style={{ padding: "8px 8px", minWidth: 110 }}>
                          {row.isEditing ? (
                            <input value={row.client_phone} onChange={(e) => updateCell(row._id, "client_phone", e.target.value)} style={inputStyle(!!row.errors.client_phone && !row.errors.client_phone.startsWith("⚠"))} placeholder="+1 234 567 8900" />
                          ) : (
                            <span style={{ color: !row.errors.client_phone ? C.gray400 : row.errors.client_phone.startsWith("⚠") ? C.amber : C.red, fontSize: 11 }}>
                              {row.client_phone || <span style={{ fontStyle: "italic" }}>—</span>}
                            </span>
                          )}
                          {row.errors.client_phone && !row.isEditing && (
                            <div style={{ fontSize: 10, color: row.errors.client_phone.startsWith("⚠") ? C.amber : C.red, marginTop: 2 }}>{row.errors.client_phone}</div>
                          )}
                        </td>

                        {/* Amount */}
                        <td style={{ padding: "8px 8px", minWidth: 90 }}>
                          {row.isEditing ? (
                            <input type="number" value={row.amount} onChange={(e) => updateCell(row._id, "amount", e.target.value)} style={inputStyle(!!row.errors.amount)} placeholder="0.00" />
                          ) : (
                            <span style={{ color: row.errors.amount ? C.red : "#fff", fontWeight: 600 }}>
                              {row.amount ? `$${parseFloat(row.amount).toLocaleString()}` : <span style={{ color: C.red, fontStyle: "italic" }}>Missing</span>}
                            </span>
                          )}
                          {row.errors.amount && !row.isEditing && <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>{row.errors.amount}</div>}
                        </td>

                        {/* Due date */}
                        <td style={{ padding: "8px 8px", minWidth: 110 }}>
                          {row.isEditing ? (
                            <input type="date" value={row.due_date} onChange={(e) => updateCell(row._id, "due_date", e.target.value)} style={{ ...inputStyle(!!row.errors.due_date), colorScheme: "dark" }} />
                          ) : (
                            <span style={{ color: row.errors.due_date ? C.red : C.gray400, fontSize: 11 }}>
                              {row.due_date ? new Date(row.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span style={{ color: C.red, fontStyle: "italic" }}>Missing</span>}
                            </span>
                          )}
                          {row.errors.due_date && !row.isEditing && <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>{row.errors.due_date}</div>}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "8px 8px", minWidth: 90 }}>
                          {row.isEditing ? (
                            <select value={row.status} onChange={(e) => updateCell(row._id, "status", e.target.value)}
                              style={{ ...inputStyle(false), appearance: "none", cursor: "pointer", paddingLeft: 8 }}>
                              <option value="pending" style={{ background: "#0c1d16" }}>Pending</option>
                              <option value="paid" style={{ background: "#0c1d16" }}>Paid</option>
                              <option value="overdue" style={{ background: "#0c1d16" }}>Overdue</option>
                            </select>
                          ) : (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                              background: row.status === "paid" ? "rgba(52,211,153,0.12)" : row.status === "overdue" ? "rgba(248,113,113,0.12)" : "rgba(251,191,36,0.12)",
                              color: row.status === "paid" ? C.emerald : row.status === "overdue" ? C.red : C.amber,
                            }}>
                              {row.status}
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td style={{ padding: "8px 8px", minWidth: 150, maxWidth: 200 }}>
                          {row.isEditing ? (
                            <input value={row.description} onChange={(e) => updateCell(row._id, "description", e.target.value)} style={inputStyle(false)} placeholder="Optional" />
                          ) : (
                            <span style={{ color: C.gray500, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 180 }}>
                              {row.description || "—"}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "8px 8px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => toggleEdit(row._id)}
                              title={row.isEditing ? "Done" : "Edit row"}
                              style={{ background: row.isEditing ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${row.isEditing ? "rgba(52,211,153,0.3)" : C.border}`, borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: row.isEditing ? C.emerald : C.gray500, display: "flex" }}>
                              {row.isEditing ? <Check size={12} /> : <Edit3 size={12} />}
                            </button>
                            <button onClick={() => removeRow(row._id)}
                              title="Remove row"
                              style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: C.red, display: "flex" }}>
                              <X size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <button onClick={() => { setStep(0); setRows([]); setFileName(""); }}
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 500, color: C.gray400, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                  ← Back
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {!canImport && invalidRows.length > 0 && (
                    <span style={{ fontSize: 12, color: C.red }}>Fix {invalidRows.length} error{invalidRows.length > 1 ? "s" : ""} to continue</span>
                  )}
                  <button onClick={doImport} disabled={!canImport || importing}
                    style={{ background: canImport ? "linear-gradient(135deg,#34d399,#10b981)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 600, color: canImport ? "#fff" : C.gray500, cursor: (canImport && !importing) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter,sans-serif", opacity: importing ? 0.7 : 1 }}>
                    {importing
                      ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Importing…</>
                      : <>Import {validRows.length} Invoice{validRows.length !== 1 ? "s" : ""}</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Result ── */}
          {step === 2 && (
            <div style={{ padding: 40, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              {importing ? (
                <>
                  <Loader2 size={40} color={C.emerald} style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ fontSize: 15, color: "#fff", fontWeight: 600 }}>Importing invoices…</p>
                </>
              ) : (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <CheckCircle2 size={28} color={C.emerald} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Import Complete!</h3>
                    <p style={{ fontSize: 14, color: C.gray400, lineHeight: 1.8 }}>
                      <span style={{ color: C.emerald, fontWeight: 700 }}>{importResult?.imported} invoice{importResult?.imported !== 1 ? "s" : ""}</span> imported successfully
                      {(importResult?.newClients ?? 0) > 0 && <><br /><span style={{ color: C.blue, fontWeight: 700 }}>{importResult?.newClients} new client{importResult?.newClients !== 1 ? "s" : ""}</span> added to your Clients page</>}
                      {importResult?.skipped ? <><br /><span style={{ color: C.amber }}>{importResult.skipped} skipped</span> (duplicates or errors)</> : ""}
                    </p>
                  </div>
                  <button onClick={onClose}
                    style={{ background: "linear-gradient(135deg,#34d399,#10b981)", border: "none", borderRadius: 12, padding: "12px 32px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "Inter,sans-serif", marginTop: 8 }}>
                    Done
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}