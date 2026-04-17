
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import path from 'path';

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'figma:asset/f9e6146427a69f3b01d7507469864f2a2c4f45c1.png': path.resolve(__dirname, './src/assets/f9e6146427a69f3b01d7507469864f2a2c4f45c1.png'),
        'figma:asset/f55352753708d5a1c04a6b5e7921ba6a691ec0b2.png': path.resolve(__dirname, './src/assets/f55352753708d5a1c04a6b5e7921ba6a691ec0b2.png'),
        'figma:asset/eda747c5b9fff8f376f736407b5003ea07ae2886.png': path.resolve(__dirname, './src/assets/eda747c5b9fff8f376f736407b5003ea07ae2886.png'),
        'figma:asset/e93bb87d1abef1a166b3bb87c5aa2ad5e94438bb.png': path.resolve(__dirname, './src/assets/e93bb87d1abef1a166b3bb87c5aa2ad5e94438bb.png'),
        'figma:asset/e33c91f6481ecae5fd797cb6723120650c140009.png': path.resolve(__dirname, './src/assets/e33c91f6481ecae5fd797cb6723120650c140009.png'),
        'figma:asset/e2ab87db1ea720cd207cf90203e8605ac21f9d02.png': path.resolve(__dirname, './src/assets/e2ab87db1ea720cd207cf90203e8605ac21f9d02.png'),
        'figma:asset/d86adce230f818f3c37eb92d8f5d16a03ab446bd.png': path.resolve(__dirname, './src/assets/d86adce230f818f3c37eb92d8f5d16a03ab446bd.png'),
        'figma:asset/cfa90523740b88f37cf837b3a4b69c4f932d514c.png': path.resolve(__dirname, './src/assets/cfa90523740b88f37cf837b3a4b69c4f932d514c.png'),
        'figma:asset/cebef7bc55f7993f4d12b2f483302971cbc799f7.png': path.resolve(__dirname, './src/assets/cebef7bc55f7993f4d12b2f483302971cbc799f7.png'),
        'figma:asset/cab19a31e625cf953e80c989d5be48a8aab5b08c.png': path.resolve(__dirname, './src/assets/cab19a31e625cf953e80c989d5be48a8aab5b08c.png'),
        'figma:asset/c244d6b648157c823b4b846b781c41182acf4a27.png': path.resolve(__dirname, './src/assets/c244d6b648157c823b4b846b781c41182acf4a27.png'),
        'figma:asset/c026b240c39a817b71ade4c0053350630c49d874.png': path.resolve(__dirname, './src/assets/c026b240c39a817b71ade4c0053350630c49d874.png'),
        'figma:asset/bf8f4f08c420b9f6a28813a523840deda26c0fac.png': path.resolve(__dirname, './src/assets/bf8f4f08c420b9f6a28813a523840deda26c0fac.png'),
        'figma:asset/ba6178de4b6be80c019e44df2f99d355a1af18f9.png': path.resolve(__dirname, './src/assets/ba6178de4b6be80c019e44df2f99d355a1af18f9.png'),
        'figma:asset/a2afb6d41d85fadeb9d2ed6c3212baefdef5c905.png': path.resolve(__dirname, './src/assets/a2afb6d41d85fadeb9d2ed6c3212baefdef5c905.png'),
        'figma:asset/889dba2addcab71f6ed7c453b51f06885650a00c.png': path.resolve(__dirname, './src/assets/889dba2addcab71f6ed7c453b51f06885650a00c.png'),
        'figma:asset/865d785d6e9774c9996411c38171ed171bfd9cc2.png': path.resolve(__dirname, './src/assets/865d785d6e9774c9996411c38171ed171bfd9cc2.png'),
        'figma:asset/7e6ae69f4b14892961aa7733b0cef36a1f5ccdd0.png': path.resolve(__dirname, './src/assets/7e6ae69f4b14892961aa7733b0cef36a1f5ccdd0.png'),
        'figma:asset/752bff3fda929cfb03de2d177a91f0aef5f1478d.png': path.resolve(__dirname, './src/assets/752bff3fda929cfb03de2d177a91f0aef5f1478d.png'),
        'figma:asset/5c776c003485fa3981a063011a735606329912a0.png': path.resolve(__dirname, './src/assets/5c776c003485fa3981a063011a735606329912a0.png'),
        'figma:asset/41b3e41de2bd3801d96e4656419c385bb1b25a45.png': path.resolve(__dirname, './src/assets/41b3e41de2bd3801d96e4656419c385bb1b25a45.png'),
        'figma:asset/1fa0e609079bf706b74de1a8a1272c80be458c46.png': path.resolve(__dirname, './src/assets/1fa0e609079bf706b74de1a8a1272c80be458c46.png'),
        'figma:asset/1e750ddb04888f776e8a6d958620e2ec491ca913.png': path.resolve(__dirname, './src/assets/1e750ddb04888f776e8a6d958620e2ec491ca913.png'),
        'figma:asset/1d6dedd8a5ccde3a869b04f6290bddffb243535a.png': path.resolve(__dirname, './src/assets/1d6dedd8a5ccde3a869b04f6290bddffb243535a.png'),
        '@mirrorworks/contracts': path.resolve(__dirname, '../../packages/contracts/src/index.ts'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['ogl'],
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router'],
            'vendor-ui': ['recharts', 'lucide-react', 'motion'],
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
            ],
            'vendor-barcode': ['bwip-js'],
            'vendor-camera': ['html5-qrcode'],
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      open: false,
    },
  });
