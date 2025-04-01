
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
    
    // Admin Routes
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/admin/Dashboard.vue'),
        },
        {
          path: 'packages',
          component: () => import('@/pages/admin/Packages.vue'),
        },
        {
          path: 'reports',
          children: [
            {
              path: 'daily',
              component: () => import('@/pages/admin/Reports/Daily.vue'),
            },
            {
              path: 'weekly',
              component: () => import('@/pages/admin/Reports/Weekly.vue'),
            },
            {
              path: 'monthly',
              component: () => import('@/pages/admin/Reports/Monthly.vue'),
            }
          ]
        }
      ]
    },

    // Teacher Routes
    {
      path: '/teacher',
      component: () => import('@/layouts/TeacherLayout.vue'),
      meta: { requiresAuth: true, requiresTeacher: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/teacher/Dashboard.vue'),
        },
        {
          path: 'calendar',
          children: [
            {
              path: 'slots',
              component: () => import('@/pages/teacher/Calendar/Slots.vue'),
            },
            {
              path: 'sync',
              component: () => import('@/pages/teacher/Calendar/Sync.vue'),
            }
          ]
        }
      ]
    },

    // Student Routes
    {
      path: '/student',
      component: () => import('@/layouts/StudentLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/student/Dashboard.vue'),
        },
        {
          path: 'bookings',
          children: [
            {
              path: 'by-teacher',
              component: () => import('@/pages/student/Bookings/ByTeacher.vue'),
            },
            {
              path: 'by-time',
              component: () => import('@/pages/student/Bookings/ByTime.vue'),
            },
            {
              path: 'history',
              component: () => import('@/pages/student/Bookings/History.vue'),
            },
            {
              path: ':id/success',
              component: () => import('@/pages/student/Bookings/Success.vue'),
            }
          ]
        },
        {
          path: 'credits',
          children: [
            {
              path: 'history',
              component: () => import('@/pages/student/Credits/History.vue'),
            },
            {
              path: 'buy',
              component: () => import('@/pages/student/Credits/Purchase.vue'),
            }
          ]
        }
      ]
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }

  if (to.meta.requiresTeacher && !authStore.isTeacher) {
    next('/')
    return
  }

  next()
})

export default router