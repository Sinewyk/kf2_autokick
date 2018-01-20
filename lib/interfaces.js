"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
};
exports.PERKS = PERKS;
var ACTIONS;
(function (ACTIONS) {
    ACTIONS["KICK"] = "kick";
    ACTIONS["SESSION_BAN"] = "sessionban";
    ACTIONS["BAN_IP"] = "banip";
    ACTIONS["BAN_ID"] = "banid";
    ACTIONS["MUTE_VOICE"] = "mutevoice";
    ACTIONS["UNMUTE_VOICE"] = "unmutevoice";
})(ACTIONS || (ACTIONS = {}));
exports.ACTIONS = ACTIONS;
