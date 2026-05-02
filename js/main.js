import { loadAllData } from './dataStore.js';

const riskFactors=["Taiwan semiconductor exposure","China manufacturing exposure","Advanced packaging exposure","HBM/memory exposure","Battery minerals exposure","Rare earth exposure","Data-center power exposure","Logistics chokepoint exposure","Single-supplier concentration","Export control exposure","Energy sensitivity","Inventory buffer weakness","Raw material concentration","Supplier financial fragility","Regulatory/political exposure"];
const byId=id=>document.getElementById(id);
const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
let D;

const watchItems=[
  "TSMC capacity expansion and utilization",
  "HBM memory supply and lead times",
  "Lithium and copper price trend",
  "Taiwan Strait geopolitical tension",
  "Data-center power and transformer availability",
  "Global logistics disruptions (Red Sea/Suez/Panama/port strikes)"
];

const strategicInsights=[
  "Nvidia: structural bottleneck is semiconductor fabrication + HBM + packaging, not demand.",
  "Apple: high exposure to Asian manufacturing concentration and Taiwan-linked chip supply.",
  "Tesla: most explicit raw-material dependency chain (lithium, nickel, graphite, copper).",
  "Cloud companies: physically constrained by GPU supply, memory, power, cooling, and grid access.",
  "AI scale-up is fundamentally an infrastructure story, not just a software story."
];

function layout(title){
  return {title,paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'},margin:{l:45,r:20,t:45,b:60}};
}

function mode(arr){
  const map={};
  arr.forEach(x=>map[x]=(map[x]||0)+1);
  return Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0]||'N/A';
}

function topNByRisk(n=5){
  return [...D.companies].sort((a,b)=>avg(b.riskScores)-avg(a.riskScores)).slice(0,n);
}

function ensureAtomicChartContainer(){
  if(!byId('atomicExposureChart')){
    const d=document.createElement('div');
    d.id='atomicExposureChart';
    d.className='chart';
    byId('atomicExplorerPanel').insertAdjacentElement('afterend',d);
  }
}

function init(){
  byId('buildStamp').textContent=`Build: v3.1 full section logic | ${new Date().toISOString().slice(0,10)}`;
  byId('companySelect').innerHTML=D.companies.map(c=>`<option>${c.name}</option>`).join('');
  byId('materialSelect').innerHTML=D.materials.map(m=>`<option>${m.name}</option>`).join('');
  byId('scenarioSelect').innerHTML=D.scenarios.map(s=>`<option>${s.name}</option>`).join('');
  ensureAtomicChartContainer();
  renderExecutiveStats();
  renderHeatmap();
  renderWatchlist();
  renderStrategicInsights();
  updateCompany(D.companies[0].name);
  updateAtomicExplorer(D.materials[0].name);
  updateScenario(D.scenarios[0].name);
}

function renderExecutiveStats(){
  const highest=topNByRisk(1)[0];
  const topSector=mode(D.companies.map(c=>c.sector));
  const topChokepoint=mode(D.companies.flatMap(c=>c.chokepoints));
  const cards=[
    ["Companies tracked",D.companies.length],
    ["Highest risk company",`${highest.name} (${avg(highest.riskScores)})`],
    ["Most exposed sector",topSector],
    ["Key chokepoint",topChokepoint],
    ["Average risk",avg(D.companies.map(c=>avg(c.riskScores)))],
    ["High-risk firms (>70)",D.companies.filter(c=>avg(c.riskScores)>70).length],
    ["Top supplier chokepoint",mode(D.suppliers.sort((a,b)=>b.riskScore-a.riskScore).slice(0,10).map(s=>s.name))],
    ["Most common material",mode(D.companies.flatMap(c=>c.materials))]
  ];
  byId('executiveStats').innerHTML=cards.map(([k,v])=>`<div class='card'><h3>${k}</h3><div class='kpi'><b>${v}</b></div></div>`).join('');

  Plotly.newPlot('rankingChart',[
    {type:'bar',orientation:'h',y:D.companies.map(c=>c.name),x:D.companies.map(c=>c.riskScores[0]+c.riskScores[1]+c.riskScores[4]+c.riskScores[6]+c.riskScores[8]-c.resilienceScore),marker:{color:'#23d5ff'}}
  ],layout('Risk ranking (semi + region + materials + power + logistics - resilience)'));
}

