import { Rules, World, Resources, MatrixCoordinate, House, Failure, Success, Result } from './Shared';

// ---- Helpers ----
export const subtractResources = (resources: Resources, toSubtract: Resources) => {
    return {
        clay: resources.clay && toSubtract.clay ? resources.clay - toSubtract.clay : resources.clay,
        grain: resources.grain && toSubtract.grain ? resources.grain - toSubtract.grain : resources.grain,
        stone: resources.stone && toSubtract.stone ? resources.stone - toSubtract.stone : resources.stone,
        wood: resources.wood && toSubtract.wood ? resources.wood - toSubtract.wood : resources.wood,
        wool: resources.wool && toSubtract.wool ? resources.wool - toSubtract.wool : resources.wool,
    };
};

const resourcesAreNonNegative = (resources: Resources) => {
    return resources.clay && resources.clay >= 0 &&
        resources.grain && resources.grain >= 0 &&
        resources.wood && resources.wood >= 0 &&
        resources.wool && resources.wool >= 0 &&
        resources.stone && resources.stone >= 0;
};

const canPlaceHouse = (coord: MatrixCoordinate, w: World) => {
    const all = w.players.reduce((acc: House[], p) => acc.concat(p.houses), []);
    return all.every((h) =>
        (h.position.x !== coord.x && h.position.y !== coord.y)
        && (h.position.y !== coord.y - 1 && h.position.x !== coord.x - 1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y - 1 && h.position.x !== coord.x + 1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y + 1 && h.position.x !== coord.x - 1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y + 1 && h.position.x !== coord.x + 1)); // Adjecent matrix corners.
};

function fail(reason: string): Failure { return { tag: 'Failure', reason }; }
function success<T>(t: T): Success<T> { return { tag: 'Success', world: t }; }

type validationFunction = (x: Result<World>) => (Result<World>);
const validationReducer = (acc: Result<World>, curr: validationFunction) => curr(acc);

// Validation functions can take more parameters - just end up as a validation function
const purchaseHouse: (t: Resources) => validationFunction = (w: Resources) => (t: Result<World>) => {
    if (t.tag === 'Success') {
        // make check
        return success(t.world);
    } else {
        return t;
    }
};
const placeHouse: (t: World) => validationFunction = (w: World) => (t: Result<World>) => {
    if (t.tag === 'Success') {
        // make check
        return success(t.world);
    } else {
        return t;
    }
};

// ---- Rule implementations ----
const rules: Rules = {
    'Build House': (p, x, y) => (w) => {
        switch (w.tag) {
            case 'Success': {
                const player = w.world.players.find((pl) => p === pl.id);
                if (!player) { return fail('The player could not be found!'); }

                if (!canPlaceHouse({x, y}, w.world)) { return fail('The house cannot be placed here!'); }

                const modifiedResources = subtractResources(player.resources, new House().cost);
                const canAfford = resourcesAreNonNegative(modifiedResources);
                if (!canAfford) { return fail('The player cannot afford this!'); }

                const modifiedPlayer = {...player, resources: modifiedResources};
                const modifiedPlayers = w.world.players.map((pl) => (pl.id === p) ? modifiedPlayer : pl);
                const world = {...w.world, players: modifiedPlayers};

                return success(world);
            }
            case 'Failure': {
                return w;
            }
        }
    },
    'Build City': (p, x, y) => (w) => {
        switch (w.tag) {
            case 'Success': {
                // Validate that the rule is legal
                const effectFunctions = [
                    purchaseHouse(w.world.players[0].resources),
                    placeHouse(w.world)];
                const result = effectFunctions.reduce(validationReducer, success(w.world));
                return result;
            }
            case 'Failure': {
                return w;
            }
        }
    },
    'Build Road': (p, x, y) => (w) => w, // TODO: Implement rules.
    'Move Thief': (p, x, y) => (w) => w,
    'Buy Card': (p) => (w) => w,
    'Play Card': (p, c) => (w) => w,
    'Trade': (p1, p2) => (w) => w,
};

// -----------------------
// Example usage of above:
// -----------------------
const initialWorld: World = {
    players: [{
        id: 0,
        resources: {},
        cities: [],
        houses: [],
        roads: [],
        ships: [],
    }],
    map: [{type: 'Wool', diceRoll: 12}],
};

const tryBuildHouse = rules['Build House'](2, 2, 2);
const tryBuildCity = rules['Build City'](2, 2, 2);
const toApply = [tryBuildHouse, tryBuildCity];

const ruleReducer = (acc: Result<World>, curr: ((x: Result<World>) => (Result<World>))) => curr(acc);
const newWorld = toApply.reduce(ruleReducer, success(initialWorld));

if (newWorld.tag === 'Success') {
    // tslint:disable-next-line:no-console
    console.log('Successfully applied two actions/rules');
} else {
    // tslint:disable-next-line:no-console
    console.log(newWorld.reason);
}
