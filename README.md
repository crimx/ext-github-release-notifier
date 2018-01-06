# [Release Notifier for Github](https://github.com/crimx/ext-github-release-notifier)

Unofficial "polyfill" for watching Github releases. It was based on [this](https://github.com/isaacs/github/issues/410#issuecomment-291797759) lovely idea.

- Chrome Extension <https://chrome.google.com/webstore/detail/gjhmlndokehcbkaockjlgeofgkiaiflg>
- Firefox Add-on <https://addons.mozilla.org/firefox/addon/release-notifier-for-github/>

It checks Github releases every 15 minutes and notifies releases by browser notification.

Fast & light-weight: It is loaded and run only when needed. And instead of subscribing atom feeds, it uses Github api and takes advantage of 403 cache.

![screenshot](https://github.com/crimx/ext-github-release-notifier/wiki/images/screen2.png)

# Develop

Clone repo, `cd` in and run `yarn install`.

1. Tweak UI with random fake data: `npm run dev` (not `yarn`).
2. Quick build (without optimization): `npm run build --debug --devbuild`.
3. Full build: `npm run build`.

Both Chrome & Firefox outputs are in `dist/` folder.

If you need to test oauth, edit `src/api/oauth-data.js`, add custom oauth client ids and secrets.

You can also untrack it locally.

```bash
git update-index --assume-unchanged src/api/oauth-data.js
```
