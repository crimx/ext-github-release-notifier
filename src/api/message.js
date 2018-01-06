/**
 * Higher level api for repos
 * @module api/message
 */

import browser from 'webextension-polyfill'
import _ from 'lodash'

/**
 * @typedef {object} MsgREQ_CHECK_REPOS
 * @property {string} type - 'REQ_CHECK_REPOS'
 */

/**
 * @event REQ_CHECK_REPOS
 * @type {MsgREQ_CHECK_REPOS}
 */

/**
 * @callback CheckReposRequestCallback
 */

/**
 * Listens request from other pages and perform check repos
 * @param {module:api/message~CheckReposRequestCallback} callback
 * @listens REQ_CHECK_REPOS
 */
export function addCheckReposRequestListener (callback) {
  if (process.env.DEBUG_MODE) {
    if (!_.isFunction(callback)) {
      throw new TypeError('arg 1 should be a function.')
    }
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'REQ_CHECK_REPOS') {
      if (process.env.DEBUG_MODE) {
        console.log('Msg Receive: REQ_CHECK_REPOS')
      }
      callback()
      return Promise.resolve()
    }
  })
}

/**
 * Request background page to check repos
 * @fires REQ_CHECK_REPOS
 * @returns {Promise<boolean>} A Promise fulfilled with no argument.
 */
export function requestCheckRepos () {
  if (process.env.DEBUG_MODE) {
    console.log(process.env.DEBUG_MODE)
    console.log('fire: REQ_CHECK_REPOS')
  }
  return browser.runtime.sendMessage({type: 'REQ_CHECK_REPOS'})
    .catch(logErrorOnDebug)
}

/**
 * @typedef {object} MsgRepoUpdate
 * @property {string} type - 'REPO_CHECK_UPDATED'
 * @property {number} success - success count
 * @property {number} failed - failed count
 */

 /**
 * @event REPO_CHECK_UPDATED
 * @type {module:api/message~MsgRepoUpdate}
 */

/**
 * @callback CheckReposProgressCallback
 * @param {module:api/message~MsgRepoUpdate} message
 */

/**
 * Events are Fired after each repo check
 * @param {module:api/message~CheckReposProgressCallback} callback
 * @listens REPO_CHECK_UPDATED
 */
export function addCheckReposProgressListener (callback) {
  if (process.env.DEBUG_MODE) {
    if (!_.isFunction(callback)) {
      throw new TypeError('arg 1 should be a function.')
    }
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'REPO_CHECK_UPDATED') {
      if (process.env.DEBUG_MODE) {
        console.log('Msg Receive: REPO_CHECK_UPDATED')
      }
      callback(message)
      return Promise.resolve()
    }
  })
}

/**
 * @param {object} msg
 * @fires REPO_CHECK_UPDATED
 */
export function fireCheckReposProgress (message) {
  if (process.env.DEBUG_MODE) {
    console.log('fire: REPO_CHECK_UPDATED', JSON.stringify(message))
    console.assert(_.isObject(message) && _.isNumber(message.success) && _.isNumber(message.failed))
  }
  browser.runtime.sendMessage({
    type: 'REPO_CHECK_UPDATED',
    ..._.omit(message, ['type'])
  }).catch(logErrorOnDebug)
}

/**
 * @typedef {object} MsgCHECK_REPOS_COMPLETE
 * @property {string} type - 'CHECK_REPOS_COMPLETE'
 */

/**
 * @event CHECK_REPOS_COMPLETE
 * @type {MsgCHECK_REPOS_COMPLETE}
 */

/**
 * Listens repo check complete
 * @param {module:api/message~CheckReposCompleteCallback} callback
 * @listens CHECK_REPOS_COMPLETE
 */
export function addCheckReposCompleteListener (callback) {
  if (process.env.DEBUG_MODE) {
    if (!_.isFunction(callback)) {
      throw new TypeError('arg 1 should be a function.')
    }
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'CHECK_REPOS_COMPLETE') {
      if (process.env.DEBUG_MODE) {
        console.log('Msg Receive: CHECK_REPOS_COMPLETE', message)
      }
      return callback(message)
    }
  })
}

/**
 * @fires CHECK_REPOS_COMPLETE
 */
