module.exports = {
    extends: [
        "eslint:recommended",
        "node"
    ],
    rules: {
        "no-console": [1, { "allow": ["info", "error"] }],
        "no-labels": 0,
        "no-unused-vars": 1,
        "indent": [2, 4, { "SwitchCase": 1 }],
        "semi": [2, "always"],
        "space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "ignore"
        }],
        "react/jsx-curly-spacing": [2, "never", { "allowMultiline": false }],
        "space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "ignore"
        }],
        "valid-jsdoc": ["error", {
            "prefer": {
                "arg": "param",
                "argument": "param",
                "return": "returns"
            },
            "preferType": {
                "object": "Object",
                "array": "Array",
                "string": "String",
                "number": "Number",
                "boolean": "Boolean",
                "promise": "Promise"
            },
            "requireReturn": false,
            "requireReturnType": true,
            "requireParamDescription": false,
            "requireReturnDescription": false,
            "matchDescription": ".+"
        }],
        "import/no-commonjs": 0,
        "padding-line-between-statements": [
          "error",
          {"blankLine": "always", "prev": ["const", "let", "var"], "next": "*"},
          {"blankLine": "any",    "prev": ["const", "let", "var"], "next": ["const", "let", "var"]},
          {"blankLine": "always", "prev": "*", "next": "return"},
          {"blankLine": "always", "prev": "directive", "next": "*" },
          {"blankLine": "any", "prev": "directive", "next": "directive"},
          {"blankLine": "always", "prev": "import", "next": "*" },
          {"blankLine": "any", "prev": "import", "next": "import"},
          {"blankLine": "any", "prev": ["const", "let", "var"], "next": "export" },
          {"blankLine": "any", "prev": "export", "next": "export"},
          {"blankLine": "always", "prev": "function", "next": "*" },
          {"blankLine": "always", "prev": "*", "next": "function" },
          {"blankLine": "always", "prev": "block-like", "next": "*" },
          {"blankLine": "always", "prev": "*", "next": "block-like" },
          {"blankLine": "always", "prev": "class", "next": "*" },
          {"blankLine": "always", "prev": "*", "next": "class" }
        ]
    }
};
