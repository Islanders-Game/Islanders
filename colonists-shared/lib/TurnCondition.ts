export type RoadBuildingCondition = { roadsBuilt: number, expected: number }
export type KnightCondition = { movedThief: boolean, stoleFromPlayer: boolean }
export type SevenCondition = { movedThief: boolean }
export type TurnCondition = RoadBuildingCondition | KnightCondition | SevenCondition

export type Conditions = {
    playedKnight?: KnightCondition,
    playedRoadBuilding?: RoadBuildingCondition
    rolledASeven?: SevenCondition
};
