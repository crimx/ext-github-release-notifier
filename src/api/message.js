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
      return callback()
    }
  })
}

/**
 * Request background page to check repos
 * @fires REQ_CHECK_REPOS
 * @returns {Promise<boolean>} A Promise fulfilled with no argument.
 */
export function requestCheckRepos () {
  return browser.runtime.sendMessage({type: 'REQ_CHECK_REPOS'})
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
      callback(message)
    }
  })
}

/**
 * @param {object} msg
 * @fires REPO_CHECK_UPDATED
 */
export function fireCheckReposProgress (message) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isObject(message) && _.isNumber(message.success) && _.isNumber(message.failed))
  }
  browser.runtime.sendMessage({
    type: 'REPO_CHECK_UPDATED',
    ..._.omit(message, ['type'])
  })
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
      callback(message)
    }
  })
}

/**
 * @fires CHECK_REPOS_COMPLETE
 */
export function fireCheckReposComplete () {
  browser.runtime.sendMessage({type: 'CHECK_REPOS_COMPLETE'})
}

/**
 * @typedef {string} MsgAddRepo - repo name ([owner]/[repo])
 * @property {string} type - 'ADD_REPO'
 * @property {string} name - repo name ([owner]/[repo])
 */

 /**
 * @event ADD_REPO
 * @type {module:api/message~MsgAddRepo}
 */

/**
 * @callback AddRepoRequestCallback
 * @param {string} name - repo name ([owner]/[repo])
 */

/**
 * Listens request from other pages
 * @param {module:api/message~AddRepoRequestCallback} callback
 * @listens ADD_REPO
 */
export function addAddRepoRequestListener (callback) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isFunction(callback))
  }
  return browser.runtime.onMessage.addListener(message => {
    if (message.type === 'ADD_REPO') {
      if (process.env.DEBUG_MODE) {
        console.assert(_.isString(message.name))
      }
      callback(message.name)
    }
  })
}

/**
 * @fires ADD_REPO
 */
export function requestAddRepo (name) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isString(name))
  }
  return browser.runtime.sendMessage({
    type: 'ADD_REPO',
    name,
  })
}
