import { sharedLinkages } from './js/linkageEngine.js';
const riskFactors=["Taiwan semiconductor exposure","China manufacturing exposure","Advanced packaging exposure","HBM/memory exposure","Battery minerals exposure","Rare earth exposure","Data-center power exposure","Logistics chokepoint exposure","Single-supplier concentration","Export control exposure","Energy sensitivity","Inventory buffer weakness"];
const byId=id=>document.getElementById(id),avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
let companies=[],materialLedger=[],scenarios=[],materialsMeta=[],tradeBenchmarks=[];
const supplierGraph=[
  {company:'Apple',supplier:'TSMC',type:'Foundry',criticality:95},{company:'Apple',supplier:'Foxconn',type:'Assembly',criticality:88},
  {company:'Microsoft',supplier:'Nvidia',type:'AI Chips',criticality:93},{company:'Microsoft',supplier:'Vertiv',type:'Power/Cooling',criticality:79},
  {company:'Nvidia',supplier:'TSMC',type:'Foundry',criticality:99},{company:'Nvidia',supplier:'SK Hynix',type:'HBM',criticality:98},
  {company:'Amazon',supplier:'Nvidia',type:'AI Chips',criticality:91},{company:'Amazon',supplier:'Schneider Electric',type:'Power',criticality:76},
  {company:'Alphabet',supplier:'TSMC',type:'Foundry',criticality:89},{company:'Alphabet',supplier:'Corning',type:'Fiber/Materials',criticality:71},
  {company:'Meta',supplier:'Nvidia',type:'AI Chips',criticality:92},{company:'Meta',supplier:'Supermicro',type:'Servers',criticality:82},
  {company:'Tesla',supplier:'CATL',type:'Batteries',criticality:94},{company:'Tesla',supplier:'Panasonic',type:'Batteries',criticality:88}
];
const geoNodes={'Chile (Escondida)':[-24.27,-69.08],'Peru (Cerro Verde)':[-16.54,-71.61],'US data center buildouts':[37.33,-121.89],'Asia substrate/PCB':[25.03,121.56],'Grid/server interconnect':[35.68,139.69],'EV powertrain chain':[31.23,121.47]};

async function loadData(){
  [companies,materialLedger,scenarios,materialsMeta,tradeBenchmarks]=await Promise.all([
    fetch('./data/companies.json').then(r=>r.json()),fetch('./data/materialLedger.json').then(r=>r.json()),fetch('./data/scenarios.json').then(r=>r.json()),fetch('./data/materials.json').then(r=>r.json()),fetch('./data/tradeBenchmarks.json').then(r=>r.json())
  ]);
}

