import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "masked-icon.svg",
            ],
            manifest: {
                name: "Scratch My Twitch",
                short_name: "ScratchMyTwitch",
                description:
                    "Manage your Twitch stream info with one-click updates",
                theme_color: "#86EFAC",
                background_color: "#FAFAF9",
                display: "standalone",
                scope: "/",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
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
});
