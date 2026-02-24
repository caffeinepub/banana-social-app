import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import Layout from './components/Layout';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';

const rootRoute = createRootRoute({
  component: () => <Layout><Outlet /></Layout>,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/feed' });
  },
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: FeedPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([indexRoute, feedRoute, profileRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
