const riskFactors=["Taiwan semiconductor exposure","China manufacturing exposure","Advanced packaging exposure","HBM/memory exposure","Battery minerals exposure","Rare earth exposure","Data-center power exposure","Logistics chokepoint exposure","Single-supplier concentration","Export control exposure","Energy sensitivity","Inventory buffer weakness","Raw material concentration","Supplier financial fragility","Regulatory/political exposure"];
const byId=id=>document.getElementById(id),avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);

function loadData(){
  Promise.all([
    fetch('data/companies.json').then(r=>r.json()),
    fetch('data/materials.json').then(r=>r.json()),
    fetch('data/suppliers.json').then(r=>r.json()),
    fetch('data/scenarios.json').then(r=>r.json()),
    fetch('data/relationships.json').then(r=>r.json()),
    fetch('data/materialLedger.json').then(r=>r.json())
  ]).then(([companies,materials,suppliers,scenarios,relationships,ledger])=>{
    window.DATA={companies,materials,suppliers,scenarios,relationships,ledger};
    initDashboard();
  }).catch(err=>{
    console.error(err);
    document.body.innerHTML='DATA LOAD FAILED';
  });
}

function initDashboard(){
  console.log('DATA LOADED',window.DATA);
  const D=window.DATA;
  byId('buildStamp').textContent=`Build: v3.2 data-load fix | ${new Date().toISOString().slice(0,10)}`;

  byId('companySelect').innerHTML=D.companies.map(c=>`<option>${c.name}</option>`).join('');
  byId('materialSelect').innerHTML=D.materials.map(m=>`<option>${m.name}</option>`).join('');
  byId('scenarioSelect').innerHTML=D.scenarios.map(s=>`<option>${s.name}</option>`).join('');

  // immediately visible section with company names
  byId('whatChanged').innerHTML=`<b>Loaded companies:</b> ${D.companies.slice(0,15).map(c=>c.name).join(', ')} ...`;

  // immediate visible chart
  Plotly.newPlot('rankingChart',[{type:'bar',orientation:'h',y:D.companies.map(c=>c.name),x:D.companies.map(c=>avg(c.riskScores)),marker:{color:'#23d5ff'}}],{title:'Average risk by company',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'},margin:{l:45,r:20,t:45,b:60}});

  renderExecutiveStats(D);
  renderHeatmap(D);
  renderWatchlist();
  renderStrategicInsights();
  updateCompany(D,D.companies[0].name);
  updateAtomicExplorer(D,D.materials[0].name);
  updateScenario(D,D.scenarios[0].name);

  byId('companySelect').addEventListener('change',e=>updateCompany(D,e.target.value));
  byId('materialSelect').addEventListener('change',e=>updateAtomicExplorer(D,e.target.value));
  byId('scenarioSelect').addEventListener('change',e=>updateScenario(D,e.target.value));
}

function renderExecutiveStats(D){const h=[...D.companies].sort((a,b)=>avg(b.riskScores)-avg(a.riskScores))[0];const cards=[["Companies tracked",D.companies.length],["Highest risk",`${h.name} (${avg(h.riskScores)})`],["Top sector",mode(D.companies.map(c=>c.sector))],["Top chokepoint",mode(D.companies.flatMap(c=>c.chokepoints||[]))],["Top supplier",mode(D.suppliers.sort((a,b)=>b.riskScore-a.riskScore).slice(0,8).map(s=>s.name))],["High-risk firms",D.companies.filter(c=>avg(c.riskScores)>70).length]];byId('executiveStats').innerHTML=cards.map(([k,v])=>`<div class='card'><h3>${k}</h3><div class='kpi'><b>${v}</b></div></div>`).join('');}
function updateCompany(D,name){const c=D.companies.find(x=>x.name===name);if(!c)return;const top=riskFactors.map((f,i)=>({f,s:c.riskScores[i]})).sort((a,b)=>b.s-a.s).slice(0,3);byId('companyProfile').innerHTML=`<b>${c.name}</b> | ${c.sector}<br><b>Segments:</b> ${c.segments.join(', ')}<br><b>Suppliers:</b> ${c.suppliers.join(', ')}<br><b>Materials:</b> ${c.materials.join(', ')}`;byId('ceoPanel').innerHTML=`<b>CEO Brief:</b> Main bottleneck is ${top[0].f}.`;byId('stackFlow').innerHTML=`${c.name} → ${c.segments[0]} → ${c.products[0]} → ${c.suppliers[0]} → ${c.regions[0]} → ${c.materials[0]} → ${top[0].f}`;Plotly.newPlot('riskRadar',[{type:'scatterpolar',r:c.riskScores,theta:riskFactors,fill:'toself',line:{color:'#ff5b6e'}}],{title:'Risk Radar',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'}});Plotly.newPlot('regionalChart',[{type:'bar',x:c.regions,y:[80,74,68,62],marker:{color:'#ffb020'}}],{title:'Regional Exposure',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'}});Plotly.newPlot('sankeyChart',[{type:'sankey',node:{label:[c.name,'Segment','Product','Supplier','Region','Material','Risk'],color:'#23d5ff'},link:{source:[0,1,2,3,4,5],target:[1,2,3,4,5,6],value:[10,9,8,7,6,5]}}],{title:'Sankey Flow',paper_bgcolor:'#0f1728',font:{color:'#d7e4ff'}});renderNetwork(D,c);}
function renderNetwork(D,c){const edges=D.relationships.filter(r=>r.source===c.name).slice(0,8);const nodes=[c.name,...edges.map(e=>e.target),...c.materials.slice(0,3)];Plotly.newPlot('supplierNetwork',[{x:nodes.map((_,i)=>Math.cos(i*.6)),y:nodes.map((_,i)=>Math.sin(i*.6)),mode:'markers+text',text:nodes,textposition:'top center',marker:{size:nodes.map((_,i)=>i===0?26:14),color:nodes.map((_,i)=>i===0?'#23d5ff':'#ffb020')}}],{title:'Supplier Network',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'}})}
function updateAtomicExplorer(D,name){const m=D.materials.find(x=>x.name===name);if(!m)return;const rows=D.ledger.filter(r=>r.material===name);byId('atomicExplorerPanel').innerHTML=`<b>${m.name}</b><br>Companies exposed: ${m.exposedCompanies.join(', ')}<br>${m.strategic}`;byId('materialLedger').innerHTML='<tr><th>Company</th><th>Supplier</th><th>Origin</th><th>Route</th><th>Volume</th><th>Cost</th></tr>'+rows.map(r=>`<tr><td>${r.company}</td><td>${r.supplier}</td><td>${r.origin}</td><td>${r.route}</td><td>${r.volume_tons}</td><td>$${r.total_cost_usd_m}M</td></tr>`).join('');const mp={};rows.forEach(r=>mp[r.company]=(mp[r.company]||0)+r.volume_tons);if(!byId('atomicExposureChart')){const d=document.createElement('div');d.id='atomicExposureChart';d.className='chart';byId('atomicExplorerPanel').after(d);}Plotly.newPlot('atomicExposureChart',[{type:'bar',x:Object.keys(mp),y:Object.values(mp),marker:{color:'#45d483'}}],{title:'Atomic Exposure',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'}});}
function renderHeatmap(D){Plotly.newPlot('riskHeatmap',[{z:D.companies.map(c=>c.riskScores),x:riskFactors,y:D.companies.map(c=>c.name),type:'heatmap',colorscale:[[0,'#45d483'],[.5,'#ffb020'],[1,'#ff5b6e']]}],{title:'Risk Heatmap',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'}});byId('riskHeatmap').on('plotly_click',d=>{const p=d.points[0];byId('heatmapExplain').innerHTML=`${p.y} / ${p.x}: ${p.z}`})}
function updateScenario(D,name){const s=D.scenarios.find(x=>x.name===name);if(!s)return;const imp=D.companies.map(c=>({name:c.name,v:Math.round((c.riskScores[0]+c.riskScores[6]+c.riskScores[7])/3)})).sort((a,b)=>b.v-a.v);byId('scenarioSimulatorPanel').innerHTML=`<b>${s.name}</b><br>${s.description}<br>First-order: ${s.firstOrderEffects}<br>Second-order: ${s.secondOrderEffects}`;Plotly.newPlot('scenarioImpact',[{type:'bar',x:imp.map(i=>i.name),y:imp.map(i=>i.v),marker:{color:'#ff5b6e'}}],{title:'Scenario Impact',paper_bgcolor:'#0f1728',plot_bgcolor:'#0f1728',font:{color:'#d7e4ff'}});byId('scenarioExplain').innerHTML=`Most affected: ${imp.slice(0,5).map(i=>i.name).join(', ')}`}
function renderWatchlist(){byId('watchlist').innerHTML=["TSMC capacity","HBM memory","Lithium/Copper prices","Taiwan Strait","Data center power","Logistics disruptions"].map(x=>`<li>${x}</li>`).join('')}
function renderStrategicInsights(){byId('strategicInsights').innerHTML=["Nvidia = semiconductor bottleneck","Apple = Asia manufacturing concentration","Tesla = raw materials chain","Cloud companies = power + GPU dependency","AI = physical infrastructure story"].map(x=>`<li>${x}</li>`).join('')}

loadData();

function mode(arr){const m={};arr.forEach(x=>{if(x)m[x]=(m[x]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'N/A'}
