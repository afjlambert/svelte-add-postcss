const { Preset } = require("use-preset");

const preprocessor = `preprocess: [
		sveltePreprocess({
			defaults: {
				style: "postcss",
			},
			postcss: true
		}),
	]`;

module.exports = Preset.make("svelte-add-postcss")
	.copyTemplates("ask")
	.editJson("package.json")
		.merge({
			devDependencies: {
				"@snowpack/plugin-build-script": "^2.0.11",
				"cssnano": "^4.1.10",
				"postcss": "^8.1.6",
				"postcss-load-config": "^3.0.0",
				"postcss-cli": "^8.2.0",
				// https://github.com/babichjacob/svelte-add-tailwindcss/issues/1
				"snowpack": "2.17.0",
				"svelte-preprocess": "^4.5.2",
			},
			// https://github.com/babichjacob/svelte-add-tailwindcss/issues/1
			resolutions: {
				"snowpack": "2.17.0",
			}
		})
		.chain()
	.edit(["svelte.config.js"])
		.replace(/^(.+)$/s)
		.with({
			replacer: (match) => {
				let result = match;

				if (match.includes("preprocess:")) {
					result = result.replace("preprocess: sveltePreprocess()", preprocessor);
				} else {
					result = `const sveltePreprocess = require` + `("svelte-preprocess");\n${result}`;
					result = result.replace("adapter:", `${preprocessor},\n\tadapter:`);
				}

				return result;
			}
		})
		.chain()
	.edit(["snowpack.config.js"])
		.replace(/^(.+)$/s)
		.with({
			replacer: (match) => {
				let result = match;

				if (match.includes("plugins:")) {
					result = result.replace(`plugins: ['@snowpack/plugin-typescript']`, `plugins: ['@snowpack/plugin-typescript', ["@snowpack/plugin-build-script", { "cmd": "postcss", "input": [".css", ".pcss"], "output": [".css"] }]]`)
				} else {
					result = result.replace("extends:", `plugins: [["@snowpack/plugin-build-script", { "cmd": "postcss", "input": [".css", ".pcss"], "output": [".css"] }]],\n\textends:`);
				}

				return result;
			}
		})
		.chain()
	.installDependencies()
