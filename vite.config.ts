//import { defineConfig } from 'vite'
import {defineConfig} from 'vitest/config' 
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.test.tsx',
        '**/*.spec.tsx',
        'node_modules/**',
        'src/app/pages/Map.tsx',
        'src/app/pages/EventConfirmation.tsx',
        'src/app/pages/admin/EventsManagement.tsx',
        'src/app/pages/profesor/EventsManagementProfesor.tsx',
        'src/components/ui/chart.tsx',
      ]
    }
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
