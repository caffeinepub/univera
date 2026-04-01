import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppProvider } from "./context/AppContext";
import { Admin } from "./pages/Admin";
import { Chat } from "./pages/Chat";
import { Feed } from "./pages/Feed";
import { HelpCenter } from "./pages/HelpCenter";
import { Home } from "./pages/Home";
import { HomeFeed } from "./pages/HomeFeed";
import { Landing } from "./pages/Landing";
import { Matches } from "./pages/Matches";
import { Onboarding } from "./pages/Onboarding";
import { Profile } from "./pages/Profile";
import { ProfilePage } from "./pages/ProfilePage";
import { Signup } from "./pages/Signup";
import { Subscription } from "./pages/Subscription";
import { SwipeDeck } from "./pages/SwipeDeck";

const queryClient = new QueryClient();

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: Home,
});

const homeFeedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home-feed",
  component: HomeFeed,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: Onboarding,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: SwipeDeck,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: Feed,
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches",
  component: Matches,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$id",
  component: Chat,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const subscriptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscription",
  component: Subscription,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Signup,
});

const profileViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$id",
  component: ProfilePage,
});

const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/help",
  component: HelpCenter,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  homeRoute,
  homeFeedRoute,
  onboardingRoute,
  appRoute,
  feedRoute,
  matchesRoute,
  chatRoute,
  profileRoute,
  adminRoute,
  subscriptionRoute,
  signupRoute,
  helpRoute,
  profileViewRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="min-h-[100dvh] bg-app">
          <RouterProvider router={router} />
          <Toaster />
        </div>
      </AppProvider>
    </QueryClientProvider>
  );
}
