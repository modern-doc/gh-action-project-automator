module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],
    plugins: [],
    env: {
        browser: true,
        es6: true,
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'import/named': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
    overrides: [
        {
            files: ['__tests__/**'],
            plugins: ['jest'],
            extends: ['plugin:jest/recommended'],
            rules: { 'jest/prefer-expect-assertions': 'off' },
        },
    ],
    env: {
        node: true,
        es6: true,
        'jest/globals': true,
    },
};
