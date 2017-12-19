import {
  requestReplaceRepo,
} from '@/api/message'

import {
  getRepo,
} from '@/api/storage'

// delay anyway
setTimeout(main, 500)

function main () {
  const menuModal = document.querySelector('.subscription-menu-modal')
  if (!menuModal) { return }
  if (process.env.DEBUG_MODE) { console.log('Notifier: detected .subscription-menu-modal') }

  // "feature" detect
  if (
    Array.from(menuModal.querySelectorAll('.select-menu-title'))
      .some(el => el.textContent.toLowerCase().indexOf('release') !== -1)
  ) {
    if (process.env.DEBUG_MODE) { console.log('Release title detected') }
    return
  }

  const repoNameTester = /^[^/\s]+\/[^/\s]+$/
  let meta = document.querySelector('meta[name=octolytics-dimension-repository_nwo]')
  if (!meta || !repoNameTester.test(meta.getAttribute('content'))) {
    if (process.env.DEBUG_MODE) { console.log(`Notifier: ${meta.getAttribute('content')} does't match`) }
    meta = document.querySelector('meta[name=octolytics-dimension-repository_network_root_nwo]')
    if (!meta || !repoNameTester.test(meta.getAttribute('content'))) {
      if (process.env.DEBUG_MODE) { console.log(`Notifier: ${meta.getAttribute('content')} does't match`) }
      return
    }
  }

  getRepo(meta.getAttribute('content'))
    .then(repoData => inject(menuModal, repoData || {name: meta.getAttribute('content')}))
}

function inject (menuModal, repoData) {
  const menuHeader = document.createElement('div')
  menuHeader.className = 'select-menu-header'
  menuHeader.tabIndex = -1
  menuHeader.innerHTML = '<a class="select-menu-title" href="https://github.com/crimx/ext-github-release-notifier">Release Notifier</a>'

  const menuList = document.createElement('div')
  menuList.className = 'select-menu-list'
  menuList.setAttribute('role', 'menu')
  menuList.innerHTML = `
  <div class="select-menu-item${repoData.watching === 'major' ? ' selected' : ''}" role="menuitem" tabindex="0">
    <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
    <div class="select-menu-item-text">
      <input ${repoData.watching === 'major' ? 'check="check"' : ''} id="release_notifier_major" name="release_notifier" type="radio" value="major">
      <span class="select-menu-item-heading">Watching major</span>
      <span class="description">Be notified of new major release.</span>
    </div>
  </div>

  <div class="select-menu-item${repoData.watching === 'minor' ? ' selected' : ''}" role="menuitem" tabindex="0">
    <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
    <div class="select-menu-item-text">
      <input ${repoData.watching === 'minor' ? 'check="check"' : ''} id="release_notifier_minor" name="release_notifier" type="radio" value="minor">
      <span class="select-menu-item-heading">Watching minor</span>
      <span class="description">Be notified of new minor release.</span>
    </div>
  </div>

  <div class="select-menu-item${repoData.watching === 'all' ? ' selected' : ''}" role="menuitem" tabindex="0">
    <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
    <div class="select-menu-item-text">
      <input ${repoData.watching === 'all' ? 'check="check"' : ''} id="release_notifier_all" name="release_notifier" type="radio" value="all">
      <span class="select-menu-item-heading">Watching all</span>
      <span class="description">Be notified of new all release.</span>
    </div>
  </div>

  <div class="select-menu-item${!repoData.watching ? ' selected' : ''}" role="menuitem" tabindex="0">
    <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
    <div class="select-menu-item-text">
      <input ${!repoData.watching ? 'check="check"' : ''} id="release_notifier_ignore" name="release_notifier" type="radio" value="ignore">
      <span class="select-menu-item-heading">Ignoring</span>
      <span class="description">Never be notified.</span>
    </div>
  </div>
  `

  menuModal.appendChild(menuHeader)
  menuModal.appendChild(menuList)

  const allMenuItems = menuModal.querySelectorAll('.select-menu-item')
  const injectedItems = menuList.querySelectorAll('.select-menu-item')

  injectedItems.forEach(item => {
    item.addEventListener('mouseover', () => {
      allMenuItems.forEach(el => el.classList.remove('navigation-focus'))
      item.classList.add('navigation-focus')
    }, false)

    item.addEventListener('click', () => {
      document.body.click() // close menu
      if (item.classList.contains('selected')) { return }

      injectedItems.forEach(el => el.classList.remove('selected'))
      item.classList.add('selected')

      const radio = item.querySelector('[name=release_notifier]')
      radio.checked = true

      requestReplaceRepo({
        name: repoData.name,
        watching: radio.value === 'ignore' ? '' : radio.value
      })
    }, false)
  })

  menuList.addEventListener('mouseout', () => {
    injectedItems.forEach(el => el.classList.remove('navigation-focus'))
  }, false)
}
