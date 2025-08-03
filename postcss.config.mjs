// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/nesting': {}, 
    // استخدام الحزمة الصحيحة للـ PostCSS
    '@tailwindcss/postcss': {}, 
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
    'cssnano': {
      preset: 'default',
    },
  },
};
