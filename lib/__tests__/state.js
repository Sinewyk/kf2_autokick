"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("../state");
describe('#playerIsInvalid', () => {
    it('returns false for a valid player', () => {
        expect(state_1.playerIsInvalid({ minLevel: 0, rolesToForbid: [] }, { playerkey: 'foo', perk: 'Commando', level: 1 })).toBeFalsy();
    });
    it('returns true for an invalid player level', () => {
        expect(state_1.playerIsInvalid({ minLevel: 2, rolesToForbid: [] }, { playerkey: 'foo', perk: 'Commando', level: 1 })).toBeTruthy();
    });
    it('returns true for an invalid player perk', () => {
        expect(state_1.playerIsInvalid({ minLevel: 0, rolesToForbid: ['Survivalist'] }, { playerkey: 'foo', perk: 'Survivalist', level: 1 })).toBeTruthy();
    });
});
describe('#hasBeenWarned', () => {
    const rules = {
        minLevel: 5,
        rolesToForbid: [],
    };
    const invalidPlayer = { playerkey: 'bar', perk: 'bar', level: 0 };
    it('returns false if previous history is undefined', () => {
        expect(state_1.hasBeenWarned(rules, undefined, invalidPlayer)).toBeFalsy();
    });
    it('returns false if previous history did not have the player', () => {
        expect(state_1.hasBeenWarned(rules, { timestamp: 0, players: [] }, invalidPlayer)).toBeFalsy();
    });
    it('returns false if previous history did have the player, but he was valid then', () => {
        expect(state_1.hasBeenWarned(rules, { timestamp: 0, players: [Object.assign({}, invalidPlayer, { level: 25 })] }, invalidPlayer)).toBeFalsy();
    });
    it('returns true if previous history did have the player and he was also invalid', () => {
        expect(state_1.hasBeenWarned(rules, { timestamp: 0, players: [invalidPlayer] }, invalidPlayer)).toBeTruthy();
    });
});
describe('#isWaitingToTakeAction', () => {
    const rules = { minLevel: 5, rolesToForbid: [] };
    const invalidPlayer = { playerkey: 'bar', perk: 'bar', level: 0 };
    const previousServerState = {
        timestamp: 0,
        players: [],
    };
    const serverState = {
        timestamp: 1,
        players: [invalidPlayer],
    };
    it('should return true if no history', () => {
        expect(state_1.isWaitingToTakeAction(rules, 5, [], serverState, invalidPlayer)).toBeTruthy();
    });
    it('should return true if not enough time has passed', () => {
        expect(state_1.isWaitingToTakeAction(rules, 5, [previousServerState], serverState, invalidPlayer)).toBeTruthy();
    });
    it('should return true if lots of time but we are not sure ...', () => {
        expect(state_1.isWaitingToTakeAction(rules, 5, [{ timestamp: 0, players: [] }], { timestamp: 10, players: [invalidPlayer] }, invalidPlayer)).toBeTruthy();
    });
    it('should return false if we are sure that enough has passed', () => {
        expect(state_1.isWaitingToTakeAction(rules, 5, [{ timestamp: 4, players: [invalidPlayer] }], { timestamp: 10, players: [invalidPlayer] }, invalidPlayer)).toBeFalsy();
    });
});
