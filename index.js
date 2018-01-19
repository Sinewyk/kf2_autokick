const assert = require('assert');
const argv = require('yargs').argv;
const request = require('superagent');
const x = require('x-ray')();

assert(argv.basic, `You need a basic argument in the form 'login:password'`);
assert(argv.servers, `You need to send a list of servers in the form 'http://0.1.2.3:4444,http://5.6.7.8:9999'`);

const servers = argv.servers.split(',');

const basicAuthValue = `Basic ${Buffer.from(argv.basic).toString('base64')}`;

const action = argv.action || 'kick';
const SURVIVALIST = ['Survivant', 'Survivalist'];
const INTERVAL = argv.interval || 10000;

const rolesToForbid = [
  ...SURVIVALIST
];
const MIN_LEVEL = argv.minLevel || 15;

const kick = server => playerkey => request
  .post(`${server}/ServerAdmin/current/players+data`)
  .set('Authorization', basicAuthValue)
  .send('ajax=1')
  .send('action=kick')
  .send(`playerkey=${playerkey}`)
  .then();

const getPlayers = server => request
  .get(`${server}/ServerAdmin/current/info`)
  .set('Authorization', basicAuthValue)
  .then(htmlRes => x(htmlRes.text, ['.foo-bar']).then())

async function check() {
  for (let i = 0; i < servers.length; ++i) {
    const server = servers[i];
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
      
      // Go through each player and check them
      for (let j = 0; j < players.length ; ++j) {
        const player = players[j];
        
        // Forbid some roles
        if (rolesToForbid.indexOf(player.perk) !== -1) {
          kick(server)(player.playerkey);
          continue;
        }

        // Forbid too low levels
        if (player.level < MIN_LEVEL) {
          kick(server)(player.playerkey);
          continue;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

check();
setInterval(check, INTERVAL);