<template>
  <div class="pagehead-wrap">
    <transition name="fade">
      <div class="check-progress-bar"
        v-if="scheduleInfo.isChecking"
        :style="{transform: `translateX(${(repoCheckProgress.success + repoCheckProgress.failed) / total * 100}%)`}"
      ></div>
    </transition>
    <div class="pagehead">
      <transition name="out-in-fade" mode="out-in">
        <!-- checking status -->
        <span v-if="scheduleInfo.isChecking">
          Checking...
          {{ repoCheckProgress.success + repoCheckProgress.failed }}/{{ total }}
        </span>
        <!-- check schedule info -->
        <div v-else>
          <span class="mr-3"><octicon name="history"></octicon> Last check: {{ lastCheck }}</span>
          <span><octicon name="clock"></octicon> Next check: {{ nextCheck }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: ['scheduleInfo', 'repoCheckProgress', 'total'],
  data () {
    return {
      currentTime: Date.now(),
    }
  },
  computed: {
    lastCheck () {
      if (!this.scheduleInfo.lastCheck) {
        return 'never'
      }
      return moment(this.scheduleInfo.lastCheck).from(this.currentTime)
    },
    nextCheck () {
      if (!this.scheduleInfo.lastCheck) {
        return 'never'
      }
      return moment(this.scheduleInfo.lastCheck)
        .add(this.scheduleInfo.period, 'minutes')
        .from(this.currentTime)
    },
  },
  created () {
    setInterval(() => {
      this.currentTime = Date.now()
    }, 1000)
  },
}
</script>

<style lang="scss" scoped>
.pagehead-wrap {
  position: relative;
  padding: 10px 0;
  color: #586069;
  background: #fafbfc;
  border-bottom: 1px solid #e1e4e8;

  .octicon {
    vertical-align: text-bottom;
  }
}

.check-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.03);
  transition: transform 0.4s;
}

.pagehead {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  width: 700px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 992px) {
  .pagehead {
    width: 750px
  }
}
</style>
