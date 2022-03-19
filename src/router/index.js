import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: '登录',
    component: () => import('@/views/login'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/mark',
    name: '标注',
    component: () => import('@/views/mark'),
    meta: {
      title: '标注视图'
    }
  },
  {
    path: '/verify',
    name: '复核',
    component: () => import('@/views/verify'),
    meta: {
      title: '复核视图'
    }
  },
  {
    path: '/m/verify',
    name: '复核-mobile',
    component: () => import('@/views/verify'),
    meta: {
      title: '复核视图'
    }
  },
  {
    path: '/show',
    name: '查看',
    component: () => import('@/views/verify'),
    meta: {
      title: '查看标注结果'
    }
  },
  {
    path: '/user',
    name: '用户中心',
    component: () => import('@/page/dashboard'),
    children: [
      {
        path: '/',
        component: () => import('@/views/user.vue'),
        meta: {
          title: '用户中心'
        }
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/page/layout'),
    children: [
      {
        path:'/',
        component: Home,
        meta: {
          title: '图像标注平台'
        },
      },
      {
        path: '/discover',
        name: '发现',
        component: () => import('@/views/discover'),
        meta: {
          title: '发现任务'
        }
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: {
          title: '关于'
        }
      },
      {
        path: '/issue',
        component: () => import('@/views/issue.vue'),
        meta: {
          title: '发布任务'
        }
      }
    ]
  },
  {
    path: '*',
    name: '404',
    component: () => import('@/views/404'),
    meta: {
      title: '404'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/' || to.path === '/m/verify' || to.path === '/about') {
    next();
  } else {
    let token = localStorage.getItem('token');
    if (token === null || token === '') {
      next(`/login?redir=${to.path}`);
    } else {
      let form = {
        token: localStorage.getItem('token')
      };
      let server = axios.create({
        baseURL: require('../../server/config/env.js').server.callbackuri,
        timeout: 10000
      });
      server.post('/verify',form).then((res) => {
        next();
      }).catch((err) => {
        if (err.response.status === 401) {
          router.replace({ path: `/login?redir=${to.path}` });
        } else if (err.response.status === 403) {
          localStorage.removeItem('token');
          alert('登录过期，请重新登录');
          router.replace({ path: `/login?redir=${to.path}` });
        } else {
          alert(err);
        }
      });
    }
  }
})

export default router
