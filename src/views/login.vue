<template>
  <div class="min-h-screen bg-gray-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <template v-if='is_login'>
            您已登录。<br>
            <el-button type="primary" @click='exit()'>退出登录</el-button>
            <el-button type="primary" @click='this.$router.go(-1)'>返回</el-button>
          </template>
          <template v-if='login_stat && !is_login'>
            <el-form label-position='left' ref='loginref' :rules='form_rules' :model='login_form' label-width="80px" class='login_form'>
                <div class="switch">
                  <span id='login' v-bind:class='{active: this.login_stat}' @click="set_state(true)">登录</span>
                  <span>/</span>
                  <span id='register' v-bind:class='{active: !this.login_stat}' @click="set_state(false)">注册</span>
                </div>
                <el-form-item label='用户名' prop='username'>
                  <el-input v-model="login_form.username"></el-input>
                </el-form-item>
                <el-form-item label='密码' prop='passwd'>
                  <el-input v-model="login_form.passwd" show-password clearable></el-input>
                </el-form-item>
                <div class="mt-6">
                  <el-button type="primary" @click='login()'>登录</el-button>
                </div>
            </el-form>
          </template>
          <template v-if='!login_stat && !is_login'>
            <el-form label-position='left' ref='regref' :rules='form_rules' :model='reg_form' label-width="80px" class='login_form'>
                <div class="switch">
                    <span id='login' v-bind:class='{active: this.login_stat}' @click="set_state(true)">登录</span>
                    <span>/</span>
                    <span id='register' v-bind:class='{active: !this.login_stat}' @click="set_state(false)">注册</span>
                </div>
                <el-form-item label='用户名' prop='username'>
                    <el-input v-model="reg_form.username"></el-input>
                </el-form-item>
                <el-form-item label='邮箱' prop='email'>
                    <el-input v-model="reg_form.email"></el-input>
                </el-form-item>
                <el-form-item label='密码' prop='passwd'>
                    <el-input type="password" v-model="reg_form.passwd" clearable></el-input>
                </el-form-item>
                <el-form-item label='确认密码' prop='confirmpwd'>
                    <el-input type="password" v-model="reg_form.confirmpwd" clearable></el-input>
                </el-form-item>
                <el-form-item prop='captcha'>
                  <div id="recaptcha" class="g-recaptcha"></div>
                </el-form-item>
                <el-button type="primary" @click='register()'>注册</el-button>
            </el-form>
          </template>
        </div>
      </div>
  </div>
</template>

<style>
.switch span{
  color: #ccc;
  font-size: 1.4rem;
  cursor: pointer;
}

.switch span.active{
  color: rgb(0, 17, 255);
}

.el-form-item {
  margin: 1rem 0 0;
}

#forgetpwd {
  color: grey;
  margin: 0 1rem 0;
}
</style>

<script>
import { mapMutations } from 'vuex';
let captcha_en = require('../../server/config/env').captcha.enable;
export default ({
  name: 'login',
  mounted: function(){
    window.robot_verify = this.robot_verify;
    window.captcha_expire = this.captcha_expire;
    this.check_login();
    this.initCaptcha();
  },
  data(){
    var validate_email = (rule, value, callback) => {
        if(!value){
          return callback(new Error('请输入邮箱'));
        }
        let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(!filter.test(value)) {
          callback(new Error('邮箱格式错误'));
        } else {
          callback();
        };
    };
    var validate_pwd2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.reg_form.passwd) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
    };
    var check_robot = (rule, value, callback) => {
      if(!captcha_en) callback();
      if (value === 0) {
        callback(new Error('请进行人机验证'));
      } else {
        this.$http.post('/captcha',{code: this.captcha_response}).then((res)=>{
          if(!res.data.success) {
            callback(new Error('服务端验证失败，请重新验证'));
            this.$router.go(0);
          } else {
            callback();
          }
        }).catch((err)=>{
          this.$err(err);
        });
      }
    };
    return {
      is_login: false,
      login_stat: true,
      captcha_response: '',
      login_form:{
        username: '',
        passwd: '',
      },
      reg_form:{
        email: '',
        username: '',
        passwd: '',
        confirmpwd: '',
        captcha: 0
      },
      form_rules:{
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        passwd:[
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        confirmpwd:[
          { required: true, validator: validate_pwd2, trigger: 'blur' }
        ],
        email:[
          { required: true, validator: validate_email, trigger: 'blur' }
        ],
        captcha:[
          { validator: check_robot, trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    ...mapMutations(['changeLogin']),
    check_login(){
      this.is_login = localStorage.getItem('token')?true:false;
    },
    initCaptcha(){
      if(!captcha_en) return;
      setTimeout(() => {
        var self = this;
        if(typeof grecaptcha === 'undefined') {
            self.initReCaptcha();
        } else {
            window.grecaptcha.render('recaptcha', {
              'sitekey': '6LckeZ8cAAAAAF68JcsQZ9is4Lqsn23ka7-BgNpr',
              'callback': robot_verify,
              'expired-callback': captcha_expire
            });
        }
      }, 100);
    },
    captcha_expire(){
      this.reg_form.captcha = 0;
    },
    robot_verify(res){
      this.reg_form.captcha = 1;
      this.captcha_response = res;
    },
    set_state(state){
      if(this.login_stat){
          this.$refs.loginref.resetFields();
      } else {
          this.$refs.regref.resetFields();
      }
      this.login_stat=state;
      this.initCaptcha();
    },
    getUrlKey(name){
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null
    },
    login(){
      this.$refs.loginref.validate((valid) => {
        if(!valid) return;
        let form = {
          username: this.login_form.username,
        };
        this.$http.post('/login',form).then((res)=>{
          if(res.data.value < 0){
            this.$err(res.data.err);
          }else if(this.$crypto.compareSync(this.login_form.passwd,res.data.hash)){
            this.$msg('登录成功');
            this.changeLogin({ Authorization: res.data.token, Username: this.login_form.username });
            var search = location.search;
            var obj = {};
            if(search != 0){
              var splits = search.slice("1").split("&");
              for(var i = 0;i < splits.length;i++){
                var arr = splits[i].split("=");
                obj[arr[0]] = arr[1];
              }
              this.$router.replace({ path:  unescape(obj['redir']) });
            } else {
              this.$router.go(-1);
            }
          }else {
            this.$err('密码错误');
          }
        }).catch((err)=>{
          this.$err(err);
        });
      });
    },
    register(){
      this.$refs.regref.validate((valid) => {
        if(!valid) return;
        let form = {
          email: this.reg_form.email,
          username: this.reg_form.username,
          passwd: this.$crypto.hashSync(this.reg_form.passwd,10)
        }
        this.$http.post('/register',form).then((res)=>{
          console.log(res);
          if(res.data.value < 0){
            this.$err(res.data.err);
          }else{
            this.$msg('注册成功');
            this.$router.go(0);
          }
        }).catch((err)=>{
          this.$err(err);
        });
      })
    },
    exit(){
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.$router.go(0);
    }
  }
})
</script>

