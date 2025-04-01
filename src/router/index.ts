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
    // Login ve register sayfaları
    {
      path: '/login',
      component: () => import('@/pages/index.vue'), // Geçici olarak ana sayfaya yönlendirme
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      component: () => import('@/pages/index.vue'), // Geçici olarak ana sayfaya yönlendirme
      meta: { requiresAuth: false }
    },
    {
      path: '/terms',
      component: () => import('@/pages/index.vue'), // Geçici olarak ana sayfaya yönlendirme
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
          path: 'reports/daily',
          component: () => import('@/pages/admin/Reports/Daily.vue'),
        },
        {
          path: 'reports/weekly',
          component: () => import('@/pages/admin/Reports/Weekly.vue'),
        },
        {
          path: 'reports/monthly',
          component: () => import('@/pages/admin/Reports/Monthly.vue'),
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
          path: 'calendar/slots',
          component: () => import('@/pages/teacher/Calendar/Slots.vue'),
        },
        {
          path: 'calendar/sync',
          component: () => import('@/pages/teacher/Calendar/Sync.vue'),
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
          path: 'bookings/by-teacher',
          component: () => import('@/pages/student/Bookings/ByTeacher.vue'),
        },
        {
          path: 'bookings/by-time',
          component: () => import('@/pages/student/Bookings/ByTime.vue'),
        },
        {
          path: 'bookings/history',
          component: () => import('@/pages/student/Bookings/History.vue'),
        },
        {
          path: 'credits/history',
          component: () => import('@/pages/student/Credits/History.vue'),
        },
        {
          path: 'credits/buy',
          component: () => import('@/pages/student/Credits/Purchase.vue'),
        }
      ]
    },
    // 404 route
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // useAuthStore'u doğru bir şekilde kullanabilmek için burada çağırıyoruz
  // böylece Vue context'in dışında çağırma hatası almıyoruz
  const authStore = useAuthStore();

  // Auth kontrolleri
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/');
    return;
  }

  if (to.meta.requiresTeacher && !authStore.isTeacher) {
    next('/');
    return;
  }

  next();
});

export default router