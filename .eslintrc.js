module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
	"env": {
		"browser": true,
		"node": true
	},
	"rules": {
		"semi": ["error", "never"],
		"quotes": ["error", "double"],
		"indent": ["error", "tab"],
		"no-console": 0,
		"no-param-reassign": ["error", {
			"props": true,
			"ignorePropertyModificationsFor": [
				"newParent",
				"parent",
				"child"
			]
		}],
		"no-tabs": 0
	}
};
