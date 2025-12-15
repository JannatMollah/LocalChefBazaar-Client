import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Auth from "../pages/Auth";

import Dashboard from "../pages/dashboard/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ChefDashboard from "../pages/chef/ChefDashboard";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import ChefRoute from "./ChefRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/auth", element: <Auth /> },

      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },

      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },

      {
        path: "/chef",
        element: (
          <ChefRoute>
            <ChefDashboard />
          </ChefRoute>
        ),
      },
    ],
  },
]);

export default router;
