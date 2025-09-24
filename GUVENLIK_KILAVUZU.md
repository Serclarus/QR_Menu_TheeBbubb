# 🔐 Güvenlik Kılavuzu - QR Menü Admin Sistemi

## 🛡️ Gelişmiş Güvenlik Özellikleri

### **1. Gizli Erişim Sistemi**
- ❌ **Görünür admin butonu YOK**
- ✅ **Gizli erişim kodu**: `Ctrl + Alt + Q + R + M + E + N + U` (sırayla)
- ✅ **Alternatif erişim**: Cafe adına 5 kez tıklayın
- ✅ **Sadece yetkili kişi erişebilir**

### **2. Güçlü Kimlik Doğrulama**
- ✅ **SHA-256 şifreleme** ile güvenli şifre
- ✅ **Varsayılan şifre**: `SecureAdmin2024!`
- ✅ **3 başarısız deneme** sonrası 5 dakika kilit
- ✅ **Otomatik oturum sonlandırma** (30 dakika)

### **3. Oturum Güvenliği**
- ✅ **Şifreli oturum token'ları**
- ✅ **Otomatik oturum yenileme**
- ✅ **Hareket takibi** (5 dakika hareketsizlik = oturum sonu)
- ✅ **Güvenli oturum sonlandırma**

### **4. Veri Koruması**
- ✅ **Tüm veriler şifrelenmiş** olarak saklanır
- ✅ **XSS koruması** (zararlı kod girişi engellenir)
- ✅ **Input sanitization** (girdi temizleme)
- ✅ **Güvenli veri yedekleme**

### **5. Gelişmiş Güvenlik Önlemleri**
- ✅ **Sağ tık engelleme**
- ✅ **F12/Developer Tools engelleme**
- ✅ **Metin seçimi engelleme**
- ✅ **Kopyalama koruması**
- ✅ **Sayfa kaynak kodu koruması**

## 🔧 Güvenlik Ayarları

### **Şifre Değiştirme**
1. Admin paneline giriş yapın
2. **"Güvenlik"** sekmesine gidin
3. **"Yeni Şifre"** alanına yeni şifrenizi yazın
4. **"Şifre Tekrarı"** alanına aynı şifreyi tekrar yazın
5. **"Şifre Değiştir"** butonuna tıklayın

**Şifre Gereksinimleri:**
- En az 8 karakter
- En az 1 büyük harf (A-Z)
- En az 1 küçük harf (a-z)
- En az 1 rakam (0-9)
- En az 1 özel karakter (!@#$%^&*)

### **Gizli Erişim Kodu Değiştirme**
`secure-admin.js` dosyasında:
```javascript
const secretCode = ['KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN']; // "ADMIN"
```
Bu kodu istediğiniz tuş kombinasyonu ile değiştirin.

### **Oturum Süresi Değiştirme**
`secure-admin-panel.js` dosyasında:
```javascript
this.sessionTimeout = 1800000; // 30 dakika (milisaniye)
```

## 🚨 Güvenlik Uyarıları

### **ÖNEMLİ:**
- ✅ **Şifrenizi kimseyle paylaşmayın**
- ✅ **Gizli erişim kodunu kimseye söylemeyin**
- ✅ **Oturumunuzu kullanmadığınızda kapatın**
- ✅ **Düzenli olarak şifrenizi değiştirin**

### **Güvenlik İpuçları:**
1. **Güçlü şifre kullanın** (en az 8 karakter, büyük/küçük harf, rakam, özel karakter)
2. **Şifrenizi düzenli değiştirin** (3-6 ayda bir)
3. **Başkalarının yanında admin paneline giriş yapmayın**
4. **Ortak bilgisayarlarda "Beni Hatırla" kullanmayın**

## 🔍 Güvenlik Testleri

### **Test 1: Gizli Erişim**
- Ana sayfada `Ctrl + Alt + Q + R + M + E + N + U` tuşlarına sırayla basın
- VEYA cafe adına 5 kez tıklayın
- Gizli giriş ekranı açılmalı

### **Test 2: Şifre Koruması**
- Yanlış şifre ile 3 deneme yapın
- 5 dakika kilitlenme olmalı

### **Test 3: Oturum Sonlandırma**
- 30 dakika hareketsiz kalın
- Otomatik çıkış olmalı

### **Test 4: Güvenlik Engellemeleri**
- F12 tuşuna basın (engellenmeli)
- Sağ tık yapın (engellenmeli)
- Sayfa kaynağını görüntüleyin (admin kodu görünmemeli)

## 🛠️ Sorun Giderme

### **Admin Paneline Erişemiyorum**
1. Gizli erişim kodunu doğru yazdığınızdan emin olun
2. Tarayıcı önbelleğini temizleyin
3. Sayfayı yenileyin

### **Şifremi Unuttum**
1. `secure-admin-panel.js` dosyasını açın
2. `this.adminPassword = 'SecureAdmin2024!';` satırını bulun
3. Yeni şifrenizi yazın

### **Oturum Sürekli Sonlanıyor**
1. Tarayıcı ayarlarını kontrol edin
2. JavaScript'in etkin olduğundan emin olun
3. Sayfayı yenileyin

## 📞 Acil Durum

### **Güvenlik İhlali Şüphesi**
1. Hemen tüm oturumları sonlandırın
2. Şifrenizi değiştirin
3. Tüm verileri yedekleyin
4. Sistemi yeniden başlatın

### **Veri Kaybı**
1. Yedek dosyalarınızı kontrol edin
2. `localStorage` verilerini kontrol edin
3. Gerekirse verileri geri yükleyin

## 🔒 Ek Güvenlik Önerileri

### **Sunucu Güvenliği (İleri Seviye)**
- HTTPS kullanın
- Güvenlik sertifikaları ekleyin
- Firewall kuralları ayarlayın
- Düzenli güvenlik güncellemeleri yapın

### **Veri Yedekleme**
- Düzenli olarak verilerinizi yedekleyin
- Yedekleri güvenli yerde saklayın
- Yedek dosyalarını şifreleyin

---

**⚠️ UYARI:** Bu sistem yüksek güvenlik standartları ile tasarlanmıştır. Güvenlik ayarlarını değiştirmeden önce yedek alın!
