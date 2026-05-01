export function sharedLinkages(rows){
  const groups={};
  rows.forEach(r=>{const k=`${r.supplier}|${r.route}`;(groups[k]??=[]).push(r);});
  return Object.entries(groups).filter(([,v])=>v.length>1).map(([k,v])=>{
    const vol=v.reduce((s,x)=>s+x.volume_tons,0);
    const weighted=Math.round(v.reduce((s,x)=>s+x.unit_cost_usd_ton*x.volume_tons,0)/vol);
    return {key:k,companies:v.map(x=>x.company),volume:vol,weightedCost:weighted};
  });
}
