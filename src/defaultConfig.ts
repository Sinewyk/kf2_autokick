import { ConfigFile, ACTIONS } from './interfaces';

const DefaultConfig: ConfigFile = {
	servers: [],
	basicAuthorization: '',
	intervalCheck: 5000,
	action: ACTIONS.KICK,
	minLevel: 15,
	warnings: true,
	warningPeriod: 20000,
	warningMessage:
		'Minimum perk level required is 15. Change perk or be kicked.',
	removePerks: [],
	log: false,
};

export default DefaultConfig;
