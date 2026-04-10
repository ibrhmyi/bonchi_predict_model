/**
 * Export Results — JSON and CSV download
 */

import type { RankedConcept } from "./scoring";

interface ExportMeta {
  country: string;
  base: string;
  strategy: string;
  pricePoint: number;
  exportedAt: string;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsJSON(ranking: RankedConcept[], meta: ExportMeta): void {
  const data = {
    meta,
    results: ranking.map((r) => ({
      concept: r.conceptLabel,
      score: r.score,
      baseScore: r.baseScore,
      regionalBonus: r.regionalBonus,
      priceFit: r.priceFit,
      estimatedMargin: r.estimatedMargin,
      flavorFamiliarity: r.regionalFlavorInfo?.familiarity ?? null,
      insights: r.insights,
      factors: r.factorDetails.map((d) => ({
        factor: d.factor,
        countryValue: d.countryValue,
        conceptValue: d.conceptValue,
        match: d.match,
        weight: d.weight,
        weightedMatch: d.weightedMatch,
      })),
    })),
  };

  const filename = `bonchi-${meta.country.toLowerCase()}-${meta.base.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
}

export function exportAsCSV(ranking: RankedConcept[], meta: ExportMeta): void {
  const headers = [
    "Rank",
    "Concept",
    "Score",
    "Base Score",
    "Regional Bonus",
    "Price Fit",
    "Est. Margin",
    "Flavor Familiarity",
    "Country",
    "Base",
    "Strategy",
    "Price Point",
  ];

  const rows = ranking.map((r, i) => [
    i + 1,
    `"${r.conceptLabel}"`,
    r.score,
    r.baseScore,
    r.regionalBonus,
    r.priceFit ?? "",
    r.estimatedMargin ?? "",
    r.regionalFlavorInfo?.familiarity ?? "",
    `"${meta.country}"`,
    `"${meta.base}"`,
    `"${meta.strategy}"`,
    meta.pricePoint,
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const filename = `bonchi-${meta.country.toLowerCase()}-${Date.now()}.csv`;
  downloadBlob(csv, filename, "text/csv");
}
