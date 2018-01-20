"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const yargs_1 = require("yargs");
const XRAY = require("x-ray");
const _debug = require("debug");
const sideEffects_1 = require("./sideEffects");
const interfaces_1 = require("./interfaces");
const debug = _debug('kf2autokick');
exports.debug = debug;
// Validate mandatory options
assert(yargs_1.argv.basic, `You need a basic argument in the form 'login:password'`);
assert(yargs_1.argv.servers, `You need to send a list of servers in the form 'http://0.1.2.3:4444,http://5.6.7.8:9999'`);
// Validate some other options
const ACTION = yargs_1.argv.action || interfaces_1.ACTIONS.KICK;
assert(Object.values(interfaces_1.ACTIONS).indexOf(ACTION) !== -1, `Invalid action, must be one of ${Object.values(interfaces_1.ACTIONS)}`);
const removedPerks = typeof yargs_1.argv.removedPerks !== 'undefined' ? yargs_1.argv.removedPerks.split(',') : [];
removedPerks.forEach(role => assert(Object.keys(interfaces_1.PERKS).indexOf(role) !== -1, `Perk ${role} is invalid, valid values are: ${Object.keys(interfaces_1.PERKS)}`));
// This is basically some crude i18n support ... because web panel sends back already translated perks name
const rolesToForbid = removedPerks.reduce((acc, perkToRemove) => acc.concat(interfaces_1.PERKS[perkToRemove]), []);
const servers = yargs_1.argv.servers.split(',');
const basicAuthValue = `Basic ${Buffer.from(yargs_1.argv.basic).toString('base64')}`;
const INTERVAL = yargs_1.argv.interval ? parseInt(yargs_1.argv.interval) : 15000;
const WARNING_MODE = yargs_1.argv.warning === undefined ? true : false;
const WARNING_MESSAGE = yargs_1.argv.warningMessage ||
    'No perks under level 15 : change or kick is imminent !';
const MIN_LEVEL = yargs_1.argv.minLevel ? parseInt(yargs_1.argv.minLevel, 10) : 15;
const x = XRAY();
const extractPlayers = (html) => Promise.resolve(x(html, ['.foo-bar'])).then((players) => players.map((player) => {
    const splitPlayer = player.split(';');
    return {
        perk: splitPlayer[0],
        // if there's no perk yet, user is still loading
        // mark level as 99 so that no warnings can be issued yet
        level: splitPlayer[0] === '' ? 99 : parseInt(splitPlayer[1], 10),
        playerkey: splitPlayer[2],
    };
}));
const globalState = {};
// Clean players who aren't there anymore between two checks
const cleanState = (server, players) => {
    const previousState = globalState[server];
    globalState[server] = {};
    players.forEach(player => {
        if (previousState[player.playerkey]) {
            globalState[server][player.playerkey] = true;
        }
    });
};
// Mark a player as needing to be warned
const warnPlayer = (server, playerkey) => {
    globalState[server][playerkey] = true;
    debug(`${playerkey}: warn on ${server}`);
};
// Mark a player as not needing to be warned
const unwarnPlayer = (server, playerkey) => {
    if (globalState[server][playerkey]) {
        debug(`${playerkey}: unwarn on ${server}`);
    }
    delete globalState[server][playerkey];
};
// Is this a first offense ?
const firstOffense = (server, playerkey) => {
    return globalState[server][playerkey] == null;
};
let timerHandle;
async function check() {
    for (let i = 0; i < servers.length; ++i) {
        const server = servers[i];
        globalState[server] = globalState[server] || {};
        try {
            const infos = await sideEffects_1.fetchInfos(server, basicAuthValue);
            const players = await extractPlayers(infos);
            cleanState(server, players);
            // Go through each player and check them
            for (let j = 0; j < players.length; ++j) {
                const player = players[j];
                // Forbid some roles
                if (rolesToForbid.indexOf(player.perk) !== -1) {
                    if (WARNING_MODE && firstOffense(server, player.playerkey)) {
                        warnPlayer(server, player.playerkey);
                    }
                    else {
                        sideEffects_1.action(server, basicAuthValue, ACTION, player.playerkey);
                    }
                    continue;
                }
                // Forbid too low levels
                if (player.level < MIN_LEVEL) {
                    if (WARNING_MODE && firstOffense(server, player.playerkey)) {
                        warnPlayer(server, player.playerkey);
                    }
                    else {
                        sideEffects_1.action(server, basicAuthValue, ACTION, player.playerkey);
                    }
                    continue;
                }
                unwarnPlayer(server, player.playerkey);
            }
            // Warnings to issue ? Just issue one globally
            if (Object.keys(globalState[server]).length > 0) {
                await sideEffects_1.adminSays(server, basicAuthValue, WARNING_MESSAGE);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    // schedule next check
    timerHandle = setTimeout(check, INTERVAL);
}
debug('starting ...');
check();
function handleExit() {
    debug('closing ...');
    clearTimeout(timerHandle);
}
process.once('SIGINT', handleExit);
process.once('SIGTERM', handleExit);
