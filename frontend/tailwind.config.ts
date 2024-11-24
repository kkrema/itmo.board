import { Config } from 'tailwindcss';

const config: Config = {
    content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
    prefix: '',
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;

export default config;
