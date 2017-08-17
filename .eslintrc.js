module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true
    },
    root: true,
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module'
    },
    extends: [
        'eslint:recommended',
        'plugin:ember-suave/recommended'
    ],
    rules: {
        'indent': [2, 4],
        'no-console': 'off',
        'object-curly-spacing': ['off'],
        'ember-suave/no-direct-property-access': 'off',
        'ember-suave/no-const-outside-module-scope': 'off',
        'comma-dangle': ['error', { 'arrays': 'never', 'objects': 'always-multiline' }]
    },
    globals: {
        module: true,
        process: false,
        requireNode: false
    }
};
