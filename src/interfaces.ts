// Ideally I would only support english, but I'm French
// so some of my friends server are installed in French
const PERKS = {
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
  MUTE_VOICE = 'mutevoice',
  UNMUTE_VOICE = 'unmutevoice',
}

type PlayerKey = string

interface GlobalState {
  [serverAddress: string]: {
    [playerkey: string]: boolean
  }
}

interface PlayerInfos {
  playerkey: PlayerKey
  perk: string
  level: number
}

export { PERKS, ACTIONS, GlobalState, PlayerKey, PlayerInfos }
