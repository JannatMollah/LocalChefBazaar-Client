import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Meals from "../pages/Meals";
import Auth from "../pages/Auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "meals",
        element: <Meals />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },
    ],
  },
]);

export default router;
