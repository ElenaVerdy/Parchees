module.exports = {
    'env': {
        'browser': true,
        'amd': true,
        'node': true,
        'es6': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true
        },
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'plugins': [
    ],
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ],
        'no-trailing-spaces': 'error',
        'react/prop-types': 0,
        'arrow-parens': 0,
        'generator-star-spacing': 0,
        'no-multiple-empty-lines': [2, { max: 2, maxEOF: 1 }],
        'prefer-promise-reject-errors': 'off',
        'comma-dangle': ['error', 'never'],
        'space-before-function-paren': ['error', 'always'],
        'object-curly-newline': ['error', { consistent: true }],
        'max-len': 'off',
        'prefer-const': 'error',
        'no-irregular-whitespace': 'error',
        curly: ['error', 'all'],
        'max-statements-per-line': 'error',
        'brace-style': 'error',
        'require-await': 'error',
        'no-shadow': 'error',
        'no-param-reassign': ['error', { props: false }],
        'no-underscore-dangle': 'error',
        'padding-line-between-statements': ['error',
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: 'const', next: '*' },
            { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
            { blankLine: 'always', prev: ['block', 'multiline-block-like', 'for', 'if', 'multiline-expression'], next: '*' }
        ]
    }
}