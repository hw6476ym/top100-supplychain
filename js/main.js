console.log("MAIN.JS LOADED");

// ===== LOAD DATA =====
async function loadData() {
  try {
    const [companies, materials, suppliers, scenarios, relationships] = await Promise.all([
      fetch('data/companies.json').then(r => r.json()),
      fetch('data/materials.json').then(r => r.json()),
      fetch('data/suppliers.json').then(r => r.json()),
      fetch('data/scenarios.json').then(r => r.json()),
      fetch('data/relationships.json').then(r => r.json())
    ]);

    return { companies, materials, suppliers, scenarios, relationships };
  } catch (err) {
    console.error("DATA LOAD FAILED", err);
    document.body.innerHTML = "<h1 style='color:red'>DATA LOAD FAILED</h1>";
  }
}

// ===== HELPERS =====
const byId = (id) => document.getElementById(id);

// ===== RENDER =====
function render(data) {
  console.log("RENDER FUNCTION CALLED", data);

  const { companies } = data;

  // ===== RANKING =====
  const ranking = byId("rankingChart");
  if (ranking) {
    ranking.innerHTML = companies.slice(0, 5).map(c =>
      `<div style="padding:5px">${c.name} - ${c.resilienceScore}</div>`
    ).join("");
  }

  // ===== COMPANY CARDS =====
  const container = byId("leaderCards");
  if (container) {
    container.innerHTML = companies.slice(0, 10).map(c => `
      <div style="border:1px solid #444; padding:10px; margin:10px;">
        <h3>${c.name}</h3>
        <p><b>Sector:</b> ${c.sector}</p>
        <p><b>Risk Score:</b> ${c.resilienceScore}</p>
      </div>
    `).join("");
  }
}

// ===== INIT =====
async function init() {
  console.log("INIT STARTED");

  const data = await loadData();

  if (!data) return;

  render(data);
}

// ===== START =====
window.onload = init;
