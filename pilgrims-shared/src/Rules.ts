import { Rules, World, Resources, MatrixCoordinate, House, Failure } from "./Shared";

// ---- Helpers ----
const subtractResources = (resources: Resources, toSubtract: Resources) => {
    return { clay: resources.clay - toSubtract.clay,
             grain: resources.grain - toSubtract.grain,
             stone: resources.stone - toSubtract.stone,
             wood: resources.wood - toSubtract.wood,
             wool: resources.wool - toSubtract.wool }
}

const resourcesAreNonNegative = (resources: Resources) => {
    return Object.keys(resources).every(k => resources[k] !== undefined && Number(resources[k]) >= 0);
}

const canPlaceHouse = (c: MatrixCoordinate, w: World) => {
    const all = w.players.reduce((acc: House[], p) => acc.concat(p.houses), [])
    return all.every(h => h.position.x !== c.x && h.position.y !== c.y) 
    //TODO: Implement checking for nearby houses on adjecent corners.
}
function fail(reason: string): Failure { return { tag: "Failure", reason: reason } }

// ---- Rule implementations ----
const rules: Rules = {
    "Build House": (p, x, y) => (w) => {
        switch (w.tag) {
            case "Failure": return w
            case "Success":
                const player = w.world.players.find(pl => p == pl.id)
                if (!player) return fail("The player could not be found!")

                if (!canPlaceHouse({x, y}, w.world)) return fail("The house cannot be placed here!")
                
                const modifiedResources = subtractResources(player.resources, new House().cost)
                const canAfford = resourcesAreNonNegative(modifiedResources)
                if (!canAfford) return fail("The player cannot afford this!")
                
                const modifiedPlayer = {...player, resources: modifiedResources} 
                const modifiedPlayers = w.world.players.map(pl => (pl.id == p) ? modifiedPlayer : pl);
                const world = {...w.world, players: modifiedPlayers}

                return {...w, world: world}
        }
    }, 
    "Build City": (p, x, y) => (w) => w, //TODO: Implement rules.
    "Build Road": (p, x, y) => (w) => w,
    "Move Thief": (p, x, y) => (w) => w,
    "Buy Card": (p) => (w) => w,
    "Play Card": (p, c) => (w) => w,
    "Trade": (p1, p2) => (w) => w
}


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
        ships: []
    }],
    map: [{type: "Wool", diceRoll: 12}]
}

const tryBuildHouse = rules["Build House"](2, 2, 2)
const tryBuildCity= rules["Build City"](2, 2, 2)
const toApply = [tryBuildHouse, tryBuildCity];

//TODO: Feed initial World through mutator functions,
//      passing each new generated World to the next function to be applied, 
//      resulting in a final Result<World> that's either valid or invalid. 

//const newWorld = ???