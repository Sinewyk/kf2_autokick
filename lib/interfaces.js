"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
};
exports.PERKS = PERKS;
var ACTIONS;
(function (ACTIONS) {
    ACTIONS["KICK"] = "kick";
    ACTIONS["SESSION_BAN"] = "sessionban";
    ACTIONS["BAN_IP"] = "banip";
    ACTIONS["BAN_ID"] = "banid";
})(ACTIONS || (ACTIONS = {}));
exports.ACTIONS = ACTIONS;
