const cssnano = require("cssnano");

const mode = process.env.NODE_ENV;
const dev = mode !== "production";

module.exports = {
	plugins: [
		!dev && cssnano({
			preset: "default",
		}),
	],
};
