import { Rules, World, Result, Success } from "./Shared";

const rules: Rules = {
    "Build House": (p, x, y) => (w) => w, //TODO: Implement rules.
    "Build City": (p, x, y) => (w) => w,
    "Build Road": (p, x, y) => (w) => w,
    "Move Thief": (p, x, y) => (w) => w,
    "Buy Card": (p) => (w) => w,
    "Play Card": (p, c) => (w) => w,
    "Trade": (p1, p2) => (w) => w
}

function getOrElse<T>(w: Result<World>, orElse: World): World {
    if ((<Success<World>>w).world) return (<Success<World>>w).world
    return orElse;
}


//
// Example usage of above:
//
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