<template>
  <div class="pt-14 pb-4 user_tasks">
    <el-descriptions title="用户信息" class="pt-4">
      <el-descriptions-item label="用户名">{{this.username}}</el-descriptions-item>
      <el-descriptions-item label="发起任务数">
        <el-tag size="small">{{this.post_task_list.length}}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="接受任务数">
        <el-tag size="small">{{this.recv_task_list.length}}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <hr>
    <div class="pt-6">
      <h2 class="font-bold text-gray-700">发起的任务</h2>
        <el-table :data="post_task_list" style="width: 100%" max-height="400"  :default-sort = "{prop: 'created_at', order: 'descending'}">
          <el-table-column fixed sortable prop="tid" label="任务ID" width="160">
          </el-table-column>
          <el-table-column prop="title" label="任务标题" width="200">
          </el-table-column>
          <el-table-column prop="state" label="任务状态" width="130" :filters="filter" :filter-method="filter_state" filter-placement="bottom-end">
            <template slot-scope="scope">
              <el-tag :type="label_map[scope.row.state]" disable-transitions>{{scope.row.state}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="uname_recv" label="接单用户" width="130">
          </el-table-column>
          <el-table-column sortable prop="created_at" label="创建时间" width="300">
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150">
            <template slot-scope="scope">
              <el-popover v-if="scope.row.state=='待审核'" placement="bottom" title="可在移动端扫描二维码查看" width="220" trigger="hover">
                <img :src="scope.row.qrcode" alt="qr-code unavailable">
                <el-button slot="reference" @click="handle(scope.row, verify_task)" type="text" size="small">
                  复核<i class="el-icon-mobile"></i>
                </el-button>
              </el-popover>
              <el-button v-if="scope.row.state=='待领取'" @click="handle(scope.row, delete_task)" type="text" size="small">取消</el-button>
              <el-button v-if="scope.row.state=='已完成'" @click="handle(scope.row, check_task)" type="text" size="small">查看</el-button>
              <el-dropdown class="pl-2" v-if="scope.row.state=='已完成'" trigger="click">
                <el-button class="el-dropdown-link" type="text" size="small">
                  导出<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="export_dataset(scope.row.tid, 'voc')">PASCAL VOC</el-dropdown-item>
                  <el-dropdown-item @click.native="export_dataset(scope.row.tid, 'coco')">COCO</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      <h2 class="font-bold text-gray-700 pt-4">接受的任务</h2>
      <el-table :data="recv_task_list" style="width: 100%"  max-height="400"  :default-sort = "{prop: 'created_at', order: 'descending'}">
          <el-table-column fixed sortable prop="tid" label="任务ID" width="160">
          </el-table-column>
          <el-table-column prop="title" label="任务标题" width="200">
          </el-table-column>
          <el-table-column prop="state" label="任务状态" width="130" :filters="filter" :filter-method="filter_state" filter-placement="bottom-end">
            <template slot-scope="scope">
              <el-tag :type="label_map[scope.row.state]" disable-transitions>{{scope.row.state}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="uname" label="发起用户" width="130">
          </el-table-column>
          <el-table-column sortable prop="created_at" label="创建时间" width="300">
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="130">
            <template slot-scope="scope">
              <el-button v-if="scope.row.state=='进行中'" @click="handle(scope.row, get_into_task)" type="text" size="small">进入</el-button>
              <el-button v-if="scope.row.state=='进行中'" @click="handle(scope.row, decline_task)" type="text" size="small">放弃</el-button>
              <el-button v-if="scope.row.state=='退回'" @click="read_advice(scope.row.advice)" type="text" size="small">查看建议</el-button>
              <el-button v-if="scope.row.state=='退回'" @click="handle(scope.row, get_into_task)" type="text" size="small">修改</el-button>
            </template>
          </el-table-column>
        </el-table>
    </div>
  <el-backtop></el-backtop>
  </div>
</template>

<script>
import Vue from 'vue'
import conf from '../../server/config/env'
export default {
  name: 'user_tasks',
  data(){
    return {
      username: '',
      post_task_list: [],
      recv_task_list: [],
      state_map: {
        'init': '待领取',
        'in_progress': '进行中',
        'to_be_verified': '待审核',
        'to_be_revised': '退回',
        'done': '已完成'
      },
      filter: [
        {text: '待领取', value: '待领取'},
        {text: '进行中', value: '进行中'},
        {text: '待审核', value: '待审核'},
        {text: '退回', value: '退回'},
        {text: '已完成', value: '已完成'}
      ],
      label_map: {
        '待领取': 'primary',
        '进行中': 'primary',
        '待审核': 'warning',
        '退回': 'warning',
        '已完成': 'success',
      }
    }
  },
  mounted(){
    let cur_name = localStorage.getItem('username');
    this.username = cur_name;
    this.get_task_list(this.post_task_list, `/task/uname/${cur_name}`);
    this.get_task_list(this.recv_task_list, `/task/uname_r/${cur_name}`);
  },
  methods: {
    get_task_list(list, url){
      this.$http.get(url, {})
        .then((res) => {
          for(let key in res.data) {
            var temp = res.data[key];
            temp.state = this.state_map[temp.state];
            if(temp.uname_recv == 'null'){
              temp.uname_recv = '暂无';
            }
            if(temp.state == '待审核'){
              temp.qrcode = `${conf.server.callbackuri}/qrcode?text=${encodeURI(this.$website_url+'/m/verify?tid='+temp.tid+'&mod=true')}`;
            }
            temp.created_at = new Date(temp.created_at).toLocaleString();
            list.push(res.data[key]);
          }
      }).catch((err) => {
        this.$err(err);
      });
    },
    get_into_task(task_id){
      this.$router.replace({ path: `/mark?tid=${task_id}` });
    },
    decline_task(task_id){
      this.$http.put(`/task/tid/${task_id}`,{
          state: 'init',
          uname_recv: 'null'
      }).then((res) => {
        if(res.data.value < 0){
          this.$err(res.data.err);
        } else {
          this.$msg('取消成功');
          this.$router.go(0);
        }
      }).catch((err) => {
        this.$err(err);
      });
    },
    delete_task(task_id){
      this.$http.delete(`/task/tid/${task_id}`,{})
        .then((res) => {
          if(res.data.value < 0){
            this.$err(res.data.err);
          } else {
            this.$msg('取消成功');
            this.$router.go(0);
          }
        }).catch((err) => {
          this.$err(err);
        });
    },
    verify_task(task_id){
      this.$router.replace({ path: `/verify?tid=${task_id}&mod=true` });
    },
    check_task(task_id){
      this.$router.replace({ path: `/show?tid=${task_id}&mod=false` });
    },
    read_advice(msg){
      this.$msgbox(msg, '修改意见', {
        confirmButtonText: '确定'
      });
    },
    handle(row, callback){
      callback(row.tid);
    },
    filter_state(value, row){
      return row.state === value;
    },
    export_dataset(task_id, dataset){
      var url = `${conf.server.callbackuri}/export?tid=${task_id}&dataset=${dataset}`;
      window.open(url);
    }
  }
}
</script>