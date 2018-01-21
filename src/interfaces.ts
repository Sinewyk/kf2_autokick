interface ConfigFile {
  servers: string[]
  basicAuthorization: string
  intervalCheck: number
  action: ACTIONS
  minLevel: number
  warnings: boolean
  warningMessage: string
  warningPeriod: number
  removePerks: string[]
}

// Ideally I would only support english, but I'm French
// so some of my friends server are installed in French
interface PERKS_Interface {
  [key: string]: string[]
}

const PERKS: PERKS_Interface = {
  Berserker: ['Berserker', 'Fou Furieux'],
  Survivalist: ['Survivalist', 'Survivant'],
  Commando: ['Commando'],
  Support: ['Support', 'Soutien'],
  FieldMedic: ['Field Medic', 'Médecin'],
  Demolitionist: ['Demolitionist', 'Démolisseur'],
  Firebug: ['Firebug', 'Pyromane'],
  Gunslinger: ['Gunslinger', 'Flingueur'],
  Sharpshooter: ['Sharpshooter', "Tireur d'élite"],
  SWAT: ['SWAT'],
}

enum ACTIONS {
  KICK = 'kick',
  SESSION_BAN = 'sessionban',
  BAN_IP = 'banip',
  BAN_ID = 'banid',
}

type PlayerKey = string

// global state just keep track of previous server states
interface GlobalState {
  [serverAddress: string]: ServerState[]
}

interface ServerState {
  timestamp: number
  players: PlayerInfos[]
}

interface InvalidRules {
  rolesToForbid: string[]
  minLevel: number
}

interface PlayerInfos {
  playerkey: PlayerKey
  perk: string
  level: number
}

export {
  ConfigFile,
  PERKS,
  ACTIONS,
  GlobalState,
  PlayerKey,
  ServerState,
  PlayerInfos,
  InvalidRules,
}
