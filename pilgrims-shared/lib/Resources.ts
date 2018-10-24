export interface Resources {
  wood?: number;
  stone?: number;
  clay?: number;
  grain?: number;
  wool?: number;
}

// ---- Helpers ----
export const subtractResources = (
  resources: Resources,
  toSubtract: Resources,
) => {
  return {
    clay:
      resources.clay && toSubtract.clay
        ? resources.clay - toSubtract.clay
        : resources.clay,
    grain:
      resources.grain && toSubtract.grain
        ? resources.grain - toSubtract.grain
        : resources.grain,
    stone:
      resources.stone && toSubtract.stone
        ? resources.stone - toSubtract.stone
        : resources.stone,
    wood:
      resources.wood && toSubtract.wood
        ? resources.wood - toSubtract.wood
        : resources.wood,
    wool:
      resources.wool && toSubtract.wool
        ? resources.wool - toSubtract.wool
        : resources.wool,
  };
};

export const addResources = (resources: Resources, toAdd: Resources) => {
  return {
    clay: resources.clay
      ? toAdd.clay
        ? resources.clay + toAdd.clay
        : resources.clay
      : toAdd.clay,
    grain: resources.grain
      ? toAdd.grain
        ? resources.grain + toAdd.grain
        : resources.grain
      : toAdd.grain,
    stone: resources.stone
      ? toAdd.stone
        ? resources.stone + toAdd.stone
        : resources.stone
      : toAdd.stone,
    wood: resources.wood
      ? toAdd.wood
        ? resources.wood + toAdd.wood
        : resources.wood
      : toAdd.wood,
    wool: resources.wool
      ? toAdd.wool
        ? resources.wool + toAdd.wool
        : resources.wool
      : toAdd.wool,
  };
};

export const resourcesAreNonNegative = (resources: Resources) => {
  return (
    resources.clay &&
    resources.clay >= 0 &&
    resources.grain &&
    resources.grain >= 0 &&
    resources.wood &&
    resources.wood >= 0 &&
    resources.wool &&
    resources.wool >= 0 &&
    resources.stone &&
    resources.stone >= 0
  );
};
