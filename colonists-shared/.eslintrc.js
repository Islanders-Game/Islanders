module.exports = {
  env: {
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'function-param-newline': 0,
    'implicit-arrow-linebreak': 0,
    'import/prefer-default-export': 0,
    'interface-name': 0,
    'linebreak-style': 0,
    'lines-between-class-members': 0,
    'max-classes-per-file': 0,
    'max-len': [1, { code: 120, tabWidth: 2 }],
    'no-confusing-arrow': 0,
    'no-consecutive-blank-lines': 0,
    'no-lonely-if': 0,
    'no-plusplus': 0,
    'no-redeclare': 0,
    'no-unused-vars': 0,
    'no-use-before-define': 0,
    'no-warning-comments': [1, { terms: ['todo', 'fixme', 'warn'], location: 'anywhere' }],
    'object-literal-sort-keys': 0,
    'operator-linebreak': 0,
    'ordered-imports': 0,
    indent: [1, 2, { SwitchCase: 1 }],
    quotes: [1, 'single'],
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
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['lib'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