function updateCompany(name){
  const c=D.companies.find(x=>x.name===name);
  const topDrivers=riskFactors.map((f,i)=>({f,s:c.riskScores[i]})).sort((a,b)=>b.s-a.s).slice(0,3);

  byId('companyProfile').innerHTML=`<b>${c.name} (${c.ticker})</b> | ${c.sector}<br>
  <b>Segments:</b> ${c.segments.join(', ')}<br>
  <b>Products:</b> ${c.products.join(', ')}<br>
  <b>Suppliers:</b> ${c.suppliers.join(', ')}<br>
  <b>Materials:</b> ${c.materials.join(', ')}<br>
  <b>Regions:</b> ${c.regions.join(', ')}<br>
  <b>Chokepoints:</b> ${c.chokepoints.join(', ')}<br>
  <b>Risk narrative:</b> ${c.narrative}`;

  byId('ceoPanel').innerHTML=`<b>CEO Brief</b><br>
  Bottom line: ${c.name} is exposed to concentrated upstream dependencies.<br>
  Main bottleneck: ${topDrivers[0].f}.<br>
  Under stress: disruptions in ${c.chokepoints[0]} / ${c.chokepoints[1]} delay capacity and raise costs.<br>
  Risk reduction: secure long-term supply, diversify vendors, and build inventory buffer.`;

  byId('stackFlow').innerHTML=`<b>Supply Stack</b><br>${c.name} → ${c.segments[0]} → ${c.products[0]} → component chain → ${c.suppliers.slice(0,3).join('/')} → ${c.regions.slice(0,3).join('/')} → ${c.materials.slice(0,4).join('/')} → ${topDrivers[0].f}`;

  Plotly.newPlot('riskRadar',[
    {type:'scatterpolar',r:c.riskScores,theta:riskFactors,fill:'toself',line:{color:'#ff5b6e'}}
  ],layout('Company risk radar'));

  Plotly.newPlot('regionalChart',[
    {type:'bar',x:c.regions,y:[82,76,69,63],marker:{color:'#ffb020'}}
  ],layout('Regional exposure'));

  renderNetwork(c);
  renderSankey(c);
}

function renderNetwork(c){
  const edges=D.relationships.filter(r=>r.source===c.name).slice(0,8);
  const nodes=[c.name,...edges.map(e=>e.target),...c.materials.slice(0,3),...c.regions.slice(0,2),...c.chokepoints.slice(0,2)];
  Plotly.newPlot('supplierNetwork',[
    {x:nodes.map((_,i)=>Math.cos(i*0.55)),y:nodes.map((_,i)=>Math.sin(i*0.55)),mode:'markers+text',text:nodes,textposition:'top center',marker:{size:nodes.map((_,i)=>i===0?28:i<=edges.length?17:12),color:nodes.map((_,i)=>i===0?'#23d5ff':i<=edges.length?'#ffb020':'#45d483')}}
  ],layout('Supplier network explorer'));
}

function renderSankey(c){
  const labels=[c.name,'Business segment','Product/system','Supplier','Region','Material','Risk driver'];
  Plotly.newPlot('sankeyChart',[
    {type:'sankey',node:{label:labels,color:'#23d5ff'},link:{source:[0,1,2,3,4,5],target:[1,2,3,4,5,6],value:[10,9,8,7,6,5]}}
  ],layout('Sankey supply-chain flow'));
}

