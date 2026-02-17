import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#FEF5F2',
  				'100': '#FCE8E1',
  				'200': '#F9D5C9',
  				'300': '#F4B8A3',
  				'400': '#EC9474',
  				'500': '#E07856',
  				'600': '#CC5A38',
  				'700': '#AB462B',
  				'800': '#8D3B28',
  				'900': '#753526',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#FDF9F7',
  				'100': '#FAF0EA',
  				'200': '#F4D5C6',
  				'300': '#EEBDA8',
  				'400': '#E49B7D',
  				'500': '#D87B5A',
  				'600': '#C45F42',
  				'700': '#A34A35',
  				'800': '#863F30',
  				'900': '#6F372B',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			cream: {
  				'50': '#FEFDFB',
  				'100': '#FAF9F6',
  				'200': '#F5F3EF',
  				'300': '#E8E4DD',
  				'400': '#D4CFC4',
  				'500': '#B8B1A4',
  				'600': '#9A9285',
  				'700': '#7D766A',
  				'800': '#665F55',
  				'900': '#524D44'
  			},
  			charcoal: {
  				DEFAULT: '#2D2D2D',
  				light: '#6B6B6B',
  				muted: '#8F8F8F'
  			},
  			success: {
  				DEFAULT: '#6B9E78',
  				light: '#E8F5EB',
  				dark: '#4A7A55'
  			},
  			error: {
  				DEFAULT: '#D66B6B',
  				light: '#FCEAEA',
  				dark: '#B54545'
  			},
  			code: {
  				bg: '#F7F5F2',
  				border: '#E8E4DD'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Menlo',
  				'monospace'
  			],
  			display: [
  				'Plus Jakarta Sans',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'12px',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			sm: [
  				'14px',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			base: [
  				'16px',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			lg: [
  				'18px',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			xl: [
  				'20px',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			'2xl': [
  				'24px',
  				{
  					lineHeight: '1.4'
  				}
  			],
  			'3xl': [
  				'30px',
  				{
  					lineHeight: '1.3'
  				}
  			],
  			'4xl': [
  				'36px',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			'5xl': [
  				'48px',
  				{
  					lineHeight: '1.1'
  				}
  			],
  			'6xl': [
  				'60px',
  				{
  					lineHeight: '1.05'
  				}
  			],
  			'7xl': [
  				'72px',
  				{
  					lineHeight: '1'
  				}
  			],
  			'8xl': [
  				'96px',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		lineHeight: {
  			relaxed: '1.6',
  			loose: '1.75'
  		},
  		spacing: {
  			'0.5': '2px',
  			'1': '4px',
  			'1.5': '6px',
  			'2': '8px',
  			'2.5': '10px',
  			'3': '12px',
  			'4': '16px',
  			'5': '20px',
  			'6': '24px',
  			'7': '28px',
  			'8': '32px',
  			'9': '36px',
  			'10': '40px',
  			'11': '44px',
  			'12': '48px',
  			'14': '56px',
  			'16': '64px',
  			'18': '72px',
  			'20': '80px',
  			'24': '96px',
  			'28': '112px',
  			'32': '128px'
  		},
  		borderRadius: {
  			lg: '8px',
  			md: '6px',
  			sm: '4px',
  			xl: '12px',
  			'2xl': '16px',
  			'3xl': '20px',
  			'4xl': '24px',
  			full: '9999px'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgba(45, 45, 45, 0.05)',
  			DEFAULT: '0 2px 8px -2px rgba(45, 45, 45, 0.08), 0 2px 4px -2px rgba(45, 45, 45, 0.04)',
  			md: '0 4px 12px -4px rgba(45, 45, 45, 0.1), 0 4px 6px -4px rgba(45, 45, 45, 0.05)',
  			lg: '0 8px 24px -8px rgba(45, 45, 45, 0.12), 0 8px 12px -8px rgba(45, 45, 45, 0.06)',
  			xl: '0 16px 40px -12px rgba(45, 45, 45, 0.15), 0 12px 20px -12px rgba(45, 45, 45, 0.08)',
  			'2xl': '0 24px 50px -16px rgba(45, 45, 45, 0.18)',
  			warm: '0 4px 14px -4px rgba(224, 120, 86, 0.25)',
  			'warm-lg': '0 8px 24px -6px rgba(224, 120, 86, 0.3)',
  			inner: 'inset 0 2px 4px 0 rgba(45, 45, 45, 0.05)',
  			none: 'none'
  		},
  		transitionDuration: {
  			DEFAULT: '200ms',
  			fast: '150ms',
  			slow: '300ms'
  		},
  		transitionTimingFunction: {
  			DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  			smooth: 'cubic-bezier(0.22, 1, 0.36, 1)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'fade-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			pulse: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			'progress-indeterminate': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(400%)'
  				}
  			},
  			shake: {
  				'0%, 100%': {
  					transform: 'translateX(0)'
  				},
  				'10%, 30%, 50%, 70%, 90%': {
  					transform: 'translateX(-4px)'
  				},
  				'20%, 40%, 60%, 80%': {
  					transform: 'translateX(4px)'
  				}
  			},
  			'bounce-subtle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-up': 'fade-up 0.3s ease-out',
  			'scale-in': 'scale-in 0.2s ease-out',
  			shimmer: 'shimmer 2s infinite linear',
  			pulse: 'pulse 2s ease-in-out infinite',
  			'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
  			shake: 'shake 0.5s ease-in-out',
  			'bounce-subtle': 'bounce-subtle 0.5s ease-in-out'
  		},
  		backdropBlur: {
  			xs: '2px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
