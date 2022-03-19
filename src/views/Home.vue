<template>
  <main class="pt-24">
  <div class="px-32">
    <div class="bg-right bg-cover" style="background-image:url('../assets/bg.svg');">
      <div class="container px-6 mx-auto flex flex-wrap flex-col md:flex-row items-center">
        <div class="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
          <h1 class="my-2 text-3xl md:text-5xl text-purple-800 font-bold leading-tight text-center md:text-left slide-in-bottom-h1">图像标注平台</h1>
          <p class="leading-normal text-base md:text-2xl mb-8 text-center md:text-left slide-in-bottom-subtitle">在线人工智能数据集标注工具</p>
          <div class="flex w-full justify-center md:justify-start pb-24 lg:pb-0 fade-in">
            <el-button type="primary" @click="$router.replace({path:'/discover'})">探索</el-button>
            <el-button @click="$router.replace({path:'/about'})">关于网站</el-button>
          </div>
        </div>
        <div class="w-full lg:w-3/5 py-6 overflow-y-hidden">
          <img class="w-5/6 mx-auto lg:mr-0 slide-in-bottom" src="@/assets/figure.png">
        </div>
        <div class="w-full pt-8 text-sm text-center md:text-left fade-in">
          <a class="text-gray-500 no-underline hover:no-underline" href="#">&copy; 潘致远, 浙江大学 2022。 仅用于学习用途，不应在生产环境中部署。</a>
          <hr>
        </div>
      </div>
    </div>
  </div>
  </main>
</template>

<script>
export default {
  name: 'Home'
}
</script>
