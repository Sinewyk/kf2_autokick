import { InvalidRules } from '../interfaces';
import {
	playerIsInvalid,
	hasBeenWarned,
	isWaitingToTakeAction,
} from '../state';

describe('#playerIsInvalid', () => {
	it('returns false for a valid player', () => {
		expect(
			playerIsInvalid(
				{ minLevel: 0, rolesToForbid: [] },
				{ playerkey: 'foo', perk: 'Commando', level: 1 },
			),
		).toBeFalsy();
	});

	it('returns true for an invalid player level', () => {
		expect(
			playerIsInvalid(
				{ minLevel: 2, rolesToForbid: [] },
				{ playerkey: 'foo', perk: 'Commando', level: 1 },
			),
		).toBeTruthy();
	});

	it('returns true for an invalid player perk', () => {
		expect(
			playerIsInvalid(
				{ minLevel: 0, rolesToForbid: ['Survivalist'] },
				{ playerkey: 'foo', perk: 'Survivalist', level: 1 },
			),
		).toBeTruthy();
	});
});

describe('#hasBeenWarned', () => {
	const rules: InvalidRules = {
		minLevel: 5,
		rolesToForbid: [],
	};

	const invalidPlayer = { playerkey: 'bar', perk: 'bar', level: 0 };

	it('returns false if previous history is undefined', () => {
		expect(hasBeenWarned(rules, undefined, invalidPlayer)).toBeFalsy();
	});

	it('returns false if previous history did not have the player', () => {
		expect(
			hasBeenWarned(rules, { timestamp: 0, players: [] }, invalidPlayer),
		).toBeFalsy();
	});

	it('returns false if previous history did have the player, but he was valid then', () => {
		expect(
			hasBeenWarned(
				rules,
				{ timestamp: 0, players: [{ ...invalidPlayer, level: 25 }] },
				invalidPlayer,
			),
		).toBeFalsy();
	});

	it('returns true if previous history did have the player and he was also invalid', () => {
		expect(
			hasBeenWarned(
				rules,
				{ timestamp: 0, players: [invalidPlayer] },
				invalidPlayer,
			),
		).toBeTruthy();
	});
});

describe('#isWaitingToTakeAction', () => {
	const rules: InvalidRules = { minLevel: 5, rolesToForbid: [] };

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
		expect(
			isWaitingToTakeAction(rules, 5, [], serverState, invalidPlayer),
		).toBeTruthy();
	});

	it('should return true if not enough time has passed', () => {
		expect(
			isWaitingToTakeAction(
				rules,
				5,
				[previousServerState],
				serverState,
				invalidPlayer,
			),
		).toBeTruthy();
	});

	it('should return true if lots of time but we are not sure ...', () => {
		expect(
			isWaitingToTakeAction(
				rules,
				5,
				[{ timestamp: 0, players: [] }],
				{ timestamp: 10, players: [invalidPlayer] },
				invalidPlayer,
			),
		).toBeTruthy();
	});

	it('should return false if we are sure that enough has passed', () => {
		expect(
			isWaitingToTakeAction(
				rules,
				5,
				[{ timestamp: 4, players: [invalidPlayer] }],
				{ timestamp: 10, players: [invalidPlayer] },
				invalidPlayer,
			),
		).toBeFalsy();
	});
});
