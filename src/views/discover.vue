<template>
  <div class="pt-24 pb-4">
  <div class="lg:px-48 sm:px-10">
    <div class="block lg:flex flex-wrap md:-mx-2 justify-center">
      <h1 class="text-xl self-center" v-if="this.task_list.length == 0">暂无数据</h1>
      <div v-for="(task, idx) in this.task_list" :key="idx" class="w-full md:mx-12 mb-4 md:mb-4">
        <div v-if="task.img_src" class="bg-white rounded-lg overflow-hidden shadow relative">
          <el-carousel trigger="click" :interval="10000" type="card" height="200px">
            <el-carousel-item v-for="img_idx in task.img_src" :key="img_idx">
              <img :src="img_idx" class="h-56 w-full object-cover object-center">
            </el-carousel-item>
          </el-carousel>
          <div class="p-4 h-auto md:h-40 lg:h-48">
            <a href="#" class="block text-blue-500 hover:text-blue-600 font-semibold mb-2 text-lg md:text-base lg:text-lg">
              {{ task.title }}
            </a>
            <div class="text-gray-500 leading-relaxed block md:text-xs lg:text-sm">
              发布用户: {{ task.uname }} &nbsp;&nbsp; 发布时间: {{ task.created_at }}
            </div>
            <hr><br>
            <div class="text-gray-700 leading-relaxed block md:text-xs lg:text-sm">
              {{ task.desc }}
            </div>
            <div class="relative mt-2 lg:absolute bottom-0 mb-4 lg:block">
              <a class="inline bg-gray-200 py-1 px-2 rounded-lg lowercase text-gray-700 text-sm" href="#" @click="trigger_confirm(task.uname, task.tid)">领取任务</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-backtop></el-backtop>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'discover',
  data(){
    return {
      task_list: [],
      image_list: [],
      plist: []
    }
  },
  mounted(){
    this.get_task_list();
  },
  methods: {
    get_task_list(){
        this.$http.get('/task', {})
          .then((res) => {
          for(let key in res.data) {
            if(res.data[key].state === 'init') {
              var temp = res.data[key];
              temp.created_at = new Date(temp.created_at).toLocaleString();
              this.task_list.push(temp);
              this.plist.push(temp.pid);
            }
          }
          this.$http.get('/image/plist',{
            params:{
              plist: this.plist
            }
          }).then((res) => {
            this.image_list = res.data.img;
            for(var i=0;i<this.task_list.length;i++){
              Vue.set(this.task_list[i], 'img_src', this.image_list[i]);
            }
          }).catch((err) => {
            this.$err(err);
          });
        }).catch((err) => {
          this.$err(err);
        });
    },
    trigger_confirm(task_uname, task_id){
      let cur_user = localStorage.getItem('username');
      if(cur_user === task_uname){
        this.$err('不能领取自己发布的任务');
        return;
      }
      this.$confirm(`确认领取?`,'提示',{
        type: 'info'
      }).then(_ => {
        this.get_new_task(task_id);
      });
    },
    get_new_task(task_id){
      let cur_user = localStorage.getItem('username');
      this.$http.put(`/task/tid/${task_id}`,{
        state: 'in_progress',
        uname_recv: cur_user
      }).then((res) => {
        if(res.data.value < 0){
          this.$err(res.data.err);
        } else {
          this.$msg('领取成功');
          this.$router.go(0);
        }
      }).catch((err) => {
        this.$err(err);
      });
    }
  }
}
</script>
