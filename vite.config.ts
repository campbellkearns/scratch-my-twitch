import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.svg",
                "favicon-16x16.png",
                "favicon-32x32.png",
                "apple-touch-icon.svg",
                "pwa-192x192.svg",
                "pwa-512x512.svg",
                "pwa-512x512-maskable.svg",
            ],
            manifest: {
                name: "Scratch My Twitch - Stream Profile Manager",
                short_name: "Scratch My Twitch",
                description: "One-click Twitch stream setup with custom profiles. Manage your streaming categories, titles, and tags instantly.",
                theme_color: "#86EFAC",
                background_color: "#FAFAF9",
                display: "standalone",
                orientation: "portrait-primary",
                scope: "/",
                start_url: "/",
                categories: ["productivity", "entertainment", "utilities"],
                icons: [
                    {
                        src: "pwa-192x192.svg",
                        sizes: "192x192",
                        type: "image/svg+xml",
                        purpose: "any"
                    },
                    {
                        src: "pwa-512x512.svg",
                        sizes: "512x512",
                        type: "image/svg+xml",
                        purpose: "any"
                    },
                    {
                        src: "pwa-512x512-maskable.svg",
                        sizes: "512x512",
                        type: "image/svg+xml",
                        purpose: "maskable"
                    }
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.twitch\.tv\/.*/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "twitch-api-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 5, // 5 minutes
                            },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
});