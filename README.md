## 🏛️ Architectural Plan

This project follows a microservices-oriented architecture composed of three main repositories:

1.  **Backend Service (`smart-healthcare-system`)**: This repository contains the core backend logic, database models, and API endpoints for all services.
2.  **Service Bus (`service-bus`)**: Acts as an integration layer, aggregating and orchestrating APIs from the backend service before exposing them to the frontend.
3.  **Frontend (`frontend`)**: The user-facing application that consumes data from the service bus and handles all client-side rendering and interactions.

---

## 🗃️ Database Schema

The database consists of the following tables:

-   `pengguna`
    -   `id_pengguna` (Primary Key)
    -   `email`
    -   `password_hash`
    -   `role`
    -   `nama_lengkap`
    -   `no_telepon`
-   `dokter`
    -   `id_dokter` (Primary Key)
    -   `id_pengguna` (Foreign Key to `pengguna`)
    -   `spesialisasi`
    -   `no_lisensi`
    -   `biaya_konsultasi`
-   `pasien`
    -   `id_pasien` (Primary Key)
    -   `id_pengguna` (Foreign Key to `pengguna`)
    -   `tanggal_lahir`
    -   `golongan_darah`
    -   `alamat`
-   `janji_temu`
    -   `id_janji_temu` (Primary Key)
    -   `id_pasien` (Foreign Key to `pasien`)
    -   `id_dokter` (Foreign Key to `dokter`)
    -   `tanggal_janji`
    -   `waktu_janji`
    -   `status`
    -   `keluhan`
-   `rekam_medis`
    -   `id_rekam_medis` (Primary Key)
    -   `id_pasien` (Foreign Key to `pasien`)
    -   `id_dokter` (Foreign Key to `dokter`)
    -   `id_janji_temu` (Foreign Key to `janji_temu`)
    -   `tanggal_kunjungan`
    -   `diagnosis`
    -   `tindakan`
    -   `catatan`
-   `apoteker`
    -   `id_apoteker` (Primary Key)
    -   `id_pengguna` (Foreign Key to `pengguna`)
    -   `no_lisensi`
-   `obat`
    -   `id_obat` (Primary Key)
    -   `nama_obat`
    -   `kategori`
    -   `harga`
    -   `stok`
-   `resep`
    -   `id_resep` (Primary Key)
    -   `id_rekam_medis` (Foreign Key to `rekam_medis`)
    -   `tanggal_resep`
    -   `status`
-   `detail_resep`
    -   `id_detail` (Primary Key)
    -   `id_resep` (Foreign Key to `resep`)
    -   `id_obat` (Foreign Key to `obat`)
    -   `jumlah`
    -   `dosis`
    -   `instruksi`
-   `transaksi_farmasi`
    -   `id_transaksi` (Primary Key)
    -   `id_resep` (Foreign Key to `resep`)
    -   `id_apoteker` (Foreign Key to `apoteker`)
    -   `tanggal_transaksi`
    -   `total_harga`

---

## 👥 Team & Task Division

The development is divided into the following services, with each team member responsible for a specific domain:

-   **Authentication & User Management (Auth Service)**
    -   **Lead:** Izza
    -   **Responsibilities:** User registration, login, profile management, and access control.

-   **Registration & Appointment Service**
    -   **Lead:** Raihan
    -   **Responsibilities:** Patient registration, doctor scheduling, and appointment booking.

-   **Prescription & Pharmacy Service**
    -   **Lead:** Dini
    -   **Responsibilities:** Managing prescriptions, medication inventory, and pharmacy transactions.

-   **Electronic Health Record (EHR) Service**
    -   **Lead:** Fanial
    -   **Responsibilities:** Creating, managing, and securing patient electronic health records.
