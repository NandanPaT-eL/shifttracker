import { useState } from "react";
import { IconClose, IconClock, IconMapPin, IconTrash, IconDollar } from "./Icons.jsx";

const emptyForm = (date) => ({
  date,
  startTime: "09:00",
  endTime: "17:00",
  category: "",
  location: "",
  notes: "",
  pay: { enabled: false, type: "hourly", rate: "", flatAmount: "" },
});

function CategoryDot({ color }) {
  return <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block" style={{ background: color }} />;
}

export default function ShiftModal({ date, shifts, categories, onClose, onSave, onDelete, onCreateCategory }) {
  const [form, setForm] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const editing = form?._id;

  const startAdding = () => {
    const defaultCategory = categories[0]?.name || "";
    setForm({ ...emptyForm(date), category: defaultCategory });
  };

  const startEditing = (shift) => {
    setForm({
      ...shift,
      pay: {
        enabled: !!shift.pay?.enabled,
        type: shift.pay?.type || "hourly",
        rate: shift.pay?.rate || "",
        flatAmount: shift.pay?.flatAmount || "",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setForm(null);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const created = await onCreateCategory(newCategory.trim());
    setForm((f) => ({ ...f, category: created.name }));
    setNewCategory("");
    setShowNewCategory(false);
  };

  const prettyDate = new Date(date + "T00:00:00Z").toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[3px] p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <div className="text-[15px] font-semibold text-slate-900">{prettyDate}</div>
            {!form && (
              <div className="text-[12px] text-slate-400 mt-0.5">
                {shifts.length} shift{shifts.length !== 1 ? "s" : ""} logged
              </div>
            )}
            {form && (
              <div className="text-[12px] text-slate-400 mt-0.5">
                {editing ? "Edit shift" : "Log new shift"}
              </div>
            )}
          </div>
          <button
            id="modal-close"
            onClick={form ? () => setForm(null) : onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconClose size={14} />
          </button>
        </div>

        <div className="p-5">
          {/* ── List mode ─────────────────────────────── */}
          {!form && (
            <div className="flex flex-col gap-2.5 animate-fade-in">
              {shifts.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-slate-300 text-4xl mb-3">🕐</div>
                  <div className="text-[13px] text-slate-400">No shifts logged yet.</div>
                  <div className="text-[12px] text-slate-300 mt-1">Tap below to add one.</div>
                </div>
              )}

              {shifts.map((s) => {
                const color = categories.find((c) => c.name === s.category)?.color || "#3B82F6";
                return (
                  <button
                    key={s._id}
                    onClick={() => startEditing(s)}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-card px-4 py-3.5 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                      <div>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                          <IconClock size={12} className="text-slate-400" />
                          {s.startTime} – {s.endTime}
                          <span className="text-slate-400 font-normal">· {s.hours}h</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                            <CategoryDot color={color} />
                            {s.category}
                          </span>
                          {s.location && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <IconMapPin size={10} />
                              {s.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {s.pay?.enabled && (
                      <div className="text-[14px] font-bold text-emerald-500 flex-shrink-0">
                        ${s.pay.amount?.toFixed(2)}
                      </div>
                    )}
                  </button>
                );
              })}

              <button
                id="modal-add-shift"
                onClick={startAdding}
                className="btn-primary w-full mt-1 py-3 rounded-xl text-[13.5px]"
              >
                + Log shift on this day
              </button>
            </div>
          )}

          {/* ── Form mode ─────────────────────────────── */}
          {form && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-in">
              {/* Time row */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start</span>
                  <input
                    type="time" required value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="field"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End</span>
                  <input
                    type="time" required value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="field"
                  />
                </label>
              </div>

              {/* Category */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</span>
                <div className="flex gap-2">
                  <select
                    required value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="field flex-1"
                  >
                    <option value="" disabled>Choose category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory((v) => !v)}
                    className="btn-ghost text-[12px] px-3 flex-shrink-0"
                  >
                    New
                  </button>
                </div>
              </label>

              {showNewCategory && (
                <div className="flex gap-2 -mt-2 animate-fade-in">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category name"
                    className="field flex-1"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="btn-primary text-[12px] px-4 py-2 rounded-xl flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Location */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Location <span className="text-slate-300 normal-case font-normal">(optional)</span>
                </span>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Downtown store"
                  className="field"
                />
              </label>

              {/* Pay tracker */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                    <IconDollar size={15} className="text-slate-400" />
                    Track pay for this shift
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.pay.enabled}
                      onChange={(e) => setForm({ ...form, pay: { ...form.pay, enabled: e.target.checked } })}
                      className="sr-only peer"
                      id="pay-toggle"
                    />
                    <div className="w-10 h-5.5 rounded-full bg-slate-200 peer-checked:bg-blue-500 transition-colors relative" style={{ height: "22px" }}>
                      <div className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${form.pay.enabled ? "translate-x-[18px]" : ""}`} />
                    </div>
                  </div>
                </label>

                {form.pay.enabled && (
                  <div className="mt-3.5 flex flex-col gap-3 animate-fade-in">
                    <div className="pill-group">
                      {["hourly", "flat"].map((t) => (
                        <button
                          key={t} type="button"
                          onClick={() => setForm({ ...form, pay: { ...form.pay, type: t } })}
                          className={`pill-btn flex-1 capitalize ${form.pay.type === t ? "active" : ""}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {form.pay.type === "hourly" ? (
                      <input
                        type="number" step="0.01" min="0" placeholder="Hourly rate ($)"
                        value={form.pay.rate}
                        onChange={(e) => setForm({ ...form, pay: { ...form.pay, rate: e.target.value } })}
                        className="field"
                      />
                    ) : (
                      <input
                        type="number" step="0.01" min="0" placeholder="Flat amount ($)"
                        value={form.pay.flatAmount}
                        onChange={(e) => setForm({ ...form, pay: { ...form.pay, flatAmount: e.target.value } })}
                        className="field"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes (optional)"
                rows={2}
                className="field resize-none"
              />

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                {editing && (
                  <button
                    type="button"
                    onClick={async () => { await onDelete(form._id); setForm(null); }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 text-[13px] font-medium hover:bg-red-100 transition-colors"
                  >
                    <IconTrash size={14} />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="flex-1 btn-ghost py-2.5 rounded-xl text-[13.5px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-[13.5px] disabled:opacity-70"
                >
                  {saving ? "Saving…" : editing ? "Update" : "Save Shift"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
