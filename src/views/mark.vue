<template>
  <div class='pic_mark'>
    <el-page-header class="fixed top-0 left-0 py-4 w-full text-xl px-3 bg-white" style="z-index: 9999;" @back="go_back" :content="'标注任务 '+this.tid">
    </el-page-header>
    <div class="fixed flex p-2 group right-4 top-2 bg-white" style="z-index: 9999;">
      <el-button v-if="canvas_init == false" @click="init_canvas()" type="primary" plain class="font-normal rounded-sm items-center p-2 group">初始化画布</el-button>
      <div class="flex pr-2" v-if="canvas_init">
        <div class="text-sm float-left m-auto pr-0.5">线条颜色</div>
        <el-color-picker class="float-left m-auto" size="small" color-format="hex" v-model="linecolor"></el-color-picker>
      </div>
      <div class="flex pr-2" v-if="canvas_init">
        <div class="text-sm float-left m-auto pr-0.5">文字颜色</div>
        <el-color-picker class="float-left m-auto" size="small" color-format="hex" v-model="textcolor"></el-color-picker>
      </div>
      <el-button v-if="canvas_init" @click="draw_rect()" type="primary" :plain="draw_type != 'rectangle'" class="font-normal rounded-sm items-center p-2 group">矩形工具</el-button>
      <el-button v-if="canvas_init" @click="draw_polygon()" type="primary" :plain="draw_type != 'polygon'" class="font-normal rounded-sm items-center p-2 group">多边形工具</el-button>
      <el-button v-if="canvas_init" @click="reset()" type="primary" :disabled="draw_type==''" plain class="font-normal rounded-sm items-center p-2 group">释放画笔</el-button>
      <el-button v-if="canvas_init" @click="dialogVisible = true" type="primary" plain class="font-normal rounded-sm items-center p-2 group">查看数据</el-button>
      <el-button v-if="canvas_init" @click="trigger_submit_confirm()" type="primary" plain class="font-normal rounded-sm items-center p-2 group">提交</el-button>
      <el-button v-if="canvas_init" @click="clear_drawings()" type="danger" plain class="font-normal rounded-sm items-center p-2 group">清除当前画布</el-button>
    </div>
    <div class="rounded-sm">
      <el-tabs v-model="activeName" :before-leave="leave_tab" type="card" class="pt-16">
        <el-tab-pane v-for="(item,idx) in pic" :key="idx" :label="(idx+1).toString()" :name="(idx).toString()">
          <div class="flex overflow-hidden">
            <div id="main-content" class="h-full w-full relative overflow-y-auto lg:ml-4 lg:mr-4 lg:mb-2">
                <main>
                  <img :id="`img_${idx}`" :ref="'ref_img'+idx" :src="item" alt="pic" hidden crossorigin="">
                  <canvas :id="'ctx_'+idx" :ref="'ref_ctx'+idx" @mousedown="mouse_down($event)" @mouseup="mouse_up($event)" @mousemove="mouse_move($event)">
                    Your browser does not support canvas.
                  </canvas>
                  <a href='#' v-if="canvas_init == false" @click="init_canvas()" class="text-2xl text-gray-700 hover:text-blue-500 italic underline">单击此处或"初始化画布"按钮以开始</a>
                </main>
            </div>
        </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog title="标注数据" :visible.sync="dialogVisible" width="40%" style="z-index: 12000;">
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
export default {
  name: 'pic_mark',
  data(){
    return {
      tid: '',
      pid: '',
      pic: [],
      activeName: '0',
      activated: [],
      canvas_init: false,
      mouse_moving: false,
      rect_pos: {
        start: false,
        x: '',
        y: ''
      },
      polygon_pos: {
        start: false,
        start_x: '',
        start_y: '',
        bbox_x_min: '',
        bbox_x_max: '',
        bbox_y_min: '',
        bbox_y_max: ''
      },
      draw_type: '',
      textcolor: '#2883dd',
      linecolor: '#000000',
      label_result: [],
      dialogVisible: false,
      temp_canvas_img: [],
      res_pic: []
    }
  },
  mounted(){
    this.get_param();
    this.get_pic();
    if(document.body.clientWidth < 960){
      this.$err('浏览器宽度较小，可能影响使用');
    }
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
            this.pid = res.data.img[0].pid;
            this.pic = res.data.img[0].src;
            for(var i=0;i<this.pic.length;i++){
              this.activated[i] = false;
            }
          }
        })
        .catch((err) => {
          this.$err(err);
        });
    },
    init_canvas(){
      for(var i=0;i<this.pic.length;i++){
        var canvas = document.querySelector('#ctx_'+i);
        var image = document.querySelector('#img_'+i);
        var ctx = canvas.getContext('2d');
        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;
        ctx.drawImage(image,0,0);
        this.temp_canvas_img.push(ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height));
      }
      this.canvas_init=true;
    },
    mouse_down(e){
      var canvas = document.querySelector('#ctx_'+this.activeName);
      var ctx = canvas.getContext('2d');
      var bounding = canvas.getBoundingClientRect();
      var imageX = e.clientX - bounding.left;
      var imageY = e.clientY - bounding.top;
      this.temp_canvas_img[parseInt(this.activeName)] = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
      if(this.draw_type == 'rectangle'){
        this.rect_pos.x = imageX;
        this.rect_pos.y = imageY;
        ctx.beginPath();
        this.rect_pos.start = true;
      } else if (this.draw_type == 'polygon'){
        if(this.polygon_pos.start == false){
          this.polygon_pos.start = true;
          this.polygon_pos.start_x = imageX;
          this.polygon_pos.start_y = imageY;
          this.polygon_pos.bbox_x_min = imageX;
          this.polygon_pos.bbox_x_max = imageX;
          this.polygon_pos.bbox_y_min = imageY;
          this.polygon_pos.bbox_y_max = imageY;
          ctx.beginPath();
          ctx.moveTo(imageX, imageY);
        } else {
          const start_x = this.polygon_pos.start_x;
          const start_y = this.polygon_pos.start_y;
          if(imageX < this.polygon_pos.bbox_x_min){
            this.polygon_pos.bbox_x_min = imageX;
          }
          if(imageX > this.polygon_pos.bbox_x_max){
            this.polygon_pos.bbox_x_max = imageX;
          }
          if(imageY < this.polygon_pos.bbox_y_min){
            this.polygon_pos.bbox_y_min = imageY;
          }
          if(imageY > this.polygon_pos.bbox_y_max){
            this.polygon_pos.bbox_y_max = imageY;
          }
          var eps = 5;
          if(Math.sqrt((imageX-start_x)*(imageX-start_x)+(imageY-start_y)*(imageY-start_y)) < 5){
            this.$confirm('闭合该图形?','提示',{
              type: 'warning'
            }).then(() => {
              imageX = start_x;
              imageY = start_y;
              this.polygon_pos.start = false;
              this.$prompt('', '标签名', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              }).then(({ value }) => {
                if(value === null){
                  this.$err('无标签的标注将不会被保存');
                } else {
                  ctx.font = '18px STheiti, SimHei';
                  ctx.fillStyle = this.textcolor;
                  ctx.fillText(value, start_x, start_y - 5);
                  var index = parseInt(this.activeName);
                  var annotation = {
                    idx: index,
                    width: canvas.width,
                    height: canvas.height,
                    label: value,
                    bbox: [this.polygon_pos.bbox_x_min, this.polygon_pos.bbox_y_min, this.polygon_pos.bbox_x_max, this.polygon_pos.bbox_y_max]
                  };
                  this.label_result.push(annotation);
                }
              }).catch(() => {
                this.$err('无标签的标注将不会被保存');
              });
            });
          }
          ctx.strokeStyle = this.linecolor;
          ctx.lineTo(imageX, imageY);
          ctx.moveTo(imageX, imageY);
          ctx.stroke();
          if(this.polygon_pos.start == false){
            ctx.closePath();
          }
        }
      }
    },
    mouse_move(e){
      var canvas = document.querySelector('#ctx_'+this.activeName);
      var ctx = canvas.getContext('2d');
      var bounding = canvas.getBoundingClientRect();
      const imageX = e.clientX - bounding.left;
      const imageY = e.clientY - bounding.top;
      if(this.draw_type == 'rectangle' && this.rect_pos.start){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(this.temp_canvas_img[parseInt(this.activeName)],0,0);
        ctx.beginPath();
        ctx.strokeStyle = this.linecolor;
        const {x, y} = this.rect_pos;
        ctx.strokeRect(x, y, imageX - x, imageY - y);
        ctx.closePath();
      } else if(this.draw_type == 'polygon' && this.polygon_pos.start){

      }
    },
    mouse_up(e){
      var canvas = document.querySelector('#ctx_'+this.activeName);
      var ctx = canvas.getContext('2d');
      var bounding = canvas.getBoundingClientRect();
      const imageX = e.clientX - bounding.left;
      const imageY = e.clientY - bounding.top;
      if(this.draw_type == 'rectangle'){
        const { start, x, y } = this.rect_pos;
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, imageX - x, imageY - y);
        ctx.closePath();
        this.rect_pos.start = false;
        this.$prompt('', '标签名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          if(value === null){
            this.$err('无标签的标注将不会被保存');
          } else {
            ctx.font = '18px STheiti, SimHei';
            ctx.fillStyle = this.textcolor;
            if(y > 30){
              ctx.fillText(value, x, y - 5);
            } else {
              ctx.fillText(value, x, imageY + 15);
            }
            var index = parseInt(this.activeName);
            var _bbox = x < imageX ? [x, y, imageX, imageY] : [imageX, imageY, x, y];
            var annotation = {
              idx: index,
              width: canvas.width,
              height: canvas.height,
              label: value,
              bbox: _bbox
            };
            this.label_result.push(annotation);
          }
        }).catch(() => {
          this.$err('无标签的标注将不会被保存');
        });
      }
    },
    go_back(){
      this.$confirm('确认返回？结果将不会被保存。','提示',{
        type: 'warning'
      }).then(() => {
        this.$router.replace({ path: '/user' });
      });
    },
    draw_rect(){
      this.draw_type = 'rectangle';
    },
    draw_polygon(){
      this.draw_type = 'polygon';
    },
    reset(){
      this.draw_type = '';
    },
    trigger_submit_confirm(){
      this.$confirm('确认提交?','提示',{
        type: 'warning'
      }).then(() => {
        this.submit();
      });
    },
    submit(){
      for(var i=0;i<this.pic.length;i++){
        var canvas = document.querySelector(`#ctx_${i}`);
        this.res_pic.push(canvas.toDataURL());
      }
      this.$http.put(`/image/pid/${this.pid}`,{
        res: this.label_result,
        res_url: this.res_pic
      }).then((res) => {
        if(res.data.value < 0){
          this.$err(res.data.err);
        } else {
          this.$http.put(`/task/tid/${this.tid}`,{
            state: 'to_be_verified',
          }).then((res) => {
            if(res.data.value < 0){
              this.$err(res.data.err);
            } else {
              this.$msg('提交成功');
              this.$router.replace({ path: '/user' });
            }
          }).catch((err) => {
            this.$err(err);
          });
        }
      }).catch((err) => {
        this.$err(err);
      });
    },
    clear_drawings(){
      var canvas = document.querySelector('#ctx_'+this.activeName);
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var image = document.querySelector('#img_'+this.activeName);
      ctx.drawImage(image,0,0);
      for(var i=0;i<this.label_result.length;i++){
        // console.log(this.label_result[i])
        if(this.label_result[i].idx == parseInt(this.activeName)){
          this.label_result.splice(i,1);
        }
      }
    },
    leave_tab(act,old_act){
      if(this.polygon_pos.start){
        this.$err('请先完成多边形绘制后再切换页面');
        return false;
      } else {
        return true;
      }
    }
  }
}
</script>

