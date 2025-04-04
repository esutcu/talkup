import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/Landing.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      component: () => import('@/pages/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      component: () => import('@/pages/auth/Register.vue'),
      meta: { requiresAuth: false }
    },
    // Öğrenci routes
    {
      path: '/student',
      component: MainLayout,
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: '',
          component: () => import('@/pages/student/Dashboard.vue')
        },
        {
          path: 'bookings',
          component: () => import('@/pages/student/Bookings.vue')
        }
      ]
    },
    // Öğretmen routes
    {
      path: '/teacher',
      component: MainLayout,
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
    // Admin routes
    {
      path: '/admin',
      component: MainLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          component: () => import('@/pages/admin/Dashboard.vue')
        },
        {
          path: 'packages',
          component: () => import('@/pages/admin/Packages.vue')
        },
        {
          path: 'teachers',
          component: () => import('@/pages/admin/Teachers.vue')
        }
      ]
    }
  ]
})

// Auth Guard
router.beforeEach((to, _, next) => {
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