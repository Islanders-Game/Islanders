export type RoadBuildingCondition = { roadsBuilt: number, expected: number }
export type KnightCondition = { movedThief: boolean, stoleFromPlayer: boolean }
export type SevenCondition = { movedThief: boolean, stoleFromPlayer: boolean }
export type InitialRoadCondition = { hasPlaced: boolean }
export type InitialHouseCondition = { hasPlaced: boolean }
export type TurnCondition =
    RoadBuildingCondition
    | KnightCondition
    | SevenCondition
    | InitialHouseCondition
    | InitialRoadCondition

export type Conditions = {
    playedKnight?: KnightCondition,
    playedRoadBuilding?: RoadBuildingCondition
    rolledASeven?: SevenCondition
    mustPlaceInitialRoad?: InitialRoadCondition
    mustPlaceInitialHouse?: InitialHouseCondition
};
