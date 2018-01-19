# Install

Install [nodejs](https://nodejs.org)

Install [yarn](https://yarnpkg.com)

Get the code

Install dependencies: `yarn --frozen-lockfile`

Killing floor 2 server edits:
  - Activate http basic auth on your killing floor 2 web admin panel
  - and replace line 4 of your web admin `current_player_row.inc` file with `<td class="foo-bar"><%player.perk.name%>;<%player.perk.level%>;<%player.playerkey%></td>`


# Run
Run the daemon it as

`node --servers http://1.2.3.4:8080,http://1.2.3.4:8081 --basic admin:123 [--minLevel=#] [--action=#] [--interval=timeIn_ms] index.js`

minLevel defaults to `15`

action defaults to `kick`, available options: `kick`, `sessionban`, `banip`, `banid`, `mutevoice` and `unmutevoice`

interval defaults to `10000`

Forbidden perk per default is Survivalist, I may later make it configurable

# Requirements

Node 8+ (async, await)