function initControls(){
  byId('companySelect').innerHTML=companies.map(c=>`<option>${c.name}</option>`).join('');
  byId('materialSelect').innerHTML=materialsMeta.map(m=>`<option>${m.name}</option>`).join('');
  byId('scenarioSelect').innerHTML=scenarios.map(s=>`<option>${s.name}</option>`).join('');
  byId('riskFilter').innerHTML=['All',...riskFactors].map(r=>`<option>${r}</option>`).join('');
}
function renderCards(){
  byId('companyCards').innerHTML=companies.map(c=>`<div class='card' data-name='${c.name}'><h3>${c.name} <span class='risk-${c.resilienceScore>69?'low':'high'}'>Resilience ${c.resilienceScore}</span></h3><div class='kpi'><span>Overall risk</span><b>${avg(c.riskScores)}</b></div><div class='kpi'><span>Semi exposure</span><b>${c.riskScores[0]}</b></div><div class='kpi'><span>Energy sensitivity</span><b>${c.riskScores[10]}</b></div><div class='kpi'><span>Inventory weakness</span><b>${c.riskScores[11]}</b></div></div>`).join('');
  document.querySelectorAll('.card').forEach(el=>el.onclick=()=>{byId('companySelect').value=el.dataset.name;updateCompany(el.dataset.name)});
}
function updateCompany(name){
  const c=companies.find(x=>x.name===name), top=rankedRisks(c).slice(0,3);
  byId('companyProfile').innerHTML=`<b>${c.name}</b> (${c.ticker})<br><b>Segments:</b> ${c.segments.join(', ')}<br><b>Chain narrative:</b> ${c.chain}<br><b>Top current risk drivers:</b> ${top.map(t=>`${t.factor} (${t.score})`).join('; ')}`;
  Plotly.newPlot('riskRadar',[{type:'scatterpolar',r:c.riskScores,theta:riskFactors,fill:'toself',line:{color:'#ff5b6e'}}],layout('12-factor risk radar'));
  Plotly.newPlot('regionalChart',[{type:'bar',x:['US','Taiwan','China','Korea'],y:[60,88,72,68],marker:{color:'#ffb020'}}],layout('Regional concentration proxy'));
  renderSupplierNetwork(c.name);
  Plotly.newPlot('sankeyChart',[{type:'sankey',node:{label:[c.name,'Business segments','Critical systems','Suppliers','Materials/chokepoints'],color:'#23d5ff'},link:{source:[0,1,2,3],target:[1,2,3,4],value:[10,9,8,7]}}],layout('Top-to-bottom chain map'));
}
function rankedRisks(c){return riskFactors.map((f,i)=>({factor:f,score:c.riskScores[i]})).sort((a,b)=>b.score-a.score)}
function updateMaterial(material){
  const rows=materialLedger.filter(r=>r.material===material), meta=materialsMeta.find(m=>m.name===material), bench=tradeBenchmarks.find(b=>b.material===material);
  const exposed=[...new Set(rows.map(r=>r.company))], totalVol=rows.reduce((s,r)=>s+r.volume_tons,0), topSupplier=Object.entries(rows.reduce((a,r)=>(a[r.supplier]=(a[r.supplier]||0)+r.volume_tons,a),{})).sort((a,b)=>b[1]-a[1])[0];
  byId('materialInfo').innerHTML=`<b>${material}</b><br><b>Exposed companies:</b> ${exposed.join(', ')||'No records'}<br><b>System importance:</b> ${meta?.importance||'N/A'}/100 | <b>Substitution:</b> ${meta?.substitution||'N/A'} | <b>Recovery:</b> ${meta?.recovery||'N/A'}<br><b>Strategic read:</b> ${meta?.strategic||'N/A'}<br><b>Concentration insight:</b> total tracked flow ${totalVol.toLocaleString()} tons/yr; largest supplier flow ${topSupplier?`${topSupplier[0]} (${topSupplier[1].toLocaleString()} tons)`:'N/A'}.<br><b>Global trade/market benchmark:</b> ${bench?`${bench.metric}; volume ${bench.volume_tons?bench.volume_tons.toLocaleString()+' tons':''}${bench.volume_tons?' | ':''}value $${bench.value_usd_b}B (${bench.as_of}) [${bench.source}]`:'N/A'}.`;
  byId('materialLedger').innerHTML='<tr><th>Company</th><th>Supplier</th><th>Origin</th><th>Route</th><th>Tons</th><th>$/ton</th><th>$M</th><th>Confidence</th></tr>'+rows.map(r=>`<tr><td>${r.company}</td><td>${r.supplier}</td><td>${r.origin}</td><td>${r.route}</td><td>${r.volume_tons.toLocaleString()}</td><td>${r.unit_cost_usd_ton.toLocaleString()}</td><td>${r.total_cost_usd_m.toLocaleString()}</td><td>${r.confidence_score}</td></tr>`).join('');
  renderLinkageMap(rows,material); renderShared(rows,material);
}
function renderLinkageMap(rows,material){
  const traces=rows.map(r=>{const o=r.origin.includes('Escondida')?'Chile (Escondida)':'Peru (Cerro Verde)';const d=r.route.includes('US data center')?'US data center buildouts':r.route.includes('substrate')?'Asia substrate/PCB':r.company==='Tesla'?'EV powertrain chain':'Grid/server interconnect';return {type:'scattergeo',mode:'lines+markers',lon:[geoNodes[o][1],geoNodes[d][1]],lat:[geoNodes[o][0],geoNodes[d][0]],line:{width:1+Math.log10(r.volume_tons),color:'#23d5ff'},name:`${r.company}: ${r.volume_tons.toLocaleString()}t, $${r.unit_cost_usd_ton}/t`};});
  Plotly.newPlot('linkageMap',traces,{title:`${material} origin-to-use linkage`,paper_bgcolor:'#0f1728',font:{color:'#d7e4ff'},geo:{showland:true,landcolor:'#152238',showocean:true,oceancolor:'#0b1222',bgcolor:'#0f1728'}});
}
function renderShared(rows,material){
  const clusters=sharedLinkages(rows);
  byId('sharedLinkageTable').innerHTML='<tr><th>Shared cluster</th><th>Companies</th><th>Total tons</th><th>Weighted $/ton</th><th>Systemic implication</th></tr>'+clusters.map(c=>`<tr><td>${c.key}</td><td>${c.companies.join(', ')}</td><td>${c.volume.toLocaleString()}</td><td>${c.weightedCost.toLocaleString()}</td><td>Single disruption can affect ${c.companies.length} firms simultaneously.</td></tr>`).join('');
  byId('linkageInsight').innerHTML=clusters.length?`<b>${material}:</b> ${clusters.length} shared dependency clusters found. <b>Decision signal:</b> prioritize dual-sourcing where cluster volume and company count are highest.`:`No shared clusters for ${material}.`;
}

