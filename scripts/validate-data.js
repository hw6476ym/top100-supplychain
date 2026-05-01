const fs = require('fs');
const files=['data/companies.json','data/materialLedger.json','data/scenarios.json','data/materials.json','data/tradeBenchmarks.json'];
let ok=true;
for(const f of files){
  const rows=JSON.parse(fs.readFileSync(f,'utf8'));
  if(!Array.isArray(rows)||rows.length===0){console.error(`${f}: empty/non-array`);ok=false;continue;}
  rows.forEach((r,i)=>{
    if(f.includes('materialLedger')){
      ['company','material','supplier','origin','route','volume_tons','unit_cost_usd_ton','total_cost_usd_m','source_type','confidence_score','as_of_date'].forEach(k=>{if(r[k]===undefined){console.error(`${f}[${i}] missing ${k}`);ok=false;}});
    }
    if(f.includes('companies')){
      ['name','ticker','riskScores','resilienceScore','segments','chain'].forEach(k=>{if(r[k]===undefined){console.error(`${f}[${i}] missing ${k}`);ok=false;}});
    }
    if(f.includes('scenarios')){
      ['name','channel','beneficiaries'].forEach(k=>{if(r[k]===undefined){console.error(`${f}[${i}] missing ${k}`);ok=false;}});
    }
    if(f.includes('materials')){
      ['name','importance','substitution','recovery','strategic'].forEach(k=>{if(r[k]===undefined){console.error(`${f}[${i}] missing ${k}`);ok=false;}});
    }
    if(f.includes('tradeBenchmarks')){
      ['material','metric','value_usd_b','as_of','source'].forEach(k=>{if(r[k]===undefined){console.error(`${f}[${i}] missing ${k}`);ok=false;}});
    }
  });
}
if(!ok)process.exit(1);
console.log('Data validation passed.');
