<template>
  <div class="app-nav-bar" style="flex-grow: 1;">
    <div class="nav-content" >
      <breadcrumb />
      <!-- <div class="right-info">
        <lin-notify
          height="370"
          :value="value"
          :hidden="hidden"
          :trigger="'click'"
          @readAll="readAll"
          @viewAll="viewAll"
          :messages="messages"
          @readMessages="readMessages"
        >
        </lin-notify>
      </div> -->
    </div>
  </div>
  <div class="right-info">
    <user></user>
  </div>
</template>

<script>
// import { getToken } from '@/lin/util/token'
import User from "./user";
import Breadcrumb from "./breadcrumb";

export default {
  name: "NavBar",
  data() {
    return {
      value: 0,
      hidden: false,
      messages: [],
      // path: `//api.s.colorful3.com/ws/message?token=${getToken('access_token').split(' ')[1]}`,
    };
  },
  created() {
    // if (Config.websocketEnable) {
    //   this.$connect(this.path, { format: 'json' })
    //   this.$options.sockets.onmessage = data => {
    //     console.log(JSON.parse(data.data))
    //     this.messages.push(JSON.parse(data.data))
    //   }
    //   this.$options.sockets.onerror = err => {
    //     console.error(err)
    //     this.$message.error('token已过期,请重新登录')
    //     store.dispatch('loginOut')
    //     const { origin } = window.location
    //     window.location.href = origin
    //   }
    // }
  },
  watch: {
    messages: {
      handler() {
        this.value = this.messages.filter((msg) => msg.is_read === false).length;
        if (this.value === 0) {
          this.hidden = true;
        } else {
          this.hidden = false;
        }
      },
      immediate: true,
    },
  },
  methods: {
    readAll() {
      console.log("点击了readAll");
    },
    viewAll() {
      console.log("点击了viewAll");
    },
    readMessages(msg, index) {
      this.messages[index].is_read = true;
    },
  },
  components: {
    Breadcrumb,
    User,
    // Screenfull,
    // ClearTab,
  },
};
</script>

<style lang="scss" scoped>
</style>
