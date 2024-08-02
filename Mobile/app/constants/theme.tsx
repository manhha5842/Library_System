import React from 'react';
import { extendTheme } from 'native-base';
export const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        background: {
            default: 'white',
        },
    },
    fontConfig: {
        Lexend: {
            100: {
                normal: "Lexend_100Thin",
            },
            200: {
                normal: "Lexend_200ExtraLight",
            },
            300: {
                normal: "Lexend_300Light",
            },
            400: {
                normal: "Lexend_400Regular",
            },
            500: {
                normal: "Lexend_500Medium",
            },
            600: {
                normal: "Lexend_600SemiBold",
            },
            700: {
                normal: 'Lexend_700Bold',
            },
            800: {
                normal: 'Lexend_800ExtraBold',
            },
            900: {
                normal: 'Lexend_900Black',
            },
        },
    },
    fonts: {
        heading: "Lexend",
        body: "Lexend",
        mono: "Lexend",
    },
});