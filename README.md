# Smart Healthcare System

A comprehensive healthcare management system built with Laravel 11, designed to streamline hospital operations, patient management, and medical record keeping.

## 👥 Tim Pengembang & Pembagian Service

1. **Service Autentikasi & Manajemen Pengguna (Auth Service)** - Izza
   - Login/Register system
   - Role-based access control
   - User profile management
   - Session management

2. **Service Pendaftaran & Janji Temu (Appointment Service)** - Raihan
   - Appointment scheduling
   - Doctor availability management
   - Patient registration
   - Appointment notifications

3. **Service Resep & Farmasi (Prescription & Pharmacy Service)** - Dini
   - Digital prescription management
   - Medicine inventory
   - Pharmacy integration
   - Prescription tracking

4. **Service Rekam Medis Elektronik (Electronic Health Record Service)** - Fanial
   - Patient medical records
   - Medical history tracking
   - Document management
   - Health data analytics

## 🏗️ Project Structure

```
Smart-Healthcare-System/
├── app/                    # Laravel application logic
│   ├── Http/Controllers/   # HTTP controllers
│   ├── Models/            # Eloquent models
│   └── Providers/         # Service providers
├── bootstrap/              # Laravel bootstrap files
├── config/                # Laravel configuration files
├── database/              # Database migrations, seeders, factories
│   ├── migrations/        # Database migrations
│   ├── seeders/          # Database seeders
│   └── factories/        # Model factories
├── public/                # Public assets and entry point
├── resources/             # Views, assets, and frontend files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── views/            # Blade templates
│   └── src/              # React frontend (untuk development masa depan)
├── routes/                # Route definitions
│   ├── web.php           # Web routes
│   ├── api.php           # API routes
│   └── console.php       # Console routes
├── storage/               # Storage for logs, cache, uploads
├── tests/                 # Test files
└── vendor/               # Composer dependencies
```

## 🚀 Tech Stack

- **Backend**: Laravel 11
- **Database**: SQLite (development), MySQL/PostgreSQL (production)
- **Frontend**: Blade Templates (default Laravel)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: Composer (PHP), NPM (JavaScript)

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- NPM atau Yarn

## 🛠️ Quick Start

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Smart-Healthcare-System
   ```

2. **Setup project**
   ```bash
   npm run setup
   ```

3. **Start development**
   ```bash
   npm start
   ```

   Project akan berjalan di:
   - Backend: http://127.0.0.1:8000
   - Frontend: http://localhost:5173 (jika menggunakan Vite)

## 🔧 Manual Setup

Jika `npm run setup` tidak bekerja, lakukan setup manual:

### Backend Setup
```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations (jika diperlukan)
php artisan migrate

# Start Laravel server
php artisan serve
```

### Frontend Setup
```bash
# Install JavaScript dependencies
npm install

# Build assets
npm run build

# Or start development server
npm run dev
```

## 📜 Available Scripts

- `npm run setup` - Setup lengkap project (backend + frontend)
- `npm start` - Start development server (backend + frontend)
- `npm run dev` - Build assets untuk development
- `npm run build` - Build assets untuk production
- `npm run backend:serve` - Start Laravel server saja
- `npm run backend:migrate` - Run database migrations
- `npm run backend:fresh` - Fresh migrate database

## 🎯 Development Status

**Status Saat Ini**: Setup Awal ✅

Project ini saat ini dalam kondisi setup awal yang bersih dengan:
- ✅ Struktur Laravel 11 standar
- ✅ Konfigurasi dasar (database, session, dll)
- ✅ Template Blade default
- ✅ API routes kosong (siap untuk development)
- ✅ Pembagian tugas tim sudah ditentukan

**Tahap Selanjutnya** (1 minggu ke depan):
- 🔄 Development service-service oleh masing-masing developer
- 🔄 Implementasi fitur-fitur sesuai pembagian tugas
- 🔄 Integrasi antar service

## 🔐 Security Features

- CSRF Protection
- SQL Injection Prevention
- XSS Protection
- Authentication & Authorization
- Session Security

## 🧪 Testing

```bash
# Run tests
php artisan test

# Run specific test
php artisan test --filter TestName
```

## 🚀 Deployment

1. Set environment variables untuk production
2. Run `composer install --optimize-autoloader --no-dev`
3. Run `npm run build`
4. Configure web server (Apache/Nginx)
5. Set proper file permissions

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk pertanyaan atau bantuan, silakan hubungi tim development:
- **Izza** - Auth Service
- **Raihan** - Appointment Service  
- **Dini** - Prescription & Pharmacy Service
- **Fanial** - Electronic Health Record Service
