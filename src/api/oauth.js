/**
 * @module api/oauth
 */

import browser from 'webextension-polyfill'
import { clientId, clientSecret } from './oauth-data'

const platform = navigator.userAgent.indexOf('Chrome') !== -1 ? 'chrome' : 'firefox'

/**
 * Perform web authorization flow
 * @return {Promise} A Promise fulfilled with no argument if succeeded.
 */
export function authorize () {
  return fetchToken()
    .then(saveToken)
}

/**
 * Save token to local storage
 * @return {Promise<string>} A Promise fulfilled with the access token if succeeded.
 */
export function saveToken (accessToken) {
  if (process.env.DEBUG_MODE) {
    console.assert(typeof accessToken === 'string')
  }
  return browser.storage.local.set({accessToken})
}

/**
 * Remove token from local storage
 * @return {Promise} A Promise fulfilled with no argument if succeeded.
 */
export function removeToken () {
  return saveToken('')
}

/**
 * Get token from local storage
 * @return {Promise<string>} A Promise fulfilled with the access token if succeeded.
 */
export function getToken () {
  return browser.storage.local.get('accessToken')
    .then(({accessToken}) => accessToken)
}

/**
 * Fetch token from Github
 * @return {Promise<string>} A Promise fulfilled with the access token if succeeded.
 */
export function fetchToken () {
  const state = String(Date.now())
  return launchWebAuthFlow({
    url: `https://github.com/login/oauth/authorize?client_id=${clientId[platform]}&state=${state}&redirect_uri=${browser.identity.getRedirectURL()}`,
    interactive: true,
  })
  .then(redirectURL => {
    const params = new URL(redirectURL).searchParams
    if (params.get('state') !== state) {
      return Promise.reject(new Error('Oauth: wrong state'))
    }
    const code = params.get('code')
    if (!code) {
      return Promise.reject(new Error('Oauth: empty temporary code'))
    }
    if (process.env.DEBUG_MODE) {
      console.log('Oauth: received temporary code ' + code)
    }
    return code
  })
  .then(code => {
    const formData = new FormData()
    formData.append('client_id', clientId[platform])
    formData.append('client_secret', clientSecret[platform])
    formData.append('code', code)
    formData.append('state', state)
    return fetch('https://github.com/login/oauth/access_token', {
      headers: {
        'Accept': 'application/json',
      },
      method: 'POST',
      body: formData,
    })
  })
  .then(response => response.json())
  .then(json => {
    if (process.env.DEBUG_MODE) {
      if (json.access_token) {
        console.log('Oauth: received access token: ', json.access_token)
      }
    }
    return json.access_token || Promise.reject(new Error('Oauth: empty access token'))
  })
}

/**
 * Check if the accesss token is still valid
 * @returns {Promise<boolean>} A Promise fulfilled with a flag if succeeded.
 */
export function checkAccessToken () {
  return getToken()
    .then(token => {
      if (!token) { return true }

      return fetch(`https://api.github.com/applications/${clientId[platform]}/tokens/${token}`, {
        headers: {
          'Accept': 'application/vnd.github.machine-man-preview+json',
          'Authorization': `Basic ${btoa(`${clientId[platform]}:${clientSecret[platform]}`)}`,
        }
      })
      .then(response => response.json())
      .then(json => {
        if (process.env.DEBUG_MODE) {
          console.log('access token check result:', json)
        }
        return Boolean(json.created_at)
      })
      .catch(() => true) // unknown network error, keep the toekn
    })
}

/**
 * @callback TokenCallback
 * @param {string} token - access token
 */

/**
 * @param {module:api/oauth~TokenCallback} callback
 * @listens browser.storage.onChanged
 */
export function addTokenListener (callback) {
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.accessToken) {
      callback(changes.accessToken.newValue)
    }
  })
}

/**
 * Fix webextension-polyfill bug
 * @param {object} options
 * @param {string} options.url
 * @param {boolean} [options.interactive=false]
 * @returns {Promise<string>} A Promise fulfilled with the redirect URL if succeeded.
 */
function launchWebAuthFlow (options) {
  return platform === 'chrome'
  ? new Promise(resolve => chrome.identity.launchWebAuthFlow(options, resolve))
  : browser.identity.launchWebAuthFlow(options)
}
