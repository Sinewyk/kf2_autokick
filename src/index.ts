import * as assert from 'assert'
import { argv } from 'yargs'
import * as XRAY from 'x-ray'
import * as _debug from 'debug'
import { adminSays, fetchInfos, action } from './sideEffects'
import { GlobalState, PlayerInfos, PERKS, ACTIONS } from './interfaces'

const debug = _debug('kf2autokick')

export { debug }

// Validate mandatory options
assert(argv.basic, `You need a basic argument in the form 'login:password'`)
assert(
  argv.servers,
  `You need to send a list of servers in the form 'http://0.1.2.3:4444,http://5.6.7.8:9999'`,
)

// Validate some other options
const ACTION: ACTIONS = argv.action || ACTIONS.KICK
assert(
  Object.values(ACTIONS).indexOf(ACTION) !== -1,
  `Invalid action, must be one of ${Object.values(ACTIONS)}`,
)

const servers: string[] = argv.servers.split(',')

const basicAuthValue = `Basic ${Buffer.from(argv.basic).toString('base64')}`
const INTERVAL = argv.interval ? parseInt(argv.interval) : 15000
const WARNING_MODE = argv.warning === undefined ? true : false
const WARNING_MESSAGE: string =
  argv.warningMessage ||
  'No Survivalist, no perks under level 15 : change or kick is imminent !'
const MIN_LEVEL = argv.minLevel ? parseInt(argv.minLevel, 10) : 15
const rolesToForbid = [...PERKS.Survivalist]

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
  for (let i = 0; i < servers.length; ++i) {
    const server = servers[i]

    globalState[server] = globalState[server] || {}

    try {
      const infos = await fetchInfos(server, basicAuthValue)
      const players = await extractPlayers(infos)

      cleanState(server, players)

      // Go through each player and check them
      for (let j = 0; j < players.length; ++j) {
        const player = players[j]

        // Forbid some roles
        if (rolesToForbid.indexOf(player.perk) !== -1) {
          if (WARNING_MODE && firstOffense(server, player.playerkey)) {
            warnPlayer(server, player.playerkey)
          } else {
            action(server, basicAuthValue, ACTION, player.playerkey)
          }
          continue
        }

        // Forbid too low levels
        if (player.level < MIN_LEVEL) {
          if (WARNING_MODE && firstOffense(server, player.playerkey)) {
            warnPlayer(server, player.playerkey)
          } else {
            action(server, basicAuthValue, ACTION, player.playerkey)
          }
          continue
        }

        unwarnPlayer(server, player.playerkey)
      }

      // Warnings to issue ? Just issue one globally
      if (Object.keys(globalState[server]).length > 0) {
        await adminSays(server, basicAuthValue, WARNING_MESSAGE)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // schedule next check
  timerHandle = setTimeout(check, INTERVAL)
}

debug('starting ...')
check()

function handleExit() {
  debug('closing ...')
  clearTimeout(timerHandle)
}

process.once('SIGINT', handleExit)
process.once('SIGTERM', handleExit)