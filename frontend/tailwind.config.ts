import { Config } from 'tailwindcss';

const config: Config = {
    content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
    prefix: '',
    theme: {
        extend: {
            backgroundImage: {
                'custom-grid': "url('/graph-paper.svg')",
            },
        },
    },
    plugins: [],
} satisfies Config;

export default config;
