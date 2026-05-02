// ✅ IMPORTS MUST BE FIRST
import { loadData } from './dataStore.js';
import { setSelectedCompany, setSelectedMaterial, setSelectedScenario } from './state.js';
import { avg, renderRanking, renderHeatmap, renderCompanyCharts } from './charts.js';
import { renderSankey, renderNetwork, renderTable } from './linkage.js';
import { updateScenario } from './scenarios.js';

console.log("MAIN.JS RUNNING");

// ✅ helpers
const byId = (id) => document.getElementById(id);
let data;

// ✅ render cards
function renderCards(){
  const { companies } = data;
  byId("companyCards").innerHTML = companies.map(c => `
    <div class='card' data-name='${c.name}'>
      <h3>${c.name} <span class='risk-${c.resilienceScore>68?"low":"high"}'>R${c.resilienceScore}</span></h3>
      ${[
        ["Overall risk", avg(c.riskScores)],
        ["Semiconductor dep", c.riskScores[0]],
        ["China/Taiwan", Math.round((c.riskScores[0]+c.riskScores[1])/2)],
        ["AI infra dep", c.riskScores[3]],
        ["Energy/DC", c.riskScores[6]],
        ["Raw material", c.riskScores[4]],
        ["Logistics", c.riskScores[7]],
        ["Resilience", c.resilienceScore]
      ].map(x=>`<div class='kpi'><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}
    </div>
  `).join("");

  document.querySelectorAll('.card').forEach(el =>
    el.onclick = () => {
      byId('companySelect').value = el.dataset.name;
      updateCompany(el.dataset.name);
    }
  );
}

// ✅ update company
function updateCompany(name){
  const { companies, riskFactors } = data;
  const c = companies.find(x => x.name === name);

  setSelectedCompany(name);

  byId('companyProfile').innerHTML = `
    <b>${c.name} (${c.ticker})</b><br>
    ${c.mainRiskNarrative}<br>
    <i>Strategic implication:</i> ${c.strategicImplication}<br>
    <b>Segments:</b> ${c.segments.join(', ')}<br>
    <b>Products:</b> ${c.products.join(', ')}<br>
    <b>Suppliers:</b> ${c.suppliers.join(', ')}<br>
    <b>Regions:</b> ${c.regions.join(', ')}
  `;

  renderCompanyCharts(c, riskFactors);
  renderSankey(c);
  renderNetwork(c, companies);
  renderTable(c, byId);
}

// ✅ update material
function updateMaterial(name){
  const m = data.materials.find(x => x.name === name);

  setSelectedMaterial(name);

  byId('materialInfo').innerHTML = `
    <b>${m.name}</b> (${m.category})<br>
    <b>Companies exposed:</b> ${m.exposedCompanies.join(', ') || 'Indirect across ecosystem'}<br>
    <b>Why it matters:</b> ${m.explanation}<br>
    <b>Suppliers/regions:</b> ${m.regions.join(', ')}<br>
    <b>Substitution difficulty:</b> ${m.substitutionDifficulty}<br>
    <b>Time-to-recover:</b> ${m.recovery}<br>
    <b>Strategic implication:</b> Bottlenecks can re-rank company execution outcomes.
  `;
}

// ✅ strategic insights
function renderStrategic(){
  byId('strategicList').innerHTML = [
    "Nvidia is most exposed to advanced semiconductor bottlenecks.",
    "Apple remains heavily tied to Asian manufacturing concentration and TSMC.",
    "Tesla has the clearest mineral-to-product dependency chain.",
    "Cloud giants are physically dependent on GPUs, memory, cooling, power, copper, and grid capacity.",
    "AI expansion is constrained by chips, packaging, memory, logistics, and geopolitics.",
    "Critical chokepoints: TSMC, HBM, advanced packaging, transformers, copper, rare earths, and shipping corridors."
  ].map(x => `<li>${x}</li>`).join('');
}

// ✅ INIT
async function init(){
  try {
    data = await loadData();
    console.log("DATA LOADED:", data);
  } catch (err) {
    console.error("LOAD FAILED:", err);
    document.body.innerHTML = "<h1 style='color:red'>DATA FAILED</h1>";
    return;
  }

  const { companies, materials, scenarios, riskFactors } = data;

  byId("companySelect").innerHTML = companies.map(c => `<option>${c.name}</option>`).join("");
  byId("materialSelect").innerHTML = materials.map(m => `<option>${m.name}</option>`).join("");
  byId("scenarioSelect").innerHTML = scenarios.map(s => `<option>${s.name}</option>`).join("");
  byId("riskFilter").innerHTML = ["All", ...riskFactors].map(r => `<option>${r}</option>`).join("");

  renderCards();
  renderRanking(companies);
  renderHeatmap(companies, riskFactors, byId);
  renderStrategic();

  updateCompany(companies[0].name);
  updateMaterial(materials[0].name);

  setSelectedScenario(scenarios[0].name);
  updateScenario(scenarios[0].name, scenarios, byId);
}

// ✅ START
window.addEventListener('load', () => {
  byId('companySelect').addEventListener('change', () =>
    updateCompany(byId('companySelect').value)
  );

  byId('materialSelect').addEventListener('change', e =>
    updateMaterial(e.target.value)
  );

  byId('scenarioSelect').addEventListener('change', e => {
    setSelectedScenario(e.target.value);
    updateScenario(e.target.value, data.scenarios, byId);
  });

  init();
});
