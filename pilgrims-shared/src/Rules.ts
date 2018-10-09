import { Rules, World } from "./Shared";

const rules: Rules = {
    "Build House": (p, x, y) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    },
    "Build City": (p, x, y) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    },
    "Build Road": (p, x, y) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    },
    "Move Thief": (p, x, y) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    },
    "Buy Card": (p) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    },
    "Play Card": (p, c) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    },
    "Trade": (p1, p2) => (w) => {
        return { world: w}                  //TODO: Implement rule.
    }
}

// Test of above: 
const world: World = {
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

// Call tryBuilds with a World, resulting in hopefully a Result<World>, otherwise a Failure. 
const newWorld = toApply.reduce(rule => rule)