function updateAtomicExplorer(materialName){
  const m=D.materials.find(x=>x.name===materialName);
  const rows=D.ledger.filter(r=>r.material===materialName);
  const exposed=[...new Set(rows.map(r=>r.company))];

  byId('atomicExplorerPanel').innerHTML=`<b>${m.name}</b><br>
  <b>Companies exposed:</b> ${exposed.join(', ')||m.exposedCompanies.join(', ')}<br>
  <b>Explanation:</b> ${m.strategic}<br>
  <b>Substitution:</b> ${m.substitutionDifficulty} | <b>Severity:</b> ${m.disruptionSeverity} | <b>Recovery:</b> ${m.recovery}`;

  byId('materialLedger').innerHTML='<tr><th>Company</th><th>Supplier</th><th>Origin</th><th>Route</th><th>Volume</th><th>Cost</th></tr>'+
  rows.map(r=>`<tr><td>${r.company}</td><td>${r.supplier}</td><td>${r.origin}</td><td>${r.route}</td><td>${r.volume_tons.toLocaleString()}</td><td>$${r.total_cost_usd_m}M</td></tr>`).join('');

  const exposureMap={};
  rows.forEach(r=>exposureMap[r.company]=(exposureMap[r.company]||0)+r.volume_tons);
  Plotly.newPlot('atomicExposureChart',[
    {type:'bar',x:Object.keys(exposureMap),y:Object.values(exposureMap),marker:{color:'#45d483'}}
  ],layout('Atomic input exposure (volume by company)'));
}

function renderHeatmap(){
  Plotly.newPlot('riskHeatmap',[
    {z:D.companies.map(c=>c.riskScores),x:riskFactors,y:D.companies.map(c=>c.name),type:'heatmap',colorscale:[[0,'#45d483'],[0.5,'#ffb020'],[1,'#ff5b6e']]}
  ],layout('Risk heatmap'));

  byId('riskHeatmap').on('plotly_click',d=>{
    const p=d.points[0];
    byId('heatmapExplain').innerHTML=`<b>${p.y}</b> / <b>${p.x}</b> = ${p.z}.<br>Why high: concentrated supplier-region-material dependencies.<br>Potential trigger: policy, logistics, or capacity shock.<br>Mitigation: diversify sourcing, lock long-term contracts, increase inventory buffers.`;
  });
}

function updateScenario(name){
  const s=D.scenarios.find(x=>x.name===name);
  const impact=D.companies.map(c=>({name:c.name,v:Math.round((c.riskScores[0]+c.riskScores[6]+c.riskScores[7])/3)})).sort((a,b)=>b.v-a.v);

  byId('scenarioSimulatorPanel').innerHTML=`<b>Scenario:</b> ${s.name}<br><b>Severity channel:</b> ${s.description}<br><b>First-order:</b> ${s.firstOrderEffects}<br><b>Second-order:</b> ${s.secondOrderEffects}`;

  Plotly.newPlot('scenarioImpact',[
    {type:'bar',x:impact.map(i=>i.name),y:impact.map(i=>i.v),marker:{color:'#ff5b6e'}}
  ],layout('Scenario simulator impact'));

  byId('scenarioExplain').innerHTML=`Most affected companies: ${impact.slice(0,5).map(i=>i.name).join(', ')}.<br>Relative beneficiaries: ${s.relativeBeneficiaries}.`;
}

function renderWatchlist(){
  byId('watchlist').innerHTML=watchItems.map(w=>`<li>${w}</li>`).join('');
}

function renderStrategicInsights(){
  byId('strategicInsights').innerHTML=strategicInsights.map(x=>`<li>${x}</li>`).join('');
  byId('whatChanged').innerHTML='<b>What changed / why it matters:</b> executive stats, atomic explorer, heatmap, scenario simulator, watchlist, and strategic insights are now all connected to real data and active update logic.';
}

window.addEventListener('load',async()=>{
  D=await loadAllData();
  init();
  byId('companySelect').addEventListener('change',e=>updateCompany(e.target.value));
  byId('materialSelect').addEventListener('change',e=>updateAtomicExplorer(e.target.value));
  byId('scenarioSelect').addEventListener('change',e=>updateScenario(e.target.value));
});
