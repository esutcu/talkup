import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/Landing.vue'),
      meta: { requiresAuth: false }
    },
    // Öğrenci Paneli
    {
      path: '/student',
      component: () => import('@/layouts/StudentLayout.vue'),
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: '',
          component: () => import('@/pages/student/Dashboard.vue')
        },
        {
          path: 'bookings', 
          component: () => import('@/pages/student/Bookings.vue')
        },
        {
          path: 'credits',
          component: () => import('@/pages/student/Credits.vue')
        }
      ]
    },
    // Öğretmen Paneli  
    {
      path: '/teacher',
      component: () => import('@/layouts/TeacherLayout.vue'), 
      meta: { requiresAuth: true, role: 'teacher' },
      children: [
        {
          path: '',
          component: () => import('@/pages/teacher/Dashboard.vue')
        },
        {
          path: 'slots',
          component: () => import('@/pages/teacher/Slots.vue')
        }
      ]
    },
    // Auth Sayfaları
    {
      path: '/login',
      component: () => import('@/pages/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      component: () => import('@/pages/auth/Register.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// Auth Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.role && to.meta.role !== authStore.userRole) {
    next('/')
    return
  }

  next()
})

export default router