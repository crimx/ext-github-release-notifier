<template>
  <div>
    <header class="header-wrap">
      <div class="header">
        <button class="btn btn-menu" type="button" @click="isShowDrawer = true">
          <octicon name="three-bars"></octicon>
        </button>
        <div>
          <h1 class="header-title">Github Release Notifier</h1>
          <small class="header-description">Unofficial "polyfill" for watching Github releases.</small>
        </div>
        <div class="header-aside">
          <button class="btn btn-sm" type="button" @click="requestCheckRepos">
            <octicon :name="scheduleInfo.isChecking ? 'sync' : 'zap'" :spin="scheduleInfo.isChecking"></octicon>
            Check Now
          </button>
          <input v-model="filterText" class="btn-filter form-control input-sm" type="text" placeholder="Filter">
          <transition name="out-in-fade" mode="out-in">
            <a v-if="hasToken && !isFetchingToken" class="tooltipped tooltipped-sw text-inherit" href="#" @click.prevent="signOut" role="button" :aria-label="`Sign out (rate limit remaining: ${rateLimitRemaining})`">
              <octicon name="sign-out" scale="1.5" style="position: relative; top: 2px;"></octicon>
            </a>
            <span v-if="!hasToken && !isFetchingToken" class="tooltipped tooltipped-sw tooltipped-no-delay" :aria-label="`Sign in to increase request rate limit (remaining: ${rateLimitRemaining})`">
              <a href="#" class="text-white text-bold no-underline" @click.prevent="signIn">Sign in</a>
            </span>
            <octicon v-if="isFetchingToken" name="sync" spin scale="1.5"></octicon>
          </transition>
        </div>
      </div>
    </header>
    <timing :schedule-info="scheduleInfo" :repo-check-progress="repoCheckProgress" :total="rawRepos.length"></timing>
    <!-- offline warning -->
    <div class="alert-container" v-if="!isOnline">
      <div class="flash flash-warn text-center mt-3">
        <octicon name="alert"></octicon>
        You are currently offline.
      </div>
    </div>
    <!-- rate limit warning -->
    <div class="alert-container" v-if="rateLimitRemaining <= 10">
      <div class="flash flash-error text-center mt-3">
        <octicon name="dashboard"></octicon>
        {{
          rateLimitRemaining > 1
          ? `You are about to exceed rate limit (remaining: ${rateLimitRemaining}). Please sign in.`
          : `You have exceeded rate limit. Please sign in.`
        }}
      </div>
    </div>
    <main class="main-container">
      <transition name="out-in-fade" mode="out-in">
        <repolist v-if="rawRepos.length > 0" :repos="filteredRepos"></repolist>
        <blankslate v-else></blankslate>
      </transition>
    </main>
    <drawer :show.sync="isShowDrawer"></drawer>
  </div>
</template>

<script>
import Drawer from './components/Drawer'
import Timing from './components/Timing'
import Repolist from './components/Repolist'
import Blankslate from './components/Blankslate'
import moment from 'moment'
import { requestCheckRepos, requestAuthorize } from '@/api/message'
import { removeToken } from '@/api/oauth'

export default {
  name: 'app',
  props: [
    'rawRepos',
    'scheduleInfo',
    'repoCheckProgress',
    'rateLimitRemaining',
    'hasToken',
    'isOnline',
  ],
  data () {
    return {
      currentTime: Date.now(),
      isShowDrawer: false,
      filterText: '',
      isFetchingToken: false,
    }
  },
  components: {
    Drawer,
    Timing,
    Repolist,
    Blankslate,
  },
  computed: {
    formattedRepos () {
      return this.rawRepos
        .sort((a, b) => b.published_at - a.published_at)
        .map(repo => {
          const splitName = repo.name.split('/')
          return {
            ...repo,
            authorName: splitName[0],
            repoName: splitName[1],
            published_from_now: repo.published_at ? `${moment(repo.published_at).from(Date.now())}` : '',
            isFresh: moment().subtract(6, 'hours').isBefore(repo.published_at),
            isFilterOut: false,
          }
        })
    },
    filteredRepos () {
      const filterText = this.filterText.toLowerCase()
      const repos = this.formattedRepos

      if (!filterText) {
        for (let i = 0; i < repos.length; i += 1) {
          repos[i].isFilterOut = false
        }
        return repos
      }

      const matchList = []
      const filterOutList = []
      for (let i = 0; i < repos.length; i += 1) {
        if (repos[i].name.toLowerCase().indexOf(filterText) !== -1) {
          repos[i].isFilterOut = false
          matchList.push(repos[i])
        } else {
          repos[i].isFilterOut = true
          filterOutList.push(repos[i])
        }
      }
      return matchList.concat(filterOutList)
    },
  },
  methods: {
    signIn () {
      this.isFetchingToken = true
      requestAuthorize()
        .then(() => {
          this.isFetchingToken = false
        })
    },
    requestCheckRepos () {
      if (this.isOnline && !this.scheduleInfo.isChecking) {
        requestCheckRepos()
      }
    },
    signOut: removeToken,
  },
}
</script>

