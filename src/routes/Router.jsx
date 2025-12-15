import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Meal from "../pages/Meals"
import MealDetails from "../pages/MealDetails";

import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ChefDashboard from "../pages/ChefDashboard";

import PrivateRoute from "./PrivateRoute";
import StripeProvider from "../providers/StripeProvider";
import Payment from "../pages/Payment";
import AdminRoute from "./AdminRoute";
import ChefRoute from "./ChefRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/auth", element: <Auth /> },
      { path: "/meals", element: <Meal />},
      {
        path: "/meals/:id",
        element: (
          <PrivateRoute>
            <MealDetails />
          </PrivateRoute>
        ),
      },

      {
        path: "/payment/:id",
        element: (
          <PrivateRoute>
            <StripeProvider>
              <Payment />
            </StripeProvider>
          </PrivateRoute>
        )

      },

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
