import { ConfigFile, ACTIONS } from './interfaces'

const DefaultConfig: ConfigFile = {
  servers: [],
  basicAuthorization: '',
  interval: 15000,
  action: ACTIONS.KICK,
  minLevel: 15,
  warnings: true,
  warningMessage:
    'Minimum perk level required is 15. Change perk or be kicked.',
  removePerks: [],
}

export default DefaultConfig
