export const REGIONS = [
  'Banda Aceh',
  'Sabang',
  'Aceh Besar',
  'Aceh Tengah',
  'Bener Meriah',
];

export const CATEGORIES = [
  'Religi',
  'Alam',
  'Bahari',
  'Sejarah',
  'Budaya',
  'Kuliner',
];

export const REGION_BOUNDS = {
  'Banda Aceh': [
    [5.535, 95.295],
    [5.565, 95.335],
  ],
  Sabang: [
    [5.805, 95.24],
    [5.9, 95.31],
  ],
  'Aceh Besar': [
    [5.26, 95.21],
    [5.51, 95.3],
  ],
  'Aceh Tengah': [
    [4.59, 96.81],
    [4.65, 96.88],
  ],
  'Bener Meriah': [
    [4.73, 96.76],
    [4.81, 96.87],
  ],
};

export const SAMPLE_DATA = {
  destinations: [
    {
      id: 'd1',
      name: 'Masjid Raya Baiturrahman',
      category: 'Religi',
      region: 'Banda Aceh',
      description:
        'Ikon religi dan arsitektur Aceh yang menjadi salah satu tujuan utama wisata sejarah dan ibadah kota.',
      imageUrl:
        'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80',
      address: 'Jl. Moh. Jam No.1, Kp. Baru, Baiturrahman, Kota Banda Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Masjid+Raya+Baiturrahman+Banda+Aceh',
      cost: 0,
      facilities: 'Area kunjungan terbuka, pelataran payung elektrik, ruang informasi',
      prayer: 'Masjid utama dengan area wudu dan tempat salat yang luas di lokasi',
      lat: 5.5531,
      lng: 95.3175,
    },
    {
      id: 'd2',
      name: 'Museum Tsunami Aceh',
      category: 'Sejarah',
      region: 'Banda Aceh',
      description:
        'Ruang edukasi, arsip kebencanaan, dan refleksi tentang peristiwa tsunami Aceh 2004.',
      imageUrl:
        'https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=900&q=80',
      address: 'Jl. Sultan Iskandar Muda, Sukaramai, Baiturrahman, Banda Aceh',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Museum+Tsunami+Aceh',
      cost: 20000,
      facilities: 'Ruang pamer dan edukasi (periksa jam operasional sebelum berkunjung)',
      prayer: 'Musala tersedia di area museum serta dekat dengan masjid kota',
      lat: 5.5489,
      lng: 95.3164,
    },
    {
      id: 'd3',
      name: 'Pantai Lampuuk',
      category: 'Bahari',
      region: 'Aceh Besar',
      description:
        'Pantai berpasir cerah dengan panorama Samudra Hindia dan deretan pondok kuliner pesisir.',
      imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      address: 'Kecamatan Lhoknga, Kabupaten Aceh Besar',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pantai+Lampuuk+Aceh',
      cost: 10000,
      facilities: 'Area pantai, parkir, dan warung pesisir',
      prayer: 'Periksa ketersediaan musala atau Masjid Rahmatullah di sekitar kawasan',
      lat: 5.4877,
      lng: 95.2328,
    },
    {
      id: 'd4',
      name: 'Pulau Weh',
      category: 'Bahari',
      region: 'Sabang',
      description:
        'Pulau tropis di ujung barat Indonesia dengan lanskap pesisir, titik Nol Kilometer, dan wisata bahari.',
      imageUrl:
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80',
      address: 'Kota Sabang, Aceh',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pulau+Weh+Sabang',
      cost: 50000,
      facilities: 'Aktivitas bahari melalui operator lokal (konfirmasi jadwal penyeberangan)',
      prayer: 'Masjid dan musala tersebar di pusat kota Sabang dan kawasan wisata',
      lat: 5.8214,
      lng: 95.2806,
    },
    {
      id: 'd5',
      name: 'Pantai Iboih',
      category: 'Bahari',
      region: 'Sabang',
      description:
        'Kawasan pesisir tenang dengan air jernih yang populer untuk berenang dan snorkeling.',
      imageUrl:
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80',
      address: 'Iboih, Sukakarya, Kota Sabang',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pantai+Iboih+Sabang',
      cost: 15000,
      facilities: 'Akses pantai, dermaga perahu kaca, penyewaan perlengkapan selam',
      prayer: 'Tanyakan lokasi musala terdekat kepada pengelola dermaga atau homestay',
      lat: 5.883,
      lng: 95.257,
    },
    {
      id: 'd6',
      name: 'Air Terjun Suhom',
      category: 'Alam',
      region: 'Aceh Besar',
      description:
        'Wisata alam air terjun bertingkat dengan rimbun pepohonan di kawasan Lhoong.',
      imageUrl:
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=85',
      address: 'Desa Suhom, Lhoong, Kabupaten Aceh Besar',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Air+Terjun+Suhom+Aceh+Besar',
      cost: 10000,
      facilities: 'Area alam terbuka dan jalur jalan kaki; fasilitas dapat terbatas',
      prayer: 'Konfirmasi musala desa terdekat sebelum menuju lokasi air terjun',
      lat: 5.287,
      lng: 95.274,
    },
    {
      id: 'd7',
      name: 'Danau Lut Tawar',
      category: 'Alam',
      region: 'Aceh Tengah',
      description:
        'Danau vulkanik dataran tinggi di Takengon yang dikelilingi perbukitan dan udara sejuk.',
      imageUrl:
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
      address: 'Takengon, Kabupaten Aceh Tengah',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Danau+Lut+Tawar',
      cost: 10000,
      facilities: 'Area tepi danau, dermaga perahu wisata, kedai kopi Gayo',
      prayer: 'Masjid dan musala tersedia di sepanjang jalan lingkar danau',
      lat: 4.624,
      lng: 96.856,
    },
    {
      id: 'd8',
      name: 'Pantan Terong',
      category: 'Alam',
      region: 'Aceh Tengah',
      description:
        'Puncak pandang untuk menikmati lanskap Kota Takengon dan Danau Lut Tawar dari ketinggian.',
      imageUrl:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
      address: 'Bebesen, Takengon, Kabupaten Aceh Tengah',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pantan+Terong+Aceh+Tengah',
      cost: 15000,
      facilities: 'Gardu pandang dan kedai kopi; perhatikan kondisi jalan menanjak',
      prayer: 'Musala kecil tersedia di area puncak (konfirmasi jam buka)',
      lat: 4.632,
      lng: 96.827,
    },
    {
      id: 'd9',
      name: 'Kampung Wisata Ujung',
      category: 'Budaya',
      region: 'Aceh Tengah',
      description:
        'Pengalaman mengenal kehidupan tradisi dan kesenian masyarakat dataran tinggi Gayo.',
      imageUrl:
        'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80',
      address: 'Kabupaten Aceh Tengah (titik kunjungan komunitas, perlu verifikasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wisata+Budaya+Gayo+Aceh+Tengah',
      cost: 25000,
      facilities: 'Kunjungan budaya melalui pemandu komunitas setempat',
      prayer: 'Masjid kampung tersedia di area pemukiman warga',
      lat: 4.61,
      lng: 96.84,
    },
    {
      id: 'd10',
      name: 'Air Terjun Tansaran Bidin',
      category: 'Alam',
      region: 'Bener Meriah',
      description:
        'Air terjun alami di kawasan pegunungan Bener Meriah yang cocok bagi pencinta jelajah alam.',
      imageUrl:
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=85',
      address: 'Bandar, Kabupaten Bener Meriah (akses perlu diperiksa)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Air+Terjun+Tansaran+Bidin',
      cost: 10000,
      facilities: 'Jalur trekking alami; fasilitas umum masih terbatas',
      prayer: 'Tunaikan salat di masjid kecamatan sebelum memasuki jalur alam',
      lat: 4.79,
      lng: 96.78,
    },
    {
      id: 'd11',
      name: 'Perkebunan Kopi Gayo',
      category: 'Budaya',
      region: 'Bener Meriah',
      description:
        'Tur edukasi budidaya arabika Gayo mulai dari kebun hingga proses sangrai bersama petani lokal.',
      imageUrl:
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80',
      address: 'Kawasan perkebunan Kabupaten Bener Meriah (kunjungan sesuai janji)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Perkebunan+Kopi+Gayo+Bener+Meriah',
      cost: 30000,
      facilities: 'Tur kebun, sesi seduh kopi, dan produk UMKM petani',
      prayer: 'Musala tersedia di rumah produksi atau mitra kebun',
      lat: 4.75,
      lng: 96.85,
    },
    {
      id: 'd12',
      name: 'Kapal PLTD Apung',
      category: 'Sejarah',
      region: 'Banda Aceh',
      description:
        'Situs memorial tsunami berupa kapal pembangkit listrik 2.600 ton yang terdorong ke daratan pada 2004.',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      address: 'Punge Blang Cut, Jaya Baru, Kota Banda Aceh',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kapal+PLTD+Apung+Banda+Aceh',
      cost: 10000,
      facilities: 'Area memorial, dek pandang kapal, papan informasi sejarah',
      prayer: 'Musala tersedia di kawasan situs dan masjid warga sekitar',
      lat: 5.5415,
      lng: 95.3078,
    },
  ],
  foods: [
    {
      id: 'f1',
      name: 'Mie Aceh',
      category: 'Kuliner',
      region: 'Banda Aceh',
      price: 25000,
      imageUrl:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
      status: 'Belum diverifikasi dokumen',
      source: 'Data contoh demo; periksa sertifikat halal resmi di gerai tujuan',
      contact: '0800-0000-0001',
    },
    {
      id: 'f2',
      name: 'Kopi Gayo',
      category: 'Produk UMKM',
      region: 'Bener Meriah',
      price: 65000,
      imageUrl:
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80',
      status: 'Belum diverifikasi dokumen',
      source: 'Data contoh demo; konfirmasi nomor izin edar & halal pada kemasan',
      contact: '0800-0000-0002',
    },
    {
      id: 'f3',
      name: 'Kuah Beulangong',
      category: 'Kuliner',
      region: 'Aceh Besar',
      price: 35000,
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      status: 'Belum diverifikasi dokumen',
      source: 'Data contoh demo; tanyakan bahan dan sertifikasi langsung ke pengelola',
      contact: '0800-0000-0003',
    },
  ],
  stays: [
    {
      id: 's1',
      name: 'Penginapan Syariah Banda Aceh (Contoh)',
      region: 'Banda Aceh',
      price: 350000,
      facilities: 'Wi-Fi, area parkir, resepsionis 24 jam',
      muslim: 'Penunjuk arah kiblat, perlengkapan salat, jarak jalan kaki ke masjid',
      imageUrl:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      contact: '0800-1111-0001',
    },
    {
      id: 's2',
      name: 'Guesthouse Bahari Sabang (Contoh)',
      region: 'Sabang',
      price: 450000,
      facilities: 'Wi-Fi, teras santai pantai, area parkir',
      muslim: 'Akses mudah ke masjid sekitar; fasilitas kamar perlu konfirmasi langsung',
      imageUrl:
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
      contact: '0800-1111-0002',
    },
    {
      id: 's3',
      name: 'Homestay Dataran Tinggi Gayo (Contoh)',
      region: 'Aceh Tengah',
      price: 300000,
      facilities: 'Kamar keluarga, sarapan lokal sesuai permintaan',
      muslim: 'Tuan rumah Muslim; sajian sarapan disiapkan sesuai kaidah halal',
      imageUrl:
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80',
      contact: '0800-1111-0003',
    },
  ],
  packages: [
    {
      id: 'p1',
      name: 'Jejak Alam & Bahari',
      duration: 3,
      regions: ['Sabang', 'Aceh Besar'],
      interests: ['alam', 'bahari'],
      destinations: ['d3', 'd4', 'd5'],
      cost: 1250000,
      description: 'Rute pesisir Aceh Besar dan Pulau Weh Sabang untuk penjelajahan pantai dan laut.',
    },
    {
      id: 'p2',
      name: 'Sejarah dan Religi Banda Aceh',
      duration: 2,
      regions: ['Banda Aceh'],
      interests: ['sejarah', 'religi'],
      destinations: ['d1', 'd2', 'd12'],
      cost: 650000,
      description: 'Menelusuri ikon religi Banda Aceh serta situs edukasi sejarah kebencanaan.',
    },
    {
      id: 'p3',
      name: 'Pesona Dataran Tinggi Gayo',
      duration: 3,
      regions: ['Aceh Tengah', 'Bener Meriah'],
      interests: ['alam', 'budaya'],
      destinations: ['d7', 'd8', 'd11'],
      cost: 1450000,
      description: 'Menikmati Danau Lut Tawar, puncak Pantan Terong, dan perkebunan kopi Gayo.',
    },
    {
      id: 'p4',
      name: 'Budaya dan Rasa Aceh',
      duration: 2,
      regions: ['Banda Aceh', 'Aceh Besar'],
      interests: ['budaya', 'kuliner'],
      destinations: ['d1', 'd3'],
      cost: 800000,
      description: 'Perpaduan kunjungan ikon budaya kota dan pengalaman kuliner pesisir Aceh.',
    },
  ],
};
