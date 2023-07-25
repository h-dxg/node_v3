<template>
  <div class="login">
    <el-drawer
      v-model="drawer"
      title="I am the title"
      :direction="direction"
      :before-close="handleClose"
    >
      <span>Hi, there!</span>
      {{data.username}}---{{data.password}}
    </el-drawer>
  </div>
</template>

<script>
import { ref,watch ,reactive} from "vue";
export default {
  props: ['account','type'],
  setup(props) {
    console.log(props,'props123');
    const drawer = ref(false);
    const data = reactive({
       username: "",
      password: "",
    })
    watch(() => props.type, (newValue, oldValue) => {
        console.log('type111', newValue, oldValue)
        if(newValue===2){
           drawer.value = true;
           data.username=props.account.username
           data.password=props.account.password

           console.log(props.account,'传过来的数据');
        }
      })
    const direction = ref("rtl");
    function handleClose() {
      drawer.value = false;
    }
    return {
      drawer,
      direction,
      data,
      handleClose,
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
