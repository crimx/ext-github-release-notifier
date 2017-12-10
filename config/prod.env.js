'use strict'
module.exports = {
  NODE_ENV: '"production"',
  DEBUG_MODE: `${Boolean(process.env.npm_config_debug)}`
}
