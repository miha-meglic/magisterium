import jwtDecode from 'jwt-decode';
import { defineNuxtRouteMiddleware, navigateTo, useCookie, useState } from '#imports';

interface DecodedJwt {
    exp?: number;
    // Add other claims as needed, e.g., userId, role
    userId?: string;
    role?: string;
    [key: string]: any; // Allow other custom claims
}

export default defineNuxtRouteMiddleware((to) => {
    const authToken = useCookie('jwt');
    const user = useState<DecodedJwt | null>('user', () => null); // Store user data
    const isLoginPage = to.path === '/login';
    const isAuthRequired = to.meta.auth !== false; // Check if route requires auth, default true

    if (authToken.value) {
        try {
            const decodedToken = jwtDecode<DecodedJwt>(authToken.value);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decodedToken.exp && decodedToken.exp > currentTime) {
                user.value = decodedToken; // Store decoded user data
            } else {
                // Token expired, clear cookie and user state
                authToken.value = null;
                user.value = null;
                console.warn('JWT token expired.');
            }
        } catch (err) {
            console.error('Invalid JWT token:', err);
            //Invalid token clear cookie and user state
            authToken.value = null;
            user.value = null;
        }
    }

    if (isAuthRequired) { // Only check for auth if required by the route
        if (!user.value && !isLoginPage) {
            // Redirect to login and store the intended route
            return navigateTo({
                path: '/login',
                query: { redirect: to.fullPath },
            });
        }
        if (user.value && isLoginPage) {
            return navigateTo('/');
        }
    } else if (user.value && isLoginPage) {
        return navigateTo('/');
    }
});
