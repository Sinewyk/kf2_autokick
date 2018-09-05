import { ServerState, PlayerInfos, InvalidRules } from './interfaces'

const playerIsInvalid = (
  config: InvalidRules,
  playerBeingChecked: PlayerInfos,
): boolean => {
  if (config.rolesToForbid.indexOf(playerBeingChecked.perk) !== -1) {
    return true
  }

  // Forbid too low levels
  if (playerBeingChecked.level < config.minLevel) {
    return true
  }

  return false
}

const hasBeenWarned = (
  config: InvalidRules,
  previousState: ServerState | undefined,
  playerBeingChecked: PlayerInfos,
): boolean => {
  if (!previousState) {
    return false
  }
  return (
    previousState.players.filter(
      player =>
        player.playerkey === playerBeingChecked.playerkey &&
        playerIsInvalid(config, player),
    ).length !== 0
  )
}

const isWaitingToTakeAction = (
  config: InvalidRules,
  waitingPeriod: number,
  history: ServerState[],
  currentState: ServerState,
  playerBeingChecked: PlayerInfos,
): boolean => {
  if (history.length === 0) {
    return true
  }

  let firstInvalidState: ServerState = currentState

  for (let i = 0; i < history.length; ++i) {
    const previousState = history[i]

    const foundInvalidPlayer =
      previousState.players.filter(
        player =>
          player.playerkey === playerBeingChecked.playerkey &&
          playerIsInvalid(config, player),
      ).length !== 0

    if (foundInvalidPlayer) {
      firstInvalidState = previousState
    } else {
      break
    }
  }

  if (currentState.timestamp - firstInvalidState.timestamp > waitingPeriod) {
    return false
  }
  return true
}

export { playerIsInvalid, hasBeenWarned, isWaitingToTakeAction }
