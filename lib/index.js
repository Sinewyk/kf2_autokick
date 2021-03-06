"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const yargs_1 = require("yargs");
const XRAY = require("x-ray");
const defaultConfig_1 = require("./defaultConfig");
const utils_1 = require("./utils");
const api_1 = require("./api");
const interfaces_1 = require("./interfaces");
const state_1 = require("./state");
// Validate mandatory options
utils_1.validateConfigArgument(yargs_1.argv.config);
const injectedConfig = require(path_1.resolve(process.cwd(), yargs_1.argv.config));
const config = Object.assign({}, defaultConfig_1.default, injectedConfig);
utils_1.validateConfig(config);
let log;
log = function () { };
if (config.log) {
    log = (x) => console.log(x);
}
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
const globalState = config.servers.reduce((acc, server) => {
    acc[server] = [];
    return acc;
}, {});
let timerHandle;
const rules = {
    rolesToForbid,
    minLevel: config.minLevel,
};
async function check() {
    for (const server of config.servers) {
        let needToWarn = false;
        const history = globalState[server];
        try {
            const infos = await api_1.fetchInfos(server, BASIC_AUTH_VALUE);
            const players = await extractPlayers(infos);
            const currentState = {
                timestamp: Date.now(),
                players,
            };
            // Go through each player and check them
            for (const player of players) {
                if (state_1.playerIsInvalid(rules, player)) {
                    // If warnings mode is true
                    if (config.warnings) {
                        // And player has not been warned
                        if (!state_1.hasBeenWarned(rules, history[0], player)) {
                            needToWarn = true;
                            log(`Player [${player.playerkey}, ${player.perk}, ${player.level}] has been warned`);
                        }
                        else if (!state_1.isWaitingToTakeAction(rules, config.warningPeriod, history, currentState, player)) {
                            // Player has been warned and his grace period is over => action
                            await api_1.action(server, BASIC_AUTH_VALUE, config.action, player.playerkey);
                            log(`Player [${player.playerkey}, ${player.perk}, ${player.level}] has been ${config.action}`);
                        }
                    }
                    else {
                        // No warnings, just action
                        await api_1.action(server, BASIC_AUTH_VALUE, config.action, player.playerkey);
                        log(`Player [${player.playerkey}, ${player.perk}, ${player.level}] has been ${config.action}`);
                    }
                }
            }
            if (needToWarn) {
                await api_1.adminSays(server, BASIC_AUTH_VALUE, config.warningMessage);
            }
            history.unshift(currentState);
            // @TODO (sinewyk): compute necessary length
            // between interval + warning duration
            if (history.length > 10) {
                history.pop();
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    // schedule next check
    timerHandle = setTimeout(check, config.intervalCheck);
}
check();
log('starting ...');
function handleExit() {
    clearTimeout(timerHandle);
    log('stopping ...');
}
process.once('SIGINT', handleExit);
process.once('SIGTERM', handleExit);
