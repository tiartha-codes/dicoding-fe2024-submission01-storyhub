import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/util-auth';


const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/about': () => checkUnauthenticatedRouteOnly(new AboutPage()),
};

export default routes;
