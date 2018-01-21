"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playerIsInvalid = (config, playerBeingChecked) => {
    if (config.rolesToForbid.indexOf(playerBeingChecked.perk) !== -1) {
        return true;
    }
    // Forbid too low levels
    if (playerBeingChecked.level < config.minLevel) {
        return true;
    }
    return false;
};
exports.playerIsInvalid = playerIsInvalid;
const hasBeenWarned = (config, previousState, playerBeingChecked) => {
    if (!previousState) {
        return false;
    }
    return (previousState.players.filter(player => player.playerkey === playerBeingChecked.playerkey &&
        playerIsInvalid(config, player)).length !== 0);
};
exports.hasBeenWarned = hasBeenWarned;
const isWaitingToTakeAction = (config, waitingPeriod, history, currentState, playerBeingChecked) => {
    if (history.length === 0) {
        return true;
    }
    let firstInvalidState = currentState;
    for (let i = 0; i < history.length; ++i) {
        const previousState = history[i];
        const foundInvalidPlayer = previousState.players.filter(player => player.playerkey === playerBeingChecked.playerkey &&
            playerIsInvalid(config, player)).length !== 0;
        if (foundInvalidPlayer) {
            firstInvalidState = previousState;
        }
        else {
            break;
        }
    }
    if (currentState.timestamp - firstInvalidState.timestamp > waitingPeriod) {
        return false;
    }
    return true;
};
exports.isWaitingToTakeAction = isWaitingToTakeAction;
