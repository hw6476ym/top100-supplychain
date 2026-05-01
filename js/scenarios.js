import { renderScenarioChart } from './charts.js';

export function updateScenario(name, scenarios, byId){
  const s=scenarios.find(x=>x.name===name);
  const top=s.affectedCompanies.slice(0,7);
  renderScenarioChart(top);
  byId('scenarioExplain').innerHTML=`<b>${s.name}</b><br>${s.description}<br><b>Risk channel:</b> supplier concentration + materials + chokepoints.<br><b>Most affected:</b> ${top.slice(0,3).map(t=>t.name).join(', ')}<br>${s.explanation}<br><b>Relative winners:</b> firms with higher resilience and diversified sourcing.`;
}
