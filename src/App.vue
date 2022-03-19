<template>
  <div id="app">
  <router-view v-wechat-title='$route.meta.title'/>
  </div>
</template>

<script>
export default {
  name: 'app',
  methods:{
  }
}
</script>

<style>
.max-z {
  z-index:99999 !important;
}
</style>
