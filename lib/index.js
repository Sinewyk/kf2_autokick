"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const yargs_1 = require("yargs");
const XRAY = require("x-ray");
const _debug = require("debug");
const defaultConfig_1 = require("./defaultConfig");
const utils_1 = require("./utils");
const api_1 = require("./api");
const interfaces_1 = require("./interfaces");
const debug = _debug('kf2autokick');
exports.debug = debug;
// Validate mandatory options
utils_1.validateConfigArgument(yargs_1.argv.config);
const injectedConfig = require(path_1.resolve(process.cwd(), yargs_1.argv.config));
const config = Object.assign({}, defaultConfig_1.default, injectedConfig);
utils_1.validateConfig(config);
// i18n support
// Admin Web panel sends back already translated perks name
const rolesToForbid = config.removePerks.reduce((acc, perkToRemove) => acc.concat(interfaces_1.PERKS[perkToRemove]), []);
const BASIC_AUTH_VALUE = `Basic ${utils_1.base64encode(config.basicAuthorization)}`;
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
    for (let i = 0; i < config.servers.length; ++i) {
        const server = config.servers[i];
        globalState[server] = globalState[server] || {};
        try {
            const infos = await api_1.fetchInfos(server, BASIC_AUTH_VALUE);
            const players = await extractPlayers(infos);
            cleanState(server, players);
            // Go through each player and check them
            for (let j = 0; j < players.length; ++j) {
                const player = players[j];
                // Forbid some roles
                if (rolesToForbid.indexOf(player.perk) !== -1) {
                    if (config.warnings && firstOffense(server, player.playerkey)) {
                        warnPlayer(server, player.playerkey);
                    }
                    else {
                        api_1.action(server, BASIC_AUTH_VALUE, config.action, player.playerkey);
                    }
                    continue;
                }
                // Forbid too low levels
                if (player.level < config.minLevel) {
                    if (config.warnings && firstOffense(server, player.playerkey)) {
                        warnPlayer(server, player.playerkey);
                    }
                    else {
                        api_1.action(server, BASIC_AUTH_VALUE, config.action, player.playerkey);
                    }
                    continue;
                }
                unwarnPlayer(server, player.playerkey);
            }
            // Warnings to issue ? Just issue one globally
            if (Object.keys(globalState[server]).length > 0) {
                await api_1.adminSays(server, BASIC_AUTH_VALUE, config.warningMessage);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    // schedule next check
    timerHandle = setTimeout(check, config.interval);
}
debug('starting ...');
check();
function handleExit() {
    debug('closing ...');
    clearTimeout(timerHandle);
}
process.once('SIGINT', handleExit);
process.once('SIGTERM', handleExit);
