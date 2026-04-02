import { useState } from "react";
import type { FactorMap } from "../data/marketFit";
import {
  deleteScenario,
  generateScenarioId,
  loadScenarios,
  renameScenario,
  saveScenario,
  type Scenario,
} from "../utils/scenarios";

type ScenarioPanelProps = {
  countryId: string;
  baseId: string;
  presetId: string;
  pricePoint: number;
  weights: FactorMap;
  topConcept: string;
  topScore: number;
  countryLabel: string;
  baseLabel: string;
  presetLabel: string;
  onRestore: (scenario: Scenario) => void;
};

export function ScenarioPanel({
  countryId,
  baseId,
  presetId,
  pricePoint,
  weights,
  topConcept,
  topScore,
  countryLabel,
  baseLabel,
  presetLabel,
  onRestore,
}: ScenarioPanelProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  const handleSave = () => {
    const name = `${countryLabel} / ${baseLabel} / ${presetLabel} — $${pricePoint.toFixed(2)}`;
    const scenario: Scenario = {
      id: generateScenarioId(),
      name,
      createdAt: new Date().toISOString(),
      countryId,
      baseId,
      presetId,
      pricePoint,
      weights: { ...weights },
      topConcept,
      topScore,
    };
    setScenarios(saveScenario(scenario));
  };

  const handleDelete = (id: string) => {
    setScenarios(deleteScenario(id));
    setCompareIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      setScenarios(renameScenario(id, editName.trim()));
    }
    setEditingId(null);
    setEditName("");
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const compared = scenarios.filter((s) => compareIds.has(s.id));

  return (
    <section className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">Scenario Snapshots</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone">
            Save your current configuration, then compare or restore later.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center rounded-full bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Save Current Scenario
        </button>
      </div>

      {scenarios.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 transition md:flex-row md:items-center md:justify-between ${
                compareIds.has(s.id)
                  ? "border-[#2D6A4F]/30 bg-[#2D6A4F]/[0.04]"
                  : "border-[#ece3d5] bg-[#fffdfa]"
              }`}
            >
              <div className="flex-1">
                {editingId === s.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRename(s.id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-xl border border-sand bg-bone px-3 py-1.5 text-sm text-ink outline-none focus:border-[#2D6A4F]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="text-xs font-medium text-[#2D6A4F] hover:underline"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-stone hover:underline"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="font-medium text-ink">{s.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone">
                      <span>
                        Best: {s.topConcept} ({s.topScore}/100)
                      </span>
                      <span>
                        {new Date(s.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCompare(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    compareIds.has(s.id)
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-ink/5 text-ink hover:bg-ink/10"
                  }`}
                >
                  {compareIds.has(s.id) ? "Comparing" : "Compare"}
                </button>
                <button
                  type="button"
                  onClick={() => onRestore(s)}
                  className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-ink/10"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(s.id);
                    setEditName(s.name);
                  }}
                  className="text-xs text-stone hover:text-ink hover:underline"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-red-400 hover:text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare view */}
      {compared.length >= 2 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
            Comparison
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
                  <th className="px-3 py-2">Metric</th>
                  {compared.map((s) => (
                    <th key={s.id} className="px-3 py-2 text-center">
                      {s.name.length > 30 ? `${s.name.slice(0, 30)}...` : s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="bg-white/80">
                  <td className="px-3 py-2.5 font-medium text-ink">Top Concept</td>
                  {compared.map((s) => (
                    <td key={s.id} className="px-3 py-2.5 text-center text-ink">
                      {s.topConcept}
                    </td>
                  ))}
                </tr>
                <tr className="bg-white/80">
                  <td className="px-3 py-2.5 font-medium text-ink">Score</td>
                  {compared.map((s) => (
                    <td key={s.id} className="px-3 py-2.5 text-center">
                      <span className="font-bold text-[#2D6A4F]">{s.topScore}</span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-white/80">
                  <td className="px-3 py-2.5 font-medium text-ink">Price Point</td>
                  {compared.map((s) => (
                    <td key={s.id} className="px-3 py-2.5 text-center text-ink">
                      ${s.pricePoint.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scenarios.length === 0 && (
        <p className="mt-5 text-sm text-stone">
          No snapshots yet. Save your current configuration to start comparing scenarios.
        </p>
      )}
    </section>
  );
}
