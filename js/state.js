const state = {
  selectedCompany: null,
  selectedMaterial: null,
  selectedScenario: null,
};

export function setSelectedCompany(name) {
  state.selectedCompany = name;
}

export function setSelectedMaterial(name) {
  state.selectedMaterial = name;
}

export function setSelectedScenario(name) {
  state.selectedScenario = name;
}

export function getState() {
  return { ...state };
}
