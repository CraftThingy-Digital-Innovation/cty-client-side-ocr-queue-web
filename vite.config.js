import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'OcrQueueWeb',
      fileName: (format) => `cty-client-side-ocr-queue.${format}.js`,
      formats: ['es', 'umd']
    },
    minify: 'esbuild',
    sourcemap: false
  }
});
