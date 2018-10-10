import { Rules, World, Resources, MatrixCoordinate, House, Failure, Success, Result } from "./Shared";

// ---- Helpers ----
const subtractResources = (resources: Resources, toSubtract: Resources) => {
    return {   
        clay: resources.clay && toSubtract.clay ? resources.clay - toSubtract.clay : resources.clay,
        grain: resources.grain && toSubtract.grain ? resources.grain - toSubtract.grain : resources.grain,
        stone: resources.stone && toSubtract.stone ? resources.stone - toSubtract.stone : resources.stone,
        wood: resources.wood && toSubtract.wood ? resources.wood - toSubtract.wood : resources.wood,
        wool: resources.wool && toSubtract.wool ? resources.wool - toSubtract.wool : resources.wool
    }
}

const resourcesAreNonNegative = (resources: Resources) => {
    return resources.clay && resources.clay >= 0 &&
        resources.grain && resources.grain >= 0 &&
        resources.wood && resources.wood >= 0 &&
        resources.wool && resources.wool >= 0 &&
        resources.stone && resources.stone >= 0
}

const canPlaceHouse = (coord: MatrixCoordinate, w: World) => {
    const all = w.players.reduce((acc: House[], p) => acc.concat(p.houses), [])
    return all.every(h => 
        (h.position.x !== coord.x && h.position.y !== coord.y)
        && (h.position.y !== coord.y-1 && h.position.x !== coord.x-1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y-1 && h.position.x !== coord.x+1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y+1 && h.position.x !== coord.x-1)  // Adjecent matrix corners.
        && (h.position.y !== coord.y+1 && h.position.x !== coord.x+1)) // Adjecent matrix corners.
}

function fail(reason: string): Failure { return { tag: "Failure", reason: reason } }

// ---- Rule implementations ----
const rules: Rules = {
    "Build House": (p, x, y) => (w) => {
        if (w instanceof Success) {
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
        } else {
            return w;
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

const ruleReducer = (acc: Result<World>, curr: ((x:Result<World>)=>(Result<World>))) => curr(acc);
const newWorld = toApply.reduce(ruleReducer, new Success<World>(initialWorld));

if(newWorld instanceof Success) {
    console.log("Successfully applied two actions/rules")
} else {
    console.log(newWorld.reason)
} 