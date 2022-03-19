<template>
    <div>
    <nav class="bg-white shadow-lg fixed top-0 right-0 w-full" style="z-index: 90000;">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between">
                <div class="flex space-x-7">
                    <div>
                        <router-link to='/' class="flex items-center py-4 px-2">
                            <img src="@/assets/logo.png" alt="Logo" class="h-8 w-8 mr-2">
                            <span class="font-semibold text-black text-lg">图像标注平台</span>
                        </router-link>
                    </div>
                    <div class="hidden md:flex items-center space-x-1">
                        <router-link to='/' active-class="text-green-500 border-b-4 border-green-500 font-semibold" class="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300" exact>
                            首页
                        </router-link>
                        <router-link to='/discover' active-class="text-green-500 border-b-4 border-green-500 font-semibold" class="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300" exact>
                            发现
                        </router-link>
                        <router-link to='/about' active-class="text-green-500 border-b-4 border-green-500 font-semibold" class="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300" exact>
                            关于
                        </router-link>
                    </div>
                </div>
                <div class="hidden md:flex items-center space-x-3 ">
                    <template v-if="is_login"> 
                        <router-link to='/issue' class="py-2 px-2 font-medium text-gray-500 bg-gray-100 hover:bg-gray-50 rounded transition duration-300">
                            发布任务
                        </router-link>
                        <div class="ml-3 relative">
                            <div>
                                <router-link to='/user' class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu-button">
                                    <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                                </router-link>
                            </div>
                        </div>
                    </template>
                    <template v-if="!is_login">
                        <router-link to="/login" class="py-2 px-2 font-medium text-white bg-green-500 rounded hover:bg-green-400 transition duration-300">
                            登录/注册
                        </router-link>
                    </template>
                </div>
                <div class="md:hidden flex items-center">
                    <router-link to='/user' class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu-button">
                        <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                    </router-link>
                </div>
            </div>
        </div>
    </nav>
    <router-view/>
    </div>
</template>

<script>
export default{
    name: 'layout',
    mounted: function() {
        this.check_login();
    },
    data(){
        return {
            is_login: false,
            avatar_active: false,
            nav_index: 0,
        }
    },
    methods: {
        check_login(){
            this.is_login = localStorage.getItem('token') ? true : false;
        },
    }
}
</script>

<style></style>
