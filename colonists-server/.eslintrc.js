module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    "rules": {
        "no-warning-comments": [1, { "terms": ["todo", "fixme"], "location": "anywhere" }]
    }
  };