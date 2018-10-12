
import { World, Player, Result } from '../lib/Shared';
import { subtractResources, resourcesAreNonNegative, purchase } from '../lib/Rules';

describe('Resouces sunbtraction', () => {
    test('Check that subtract resources can subtract wood', () => {
        const res = { wood: 5};
        const subRes = { wood: 3};
        expect(subtractResources(res, subRes)).toEqual({ wood: 2});
    });
});

describe('Negative resources are detected', () => {
    test('Non-negative resources are detected with any negative resource type', () => {
        const res = [
            { wood: Number.NEGATIVE_INFINITY},
            { wool: -1},
            { stone: Number.NEGATIVE_INFINITY},
            { grain: -2},
            { clay: Number.NEGATIVE_INFINITY},
        ];

        res.forEach((r) => expect(resourcesAreNonNegative(r)).toBeFalsy());
    });

    test('Non-negative resources are NOT detected with any positive resource type', () => {
        const res = [
            { wood: Number.POSITIVE_INFINITY},
            { wool: 1},
            { stone: Number.POSITIVE_INFINITY},
            { grain: 2},
            { clay: Number.POSITIVE_INFINITY},
        ];

        res.forEach((r) => expect(resourcesAreNonNegative(r)).toBeFalsy());
    });
});

describe('Checking for purchaseability', () => {
    test('Player can afford purchase', () => {
        const res = { wool: 1}

        const p: Player = {
            id: 0,
            resources: res,
            houses: [], roads: [], cities: [], ships: [],
        }

        const w: World = { map: [], players: [p] };
        const wr: Result<World> = { tag: 'Success', world: w };
        const pr: Result<Player> = { tag: 'Success', world: p };
        const result = purchase(res)(pr)(wr);

        expect(result.tag === 'Success');
    });

    test('Player can NOT afford purchase', () => {
        const res = { wool: 0}
        const cost = { wool: 1}

        const p: Player = {
            id: 0,
            resources: res,
            houses: [], roads: [], cities: [], ships: [],
        }

        const w: World = { map: [], players: [p] };
        const wr: Result<World> = { tag: 'Success', world: w };
        const pr: Result<Player> = { tag: 'Success', world: p };
        const result = purchase(cost)(pr)(wr);

        expect(result.tag === 'Failure');
    });
});
