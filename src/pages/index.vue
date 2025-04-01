<template>
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section relative bg-gradient-to-r from-[#3871b1] to-[#2c5c99] text-white py-20">
        <div class="container mx-auto px-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="max-w-xl">
              <h1 class="text-4xl md:text-5xl font-bold mb-6">Online Eğitimde Yeni Dönem</h1>
              <p class="text-lg mb-8 text-blue-100">
                TalkUp ile öğretmenlerle birebir, canlı dersler alarak öğrenmenin keyfine varın.
                İstediğiniz öğretmenden, istediğiniz saatte ders alın.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <router-link
                  to="/register"
                  class="btn-primary bg-[#ff8913] hover:bg-[#ff8913]/90"
                >
                  Hemen Kaydol
                </router-link>
                <router-link
                  to="/about"
                  class="btn-secondary bg-white/20 hover:bg-white/30"
                >
                  Daha Fazla Bilgi
                </router-link>
              </div>
            </div>
            <div class="hidden md:block">
              <img src="/images/hero-illustration.svg" alt="Online Eğitim" class="max-w-full" />
            </div>
          </div>
        </div>
        
        <!-- Wave effect -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#fff" fill-opacity="1" d="M0,288L60,272C120,256,240,224,360,224C480,224,600,256,720,240C840,224,960,160,1080,149.3C1200,139,1320,181,1380,202.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>
  
      <!-- Features Section -->
      <section class="py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Neden TalkUp?</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              TalkUp, öğrenciler ve öğretmenler arasında kesintisiz bağlantı kuran modern bir platformdur
            </p>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <!-- Feature 1 -->
            <div class="feature-card">
              <div class="feature-icon bg-blue-50 text-[#3871b1]">
                <calendar-icon class="h-7 w-7" />
              </div>
              <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3">Esnek Zamanlama</h3>
              <p class="text-gray-600">
                İstediğiniz öğretmenden, sizin için uygun olan saatlerde ders alabilirsiniz.
              </p>
            </div>
  
            <!-- Feature 2 -->
            <div class="feature-card">
              <div class="feature-icon bg-orange-50 text-[#ff8913]">
                <credit-card-icon class="h-7 w-7" />
              </div>
              <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3">Kredi Sistemi</h3>
              <p class="text-gray-600">
                Kredi paketleri satın alın ve dilediğiniz zaman kullanın. Ekstra ücret yok, taahhüt yok.
              </p>
            </div>
  
            <!-- Feature 3 -->
            <div class="feature-card">
              <div class="feature-icon bg-blue-50 text-[#3871b1]">
                <video-icon class="h-7 w-7" />
              </div>
              <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3">Online Dersler</h3>
              <p class="text-gray-600">
                Google Meet ile kesintisiz, yüksek kalitede görüntülü dersler. Ekstra yazılım gerekmez.
              </p>
            </div>
          </div>
        </div>
      </section>
  
      <!-- How It Works Section -->
      <section class="bg-gray-50 py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Nasıl Çalışır?</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Sadece 3 adımda online eğitim deneyimine başlayın
            </p>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <!-- Step 1 -->
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3">Kayıt Olun ve Kredi Alın</h3>
              <p class="text-gray-600">
                Ücretsiz hesap oluşturun ve bütçenize uygun kredi paketi seçin.
              </p>
            </div>
  
            <!-- Step 2 -->
            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3">Öğretmen ve Saat Seçin</h3>
              <p class="text-gray-600">
                Size uygun öğretmeni ve sizin için müsait olan saati seçin.
              </p>
            </div>
  
            <!-- Step 3 -->
            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3">Derse Katılın</h3>
              <p class="text-gray-600">
                Belirlenen saatte otomatik oluşturulan Google Meet bağlantısıyla derse katılın.
              </p>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Packages Section -->
      <section class="py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Kredi Paketleri</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              İhtiyacınıza göre paket seçin, istediğiniz öğretmenden ders alın
            </p>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(pkg, index) in packages" :key="index" 
                 class="package-card border group hover:border-[#3871b1] transition-all duration-300"
                 :class="{'border-[#3871b1] shadow-lg': pkg.recommended}">
              <div v-if="pkg.recommended" class="bg-[#3871b1] text-white text-center py-1 text-sm font-medium">
                Önerilen
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">{{ pkg.name }}</h3>
                <div class="mb-4">
                  <span class="text-3xl font-bold">{{ formatPrice(pkg.price) }}</span>
                </div>
                <div class="text-[#3871b1] text-lg font-medium mb-6">
                  {{ pkg.credits }} Kredi
                </div>
                <ul class="space-y-3 mb-6">
                  <li v-for="(feature, i) in pkg.features" :key="i" class="flex items-start">
                    <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{{ feature }}</span>
                  </li>
                </ul>
                <button 
                  class="w-full py-3 rounded-lg font-medium transition-colors duration-300"
                  :class="pkg.recommended ? 'bg-[#ff8913] hover:bg-[#ff8913]/90 text-white' : 'border-2 border-[#3871b1] text-[#3871b1] group-hover:bg-[#3871b1] group-hover:text-white'"
                  @click="goToRegister"
                >
                  Hemen Başla
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Teachers Section -->
      <section class="bg-gray-50 py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Eğitmenlerimiz</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Alanında uzman, deneyimli eğitmenlerimizle tanışın
            </p>
          </div>
  
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div v-for="(teacher, index) in teachers" :key="index" 
                 class="teacher-card bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
              <img :src="teacher.avatar" alt="Teacher" class="w-24 h-24 rounded-full object-cover mb-4">
              <h3 class="font-bold text-lg text-gray-800">{{ teacher.name }}</h3>
              <p class="text-[#3871b1] mb-3">{{ teacher.subject }}</p>
              <p class="text-gray-600 text-sm mb-4">{{ teacher.bio }}</p>
              <div class="flex items-center justify-center">
                <star-icon v-for="i in 5" :key="i" 
                           :class="i <= teacher.rating ? 'text-[#ff8913]' : 'text-gray-300'"
                           class="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div class="text-center mt-10">
            <button 
              class="btn-primary bg-[#3871b1] hover:bg-[#3871b1]/90"
              @click="goToRegister"
            >
              Tüm Eğitmenler
            </button>
          </div>
        </div>
      </section>
  
      <!-- Testimonials Section -->
      <section class="py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Öğrencilerimiz Ne Diyor?</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Binlerce öğrencimizin deneyimleri
            </p>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(testimonial, index) in testimonials" :key="index" 
                 class="testimonial-card">
              <div class="mb-4">
                <div class="flex items-center">
                  <star-icon v-for="i in 5" :key="i" 
                             :class="i <= testimonial.rating ? 'text-[#ff8913]' : 'text-gray-300'"
                             class="h-5 w-5" />
                </div>
              </div>
              <p class="italic text-gray-600 mb-6">{{ testimonial.comment }}</p>
              <div class="flex items-center">
                <img :src="testimonial.avatar" alt="Student" class="w-12 h-12 rounded-full object-cover mr-4">
                <div>
                  <h4 class="font-medium text-gray-800">{{ testimonial.name }}</h4>
                  <p class="text-sm text-gray-500">{{ testimonial.subject }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- CTA Section -->
      <section class="bg-gradient-to-r from-[#3871b1] to-[#2c5c99] text-white py-20">
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Eğitim Yolculuğuna Bugün Başlayın</h2>
          <p class="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Online eğitimde yeni bir deneyim için TalkUp'a kaydolun ve ilk kredi paketinizi alın.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/register"
              class="btn-primary bg-[#ff8913] hover:bg-[#ff8913]/90"
            >
              Hemen Kaydol
            </router-link>
            <router-link
              to="/login"
              class="btn-secondary bg-white/20 hover:bg-white/30"
            >
              Giriş Yap
            </router-link>
          </div>
        </div>
      </section>
  
      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 class="text-xl font-bold mb-4">TalkUp</h3>
              <p class="text-gray-400">
                Online eğitimde yeni nesil platform.
              </p>
            </div>
            <div>
              <h4 class="font-bold mb-4">Sayfalar</h4>
              <ul class="space-y-2">
                <li><router-link to="/" class="text-gray-400 hover:text-white">Ana Sayfa</router-link></li>
                <li><router-link to="/about" class="text-gray-400 hover:text-white">Hakkımızda</router-link></li>
                <li><router-link to="/teachers" class="text-gray-400 hover:text-white">Eğitmenler</router-link></li>
                <li><router-link to="/packages" class="text-gray-400 hover:text-white">Paketler</router-link></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold mb-4">Destek</h4>
              <ul class="space-y-2">
                <li><router-link to="/faq" class="text-gray-400 hover:text-white">Sıkça Sorulan Sorular</router-link></li>
                <li><router-link to="/contact" class="text-gray-400 hover:text-white">İletişim</router-link></li>
                <li><router-link to="/privacy" class="text-gray-400 hover:text-white">Gizlilik Politikası</router-link></li>
                <li><router-link to="/terms" class="text-gray-400 hover:text-white">Kullanım Koşulları</router-link></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold mb-4">Bize Ulaşın</h4>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <mail-icon class="h-5 w-5 mr-2 text-gray-400" />
                  <a href="mailto:info@talkup.com" class="text-gray-400 hover:text-white">info@talkup.com</a>
                </li>
                <li class="flex items-center">
                  <phone-icon class="h-5 w-5 mr-2 text-gray-400" />
                  <a href="tel:+902121234567" class="text-gray-400 hover:text-white">+90 212 123 45 67</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-400">© 2025 TalkUp. Tüm hakları saklıdır.</p>
            <div class="flex space-x-4 mt-4 md:mt-0">
              <a href="#" class="text-gray-400 hover:text-white">
                <facebook-icon class="h-5 w-5" />
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <twitter-icon class="h-5 w-5" />
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <instagram-icon class="h-5 w-5" />
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <linkedin-icon class="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { 
    Calendar as CalendarIcon,
    CreditCard as CreditCardIcon,
    Video as VideoIcon,
    Check as CheckIcon,
    Star as StarIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    Linkedin as LinkedinIcon
  } from 'lucide-vue-next';
  import { formatPrice } from '@/utils/dateTime';
  
  const router = useRouter();
  
  // Demo paketler - Gerçek uygulamada API'den alınacak
  const packages = [
    {
      name: 'Başlangıç',
      price: 199,
      credits: 5,
      recommended: false,
      features: [
        '5 saatlik ders kredisi',
        'Tüm öğretmenlerle çalışabilme',
        '30 gün geçerlilik süresi',
        'Online dersler'
      ]
    },
    {
      name: 'Standart',
      price: 349,
      credits: 10,
      recommended: true,
      features: [
        '10 saatlik ders kredisi',
        'Tüm öğretmenlerle çalışabilme',
        '45 gün geçerlilik süresi',
        'Online dersler',
        'Ders kayıtlarına erişim'
      ]
    },
    {
      name: 'Premium',
      price: 649,
      credits: 20,
      recommended: false,
      features: [
        '20 saatlik ders kredisi',
        'Tüm öğretmenlerle çalışabilme',
        '60 gün geçerlilik süresi',
        'Online dersler',
        'Ders kayıtlarına erişim',
        'Özel ders materyalleri'
      ]
    }
  ];
  
  // Demo öğretmenler - Gerçek uygulamada API'den alınacak
  const teachers = [
    {
      name: 'Mehmet Yılmaz',
      subject: 'İngilizce',
      bio: 'İngilizce öğretiminde 10 yıllık deneyim',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Ayşe Kaya',
      subject: 'Matematik',
      bio: 'Matematik konusunda uzman',
      rating: 4,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Ali Demir',
      subject: 'Fizik',
      bio: 'Fizik dersleri konusunda uzman',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/68.jpg'
    },
    {
      name: 'Zeynep Acar',
      subject: 'Kimya',
      bio: 'Kimya konusunda 8 yıllık deneyim',
      rating: 4,
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    }
  ];
  
  // Demo yorumlar - Gerçek uygulamada API'den alınacak
  const testimonials = [
    {
      name: 'Deniz Yıldız',
      subject: 'İngilizce Dersleri',
      rating: 5,
      comment: 'TalkUp sayesinde yoğun iş tempomda bile İngilizce derslerime devam edebildim. Esneklik harika!',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      name: 'Burak Şahin',
      subject: 'Matematik Dersleri',
      rating: 5,
      comment: 'Matematik derslerinde zorlanıyordum, TalkUp\'taki öğretmenler sayesinde notlarım yükseldi ve konuları daha iyi anladım.',
      avatar: 'https://randomuser.me/api/portraits/men/54.jpg'
    },
    {
      name: 'Elif Çelik',
      subject: 'Kimya Dersleri',
      rating: 4,
      comment: 'Evden çıkmadan, istediğim zaman ders alabilmek harika. Öğretmenler gerçekten alanlarında uzmanlar.',
      avatar: 'https://randomuser.me/api/portraits/women/85.jpg'
    }
  ];
  
  // Kayıt sayfasına yönlendir
  const goToRegister = () => {
    router.push('/register');
  };
  </script>
  
  <style scoped>
  .btn-primary,
  .btn-secondary {
    @apply px-6 py-3 rounded-lg font-medium transition-colors duration-300 inline-block text-center;
  }
  
  .feature-card,
  .step-card,
  .package-card,
  .teacher-card,
  .testimonial-card {
    @apply p-6 bg-white rounded-lg shadow-sm;
  }
  
  .feature-icon {
    @apply w-14 h-14 rounded-full flex items-center justify-center;
  }
  
  .step-number {
    @apply w-10 h-10 rounded-full bg-[#3871b1] text-white flex items-center justify-center font-bold;
  }
  </style>