// src/pages/Landing.vue
<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section relative bg-gradient-to-r from-[#3871b1] to-[#2c5c99] text-white py-24 overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden opacity-20">
        <div v-for="i in 8" :key="i" 
             class="absolute rounded-full bg-white/30"
             :style="{
               width: `${50 + Math.random() * 100}px`,
               height: `${50 + Math.random() * 100}px`,
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
               animationDelay: `${i * 0.5}s`,
               animationDuration: `${4 + Math.random() * 4}s`
             }"
             :class="'animate-float'"
        ></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="max-w-xl space-y-8">
            <h1 class="text-4xl md:text-5xl font-bold leading-tight">
              Online Eğitimde<br /> 
              <span class="text-[#ff8913]">Yeni Dönem</span>
            </h1>
            <p class="text-lg text-blue-100 leading-relaxed">
              TalkUp ile öğretmenlerle birebir, canlı dersler alarak öğrenmenin keyfine varın.
              İstediğiniz öğretmenden, istediğiniz saatte ders alın.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <router-link
                to="/register"
                class="btn-primary bg-[#ff8913] hover:bg-[#ff8913]/90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff8913]/20"
              >
                Hemen Kaydol
              </router-link>
              <router-link
                to="/about"
                class="btn-secondary bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
              >
                Daha Fazla Bilgi
              </router-link>
            </div>
          </div>
          <div class="hidden md:block relative">
            <div class="absolute inset-0 bg-gradient-to-r from-[#3871b1]/20 to-transparent rounded-2xl"></div>
            <img src="/images/hero-illustration.svg" alt="Online Eğitim" class="max-w-full relative z-10 transform hover:scale-105 transition-all duration-700" />
          </div>
        </div>
      </div>
      
      <!-- Wave effect -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="w-full">
          <path fill="#fff" fill-opacity="1" d="M0,288L60,272C120,256,240,224,360,224C480,224,600,256,720,240C840,224,960,160,1080,149.3C1200,139,1320,181,1380,202.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  
    <!-- Features Section -->
    <section class="py-24">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
            Neden <span class="text-[#3871b1]">TalkUp</span>?
            <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#3871b1] to-[#ff8913] rounded-full"></div>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            TalkUp, öğrenciler ve öğretmenler arasında kesintisiz bağlantı kuran modern bir platformdur
          </p>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <!-- Feature 1 -->
          <div class="feature-card group">
            <div class="feature-icon bg-blue-50 text-[#3871b1] group-hover:bg-[#3871b1] group-hover:text-white transition-all duration-300">
              <calendar-icon class="h-7 w-7" />
            </div>
            <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3 group-hover:text-[#3871b1] transition-colors duration-300">Esnek Zamanlama</h3>
            <p class="text-gray-600">
              İstediğiniz öğretmenden, sizin için uygun olan saatlerde ders alabilirsiniz.
            </p>
          </div>
  
          <!-- Feature 2 -->
          <div class="feature-card group">
            <div class="feature-icon bg-orange-50 text-[#ff8913] group-hover:bg-[#ff8913] group-hover:text-white transition-all duration-300">
              <credit-card-icon class="h-7 w-7" />
            </div>
            <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3 group-hover:text-[#ff8913] transition-colors duration-300">Kredi Sistemi</h3>
            <p class="text-gray-600">
              Kredi paketleri satın alın ve dilediğiniz zaman kullanın. Ekstra ücret yok, taahhüt yok.
            </p>
          </div>
  
          <!-- Feature 3 -->
          <div class="feature-card group">
            <div class="feature-icon bg-blue-50 text-[#3871b1] group-hover:bg-[#3871b1] group-hover:text-white transition-all duration-300">
              <video-icon class="h-7 w-7" />
            </div>
            <h3 class="font-bold text-xl text-gray-800 mt-5 mb-3 group-hover:text-[#3871b1] transition-colors duration-300">Online Dersler</h3>
            <p class="text-gray-600">
              Google Meet ile kesintisiz, yüksek kalitede görüntülü dersler. Ekstra yazılım gerekmez.
            </p>
          </div>
        </div>
      </div>
    </section>
  
    <!-- How It Works Section -->
    <section class="bg-gray-50 py-24 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 opacity-5">
        <div v-for="i in 10" :key="i" 
             class="absolute bg-[#3871b1]"
             :style="{
               width: `${10 + Math.random() * 20}px`,
               height: `${10 + Math.random() * 20}px`,
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
               borderRadius: `${Math.random() > 0.5 ? '50%' : '4px'}`,
               opacity: Math.random() * 0.5 + 0.5
             }">
        </div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
            Nasıl <span class="text-[#3871b1]">Çalışır</span>?
            <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#3871b1] to-[#ff8913] rounded-full"></div>
          </h2>
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
    <section class="py-24">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
            Kredi <span class="text-[#3871b1]">Paketleri</span>
            <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#3871b1] to-[#ff8913] rounded-full"></div>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            İhtiyacınıza göre paket seçin, istediğiniz öğretmenden ders alın
          </p>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Başlangıç Paketi -->
          <div class="package-card border group hover:border-[#3871b1] transition-all duration-300 hover:shadow-xl">
            <div class="p-6 space-y-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Başlangıç</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold text-[#3871b1]">199 ₺</span>
              </div>
              <div class="text-[#3871b1] text-lg font-medium mb-6">
                5 Kredi
              </div>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>5 saatlik ders kredisi</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tüm öğretmenlerle çalışabilme</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>30 gün geçerlilik süresi</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Online dersler</span>
                </li>
              </ul>
              <router-link 
                to="/register"
                class="w-full py-3 rounded-lg font-medium transition-all duration-300 block text-center
                     border-2 border-[#3871b1] text-[#3871b1] group-hover:bg-[#3871b1] group-hover:text-white"
              >
                Hemen Başla
              </router-link>
            </div>
          </div>

          <!-- Standart Paket (Önerilen) -->
          <div class="package-card border border-[#3871b1] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div class="bg-[#3871b1] text-white text-center py-1 text-sm font-medium">
              Önerilen
            </div>
            <div class="p-6 space-y-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Standart</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold text-[#3871b1]">349 ₺</span>
              </div>
              <div class="text-[#3871b1] text-lg font-medium mb-6">
                10 Kredi
              </div>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>10 saatlik ders kredisi</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tüm öğretmenlerle çalışabilme</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>45 gün geçerlilik süresi</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Ders kayıtlarına erişim</span>
                </li>
              </ul>
              <router-link 
                to="/register"
                class="w-full py-3 rounded-lg font-medium transition-all duration-300 block text-center
                     bg-[#ff8913] hover:bg-[#ff8913]/90 text-white transform hover:translate-y-[-2px]"
              >
                Hemen Başla
              </router-link>
            </div>
          </div>

          <!-- Premium Paket -->
          <div class="package-card border group hover:border-[#3871b1] transition-all duration-300 hover:shadow-xl">
            <div class="p-6 space-y-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Premium</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold text-[#3871b1]">649 ₺</span>
              </div>
              <div class="text-[#3871b1] text-lg font-medium mb-6">
                20 Kredi
              </div>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>20 saatlik ders kredisi</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tüm öğretmenlerle çalışabilme</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>60 gün geçerlilik süresi</span>
                </li>
                <li class="flex items-start">
                  <check-icon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Özel ders materyalleri</span>
                </li>
              </ul>
              <router-link 
                to="/register"
                class="w-full py-3 rounded-lg font-medium transition-all duration-300 block text-center
                     border-2 border-[#3871b1] text-[#3871b1] group-hover:bg-[#3871b1] group-hover:text-white"
              >
                Hemen Başla
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <!-- Teachers Section -->
    <section class="bg-gray-50 py-24">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
            Eğitmen<span class="text-[#3871b1]">lerimiz</span>
            <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#3871b1] to-[#ff8913] rounded-full"></div>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Alanında uzman, deneyimli eğitmenlerimizle tanışın
          </p>
        </div>
  
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="(teacher, index) in teachersList" :key="index" 
               class="teacher-card bg-white rounded-xl shadow-sm overflow-hidden
                     transform transition-all duration-300 hover:shadow-lg hover:translate-y-[-8px]">
            <div class="relative overflow-hidden h-48">
              <img :src="teacher.avatar" alt="Teacher" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div class="absolute bottom-0 p-4 text-white">
                <h3 class="font-bold text-lg">{{ teacher.name }}</h3>
                <p class="text-blue-100">{{ teacher.subject }}</p>
              </div>
            </div>
            <div class="p-4 text-center">
              <div class="flex items-center justify-center mb-3">
                <star-icon v-for="i in 5" :key="i" 
                         :class="i <= teacher.rating ? 'text-[#ff8913]' : 'text-gray-300'"
                         class="h-5 w-5" />
              </div>
              <p class="text-gray-600 text-sm">{{ teacher.bio }}</p>
              <button class="mt-4 w-full py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90 transition-all duration-300">
                Profili İncele
              </button>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-10">
          <router-link 
            to="/register"
            class="btn-primary bg-[#3871b1] hover:bg-[#3871b1]/90 transition-all duration-300"
          >
            Tüm Eğitmenler
          </router-link>
        </div>
      </div>
    </section>
  
    <!-- Testimonials Section -->
    <section class="py-24 relative overflow-hidden">
      <!-- Background Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-white to-blue-50/50"></div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
            Öğrencilerimiz <span class="text-[#3871b1]">Ne Diyor</span>?
            <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#3871b1] to-[#ff8913] rounded-full"></div>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Binlerce öğrencimizin deneyimleri
          </p>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(testimonial, index) in testimonialsList" :key="index" 
               class="testimonial-card relative bg-white p-6 rounded-xl shadow-sm border border-gray-100
                     transform transition-all duration-300 hover:shadow-xl hover:border-[#3871b1]/20">
            <!-- Quote Mark -->
            <div class="absolute top-4 right-4 text-6xl leading-none text-[#3871b1]/10 font-serif">"</div>
            
            <div class="mb-4">
              <div class="flex items-center">
                <star-icon v-for="i in 5" :key="i" 
                         :class="i <= testimonial.rating ? 'text-[#ff8913]' : 'text-gray-300'"
                         class="h-5 w-5" />
              </div>
            </div>
            <p class="italic text-gray-600 mb-6 relative z-10">{{ testimonial.comment }}</p>
            <div class="flex items-center pt-4 border-t border-gray-100">
              <img :src="testimonial.avatar" alt="Student" class="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow">
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
    <section class="relative py-24 overflow-hidden bg-[#3871b1]">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'3\'%3E%3C/circle%3E%3C/g%3E%3C/svg%3E')"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-3xl mx-auto text-center text-white">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Eğitim Yolculuğuna Bugün Başlayın</h2>
          <p class="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Online eğitimde yeni bir deneyim için TalkUp'a kaydolun ve ilk kredi paketinizi alın.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/register"
              class="btn-primary bg-[#ff8913] hover:bg-[#ff8913]/90 shadow-lg shadow-[#ff8913]/20 transform hover:scale-105 transition-all duration-300"
            >
              Hemen Kaydol
            </router-link>
            <router-link
              to="/login"
              class="btn-secondary bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              Giriş Yap
            </router-link>
          </div>
        </div>
      </div>
    </section>
  
    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4 relative inline-flex flex-col">
              <span>TalkUp</span>
              <span class="w-12 h-1 bg-[#ff8913] mt-1 rounded-full"></span>
            </h3>
            <p class="text-gray-400">
              Online eğitimde yeni nesil platform.
            </p>
          </div>
          <div>
            <h4 class="font-bold mb-4 text-[#ff8913]">Sayfalar</h4>
            <ul class="space-y-2">
              <li><router-link to="/" class="text-gray-400 hover:text-white transition-colors">Ana Sayfa</router-link></li>
              <li><router-link to="/about" class="text-gray-400 hover:text-white transition-colors">Hakkımızda</router-link></li>
              <li><router-link to="/teachers" class="text-gray-400 hover:text-white transition-colors">Eğitmenler</router-link></li>
              <li><router-link to="/packages" class="text-gray-400 hover:text-white transition-colors">Paketler</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4 text-[#ff8913]">Destek</h4>
            <ul class="space-y-2">
              <li><router-link to="/faq" class="text-gray-400 hover:text-white transition-colors">Sıkça Sorulan Sorular</router-link></li>
              <li><router-link to="/contact" class="text-gray-400 hover:text-white transition-colors">İletişim</router-link></li>
              <li><router-link to="/privacy" class="text-gray-400 hover:text-white transition-colors">Gizlilik Politikası</router-link></li>
              <li><router-link to="/terms" class="text-gray-400 hover:text-white transition-colors">Kullanım Koşulları</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4 text-[#ff8913]">Bize Ulaşın</h4>
            <ul class="space-y-2">
              <li class="flex items-center">
                <mail-icon class="h-5 w-5 mr-2 text-gray-400" />
                <a href="mailto:info@talkup.com" class="text-gray-400 hover:text-white transition-colors">info@talkup.com</a>
              </li>
              <li class="flex items-center">
                <phone-icon class="h-5 w-5 mr-2 text-gray-400" />
                <a href="tel:+902121234567" class="text-gray-400 hover:text-white transition-colors">+90 212 123 45 67</a>
              </li>
            </ul>
<!-- Sosyal Medya İkonları -->
<div class="flex space-x-4 mt-4">
  <a href="#" class="h-9 w-9 rounded-full flex items-center justify-center bg-gray-800 hover:bg-[#3871b1] text-gray-400 hover:text-white transition-all duration-300">
    <facebook-icon class="h-5 w-5" />
  </a>
  <a href="#" class="h-9 w-9 rounded-full flex items-center justify-center bg-gray-800 hover:bg-[#3871b1] text-gray-400 hover:text-white transition-all duration-300">
    <twitter-icon class="h-5 w-5" />
  </a>
  <a href="#" class="h-9 w-9 rounded-full flex items-center justify-center bg-gray-800 hover:bg-[#3871b1] text-gray-400 hover:text-white transition-all duration-300">
    <instagram-icon class="h-5 w-5" />
  </a>
  <a href="#" class="h-9 w-9 rounded-full flex items-center justify-center bg-gray-800 hover:bg-[#3871b1] text-gray-400 hover:text-white transition-all duration-300">
    <linkedin-icon class="h-5 w-5" />
  </a>
</div>
</div>
        </div>

        <!-- Telif Hakkı -->
        <div class="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400">&copy; 2025 TalkUp. Tüm hakları saklıdır.</p>
          <div class="flex items-center gap-4 mt-4 md:mt-0">
            <router-link to="/privacy" class="text-sm text-gray-400 hover:text-white transition-colors">Gizlilik</router-link>
            <span class="text-gray-600">|</span>
            <router-link to="/terms" class="text-sm text-gray-400 hover:text-white transition-colors">Kullanım Şartları</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
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

const router = useRouter();

// Demo öğretmenler
const teachersList = [
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

// Demo yorumlar
const testimonialsList = [
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
  @apply p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300;
}

.feature-icon {
  @apply w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300;
}

.step-number {
  @apply w-10 h-10 rounded-full bg-[#3871b1] text-white flex items-center justify-center font-bold;
}

/* Animasyon */
@keyframes float {
  0% {
    transform: translateY(0px);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.4;
  }
  100% {
    transform: translateY(0px);
    opacity: 0.2;
  }
}

.animate-float {
  animation: float infinite ease-in-out;
}
</style>