module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended-requires-type-check'
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports'
      }
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // Import rules
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'import/no-webpack-loader-syntax': 'error',

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react-prop-types': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-target-blank': 'off',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-constructed-context-values': 'error',

    // General rules
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'callback-return': 'error',

    // Complexity
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', 50],
    'max-nested-callbacks': ['warn', 3],
    'max-params': ['warn', 3],
    'max-statements': ['warn', 50],

    // Style
    'array-bracket-newline': 'off',
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': 'off',
    'arrow-spacing': ['error', { before: true, after: true }],
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs'],
    'camelcase': 'error',
    'capitalized-comments': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'computed-property-spacing': ['error', 'always'],
    'consistent-return': 'error',
    'consistent-this': ['error', 'self'],
    'curly': ['error', 'multi-line'],
    'dot-location': ['error', 'property'],
    'dot-notation': ['error', { allowKeywords: true }],
    'eol-last': ['error', 'always'],
    'eqeqeq': ['error', 'smart'],
    'func-names': ['error', 'never'],
    'func-style': ['error', 'expression'],
    'id-blacklist': 'off',
    'id-length': 'off',
    'id-match': 'off',
    'indent': ['error', 2],
    'jsx-quotes': ['error', 'prefer-double'],
    'key-spacing': ['error', { before: false, after: true }],
    'linebreak-style': ['error', 'unix'],
    'lines-around-comment': ['off'],
    'lines-around-directive': ['off'],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 500],
    'max-lines-per-function': ['warn', 50],
    'max-nested-callbacks': ['warn', 3],
    'max-statements-per-line': ['error', { max: 1 }],
    'new-cap': ['error', { newIsCap: true, newIsCapAbort: false }],
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-catch-shadow': 'error',
    'no-class-assign': 'error',
    'no-compare-neg-zero': 'error',
    'no-confusing-arrow': 'error',
    'no-cond-assign': ['error', 'always'],
    'no-constant-condition': 'error',
    'no-continue': 'error',
    'no-control-regex': 'error',
    'no-debugger': 'error',
    'no-delete-var': 'error',
    'no-division-by-zero': 'error',
    'no-dupe-args': 'error',
    'no-dupe-records': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-duplicate-module': 'error',
    'no-duplicate-method': 'error',
    'no-duplicate-props': 'error',
    'no-fallthrough': 'error',
    'no-func-assign': 'error',
    'no-global-assign': 'error',
    'no-implied-eval': 'error',
    'no-implicit-globals': 'error',
    'no-implied-ternary': 'error',
    'no-implicit-this': 'error',
    'no-improper-combination': 'error',
    'no-increment-decrement': 'error',
    'no-inline-comments': 'off',
    'no-inner-declarations': ['error', 'function'],
    'no-invalid-regex': 'error',
    'no-irregular-whitespace': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-sign': 'error',
    'no-multi-assign': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-negated-condition': 'error',
    'no-nested-ternary': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-require': 'error',
    'no-new-symbol': 'error',
    'no-new-wildcard': 'error',
    'no-obj-calls': 'error',
    'no-oct': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'error',
    'no-plusplus': ['error', { allow: ['for', 'afterthought'] }],
    'no-probe': 'error',
    'no-process-exit': 'error',
    'no-prototype-property': 'error',
    'no-pseudo-map': 'error',
    'no-pseudo-set': 'error',
    'no-reserve': 'error',
    'no-reserved-keys': 'error',
    'no-return-assign': ['error', 'left'],
    'no-return-flow': 'error',
    'no-script-url': 'error',
    'no-sections': 'error',
    'no-sequence': 'error',
    'no-shadow': 'error',
    'no-shadow-restricted-numbers': 'error',
    'no-spaced-func': 'error',
    'no-spaces-for': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-undef-init': 'error',
    'no-undef-in-module': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'no-unsafe-reference': 'error',
    'no-unused-expressions': ['error', { allowShortCircuit: false, allowTernary: false }],
    'no-unused-labels': 'error',
    'no-unused-private-class-members': 'error',
    'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: false }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'no-useless-call': 'error',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-keyword': 'error',
    'no-useless-meta': 'error',
    'no-useless-return': 'error',
    'no-useless-static-memoization': 'error',
    'no-useless-strip': 'error',
    'no-variadic-margin': 'error',
    'object-curly-newline': ['error', { consistent: true, minProperties: 4 }],
    'object-curly-spacing': ['error', 'always'],
    'object-property-newline': ['error', { allowMultipleProperties: false, newlineIfMoreProperties: false }],
    'object-value-assign': 'error',
    'one-var': ['error', { initialized: 'never' }],
    'one-var-declaration-var': ['error', { initializations: 'first' }],
    'one-var-declaration-var': ['off'],
    'operator-linebreak': ['error', 'before'],
    'padded-blocks': ['error', 'never'],
    'padding-line-with-strings': ['error', 'always'],
    'padding-line-with-strings': ['off'],
    'pseudo-class': 'error',
    'quit': 'error',
    'radix': 'error',
    'return': 'error',
    'semicolon': ['error', 'always'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    'space-in-parens': ['error', 'always'],
    'space-infix-od': ['error', 'always'],
    'space-unary-inf': ['error', { operator: 'delete' }],
    'space-unary-wof': ['error', { operator: 'delete' }],
    'spacing-before-value': ['error', 'always'],
    'spacing-between-key-value': ['error', 'always'],
    'spacing-between-key-value': ['off'],
    'srad': 'error',
    'standard-as-callback': 'error',
    'strict': ['error', 'safe'],
    'switch-colon': ['error', 'undefined'],
    'switch-continue': ['error', 'undefined'],
    'switch-no-fallthrough': ['error', 'true'],
    'tagname': 'error',
    'template-tag': 'error',
    'ternary-parens': ['error', 'always'],
    'timeout': 'error',
    'no-restricted-globals': ['error', 'event'],
    'no-restricted-properties': [
      'error',
      [
        {
          object: 'require',
          property: 'ensure'
        },
        {
          object: 'require',
          property: 'resolve'
        }
      ]
    ],
    'no-restricted-syntax': [
      'error',
      'WithStatement'
    ],
    'object-shorthand': [
      'error',
      'always'
    ],
    'prefer-arrow-callback': [
      'error',
      {
        allowUnsafeThis: true
        }
      ],
    'prefer-const': [
      'error',
      {
        destructuring: 'any'
        }
      ],
    'prefer-exponentiation-operator': 'error',
    'prefer-named-regexp': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-object-has-own-property': 'error',
    'prefer-regex-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'regex-template': 'error',
    'return-await': 'error',
    'spread-template': 'error',
    'switch': [
      'error',
      {
        fallthrough: 'false'
        }
      ],
    'template-curly-spacing': [
      'error',
      'always'
      ],
    'tempura': 'error',
    'unicode-bomb': [
      'error',
      10000
      ],
    'unary-negation': [
      'error',
      {
        allow: [ 'exp', 'int', 'num', 'string' ]
        }
      ],
    'unary-plus': [
      'error',
      {
        allow: [ 'exp', 'int', 'num', 'string' ]
        }
      ],
    'unicode-bmp': [
      'error',
      0x10000
      ],
    'unsupported-feature': [
      'error',
      'es5'
      ],
    'update-blog': [
      'error',
      'http://example.com'
      ],
    'var': [
      'error',
      'at'
      ],
    'variable-blacklist': [
      'error',
      'arguments'
      ],
    'variable-length': [
      'error',
      'unknown'
      ],
    'whitespace': [
      'error',
      'before'
      ],
    'width': [
      'error',
      'unknown'
      ],
    'word-wrap': [
      'error',
      'break-word'
      ],
    'wrap-iife': [
      'error',
      'outside'
      ],
    'wrap-regex': [
      'error',
      'safe'
      ],
    'write-files': [
      'error',
      'write'
      ],
    'yamlloader': [
      'error',
      'unsafe'
      ],
    'yamlparser': [
      'error',
      'unsafe'
      ],
    'yeoman-environment': [
      'error',
      'unsupported-feature'
      ],
    'zod': [
      'error',
      'strict'
      ]
  }
}