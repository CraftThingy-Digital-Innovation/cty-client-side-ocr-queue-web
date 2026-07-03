# @craftthingy-digital-innovation/cty-client-side-ocr-queue-web

Bilingual documentation: [Bahasa Indonesia](#bahasa-indonesia) | [English](#english)

---

## Bahasa Indonesia

Library client-side JavaScript modular untuk mengelola antrean pemrosesan foto OCR (Optical Character Recognition) secara berurutan (sekuensial) di latar belakang browser demi menghemat pemakaian memori RAM & CPU komputer client.

### Fitur Utama
- ⏱️ **Sequential Processing:** Mengantrekan pemrosesan gambar secara teratur (satu per satu) untuk mencegah tabrakan memory browser akibat pemanggilan library AI paralel.
- ⚙️ **Queue Lifecycle Status:** Melacak status pengerjaan setiap item (`pending`, `processing`, `ready`, `error`).
- 🔔 **Event Lifecycle Hooks:** Callback terstandarisasi saat status antrean diperbarui, item sukses diekstrak, atau terjadi galat.

### Instalasi
```bash
npm install @craftthingy-digital-innovation/cty-client-side-ocr-queue-web
```

### Cara Penggunaan
```javascript
import { OcrQueueManager } from '@craftthingy-digital-innovation/cty-client-side-ocr-queue-web';

const ocrQueue = new OcrQueueManager({
  getOcrClient: async () => {
    // Kembalikan instansi PaddleOCRClient Anda
    return myOcrClientInstance;
  },
  onQueueUpdate: (queue) => {
    // Pemicu rendering UI list antrean di sidebar
    console.log("Antrean Terkini:", queue);
  },
  onItemReady: (item, index) => {
    console.log(`Foto ${item.filename} berhasil di-OCR!`, item.results);
  },
  onItemError: (item, err) => {
    console.error(`Foto ${item.filename} gagal diproses:`, err);
  }
});

// Menambahkan gambar baru ke antrean
ocrQueue.enqueue({
  id: 'image-uuid-abc',
  filename: 'paspor_budi.jpg',
  url: 'data:image/jpeg;base64,...'
});

// Hapus item dari antrean
ocrQueue.dequeue(0);

// Pilih item aktif di sidebar
ocrQueue.selectItem(1);
```

---

## English

A modular client-side JavaScript library to manage background OCR (Optical Character Recognition) image queues sequentially to conserve RAM & CPU utilization on client devices.

### Key Features
- ⏱️ **Sequential Processing:** Serializes background image analysis tasks to prevent client crashes due to parallel AI engine memory usage.
- ⚙️ **Queue Lifecycle Status:** Tracks item-level state machines (`pending`, `processing`, `ready`, `error`).
- 🔔 **Event Lifecycle Hooks:** Emits callbacks upon queue changes, successful OCR completion, and errors.

### Installation
```bash
npm install @craftthingy-digital-innovation/cty-client-side-ocr-queue-web
```

### Usage
```javascript
import { OcrQueueManager } from '@craftthingy-digital-innovation/cty-client-side-ocr-queue-web';

const ocrQueue = new OcrQueueManager({
  getOcrClient: async () => {
    return myPaddleOCRInstance;
  },
  onQueueUpdate: (queue) => {
    renderSidebar(queue);
  },
  onItemReady: (item, index) => {
    console.log("OCR output words:", item.results);
  }
});

ocrQueue.enqueue({
  filename: 'doc.jpg',
  url: 'data:image/jpeg;base64,...'
});
```

## License
Licensed under Public-Source Corporate Royalty License (PSCRL). See [LICENSE](./LICENSE) for details.
