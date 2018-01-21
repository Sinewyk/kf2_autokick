import * as assert from 'assert'
import * as path from 'path'
import defaultConfig from './defaultConfig'
import { ACTIONS, PERKS, ConfigFile } from './interfaces'

const base64encode = (string: string) => Buffer.from(string).toString('base64')

const validateConfigArgument = (config: string) => {
  assert(
    config,
    `${config} is invalid, it nYou need to point to a config file, example --config="./kf2autokick.config.json", only json files`,
  )
  assert(path.extname(config) === '.json', 'File need to be json')
}

const validateAction = (action: string) => {
  assert(
    Object.values(ACTIONS).indexOf(action) !== -1,
    `Invalid action, must be one of ${Object.values(ACTIONS)}`,
  )
}

const validateRemovePerks = (removePerks: string[]) => {
  assert(Array.isArray(removePerks), 'removePerks needs to be an array')
  removePerks.forEach(role =>
    assert(
      Object.keys(PERKS).indexOf(role) !== -1,
      `Perk ${role} is invalid, valid values are: ${Object.keys(PERKS)}`,
    ),
  )
}

const validateConfig = (config: ConfigFile) => {
  const validKeys = Object.keys(defaultConfig)
  const configKeys = Object.keys(config)

  configKeys.forEach(keyToTest =>
    assert(
      validKeys.indexOf(keyToTest) !== -1,
      `Invalid key: ${keyToTest} in your config ... fix it`,
    ),
  )

  validateAction(config.action)
  validateRemovePerks(config.removePerks)
}

export { base64encode, validateConfigArgument, validateConfig }
