console.log("FULL DASHBOARD START");

// ===== LOAD DATA =====
async function loadData() {
  try {
    const [companies, materials, suppliers, scenarios, relationships] = await Promise.all([
      fetch('./data/companies.json').then(r => r.json()),
      fetch('./data/materials.json').then(r => r.json()),
      fetch('./data/suppliers.json').then(r => r.json()),
      fetch('./data/scenarios.json').then(r => r.json()),
      fetch('./data/relationships.json').then(r => r.json())
    ]);

    return { companies, materials, suppliers, scenarios, relationships };
  } catch (err) {
    console.error("DATA LOAD FAILED", err);
    document.body.innerHTML = "<h1 style='color:red'>DATA LOAD FAILED</h1>";
  }
}

// ===== HELPERS =====
const byId = (id) => document.getElementById(id);

// ===== SIMPLE RENDER =====
function render(data) {
  console.log("RENDERING DATA", data);

  const { companies, materials } = data;

  // ===== COMPANY CARDS =====
  const container = byId("companyCards");
  if (container) {
    container.innerHTML = companies.slice(0, 10).map(c => `
      <div style="border:1px solid #444; padding:10px; margin:10px;">
        <h3>${c.name}</h3>
        <p><b>Sector:</b> ${c.sector}</p>
        <p><b>Risk Score:</b> ${c.resilienceScore}</p>
      </div>
    `).join("");
  }

  // ===== COMPANY DROPDOWN =====
  const select = byId("companySelect");
  if (select) {
    select.innerHTML = companies.map(c => `<option>${c.name}</option>`).join("");
  }

  // ===== MATERIAL DROPDOWN =====
  const matSelect = byId("materialSelect");
  if (matSelect) {
    matSelect.innerHTML = materials.map(m => `<option>${m.name}</option>`).join("");
  }
}

// ===== INIT =====
async function init() {
  const data = await loadData();

  if (!data) return;

  render(data);
}

// ===== START =====
window.onload = init;
