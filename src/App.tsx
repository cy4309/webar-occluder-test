import { lazy, Suspense } from "react";
import "@/assets/styles/app.css";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import Home from "@/pages/Home";
import { router_path } from "@/routers";
import LoadingIndicator from "@/components/LoadingIndicator";
import BaseLayout from "@/layouts/BaseLayout";

const Error = lazy(() => import("@/pages/Error"));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingIndicator />}>{children}</Suspense>
);

const App: React.FC = () => {
  const routers = createBrowserRouter([
    {
      element: (
        <BaseLayout>
          <SuspenseWrapper>
            <Outlet />
          </SuspenseWrapper>
        </BaseLayout>
      ),
      children: [
        {
          index: true,
          path: router_path.index,
          element: <Home key="Home" />,
        },
        {
          path: router_path.error,
          element: <Error key="Error" />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={routers} />
    </>
  );
};

export default App;