<style lang="scss">
/*------------------------------------*\
  #primer
\*------------------------------------*/
// Primer master file

// Global requirements
@import "primer-support/index.scss";
// @import "primer-marketing-support/index.scss";

// Core modules
@import "primer-base/index.scss";
// @import "primer-box/index.scss";
// @import "primer-breadcrumb/index.scss";
@import "primer-buttons/index.scss";
// @import "primer-table-object/index.scss";
@import "primer-forms/index.scss";
@import "primer-layout/index.scss";
@import "primer-navigation/index.scss";
@import "primer-tooltips/index.scss";
// @import "primer-truncate/index.scss";

// Product specific css modules
@import "primer-alerts/index.scss";
@import "primer-avatars/index.scss";
@import "primer-blankslate/index.scss";
// @import "primer-branch-name/index.scss";
// @import "primer-labels/index.scss";
// @import "primer-markdown/index.scss";
// @import "primer-popover/index.scss";
// @import "primer-subhead/index.scss";

// marketing specific css modules
// @import "primer-marketing-type/index.scss";
// @import "primer-marketing-buttons/index.scss";
// @import "primer-page-headers/index.scss";
// @import "primer-page-sections/index.scss";
// @import "primer-tables/index.scss";
// @import "primer-marketing-utilities/index.scss";

// Utilities always go last so that they can override components
@import "primer-utilities/index.scss";
</style>

<style>
/*------------------------------------*\
  #base
\*------------------------------------*/
body {
  min-height: 600px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  color: #24292e;
  background-color: #fff;
}
</style>


<style lang="scss" scoped>
/*------------------------------------*\
  #components
\*------------------------------------*/
%container {
  width: 700px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.header-wrap {
  font-size: 16px;
  color: rgba(255,255,255,0.75);
  background-color: #34495E;
}

.header {
  @extend %container;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-menu {
  display: flex;
  align-items: center;
  width: 38px;
  height: 34px;
  margin-right: 16px;
  color: rgba(255, 255, 255, 0.525);
  border: 1px solid rgba(255, 255, 255, 0.525);
  border-radius: 5px;
  background: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.625);
  }
}

.header-title {
  margin-bottom: 4px;
  font-size: 21px;
  line-height: 1;
}

.header-description {
  display: block;
  font-size: 12px;
  line-height: 1;
}

.header-aside {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;

  & > * {
    margin-left: 14px;
  }
}

.btn-filter {
  background: rgba(255,255,255,0.125);
  border: none;
  outline: none;
  box-shadow: none;
  color: #fff;

  &::-webkit-input-placeholder {
    color: #fff;
  }

  &::-moz-placeholder {
    color: #fff;
  }

  &:focus {
    background: rgba(255,255,255,0.175);
    outline: none;
    border: none;
    box-shadow: none;
  }
}

.main-container,
.alert-container {
  @extend %container;
}

@media (min-width: 992px) {
  .header {
    width: 750px
  }
}
</style>

<style>
/*------------------------------------*\
  #states
\*------------------------------------*/
.text-gray-lighter {
  color: #b5b5b5 !important;
}

.img-gray {
  filter: grayscale(1) !important;
}

.out-in-fade-enter-active, .out-in-fade-leave-active {
  transition: opacity .3s ease;
}
.out-in-fade-enter, .out-in-fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>

