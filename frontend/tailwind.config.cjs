/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		screens: {
			sm: "350px",
			md: "768px",
			// => @media (min-width: 768px) { ... }

			lg: "1024px",
			// => @media (min-width: 1024px) { ... }

			xl: "1280px",
			// => @media (min-width: 1280px) { ... }

			"2xl": "1536px",
		},
		extend: {
			container: {
				center: true,
				padding: "2rem",
			},
			height: {
				88: "88%",
			},
		},
		// colors: {
		// 	primaryPurple: "#605EAD",
		// 	primaryPurpleLighter: "#BDBCFF",
		// 	primaryBlue: "#E2EDFF",
		// 	primaryBlueDarker: "#96B8F3",
		// 	backgroud: "#fafafa",
		// 	darkText: "#2D2F43",
		// 	lightText: "#FFFFFF",
		// 	neutralBg: "#fafafa",
		// },
	},
	plugins: [
		// default prefix is "ui"
		require("@kobalte/tailwindcss"),

		// or with a custom prefix:
		require("@kobalte/tailwindcss")({ prefix: "kb" }),
	],
};
