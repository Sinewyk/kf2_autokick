"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const defaultConfig_1 = require("./defaultConfig");
const interfaces_1 = require("./interfaces");
const base64encode = (string) => Buffer.from(string).toString('base64');
exports.base64encode = base64encode;
const validateConfigArgument = (config) => {
    assert(config, `${config} is invalid, it nYou need to point to a config file, example --config="./kf2autokick.config.json", only json files`);
    assert(path.extname(config) === '.json', 'File need to be json');
};
exports.validateConfigArgument = validateConfigArgument;
const validateAction = (action) => {
    assert(Object.values(interfaces_1.ACTIONS).indexOf(action) !== -1, `Invalid action, must be one of ${Object.values(interfaces_1.ACTIONS)}`);
};
const validateRemovePerks = (removePerks) => {
    assert(Array.isArray(removePerks), 'removePerks needs to be an array');
    removePerks.forEach(role => assert(Object.keys(interfaces_1.PERKS).indexOf(role) !== -1, `Perk ${role} is invalid, valid values are: ${Object.keys(interfaces_1.PERKS)}`));
};
const validateConfig = (config) => {
    const validKeys = Object.keys(defaultConfig_1.default);
    const configKeys = Object.keys(config);
    configKeys.forEach(keyToTest => assert(validKeys.indexOf(keyToTest) !== -1, `Invalid key: ${keyToTest} in your config ... fix it`));
    validateAction(config.action);
    validateRemovePerks(config.removePerks);
};
exports.validateConfig = validateConfig;
