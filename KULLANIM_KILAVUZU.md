# QR Menü Kullanım Kılavuzu

## Menüyü Nasıl Düzenlersiniz?

### 1. Admin Paneline Erişim
- Menünüzün sağ alt köşesindeki **"⚙️ Admin"** butonuna tıklayın
- Şifre: `admin123` (Bu şifreyi değiştirebilirsiniz)
- Admin paneli açıldığında menünüzü düzenleyebilirsiniz

### 2. Cafe Bilgilerini Düzenleme
- **"Cafe Bilgileri"** sekmesine tıklayın
- **Cafe Adı**: Cafe adınızı yazın
- **Cafe Resmi URL**: Cafe resminizin internet adresini yazın
- **"Kaydet"** butonuna tıklayın

### 3. Kategorileri Düzenleme
- **"Kategoriler"** sekmesine tıklayın
- Düzenlemek istediğiniz kategoriye tıklayın (mavi renk olacak)
- **Kategori Başlığı**: Kategori adını yazın
- **Kategori Açıklaması**: Kategori açıklamasını yazın
- **"Kategoriyi Güncelle"** butonuna tıklayın

### 4. Menü Öğelerini Düzenleme
- **"Menü Öğeleri"** sekmesine tıklayın
- **Kategori Seçin**: Hangi kategoriye öğe ekleyeceğinizi seçin
- **Öğe Adı**: Yemek/içecek adını yazın
- **Fiyat**: Fiyatı yazın (örn: ₺35)
- **Açıklama**: Ürün açıklamasını yazın
- **"Öğe Ekle"** butonuna tıklayın

### 5. Mevcut Öğeleri Düzenleme/Silme
- Kategori seçtikten sonra alt kısımda mevcut öğeler görünür
- **"Düzenle"** butonu ile öğeyi düzenleyebilirsiniz
- **"Sil"** butonu ile öğeyi silebilirsiniz

### 6. Önizleme
- **"Önizleme"** sekmesine tıklayın
- **"Menüyü Görüntüle"** ile menünüzün nasıl göründüğünü kontrol edin
- **"Verileri Yedekle"** ile menü verilerinizi bilgisayarınıza kaydedin
- **"Verileri Geri Yükle"** ile daha önce kaydettiğiniz verileri geri yükleyin

## Önemli Notlar

### Resim URL'si Nasıl Alınır?
1. İnternette istediğiniz resmi bulun
2. Resme sağ tıklayın
3. "Resim adresini kopyala" seçeneğini seçin
4. Bu adresi "Cafe Resmi URL" alanına yapıştırın

### Yedekleme
- Düzenli olarak **"Verileri Yedekle"** butonuna tıklayarak menü verilerinizi kaydedin
- Bu sayede verilerinizi kaybetmezsiniz

### Şifre Değiştirme
- `admin.js` dosyasını açın
- `const ADMIN_PASSWORD = 'admin123';` satırını bulun
- `'admin123'` kısmını istediğiniz şifre ile değiştirin

## Sorun Giderme

### Menü Güncellenmiyor
- Tarayıcınızın önbelleğini temizleyin (Ctrl+F5)
- Sayfayı yenileyin

### Resim Görünmüyor
- Resim URL'sinin doğru olduğundan emin olun
- Resmin internet üzerinde erişilebilir olduğundan emin olun

### Veriler Kayboldu
- Yedek dosyanızı kullanarak **"Verileri Geri Yükle"** butonuna tıklayın

## İletişim
Herhangi bir sorun yaşarsanız, teknik destek için iletişime geçin.
