import { Middleware } from '@nuxt/types';

// @ts-ignore
const auth: Middleware = ({ route, redirect }) => {
    const isAuthenticated = Boolean(localStorage.getItem('authToken')); // Example check, replace with actual logic
    const isLoginPage = route.path === '/';

    if (!isAuthenticated && !isLoginPage) {
        // Redirect unauthenticated users to the login page
        return redirect('/');
    }

    if (isAuthenticated && isLoginPage) {
        // Redirect authenticated users trying to access the login page to the chat page
        return redirect('/chat');
    }
};

export default auth;