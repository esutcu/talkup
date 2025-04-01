import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { checkEnvironment } from './utils/environment'

// Uygulama başlatılmadan önce ortam değişkenlerini kontrol et
const isEnvironmentValid = checkEnvironment()

if (!isEnvironmentValid && import.meta.env.PROD) {
  // Gerekli ortam değişkenleri eksik olduğunda üretim modunda hata göster
  const errorDiv = document.createElement('div')
  errorDiv.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: red;">Eksik Yapılandırma</h2>
      <p>Uygulama yapılandırması eksik. Lütfen sistem yöneticinize başvurun.</p>
    </div>
  `
  document.body.appendChild(errorDiv)
} else {
  // Uygulamayı başlat
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  
  app.mount('#app')
}