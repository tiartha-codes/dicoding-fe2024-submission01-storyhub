import { getActiveRoute } from '../routes/url-parser.js';
import { ACCESS_TOKEN_KEY } from '../config.js';

// Get the access token from localStorage
export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

// Save the access token to localStorage
export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

// Remove the access token from localStorage
export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('removeAccessToken: error:', error); // Fixed typo in error message
    return false;
  }
}

// Routes that should only be accessible when unauthenticated
const unauthenticatedRoutesOnly = ['/login', '/register'];

// Redirect authenticated users away from unauthenticated-only routes
export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLoggedIn = !!getAccessToken();
  if (unauthenticatedRoutesOnly.includes(url) && isLoggedIn) {
    location.hash = '/'; // Redirect to home if logged in
    return null;
  }
  return page;
}

// Redirect unauthenticated users to the login page for protected routes
export function checkAuthenticatedRoute(page) {
  const isLoggedIn = !!getAccessToken();

  if (!isLoggedIn) {
    location.hash = '/login'; // Redirect to login if not logged in
    return null;
  }

  return page;
}

// Log out the user by removing the access token
export function getLogout() {
  removeAccessToken();
}