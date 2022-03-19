<template>
  <div class='pic_verify'>
    <el-page-header class="fixed top-0 left-0 py-4 w-full text-xl px-3 bg-white" style="z-index: 9999;" @back="go_back" :content="'标注任务 '+this.tid">
    </el-page-header>
    <div v-if="this.$route.path != '/m/verify'" class="fixed flex p-2 group right-4 top-2 bg-white" style="z-index: 9999;">
      <el-button @click="dialogVisible = true" type="primary" plain class="font-normal rounded-sm items-center p-2 group">查看数据</el-button>
      <el-button v-if="prop.show" @click="trigger_pass_confirm()" type="primary" plain class="font-normal rounded-sm items-center p-2 group">通过</el-button>
      <el-button v-if="prop.show" @click="trigger_reject_confirm()" type="danger" plain class="font-normal rounded-sm items-center p-2 group">退回</el-button>
    </div>
    <div class="rounded-sm">
      <el-tabs v-model="activeName" type="card" class="pt-16">
        <el-tab-pane v-for="(item,idx) in pic" :key="idx" :label="(idx+1).toString()" :name="(idx).toString()">
          <div class="flex overflow-hidden">
            <div id="main-content" class="h-full w-full relative overflow-y-auto lg:ml-8">
              <main>
                <img :src="item">
              </main>
            </div>
        </div>
        </el-tab-pane>
      </el-tabs>
      <el-footer v-if="this.$route.path == '/m/verify'" class="fixed w-full bottom-0 text-center bg-white" style="z-index: 9999;">
        <hr>
        <div class="pt-3">
        <el-button @click="dialogVisible = true" type="primary" plain class="font-normal rounded-sm items-center p-2 group">查看数据</el-button>
        <el-button v-if="prop.show" @click="trigger_pass_confirm()" type="primary" plain class="font-normal rounded-sm items-center p-2 group">通过</el-button>
        <el-button v-if="prop.show" @click="trigger_reject_confirm()" type="danger" plain class="font-normal rounded-sm items-center p-2 group">退回</el-button>
        </div>
      </el-footer>
    </div>
    <el-dialog title="标注数据" :visible.sync="dialogVisible" :width="this.$route.path == '/m/verify' ? '100%' : '40%'" style="z-index: 99999;" class="sm:w-full">
      <span>
        <json-viewer :value="label_result" :expand-depth="2" copyable boxed></json-viewer>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'pic_verify',
  data(){
    return {
      tid: '',
      pic: [],
      activeName: '0',
      activated: [],
      prop: {
        show: true
      },
      dialogVisible: false,
      label_result: [],
    }
  },
  mounted(){
    this.get_param();
    this.get_pic();
  },
  methods: {
    get_param(){
      var search = location.search;
      var obj = {};
      if(search != 0){
        var splits = search.slice("1").split("&");
        for(var i = 0;i < splits.length;i++){
          var arr = splits[i].split("=");
          obj[arr[0]] = arr[1];
        }
        this.tid = obj['tid'];
        Vue.set(this.prop, 'show', obj['mod'] == 'true' || this.$route.path == '/m/verify');
      } else {
        this.$router.replace({ path: '/' });
      }
    },
    get_pic(){
      this.$http.get(`/image/tid/${this.tid}`,{})
        .then((res) => {
          if(res.data.value < 0){
            this.$err(res.data.err);
          }else{
            this.label_result = res.data.img[0].res;
            this.pic = res.data.img[0].res_url;
            for(var i=0;i<this.pic.length;i++){
              this.activated[i] = false;
            }
          }
        })
        .catch((err) => {
          this.$err(err);
        });
    },
    go_back(){
      this.$router.replace({ path: '/user' });
    },
    trigger_reject_confirm(){
      if(this.$route.path == '/m/verify'){
        let val = prompt('退回任务','在此处填写修改意见');
        if(val != null){
          this.reject(val);
          window.location.href="about:blank";
          window.close();
        }
      } else {
        this.$prompt('修改意见', '退回任务', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          }).then(({ value }) => {
            this.reject(value);
          });
      }
    },
    reject(msg){
      this.$http.put(`/task/tid/${this.tid}`,{
        state: 'to_be_revised',
        advice: msg
      }).then((res) => {
        if(res.data.value < 0){
          this.$err(res.data.err);
        } else {
          this.$msg('退回成功');
          this.$router.replace({ path: '/user' });
        }
      }).catch((err) => {
        this.$err(err);
      });
    },
    trigger_pass_confirm(){
      if(this.$route.path == '/m/verify'){
        if(confirm('确认通过？')){
          this.pass();
          window.location.href="about:blank";
          window.close();
        }
      } else {
        this.$confirm('确认通过?','提示',{
          type: 'warning',
        }).then(() => {
          this.pass();
        });
      }
    },
    pass(){
      this.$http.put(`/task/tid/${this.tid}`,{
        state: 'done',
        advice: 'null'
      }).then((res) => {
        if(res.data.value < 0){
          this.$err(res.data.err);
          return;
        } else {
          this.$msg('提交成功')
          this.$router.replace({ path: '/user' });
        }
      }).catch((err) => {
        this.$err(err);
        return;
      });
    }
  }
}
</script>

