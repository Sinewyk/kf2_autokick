import { resolve } from 'path'
import { argv } from 'yargs'
import * as XRAY from 'x-ray'
import * as _debug from 'debug'
import defaultConfig from './defaultConfig'
import { base64encode, validateConfigArgument, validateConfig } from './utils'
import { adminSays, fetchInfos, action } from './api'
import { GlobalState, PlayerInfos, PERKS, ConfigFile } from './interfaces'

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

const globalState: GlobalState = {}

// Clean players who aren't there anymore between two checks
const cleanState = (server: string, players: PlayerInfos[]) => {
  const previousState = globalState[server]
  globalState[server] = {}
  players.forEach(player => {
    if (previousState[player.playerkey]) {
      globalState[server][player.playerkey] = true
    }
  })
}

// Mark a player as needing to be warned
const warnPlayer = (server: string, playerkey: string) => {
  globalState[server][playerkey] = true
  debug(`${playerkey}: warn on ${server}`)
}

// Mark a player as not needing to be warned
const unwarnPlayer = (server: string, playerkey: string) => {
  if (globalState[server][playerkey]) {
    debug(`${playerkey}: unwarn on ${server}`)
  }
  delete globalState[server][playerkey]
}

// Is this a first offense ?
const firstOffense = (server: string, playerkey: string) => {
  return globalState[server][playerkey] == null
}

let timerHandle: any

async function check() {
  for (let i = 0; i < config.servers.length; ++i) {
    const server = config.servers[i]

    globalState[server] = globalState[server] || {}

    try {
      const infos = await fetchInfos(server, BASIC_AUTH_VALUE)
      const players = await extractPlayers(infos)

      cleanState(server, players)

      // Go through each player and check them
      for (let j = 0; j < players.length; ++j) {
        const player = players[j]

        // Forbid some roles
        if (rolesToForbid.indexOf(player.perk) !== -1) {
          if (config.warnings && firstOffense(server, player.playerkey)) {
            warnPlayer(server, player.playerkey)
          } else {
            action(server, BASIC_AUTH_VALUE, config.action, player.playerkey)
          }
          continue
        }

        // Forbid too low levels
        if (player.level < config.minLevel) {
          if (config.warnings && firstOffense(server, player.playerkey)) {
            warnPlayer(server, player.playerkey)
          } else {
            action(server, BASIC_AUTH_VALUE, config.action, player.playerkey)
          }
          continue
        }

        unwarnPlayer(server, player.playerkey)
      }

      // Warnings to issue ? Just issue one globally
      if (Object.keys(globalState[server]).length > 0) {
        await adminSays(server, BASIC_AUTH_VALUE, config.warningMessage)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // schedule next check
  timerHandle = setTimeout(check, config.interval)
}

debug('starting ...')
check()

function handleExit() {
  debug('closing ...')
  clearTimeout(timerHandle)
}

process.once('SIGINT', handleExit)
process.once('SIGTERM', handleExit)
