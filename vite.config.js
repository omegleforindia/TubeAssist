import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → works on GitHub Pages at any repo name (username.github.io/<repo>/)
export default defineConfig({
  plugins: [react()],
  base: './',
})
