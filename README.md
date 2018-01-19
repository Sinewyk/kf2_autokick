# Install

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

`node --servers http://1.2.3.4:8080,http://1.2.3.4:8081 --basic admin:123 [--minLevel=#] [--action=#] [--interval=timeIn_ms] index.js`

minLevel defaults to `15`

action defaults to `kick`, available options: `kick`, `sessionban`, `banip`, `banid`, `mutevoice` and `unmutevoice`

interval defaults to `10000`

Forbidden perk per default is Survivalist, I may later make it configurable

# Requirements

Node 8+ (async, await)