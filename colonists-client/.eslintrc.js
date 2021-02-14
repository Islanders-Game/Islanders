// eslint-disable-next-line no-undef
module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      '@vue/typescript/recommended',
      'plugin:vue/recommended',
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
      ecmaVersion: 2018
    },
    parser: 'vue-eslint-parser',
    rules: {
      'no-warning-comments': [1, { 'terms': ['todo', 'fixme'], 'location': 'anywhere' }],
      "quotes": [1, "single"],
      "indent": [1, 2],
      "interface-name": 0,
      "ordered-imports": 0,
      "object-literal-sort-keys": 0,
      "no-consecutive-blank-lines": 0,
    }
  }