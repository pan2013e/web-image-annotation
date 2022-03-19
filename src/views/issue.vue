<template>
  <div class="issue" style="padding-top: 4rem">
    <div class="min-h-screen pt-6 bg-gray-100 flex items-center justify-center">
        <div class="container max-w-screen-lg mx-auto">
            <div>
            <div class="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                    <div class="text-gray-600">
                        <p class="font-medium text-2xl">发布任务</p>
                    </div>
                    <div class="lg:col-span-2">
                        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
                            <el-form-item label="任务标题" prop="title">
                                <el-input v-model="ruleForm.title"></el-input>
                            </el-form-item>
                            <el-form-item label="任务描述" prop="desc">
                                <el-input type="textarea" v-model="ruleForm.desc"></el-input>
                            </el-form-item>
                            <el-form-item label="上传图片">
                              <el-upload accept="image/*" drag :action="upload_url" header="{'Content-Type': 'multipart/form-data'}" :on-change="handle_change" multiple>
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                              </el-upload>
                            </el-form-item>
                            <el-form-item label="上传视频">
                              <el-upload accept="video/*" drag :action="video_upload_url" header="{'Content-Type': 'multipart/form-data'}" 
                                :before-upload="check_video_size" :on-change="handle_video_change" multiple>
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">拖到此处，或<em>点击上传</em>。单个文件上限10MB。</div>
                                <div class="el-upload__tip" slot="tip">视频文件将被分割为图片序列，每30帧一张图片</div>
                              </el-upload>
                            </el-form-item>
                            <el-form-item class="items-center justify-center">
                                <el-button type="primary" @click="submitForm('ruleForm')" :disabled="fileList.length == 0 && videoList.length == 0">发布</el-button>
                                <el-button @click="goback()">取消</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
  </div>
</template>


<script>
import conf from '../../server/config/env'
export default {
    data() {
      return {
        ruleForm: {
          title: '',
          desc: '',
          pid: '',
        },
        rules: {
          title: [
            { required: true, message: '请填写任务标题', trigger: 'blur' }
          ],
        },
        fileList: [],
        fileName: [],
        pid: '',
        upload_url: conf.server.callbackuri + '/upload/pic',
        video_upload_url: conf.server.callbackuri + '/upload/video',
        videoList: [],
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.fileList.length == 0 && this.videoList.length == 0){
              this.$err('至少上传一张图片或一个视频');
              return;
            } else {
              for(let i=0;i<this.fileList.length;i++){
                this.fileName.push(this.fileList[i].response.name);
                this.fileList[i] = this.fileList[i].response.file;
              }
              for(let i=0;i<this.videoList.length;i++){
                this.fileName = this.fileName.concat(this.videoList[i].response.name);
                this.fileList = this.fileList.concat(this.videoList[i].response.file);
              }
            }
            this.$http.post('/image', {
              uname: localStorage.getItem('username'),
              file: this.fileList,
              file_name: this.fileName
            }).then((res)=>{
              if(res.data.value < 0){
                this.$err(res.data.err);
              }else{
                this.pid = res.data.pid;
                var form = {
                  uname: localStorage.getItem('username'),
                  title: this.ruleForm.title,
                  desc: this.ruleForm.desc,
                  pid: this.pid,
                };
                this.$http.post('/task', form).then((res)=>{
                  if(res.data.value < 0){
                    this.$err(res.data.err);
                  } else {
                    this.$msg('发布成功');
                    this.$router.go(0);
                  }
                }).catch((err)=>{
                  this.$err(err);
                });
              }
            }).catch((err)=>{
              this.$err(err);
            });
          } else {
            this.$err('表单错误');
          }
        });
      },
      goback(){
        this.$router.replace({ path: '/' });
      },
      handle_change(file, list){
        this.fileList = list;
      },
      check_video_size(file){
        if(file.size/1024/1024 > 10){
          this.$err('视频大小超过限制');
          return false;
        }
        return true;
      },
      handle_video_change(file, list){
        this.videoList = list;
      }
    }
}
</script>
