# Why ?

No mutators on your Killing Floor 2 server, it stays ranked and everyone can still gain xp on it.

This is just like a robot that is using your web admin panel to manage your server automatically by doing stuff (kicking) to people according level and perks (die survivalists !)

# Install

I strongly suggest you run this on the same system where your killing floor 2 server is running so that you can use the loopback address and your credentials will be safe. Or proxy the web admin over https. But you're on your own if over http.

Install [nodejs](https://nodejs.org) (version 8+)

Install [yarn](https://yarnpkg.com)

Git clone this repo, go into it and run `yarn --prod --frozen-lockfile` to install javascript dependencies

Killing floor 2 web admin server edits ([read the doc](https://wiki.tripwireinteractive.com/index.php?title=Dedicated_Server_%28Killing_Floor_2%29#Setting_Up_Web_Admin)):

Activate http basic auth on your killing floor 2 web admin panel

![image](https://user-images.githubusercontent.com/1826366/35134456-bd68cd68-fcd6-11e7-882b-3b8453a3a356.png)

Find the file `current_player_row.inc` in your Killing Floor 2 web admin folder (should be around `Steam/SteamApps/common/KillingFloor2/KFGame/Web/ServerAdmin`) and replace its contents with

```
<tr class="<%evenodd%>">
  <td style="background: <%player.teamcolor%>; color: <%player.teamcolor%>;"><%player.teamid%>&#160;</td>
  <td><%player.name%></td>
  <td class="foo-bar"><%player.perk.name%>;<%player.perk.level%>;<%player.playerkey%></td>
  <td class="right"><%player.score%></td>
  <td class="right"><%player.pawn.health%></td>
  <td class="right"><%player.kills%></td>
  <td class="right" title="Packet loss: <%player.packetloss%>"><%player.ping%></td>
  <td class="center"><%player.admin%></td>
</tr>
```

(I'm just editing to show perk level and playerkey, necessary for actions, in one page separated by `;` for quick parsing)

# Run

Run the daemon:

`node lib/index.js --config=./config.json`

### Mandatory parameters:

`--config`: path to JSON config file relative to working directory

### Config file:

```ts
interface ConfigFile {
  servers: string[];
  basicAuthorization: string;
  intervalCheck: number; // in ms, defaults to 5000
  action: string[]; // one of 'kick', 'sessionban', 'banip' or 'banid', defaults to 'kick'
  minLevel: number; // defaults to 15
  warnings: boolean; // defaults to true
  warningPeriod: number; // defaults to 20000
  warningMessage: string; // defaults to 'Minimum perk level required is 15. Change perk or be kicked.'
  removePerks: string[]; // one of Berserker, Survivalist, Commando, Support, FieldMedic, Demolitionist, Firebug, Gunslinger, Sharpshooter or SWAT. Defaults to []
}
```

Example:

```json
{
  "servers": ["http://127.0.0.1:8080"],
  "basicAuthorization": "foo:bar",
  "intervalCheck": 5000,
  "action": "sessionban",
  "minLevel": 24,
  "warnings": true,
  "warningPeriod": 20000,
  "warningMessage": "Warning: change perk above 23, no survivalist, or get banned for the map",
  "removePerks": ["Survivalist"]
}
```

# Requirements

Node 8+ (async, await)

# TODOS

Commander for --help and such

Autokick for people joining after a certain % of the game (it's kind of a dick move to join just for the boss, you may not have time to buy anything and basically be a dead weight).

Autokick for people joining during a round without enough time to even go to the trader: if joining game with less than # seconds remaining of trader time and a class other than firebug and berserker, you get kicked. (# may be configured).

# Tech TODOS

Clean server argument passing

Maybe most + scan + proxy & shit
