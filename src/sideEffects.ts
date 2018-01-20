import * as request from 'superagent'
import { debug } from './index'
import { ACTIONS } from './interfaces'

const action = (
  server: string,
  basicAuthValue: string,
  action: ACTIONS,
  playerkey: string,
) => {
  request
    .post(`${server}/ServerAdmin/current/players+data`)
    .set('Authorization', basicAuthValue)
    .send('ajax=1')
    .send(`action=${action}`)
    .send(`playerkey=${playerkey}`)
    .then()

  debug(`${playerkey}: ${action} on ${server}`)
}

const adminSays = (server: string, basicAuthValue: string, text: string) =>
  request
    .post(`${server}/ServerAdmin/current/chat+frame+data`)
    .set('Authorization', basicAuthValue)
    .send('ajax=1')
    .send(`message=${text}`)
    .send(`teamsay=-1`)
    .then()

const fetchInfos = (server: string, basicAuthValue: string) =>
  request
    .get(`${server}/ServerAdmin/current/info`)
    .set('Authorization', basicAuthValue)
    .then(res => res.text)

export { action, adminSays, fetchInfos }
