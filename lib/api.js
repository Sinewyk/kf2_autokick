"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("superagent");
const action = (server, basicAuthValue, action, playerkey) => request
    .post(`${server}/ServerAdmin/current/players+data`)
    .set('Authorization', basicAuthValue)
    .send('ajax=1')
    .send(`action=${action}`)
    .send(`playerkey=${playerkey}`)
    .then();
exports.action = action;
const adminSays = (server, basicAuthValue, text) => request
    .post(`${server}/ServerAdmin/current/chat+frame+data`)
    .set('Authorization', basicAuthValue)
    .send('ajax=1')
    .send(`message=${text}`)
    .send(`teamsay=-1`)
    .then();
exports.adminSays = adminSays;
const fetchInfos = (server, basicAuthValue) => request
    .get(`${server}/ServerAdmin/current/info`)
    .set('Authorization', basicAuthValue)
    .then(res => res.text);
exports.fetchInfos = fetchInfos;
