# Why ?

No mutators on your Killing Floor 2 server, it stays ranked and everyone can still gain xp on it.

This is just like a robot that is using your web admin panel to manage your server automatically by doing stuff (kicking) to people according level and perks (die survivalists !)

# Install

I strongly suggest you run this on the same system where your killing floor 2 server is running so that you can use the loopback address and your credentials will be safe. Or proxy the web admin over https. But you're on your own if over http.

Install [nodejs](https://nodejs.org)

Install [yarn](https://yarnpkg.com)

Git clone this repo, go into it and run `yarn --frozen-lockfile` to install javascript dependencies

Killing floor 2 server edits ([read the doc](https://wiki.tripwireinteractive.com/index.php?title=Dedicated_Server_%28Killing_Floor_2%29#Setting_Up_Web_Admin)):

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

Run the daemon it as

`node lib/index.js --servers http://1.2.3.4:8080,http://1.2.3.4:8081 --basic admin:123 [--no-warnings] [--warning-message="Fix your shit or get kicked"] [--minLevel=#] [--action=#] [--interval=timeIn_ms] [--remove-perks="Survivalist,SWAT"]`

### Mandatory parameters:

`--servers`: comma separated list of servers, pointing to the web admin panel

`--basic`: basic auth credentials in the format `login:password` of you web admin panel

### Optional parameters:

`--min-level`: defaults to `15`

`--action`: defaults to `kick`. Available values: `kick`, `sessionban`, `banip`, `banid`, `mutevoice` and `unmutevoice`

`--interval`: defaults to `15000`, in ms. How long between checks and actions

`--no-warning`: by default we warn before doing the action ... use this option to not issue any warning before doing your action

`--warning-message`: defaults to `No perks under level 15 : change or kick is imminent !`, but customize it related to the options you are sending

`--remove-perks`: comma separated list of values ... possibles values are `Berserker`, `Survivalist`, `Commando`, `Support`, `FieldMedic`, `Demolitionist`, `Firebug`, `Gunslinger`, `Sharpshooter` and `SWAT`

Example: `--remove-perks=Survivalist,Berserker`

# Requirements

Node 8+ (async, await)

# TODOS

Commander for --help and such

# Tech TODOS

Clean server argument passing, try forEach over for loops (did for loops because async/await)

Clean global state (immutable over mutation, redux ?)

Maybe most + scan + proxy & shit
