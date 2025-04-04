import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { User } from '@/types'

export function useAdmin() {
  const { supabase } = useSupabase()
  
  // State
  const teachers = ref<User[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('')

  // Computed
  const filteredTeachers = computed(() => {
    return teachers.value.filter(teacher => {
      const matchesSearch = !searchQuery.value || 
        teacher.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      const matchesStatus = !statusFilter.value || teacher.status === statusFilter.value
      
      return matchesSearch && matchesStatus
    })
  })

  // Methods
  const fetchTeachers = async () => {
    isLoading.value = true
    const { data } = await supabase
      .from('users')
      .select(`
        *,
        total_lessons:bookings(count)
      `)
      .eq('role', 'teacher')
      .order('name')

    if (data) {
      teachers.value = data
    }
    isLoading.value = false
  }

  const updateTeacherStatus = async (teacherId: string, status: 'active' | 'inactive') => {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', teacherId)

    if (!error) {
      await fetchTeachers()
    }
  }

  const createTeacher = async (teacherData: Partial<User>) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: teacherData.email!,
      password: teacherData.password as string
    })

    if (authError) throw authError

    if (authData.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: teacherData.name,
        email: teacherData.email,
        role: 'teacher',
        status: teacherData.status
      })

      if (dbError) throw dbError
      await fetchTeachers()
    }
  }

  const updateTeacher = async (teacherId: string, teacherData: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update(teacherData)
      .eq('id', teacherId)

    if (!error) {
      await fetchTeachers()
    }
  }

  return {
    teachers,
    isLoading,
    searchQuery,
    statusFilter,
    filteredTeachers,
    fetchTeachers,
    updateTeacherStatus,
    createTeacher,
    updateTeacher
  }
}