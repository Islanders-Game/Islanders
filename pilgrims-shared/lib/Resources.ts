export interface Resources {
  wood: number;
  stone: number;
  clay: number;
  grain: number;
  wool: number;
}

// ---- Helpers ----
export const subtractResources = (
  resources: Resources,
  toSubtract: Resources,
): Resources => {
  return {
    clay: resources.clay - toSubtract.clay,
    grain: resources.grain - toSubtract.grain,
    stone: resources.stone - toSubtract.stone,
    wood: resources.wood - toSubtract.wood,
    wool: resources.wool - toSubtract.wool,
  };
};

export const addResources = (
  resources: Resources,
  toAdd: Resources,
): Resources => {
  return {
    clay: resources.clay + toAdd.clay,
    grain: resources.grain + toAdd.grain,
    stone: resources.stone + toAdd.stone,
    wood: resources.wood + toAdd.wood,
    wool: resources.wool + toAdd.wool,
  };
};

export const resourcesAreNonNegative = (resources: Resources) => {
  return (
    resources.clay >= 0 &&
    resources.grain >= 0 &&
    resources.wood >= 0 &&
    resources.wool >= 0 &&
    resources.stone >= 0
  );
};
