export function createScenarioModel({ companies }) {
  const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
  const riskLabels = [
    "Taiwan semiconductor exposure","China manufacturing exposure","Advanced packaging exposure","HBM/memory exposure","Battery minerals exposure","Rare earth exposure","Data-center power exposure","Logistics chokepoint exposure","Single-supplier concentration","Export control exposure","Energy sensitivity","Inventory buffer weakness"
  ];

  function edgeScore(edge) {
    const invPenalty = 1 / (1 + edge.inventoryCoverageDays / 30);
    return 0.35 * edge.volumeShare + 0.25 * edge.leadTimeElasticity + 0.25 * edge.substitutionDifficulty + 0.15 * invPenalty;
  }

  function buildGraph(company) {
    const nodes = new Set([company.name, ...company.segments, ...company.products, ...company.suppliers, ...company.materials, ...company.regions]);
    const adj = new Map();
    const addEdge = (from, to, meta) => {
      const edge = { from, to, ...meta };
      if (!adj.has(from)) adj.set(from, []);
      adj.get(from).push(edge);
    };

    company.segments.forEach((seg, i) => {
      addEdge(seg, company.name, { volumeShare: 0.55 + i * 0.1, leadTimeElasticity: 0.45, substitutionDifficulty: 0.6, inventoryCoverageDays: 20 });
    });
    company.products.forEach((p, i) => {
      const seg = company.segments[i % company.segments.length];
      addEdge(p, seg, { volumeShare: 0.5 + (i % 3) * 0.1, leadTimeElasticity: 0.5, substitutionDifficulty: 0.5, inventoryCoverageDays: 18 });
    });
    company.suppliers.forEach((s, i) => {
      const p = company.products[i % company.products.length];
      addEdge(s, p, { volumeShare: 0.45 + (i % 4) * 0.12, leadTimeElasticity: 0.65, substitutionDifficulty: 0.7, inventoryCoverageDays: 14 });
    });
    company.materials.forEach((m, i) => {
      const s = company.suppliers[i % company.suppliers.length];
      addEdge(m, s, { volumeShare: 0.4 + (i % 5) * 0.1, leadTimeElasticity: 0.6, substitutionDifficulty: 0.75, inventoryCoverageDays: 12 });
    });
    company.regions.forEach((r, i) => {
      const s = company.suppliers[i % company.suppliers.length];
      addEdge(r, s, { volumeShare: 0.38 + (i % 3) * 0.08, leadTimeElasticity: 0.55, substitutionDifficulty: 0.58, inventoryCoverageDays: 22 });
    });

    return { nodes, adj };
  }

  function shockToNodeWeights(scenario) {
    const lower = scenario.name.toLowerCase();
    const map = new Map();
    if (lower.includes("taiwan")) map.set("Taiwan", 0.95);
    if (lower.includes("hbm")) map.set("HBM memory", 0.9);
    if (lower.includes("copper")) map.set("Copper", 0.75);
    if (lower.includes("lithium")) map.set("Lithium", 0.8);
    if (lower.includes("packaging")) map.set("Advanced substrates", 0.82);
    if (lower.includes("rare earth")) map.set("Rare earth magnets", 0.85);
    if (lower.includes("power")) map.set("Data-center power equipment", 0.86);
    if (lower.includes("shipping") || lower.includes("suez") || lower.includes("sea")) map.set("Global shipping lanes", 0.78);
    if (lower.includes("export")) map.set("China", 0.7);
    if (!map.size) map.set(riskLabels[0], 0.65);
    return map;
  }

  function propagate(company, scenario) {
    const { adj } = buildGraph(company);
    const seeds = shockToNodeWeights(scenario);
    const impacts = new Map();
    const queue = [];
    seeds.forEach((score, node) => {
      impacts.set(node, score);
      queue.push({ node, score, path: [node], contribution: score });
    });
    const pathContribs = [];

    while (queue.length) {
      const { node, score, path, contribution } = queue.shift();
      const edges = adj.get(node) || [];
      edges.forEach((edge) => {
        const prop = score * edgeScore(edge);
        const existing = impacts.get(edge.to) || 0;
        if (prop > existing * 0.7) {
          impacts.set(edge.to, Math.max(existing, prop));
        }
        if (prop > 0.06 && path.length < 6) {
          const nextPath = [...path, edge.to];
          const nextContribution = contribution * edgeScore(edge);
          pathContribs.push({ path: nextPath, contribution: nextContribution, edge });
          queue.push({ node: edge.to, score: prop, path: nextPath, contribution: nextContribution });
        }
      });
    }

    const companyImpact = clamp((impacts.get(company.name) || 0) * 100 + (100 - company.resilienceScore) * 0.3, 0, 100);
    const segmentImpact = company.segments.map((seg) => ({ segment: seg, score: clamp((impacts.get(seg) || 0) * 100, 0, 100) })).sort((a, b) => b.score - a.score);
    const window = companyImpact > 75 ? "4+ quarters" : companyImpact > 50 ? "2-4 quarters" : "1-2 quarters";

    const topPaths = pathContribs
      .filter((p) => p.path[p.path.length - 1] === company.name)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5)
      .map((p) => ({
        nodes: p.path,
        contribution: clamp(p.contribution * 100, 0, 100),
        rationale: `Volume share ${p.edge.volumeShare.toFixed(2)}, lead-time elasticity ${p.edge.leadTimeElasticity.toFixed(2)}, substitution ${p.edge.substitutionDifficulty.toFixed(2)}, inventory ${p.edge.inventoryCoverageDays}d`
      }));

    return {
      company: company.name,
      companyImpactScore: Math.round(companyImpact),
      segmentImpact,
      recoveryWindow: window,
      explainability: {
        scenario: scenario.name,
        topContributingPaths: topPaths,
        waterfall: topPaths.map((p) => ({ label: p.nodes.join(" → "), value: Math.round(p.contribution) })),
      }
    };
  }

  function runScenario(scenario) {
    const byCompany = companies.map((c) => propagate(c, scenario)).sort((a, b) => b.companyImpactScore - a.companyImpactScore);
    const winners = byCompany.slice(-2).map((x) => ({ company: x.company, score: x.companyImpactScore, rationale: "Lower propagated shock due to diversification and inventory cushions." }));
    const losers = byCompany.slice(0, 3).map((x) => ({ company: x.company, score: x.companyImpactScore, rationale: "Higher exposure to shocked nodes with low substitution and tight inventory." }));
    return { byCompany, winners, losers };
  }

  return { runScenario };
}
