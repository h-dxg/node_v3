<template>
  <div class="login">
    <div
      class="form-box"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0)"
    >
      <p style="text-align: center">一个简洁的登录</p>
      <br> <br>
      <form class="login-form">
        <div class="form-item nickname">
          <span class="icon account-icon"></span>
          <input
            type="text"
            v-model="account.username"
            autocomplete="off"
            placeholder="请填写用户名"
          />
        </div>
        <div class="form-item password">
          <span class="icon secret-icon"></span>
          <input
            type="password"
            v-model="account.password"
            autocomplete="off"
            placeholder="请填写用户登录密码"
          />
        </div>
      </form>
      <button class="login-form submit-btn" @click="submit">登录</button>
    </div>
  </div>
  <!-- <controlDrawer ref="cc" :type='type' :account="account"></controlDrawer> -->
</template>

<script>
import { reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

// import controlDrawer from "./controlDrawer";

export default {
  // components: { controlDrawer },
  setup() {
    const { proxy } = getCurrentInstance();
    // console.log(proxy.$util,'proxy');
    const router = useRouter();
    // const type = ref(1);
    console.log(proxy.$util, " proxy.$util");
    proxy.$util.clearLocal("key", true);

    const account = reactive({
      username: "",
      password: "",
    });
    const submit = () => {
      // type.value=2
      // account.username='22'
      // account.password='333'
      // console.log(type,'type');
      const { username, password } = account;
      proxy
        .$http({
          url: "/login/login",
          method: "post",
          data: {
            username,
            password,
          },
        })
        .then(({ data }) => {
          // console.log(data);
          if (data.token) {
            // console.log(proxy.$util,' proxy.$util');
            proxy.$util.setLocal(data.token, "token");
            router.push({ name: "home" });
          }
        })
        .catch((e) => {
          console.log(e, "e");
        });
      console.log(username, "username");
      console.log(password, "password");
    };
    return {
      submit,
      account,
    };
  },
};
</script>

<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-color: #ccc;

  .team-name {
    position: fixed;
    left: 40px;
    top: 50%;
    width: 50px;
    transform: translateY(-50%);
  }

  .form-box {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 445px;

    .title {
      height: 37px;
      font-size: 30px;
      line-height: 37px;
      margin-bottom: 15%;

      h1 {
        padding-left: 74px;
        box-sizing: border-box;
        text-align: left;
        color: #8c98ae;
      }
    }

    .login-form {
      width: 100%;

      .form-item {
        position: relative;
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        padding-bottom: 13px;
        margin-bottom: 34px;

        input {
          width: 100%;
          height: 100%;
          background: transparent;
          color: #c4c9d2;
          font-size: 14px;
          padding-left: 74px;
          box-sizing: border-box;
        }

        .captcha {
          position: absolute;
          width: 80px;
          right: 30px;
          top: -22px;
          cursor: pointer;
        }
      }

      .form-item.nickname {
        background-size: 100% auto;
        background-position: left bottom;
      }

      .form-item.password {
        background-size: 100% auto;
        background-position: left bottom;
      }

      .submit-btn {
        width: 100%;
        height: 70px;
        color: #c4c9d2;
        font-size: 16px;
        text-align: left;
        box-sizing: border-box;
        padding: 0 10px;
        padding-left: 74px;

        background-size: 90% auto;
        background-position: center bottom;
        border: none;
        cursor: pointer;
      }
    }
  }
}
</style>
