const assert = require('assert');
const argv = require('yargs').argv;
const request = require('superagent');
const x = require('x-ray')();
const debug = require('debug')('kf2autokick');

assert(argv.basic, `You need a basic argument in the form 'login:password'`);
assert(argv.servers, `You need to send a list of servers in the form 'http://0.1.2.3:4444,http://5.6.7.8:9999'`);

const servers = argv.servers.split(',');

const basicAuthValue = `Basic ${Buffer.from(argv.basic).toString('base64')}`;

const ACTION = argv.action || 'kick';
const SURVIVALIST = ['Survivant', 'Survivalist'];
const INTERVAL = argv.interval || 15000;
const WARNING_MODE = argv.warning === undefined ? true : false;
const WARNING_MESSAGE = argv.warningMessage || 'No Survivalist, no perks under level 15 : change or kick is imminent !';

const rolesToForbid = [
  ...SURVIVALIST
];
const MIN_LEVEL = argv.minLevel || 15;

const action = (server, playerkey) => {
  request
  .post(`${server}/ServerAdmin/current/players+data`)
  .set('Authorization', basicAuthValue)
  .send('ajax=1')
  .send(`action=${ACTION}`)
  .send(`playerkey=${playerkey}`)
  .then();

  debug(`${playerkey}: ${ACTION} on ${server}`);
}

const adminSays = (server, text) => request
  .post(`${server}/ServerAdmin/current/chat+frame+data`)
  .set('Authorization', basicAuthValue)
  .send('ajax=1')
  .send(`message=${text}`)
  .send(`teamsay=-1`)
  .then();

const getPlayers = server => request
  .get(`${server}/ServerAdmin/current/info`)
  .set('Authorization', basicAuthValue)
  .then(htmlRes => x(htmlRes.text, ['.foo-bar']).then())

/**
Shape:
{
  address: {
    playerkey: true,
  }
}
 */
const globalState = {};

// Clean players who aren't there anymore between two checks
const cleanState = (server, players) => {
  const previousState = globalState[server];
  globalState[server] = {};
  players.forEach(player => {
    if (previousState[player.playerkey]) {
      globalState[server][player.playerkey] = true;
    }
  })
}

// Mark a player as needing to be warned
const warnPlayer = (server, playerkey) => {
  globalState[server][playerkey] = true;
  debug(`${playerkey}: warn on ${server}`);
}

// Mark a player as not needing to be warned
const unwarnPlayer = (server, playerkey) => {
  if (globalState[server][playerkey]) {
    debug(`${playerkey}: unwarn on ${server}`);
  }
  delete globalState[server][playerkey];
}

// Is this a first offense ?
const firstOffense = (server, playerkey) => {
  return globalState[server][playerkey] == null;
}

async function check() {
  for (let i = 0; i < servers.length; ++i) {
    const server = servers[i];

    globalState[server] = globalState[server] || {};

    try {
      // Get players list in format
      /*
      [{
        perk: 'Survivant',
        level: 25,
        playerkey: key,
      }, ...others]
      */
      const players = (await getPlayers(server)).map(x => {
        const temp = x.split(';');
        return {
          perk: temp[0],
          level: parseInt(temp[1], 10),
          playerkey: temp[2],
        }
      });

      cleanState(server, players);
      
      // Go through each player and check them
      for (let j = 0; j < players.length ; ++j) {
        const player = players[j];
        
        // Forbid some roles
        if (rolesToForbid.indexOf(player.perk) !== -1) {
          if (WARNING_MODE && firstOffense(server, player.playerkey)) {
            warnPlayer(server, player.playerkey);
          } else {
            action(server, player.playerkey);
          }
          continue;
        }

        // Forbid too low levels
        if (player.level < MIN_LEVEL) {
          if (WARNING_MODE && firstOffense(server, player.playerkey)) {
            warnPlayer(server, player.playerkey);
          } else {
            action(server, player.playerkey);
          }
          continue;
        }

        unwarnPlayer(server, player.playerkey);
      }

      // Warnings to issue ? Just issue one globally
      if (Object.keys(globalState[server]).length > 0) {
        await adminSays(server, WARNING_MESSAGE);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // schedule next check
  setTimeout(check, INTERVAL);
}

check();