/** @type {import('tailwindcss').Config} */

const path = require('path')
const defaultTheme = require('tailwindcss/defaultTheme')

import defaultTheme from 'tailwindcss/defaultTheme'
import medusaUiPreset from '@medusajs/ui-preset'

const uiPath = path.resolve(
  require.resolve('@medusajs/ui'),
  '../..',
  '\*_/_.{js,jsx,ts,tsx}',
)

export default {
  presets: [medusaUiPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
