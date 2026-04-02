import {
  createRouter,
  createRoute,
  createRootRoute,
  createHashHistory,
  Navigate,
} from "@tanstack/react-router";
import { SlideLayout } from "./SlideLayout";
import { Title } from "./slides/Title";
import { Bullets } from "./slides/Bullets";
import { TwoColumn } from "./slides/TwoColumn";
import { GridLayout } from "./slides/GridLayout";
import { Phases } from "./slides/Phases";
import { Table } from "./slides/Table";

export const slides = [
  { path: "/1", component: Title, title: "Title" },
  { path: "/2", component: Bullets, title: "Bullets" },
  { path: "/3", component: TwoColumn, title: "Two Column" },
  { path: "/4", component: GridLayout, title: "Grid Layout" },
  { path: "/5", component: Phases, title: "Phase Cards" },
  { path: "/6", component: Table, title: "Table" },
] as const;

export const TOTAL_SLIDES = slides.length;

const rootRoute = createRootRoute({
  component: SlideLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/1" />,
});

const slideRoutes = slides.map((s) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: s.path,
    component: s.component,
  }),
);

const routeTree = rootRoute.addChildren([indexRoute, ...slideRoutes]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
