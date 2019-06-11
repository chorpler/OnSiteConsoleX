module.exports = {
  "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true,
    },
    "extends": [
      "eslint:recommended",
      "plugin:you-dont-need-momentjs/recommended",
    ],
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2017,
    },
    "rules": {
        // "indent": [
        //     "warn",
        //     2
        // ],
        "indent": "off",
        "linebreak-style": [
            "warn",
            "unix"
        ],
        "quotes": "off",
        // "quotes": [
        //     "warn",
        //     "single"
        // ],
        "semi": [
            "warn",
            "always"
        ],
        "no-unused-vars": "off",
        "no-console": "off",
    }
};
