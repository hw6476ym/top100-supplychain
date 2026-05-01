export const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);

export function darkLayout(title) {
  return {title,font:{color:'#d7e4ff'},paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',margin:{l:45,r:20,t:45,b:50},xaxis:{gridcolor:'#223454'},yaxis:{gridcolor:'#223454'}};
}

export function renderRanking(companies) {
  const y = companies.map(c=>c.name);
  const x = companies.map(c=>c.riskScores[0]+c.riskScores[1]+c.riskScores[4]+c.riskScores[6]-c.resilienceScore);
  Plotly.newPlot('rankingChart',[{type:'bar',x,y,orientation:'h',marker:{color:'#23d5ff'}}],darkLayout('MAG7 Composite Vulnerability Ranking'));
}

export function renderHeatmap(companies, riskFactors, byId) {
  const z=companies.map(c=>c.riskScores);
  Plotly.newPlot('riskHeatmap',[{z,x:riskFactors,y:companies.map(c=>c.name),type:'heatmap',colorscale:[[0,'#45d483'],[.5,'#ffb020'],[1,'#ff5b6e']]}],darkLayout('Risk Heatmap'));
  byId('riskHeatmap').on('plotly_click',(d)=>{const p=d.points[0];byId('heatmapExplain').innerHTML=`<b>${p.y}</b> on <b>${p.x}</b>: score <b>${p.z}</b>. Elevated scores indicate concentration, replacement complexity, or policy/logistics sensitivity.`;});
}

export function renderCompanyCharts(c, riskFactors) {
  Plotly.newPlot('riskRadar',[{type:'scatterpolar',r:c.riskScores.slice(0,6),theta:riskFactors.slice(0,6),fill:'toself',line:{color:'#ff5b6e'}}],darkLayout('Risk Radar'));
  Plotly.newPlot('regionalChart',[{type:'bar',x:c.regions,y:c.regions.map((_,i)=>60+i*8),marker:{color:'#ffb020'}}],darkLayout('Regional Exposure'));
}

export function renderScenarioChart(top) {
  Plotly.newPlot('scenarioImpact',[{type:'bar',x:top.map(t=>t.name),y:top.map(t=>t.score),marker:{color:'#ff5b6e'}}],darkLayout('Scenario Impact Severity'));
}