export function fireCheckReposComplete () {
  if (process.env.DEBUG_MODE) {
    console.log('fire: CHECK_REPOS_COMPLETE')
  }
  browser.runtime.sendMessage({type: 'CHECK_REPOS_COMPLETE'})
    .catch(logErrorOnDebug)
}

/**
 * @typedef {string} MsgReplaceRepo
 * @property {string} type - 'REPLACE_REPO'
 * @property {module:api/storage~ReleaseData} data - repo data
 */

 /**
 * @event REPLACE_REPO
 * @type {module:api/message~MsgReplaceRepo}
 */

/**
 * @callback ReplaceRepoRequestCallback
 * @param {module:api/storage~ReleaseData} data - repo data
 */

/**
 * Listens request from other pages
 * @param {module:api/message~ReplaceRepoRequestCallback} callback
 * @listens REPLACE_REPO
 */
export function addReplaceRepoRequestListener (callback) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isFunction(callback))
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'REPLACE_REPO') {
      if (process.env.DEBUG_MODE) {
        console.log('Msg Receive: REPLACE_REPO')
      }
      callback(message.data)
      return Promise.resolve()
    }
  })
}

/**
 * @fires REPLACE_REPO
 */
export function requestReplaceRepo (data) {
  if (process.env.DEBUG_MODE) {
    console.log('fire: REPLACE_REPO')
    console.assert(_.isString(data.name))
  }
  return browser.runtime.sendMessage({
    type: 'REPLACE_REPO',
    data,
  }).catch(logErrorOnDebug)
}

 /**
 * @event REPO_UPDATED
 */

/**
 * @callback RepoUpdatedMsgCallback
 * @param {module:api/storage~ReleaseData} data - repo data
 */

/**
 * Listens request from other pages
 * @param {module:api/message~RepoUpdatedMsgCallback} callback
 * @listens REPO_UPDATED
 */
export function addRepoUpdatedMsgtListener (callback) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isFunction(callback))
  }
  if (!window.channelRepoUpdated) {
    window.channelRepoUpdated = [callback]
  } else {
    window.channelRepoUpdated.push(callback)
  }
}

/**
 * @param {module:api/storage~ReleaseData} data - repo data
 * @fires REPO_UPDATED
 */
export function fireRepoUpdatedMsg (data) {
  if (process.env.DEBUG_MODE) {
    console.log('fire: REPO_UPDATED')
    console.assert(_.isNumber(data.published_at))
  }
  if (!window.channelRepoUpdated) {
    window.channelRepoUpdated = []
  } else {
    window.channelRepoUpdated.forEach(callback => {
      callback(data)
    })
  }
}

/**
 * @listens IS_POPUP_OPEN
 */
export function listenPopUpPageOpenQuery () {
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'IS_POPUP_OPEN') {
      if (process.env.DEBUG_MODE) {
        console.log('Msg Receive: IS_POPUP_OPEN')
      }
      return Promise.resolve(true)
    }
  })
}

/**
 * @fires IS_POPUP_OPEN
 */
export function isPopupPageOpen () {
  if (process.env.DEBUG_MODE) {
    console.log('fire: IS_POPUP_OPEN')
  }
  return browser.runtime.sendMessage({type: 'IS_POPUP_OPEN'})
    .catch(logErrorOnDebug)
}

function logErrorOnDebug (error) {
  if (process.env.DEBUG_MODE) {
    console.warn(error.message || error.toString())
  }
}

/**
 * @typedef {string} MsgAuthorize
 * @property {string} type - 'AUTHORIZE'
 */

 /**
 * @event AUTHORIZE
 * @type {module:api/message~MsgAuthorize}
 */

/**
 * @callback AuthorizeRequestCallback
 */

/**
 * Listens request from other pages and perform oauth authorization
 * @param {module:api/message~AuthorizeRequestCallback} callback
 * @listens AUTHORIZE
 */
export function addAuthorizeRequestListener (callback) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isFunction(callback))
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'AUTHORIZE') {
      if (process.env.DEBUG_MODE) {
        console.log('Msg Receive: AUTHORIZE')
      }
      return callback()
    }
  })
}

/**
 * @fires AUTHORIZE
 */
export function requestAuthorize () {
  if (process.env.DEBUG_MODE) {
    console.log('fire: AUTHORIZE')
  }
  return browser.runtime.sendMessage({
    type: 'AUTHORIZE',
  }).catch(logErrorOnDebug)
}
