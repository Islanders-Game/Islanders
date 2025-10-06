// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript/recommended',
    'plugin:vue/recommended',
    'plugin:vue/essential',
    '@vue/standard',
  ],

  plugins: ['@typescript-eslint'],

  parserOptions: {
    ecmaVersion: 2020,
  },

  parser: 'vue-eslint-parser',

  rules: {
    'function-param-newline': 0,
    'implicit-arrow-linebreak': 0,
    'import/named': 0,
    'import/no-cycle': 0,
    'import/prefer-default-export': 0,
    'interface-name': 0,
    'linebreak-style': 0,
    'lines-between-class-members': 0,
    'max-classes-per-file': 0,
    'max-len': [1, { code: 120, tabWidth: 2 }],
    'no-bitwise': 0,
    'no-confusing-arrow': 0,
    'no-consecutive-blank-lines': 0,
    'no-lonely-if': 0,
    'no-plusplus': 0,
    'no-redeclare': 0,
    'no-unused-vars': 0,
    'no-use-before-define': 0,
    'no-warning-comments': [1, { terms: ['todo', 'fixme'], location: 'anywhere' }],
    'object-literal-sort-keys': 0,
    'operator-linebreak': 0,
    'ordered-imports': 0,
    'space-before-function-paren': 0,
    "comma-dangle": ["error", "always-multiline"],
    "vue/max-attributes-per-line": 0,
    "vue/singleline-html-element-content-newline": 0,
    indent: [1, 2, { SwitchCase: 1 }],
    quotes: [1, 'single'],
    semi: 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'object-curly-newline': ['error', {
      ObjectPattern: { multiline: true },
      ExportDeclaration: { multiline: true, minProperties: 3 },
    }],
    'no-console': [1, { allow: ['warn', 'error'] }],
    'class-methods-use-this': 'off'
  },
  root: true,

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