function renderSupplierNetwork(company){
  const focus=supplierGraph.filter(x=>x.company===company);
  const compNodes=[...new Set(focus.map(x=>x.company))];
  const supNodes=[...new Set(focus.map(x=>x.supplier))];
  const all=[...compNodes.map(n=>({n,t:'company'})),...supNodes.map(n=>({n,t:'supplier'}))];
  Plotly.newPlot('supplierNetwork',[{x:all.map((_,i)=>i%2===0?0.2:0.8),y:all.map((_,i)=>1-(i/(all.length+1))),mode:'markers+text',text:all.map(a=>a.n),textposition:'middle right',marker:{size:all.map(a=>a.t==='company'?26:16),color:all.map(a=>a.t==='company'?'#23d5ff':'#ffb020')}}],layout(`Supplier network: ${company}`));
  const narrative=focus.sort((a,b)=>b.criticality-a.criticality).map(x=>`${x.supplier} (${x.type}, ${x.criticality})`).join('; ');
  byId('linkageInsight').innerHTML=`<b>${company} supplier concentration:</b> ${narrative}. <br><b>Analyst view:</b> concentration above ~90 indicates bottlenecks likely to bind growth during demand surges or geopolitical stress.`;
}

function renderRanking(){Plotly.newPlot('rankingChart',[{type:'bar',orientation:'h',y:companies.map(c=>c.name),x:companies.map(c=>c.riskScores[0]+c.riskScores[10]+c.riskScores[11]-c.resilienceScore),marker:{color:'#23d5ff'}}],layout('Risk concentration ranking (semi+energy+inventory-resilience)'));}
function renderHeatmap(){Plotly.newPlot('riskHeatmap',[{z:companies.map(c=>c.riskScores),x:riskFactors,y:companies.map(c=>c.name),type:'heatmap',colorscale:[[0,'#45d483'],[.5,'#ffb020'],[1,'#ff5b6e']]}],layout('Cross-company risk heatmap'));}
function updateScenario(name){
  const s=scenarios.find(x=>x.name===name);
  const impacts=companies.map(c=>({name:c.name,val:Math.round((c.riskScores[0]+c.riskScores[3]+c.riskScores[7])/3)})).sort((a,b)=>b.val-a.val);
  Plotly.newPlot('scenarioImpact',[{type:'bar',x:impacts.map(i=>i.name),y:impacts.map(i=>i.val),marker:{color:'#ff5b6e'}}],layout('Scenario severity (proxy composite)'));
  byId('scenarioExplain').innerHTML=`<b>${s.name}</b><br><b>Risk channel:</b> ${s.channel}<br><b>Top affected (proxy):</b> ${impacts.slice(0,3).map(i=>`${i.name} (${i.val})`).join(', ')}<br><b>Relative beneficiaries:</b> ${s.beneficiaries}<br><b>Interpretation:</b> This scenario stresses semiconductor concentration + logistics/power dependencies. Analyst takeaway: near-term winners are firms with contracted capacity, diversified supplier sets, and stronger inventory buffers; losers are companies with tight coupling to single foundry-memory chains.`;
}
function renderStrategic(){byId('strategicList').innerHTML=["Shared supplier-route clusters reveal systemic coupling across nominally independent companies.","Material-level concentration (volume + weighted cost) is a leading indicator for synchronized disruption risk.","The AI economy is constrained by hardware physics: HBM, packaging, copper, power equipment, and grid access.","Decision quality improves when confidence, recency (as_of_date), and substitution difficulty are presented together."].map(x=>`<li>${x}</li>`).join('');}
function layout(title){return {title,font:{color:'#d7e4ff'},paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',margin:{l:45,r:20,t:45,b:60}};}
window.addEventListener('load',async()=>{await loadData();initControls();renderCards();renderRanking();renderHeatmap();renderStrategic();updateCompany(companies[0].name);updateMaterial(materialsMeta[0].name);updateScenario(scenarios[0].name);byId('companySelect').addEventListener('change',e=>updateCompany(e.target.value));byId('materialSelect').addEventListener('change',e=>updateMaterial(e.target.value));byId('scenarioSelect').addEventListener('change',e=>updateScenario(e.target.value));});
