import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Meals from "../pages/Meals";
import MealDetails from "../pages/MealDetails";
import OrderPage from "../pages/OrderPage";
import Payment from "../pages/Payment";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";

// Dashboard Layouts
import DashboardLayout from "../layouts/DashboardLayout";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import ChefDashboardLayout from "../layouts/ChefDashboardLayout";

// User Dashboard Pages
import UserProfile from "../pages/dashboard/user/UserProfile";
import MyOrders from "../pages/dashboard/user/MyOrders";
import MyReviews from "../pages/dashboard/user/MyReviews";
import FavoriteMeals from "../pages/dashboard/user/FavoriteMeals";
import TrackOrder from "../pages/dashboard/user/TrackOrder";

// Chef Dashboard Pages
import ChefProfile from "../pages/dashboard/chef/ChefProfile";
import CreateMeal from "../pages/dashboard/chef/CreateMeal";
import ChefMeals from "../pages/dashboard/chef/ChefMeals";
import OrderRequests from "../pages/dashboard/chef/OrderRequests";

// Admin Dashboard Pages
import AdminProfile from "../pages/dashboard/admin/AdminProfile";
import ManageUsers from "../pages/dashboard/admin/ManageUsers";
import ManageRequests from "../pages/dashboard/admin/ManageRequests";
import PlatformStatistics from "../pages/dashboard/admin/PlatformStatistics";

// Shared Components
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import ChefRoute from "./ChefRoute";
import StripeProvider from "../providers/StripeProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/auth", element: <Auth /> },
      { path: "/meals", element: <Meals /> },
      {
        path: "/meals/:id",
        element: (
          <PrivateRoute>
            <MealDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/cart",
        element: (
          <PrivateRoute>
             <Cart />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        ),
      },
      {
        path: "/order/:id",
        element: (
          <PrivateRoute>
            <OrderPage />
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
        ),
      },
    ],
  },

  // 📌 USER DASHBOARD ROUTES
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <UserProfile /> },
      { path: "profile", element: <UserProfile /> },
      { path: "orders", element: <MyOrders /> },
      { path: "reviews", element: <MyReviews /> },
      { path: "favorites", element: <FavoriteMeals /> },
      { path: "tracking", element: <TrackOrder /> },
    ],
  },

  // 📌 CHEF DASHBOARD ROUTES
  {
    path: "/chef-dashboard",
    element: (
      <ChefRoute>
        <ChefDashboardLayout />
      </ChefRoute>
    ),
    children: [
      { index: true, element: <ChefProfile /> },
      { path: "profile", element: <ChefProfile /> },
      { path: "create-meal", element: <CreateMeal /> },
      { path: "my-meals", element: <ChefMeals /> },
      { path: "order-requests", element: <OrderRequests /> },
    ],
  },

  // 📌 ADMIN DASHBOARD ROUTES
  {
    path: "/admin-dashboard",
    element: (
      <AdminRoute>
        <AdminDashboardLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminProfile /> },
      { path: "profile", element: <AdminProfile /> },
      { path: "manage-users", element: <ManageUsers /> },
      { path: "manage-requests", element: <ManageRequests /> },
      { path: "statistics", element: <PlatformStatistics /> },
    ],
  },

  // 📌 404 Page (Optional but recommended)
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <p className="text-gray-600 mt-2">Page not found</p>
        </div>
      </div>
    ),
  },
]);

export default router;