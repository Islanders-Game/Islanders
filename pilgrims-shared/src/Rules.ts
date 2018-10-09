import { Rules } from "./Shared";

const rules: Rules = {
    "Build House": (p, x, y) => (w) => {
        return { tag: "Success", world: w} //TODO: Implement rule.
    },
    "Build City": (p, x, y) => (w) => {
        return { tag: "Success", world: w} //TODO: Implement rule.
    },
    "Build Road": (p, x, y) => (w) => {
        return { tag: "Success", world: w} //TODO: Implement rule.
    },
    "Move Thief": (p, x, y) => (w) => {
        return { tag: "Success", world: w} //TODO: Implement rule.
    },
    "Buy Card": (p) => (w) => {
        return { tag: "Success", world: w} //TODO: Implement rule.
    },
    "Play Card": (p, c) => (w) => {
        return { tag: "Success", world: w} //TODO: Implement rule.
    },
    "Trade": (p1, p2) => (w) => {
        return {tag: "Success", world: w} //TODO: Implement rule.
    }
}

const partiallyAppliedBuild = rules["Build City"](2, 2, 2);
// Call tryBuild() with a World, resulting in hopefully a Result<World>, otherwise a Failure. 