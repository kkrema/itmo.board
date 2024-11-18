import { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'custom-grid': "url('/graph-paper.svg')",
            },
        },
    },
    plugins: [],
};

export default config;
