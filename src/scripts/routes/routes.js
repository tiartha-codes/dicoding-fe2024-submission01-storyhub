// routes.js
import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import NewStoryPage from '../pages/new-story/new-story-page';
import DetailStoryPage from '../pages/detail-story/detail-story-page'; // Import DetailStoryPage
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/util-auth';

const routes = {
    '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
    '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
    '/': () => checkAuthenticatedRoute(new HomePage()),
    '/about': () => checkUnauthenticatedRouteOnly(new AboutPage()),
    '/new-story': () => checkAuthenticatedRoute(new NewStoryPage()),
    '/detail/:id': () => checkAuthenticatedRoute(new DetailStoryPage()), // Tambahkan rute detail dengan parameter ID
};

export default routes;