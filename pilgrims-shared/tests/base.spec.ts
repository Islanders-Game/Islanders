
import {  } from '../lib/Shared';
import { subtractResources } from '../lib/Rules';

describe('This tests the subtractResouces function', () => {
    test('Check that subtract resources can subtract wood', () => {
        const res = { wood: 5};
        const subRes = { wood: 3};
        expect(subtractResources(res, subRes)).toEqual({ wood: 2});
    });
});
