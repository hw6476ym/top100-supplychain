const fs=require('fs');
const specs={
  'data/companies.json':['ticker','name','sector','segments','products','suppliers','materials','regions','chokepoints','riskScores','resilienceScore','narrative','strategicImplication'],
  'data/materials.json':['name','category','usedIn','exposedCompanies','keyRegions','substitutionDifficulty','disruptionSeverity','importance','recovery','strategic'],
  'data/suppliers.json':['name','tier','category','region','components','dependentCompanies','riskScore','concentrationRisk'],
  'data/scenarios.json':['name','description','affectedCompanies','sectorImpact','severityScores','firstOrderEffects','secondOrderEffects','relativeBeneficiaries'],
  'data/relationships.json':['source','target','type','weight','riskCategory'],
  'data/materialLedger.json':['company','material','supplier','origin','route','volume_tons','unit_cost_usd_ton','total_cost_usd_m','source_type','confidence_score','as_of_date']
};
let ok=true;
for(const [file,req] of Object.entries(specs)){
  const rows=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!Array.isArray(rows)||!rows.length){console.error(`${file}: empty/non-array`);ok=false;continue;}
  rows.forEach((r,i)=>req.forEach(k=>{if(r[k]===undefined){console.error(`${file}[${i}] missing ${k}`);ok=false;}}));
}
if(!ok) process.exit(1);
console.log('Data validation passed.');
