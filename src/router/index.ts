import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/index.vue'),
      meta: { requiresAuth: false }
    },
    // Öğrenci Sayfaları
    {
      path: '/student',
      component: () => import('@/layouts/StudentLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/student/Dashboard.vue')
        },
        {
          path: 'bookings/by-teacher',
          component: () => import('@/pages/student/Bookings/ByTeacher.vue')
        },
        {
          path: 'bookings/by-time',
          component: () => import('@/pages/student/Bookings/ByTime.vue')
        }
      ]
    },
    // Öğretmen Sayfaları
    {
      path: '/teacher',
      component: () => import('@/layouts/TeacherLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/teacher/Dashboard.vue')
        },
        {
          path: 'calendar',
          component: () => import('@/pages/teacher/Calendar.vue')
        }
      ]
    },
    // Admin Sayfaları
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/admin/Dashboard.vue')
        },
        {
          path: 'packages',
          component: () => import('@/pages/admin/Packages.vue')
        }
      ]
    }
  ]
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router