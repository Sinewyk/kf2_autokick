import { resolve } from 'path'
import { argv } from 'yargs'
import * as XRAY from 'x-ray'
import * as _debug from 'debug'
import defaultConfig from './defaultConfig'
import { base64encode, validateConfigArgument, validateConfig } from './utils'
import { adminSays, fetchInfos, action } from './api'
import {
  GlobalState,
  PlayerInfos,
  PERKS,
  ConfigFile,
  ServerState,
  InvalidRules,
} from './interfaces'
import { playerIsInvalid, hasBeenWarned, isWaitingToTakeAction } from './state'

const debug = _debug('kf2autokick')

export { debug }

// Validate mandatory options
validateConfigArgument(argv.config)

const injectedConfig = require(resolve(process.cwd(), argv.config))

const config: ConfigFile = {
  ...defaultConfig,
  ...injectedConfig,
}

validateConfig(config)

// i18n support
// Admin Web panel sends back already translated perks name
const rolesToForbid = config.removePerks.reduce<string[]>(
  (acc, perkToRemove: string) => acc.concat(PERKS[perkToRemove]),
  [],
)

const BASIC_AUTH_VALUE = `Basic ${base64encode(config.basicAuthorization)}`

const x = XRAY()

const extractPlayers = (html: string): Promise<PlayerInfos[]> =>
  Promise.resolve(x(html, ['.foo-bar'])).then((players: string[]) =>
    players.map((player: string) => {
      const splitPlayer: string[] = player.split(';')
      return {
        perk: splitPlayer[0],
        // if there's no perk yet, user is still loading
        // mark level as 99 so that no warnings can be issued yet
        level: splitPlayer[0] === '' ? 99 : parseInt(splitPlayer[1], 10),
        playerkey: splitPlayer[2],
      }
    }),
  )

const globalState = config.servers.reduce<GlobalState>((acc, server) => {
  acc[server] = []
  return acc
}, {})

let timerHandle: any

const rules: InvalidRules = {
  rolesToForbid,
  minLevel: config.minLevel,
}

async function check() {
  for (let i = 0; i < config.servers.length; ++i) {
    const server = config.servers[i]

    let needToWarn = false

    const history = globalState[server]

    try {
      const infos = await fetchInfos(server, BASIC_AUTH_VALUE)
      const players = await extractPlayers(infos)

      const currentState: ServerState = {
        timestamp: Date.now(),
        players,
      }

      // Go through each player and check them
      for (let j = 0; j < players.length; ++j) {
        const player = players[j]

        if (playerIsInvalid(rules, player)) {
          // If warnings mode is true
          if (config.warnings) {
            // And player has not been warned
            if (!hasBeenWarned(rules, history[0], player)) {
              debug('need to warn at true')
              needToWarn = true
            } else if (
              !isWaitingToTakeAction(
                rules,
                config.warningPeriod,
                history,
                currentState,
                player,
              )
            ) {
              // Player has been warned and his grace period is over => action
              await action(
                server,
                BASIC_AUTH_VALUE,
                config.action,
                player.playerkey,
              )
            } else {
              debug('check if waiting')
            }
          } else {
            // No warnings, just action
            await action(
              server,
              BASIC_AUTH_VALUE,
              config.action,
              player.playerkey,
            )
          }
        }
      }

      if (needToWarn) {
        await adminSays(server, BASIC_AUTH_VALUE, config.warningMessage)
      }

      history.unshift(currentState)

      // @TODO (sinewyk): compute necessary length
      // between interval + warning duration
      if (history.length > 10) {
        history.pop()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // schedule next check
  timerHandle = setTimeout(check, config.intervalCheck)
}

debug('starting ...')
check()

function handleExit() {
  debug('closing ...')
  clearTimeout(timerHandle)
}

process.once('SIGINT', handleExit)
process.once('SIGTERM', handleExit)
