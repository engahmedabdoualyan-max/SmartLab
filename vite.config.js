// ================================================================
// SmartLAP — Vite Build Configuration
// ================================================================
// Optimizes and bundles the split JS architecture for production.
// Target: <50KB initial bundle overhead, tree-shaken, minified.
// ================================================================

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Root is the workspace root where index.html lives
  root: '.',

  // Base path for assets (root-relative for production)
  base: '/',

  // Build output configuration
  build: {
  // Output directory for production build
  outDir: 'dist',

  // Clean dist before each build
  emptyOutDir: true,

  // Generate sourcemaps only for development (off for prod)
  sourcemap: false,

  // Minification settings
  minify: 'terser',
  terserOptions: {
  compress: {
  drop_console: true,       // Remove all console.* calls
  drop_debugger: true,      // Remove debugger statements
  dead_code: true,          // Remove unreachable code
  unused: true,             // Remove unused functions/vars
  hoist_funs: true,         // Hoist function declarations
  booleans_as_integers: true,
  passes: 3                 // Multiple optimization passes
  },
  mangle: {
  properties: {
  regex: /^_/           // Mangle private underscore-prefixed props
  }
  },
  format: {
  comments: false,          // Strip all comments
  max_line_len: 200          // Keep lines reasonable
  }
  },

  // CSS minification
  cssMinify: 'cssnano',

  // Rollup-specific options
  rollupOptions: {
  // Entry point
  input: {
  main: resolve(__dirname, 'index.html')
  },

  // Manual chunk splitting for modular architecture
  output: {
  // Compact output format
  compact: true,

  // Chunk naming pattern
  entryFileNames: 'assets/[name]-[hash].js',
  chunkFileNames: 'assets/chunk-[name]-[hash].js',
  assetFileNames: 'assets/[name]-[hash][extname]',

  // Manual chunks to keep Firebase/config separate from app logic
  manualChunks: {
  // Firebase SDK bundle
  firebase: [
  resolve(__dirname, 'js/firebase-config.js'),
  resolve(__dirname, 'js/config.js')
  ],

  // Core mathematical engine
  calculations: [
  resolve(__dirname, 'js/calculations.js'),
  resolve(__dirname, 'js/test-helpers.js')
  ],

  // Security & cloud modules
  security: [
  resolve(__dirname, 'js/security.js'),
  resolve(__dirname, 'js/cloud_storage.js')
  ],

  // Navigation & UI framework
  ui: [
  resolve(__dirname, 'js/navigation.js'),
  resolve(__dirname, 'js/app.js'),
  resolve(__dirname, 'js/i18n.js'),
  resolve(__dirname, 'js/analytics.js')
  ],

  // All test modules
  tests: [
  resolve(__dirname, 'js/compaction.js'),
  resolve(__dirname, 'js/cbr.js'),
  resolve(__dirname, 'js/slump.js'),
  resolve(__dirname, 'js/maturity.js'),
  resolve(__dirname, 'js/marshall.js'),
  resolve(__dirname, 'js/bitumen.js'),
  resolve(__dirname, 'js/penetration.js'),
  resolve(__dirname, 'js/straightedge.js'),
  resolve(__dirname, 'js/sieve.js'),
  resolve(__dirname, 'js/compressive.js'),
  resolve(__dirname, 'js/ductility.js'),
  resolve(__dirname, 'js/air.js'),
  resolve(__dirname, 'js/atterberg.js'),
  resolve(__dirname, 'js/direct_shear.js'),
  resolve(__dirname, 'js/permeability.js'),
  resolve(__dirname, 'js/specific_gravity.js'),
  resolve(__dirname, 'js/water_absorption.js'),
  resolve(__dirname, 'js/flexural.js'),
  resolve(__dirname, 'js/split_tensile.js'),
  resolve(__dirname, 'js/softening_point.js'),
  resolve(__dirname, 'js/viscosity.js')
  ],

  // Serial / hardware communication
  hardware: [
  resolve(__dirname, 'js/serial.js'),
  resolve(__dirname, 'js/fab.js')
  ],

  // Auxiliary modules
  aux: [
  resolve(__dirname, 'js/auth.js'),
  resolve(__dirname, 'js/pdf.js'),
  resolve(__dirname, 'js/api.js'),
  resolve(__dirname, 'js/ml.js'),
  resolve(__dirname, 'js/qr.js')
  ]
  }
  },

  // Tree-shaking
  treeshake: {
  annotations: true,
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  tryCatchDeoptimization: false,
  unknownGlobalSideEffects: false
  }
  },

  // Target ES5 for maximum browser compatibility
  target: 'es5',

  // Limit CSS code splitting (inline critical CSS)
  cssCodeSplit: false,

  // Increase warning limit (we have many chunks)
  chunkSizeWarningLimit: 100,

  // Report gzipped sizes
  reportCompressedSize: true
  },

  // Development server configuration
  server: {
  port: 3000,
  open: true,
  // Proxy API requests if needed
  proxy: {
  '/api': {
  target: 'http://localhost:5000',
  changeOrigin: true
  }
  }
  },

  // CSS preprocessing
  css: {
  devSourcemap: false,
  postcss: {
  plugins: [
  // Autoprefixer for cross-browser CSS
  { postcssPlugin: 'autoprefixer' }
  ]
  }
  },

  // Resolve aliases for cleaner imports (though not used in vanilla JS)
  resolve: {
  alias: {
  '@js': resolve(__dirname, 'js'),
  '@css': resolve(__dirname, 'css')
  }
  },

  // Optimize dependencies
  optimizeDeps: {
  include: []
  },

  // Environment variable prefix
  envPrefix: 'SMARTLAP_'
});

