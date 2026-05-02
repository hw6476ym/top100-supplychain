export async function loadAllData(){
  const [companies,materials,suppliers,scenarios,relationships,ledger]=await Promise.all([
    fetch('./data/companies.json').then(r=>r.json()),
    fetch('./data/materials.json').then(r=>r.json()),
    fetch('./data/suppliers.json').then(r=>r.json()),
    fetch('./data/scenarios.json').then(r=>r.json()),
    fetch('./data/relationships.json').then(r=>r.json()),
    fetch('./data/materialLedger.json').then(r=>r.json())
  ]);
  return {companies,materials,suppliers,scenarios,relationships,ledger};
}
