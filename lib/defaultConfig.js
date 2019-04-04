"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const DefaultConfig = {
    servers: [],
    basicAuthorization: '',
    intervalCheck: 5000,
    action: interfaces_1.ACTIONS.KICK,
    minLevel: 15,
    warnings: true,
    warningPeriod: 20000,
    warningMessage: 'Minimum perk level required is 15. Change perk or be kicked.',
    removePerks: [],
    log: false,
};
exports.default = DefaultConfig;
