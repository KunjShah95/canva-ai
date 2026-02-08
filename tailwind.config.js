export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['"Source Serif 4"', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            spacing: {
                'px': '1px',
                'hairline': '0.5px',
            },
            borderWidth: {
                'hairline': '0.5px',
            },
            colors: {
                brand: "#5F5FFD",
                "brand-dark": "#4F4FF0",
                ink: "#1A1A1A",
                "ink-soft": "#333333",
                paper: "#FFFFFF",
                "paper-dim": "#F9F9F9",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "#5F5FFD",
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
            },
            backgroundImage: {
                'dot-grid': "radial-gradient(circle, #E5E7EB 1px, transparent 1px)",
                'dot-grid-dark': "radial-gradient(circle, #374151 1px, transparent 1px)",
            }
        },
    },
    plugins: [],
}
