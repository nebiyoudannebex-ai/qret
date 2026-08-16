import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Client-side security headers (CSP is applied to the built HTML only —
// dev relies on Vite's inline React refresh preamble + HMR websocket,
// which a strict script-src would block).
function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    apply: 'build', // production builds only — never in dev
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          '<meta name="referrer" content="strict-origin-when-cross-origin" />',
          `<meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https:; img-src 'self' https: data: blob:; script-src 'self';" />`
        );
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), securityHeaders()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Allow local qret.et domain access during local development.
      allowedHosts: ['qret.et'],
    },
  };
});
