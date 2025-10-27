// State Management
export const state = {
  ranks: [],
  currentRankIndex: -1,
  rgbTarget: null,
  fancyTarget: null,
  iconType: "material",
};

export function createRankTemplate() {
  return {
    name: "",
    prefix: "",
    display_name: "",
    icon: "DIAMOND",
    iconType: "material",
    headTexture: "",
    icon_amount: 1,
    icon_model_data: 0,
    lore: [],
    requirements: [],
    commands: [],
    luckperms: {
      weight: 0,
      permissions: [],
      inheritPrevious: true,
    },
  };
}

export function getRanks() {
  return state.ranks;
}

export function setRanks(ranks) {
  state.ranks = ranks;
}

export function getCurrentRankIndex() {
  return state.currentRankIndex;
}

export function setCurrentRankIndex(index) {
  state.currentRankIndex = index;
}

export function getCurrentRank() {
  if (state.currentRankIndex === -1) return null;
  return state.ranks[state.currentRankIndex];
}
