import React from "react";
import { useRoutes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";
import UsersManagement from "./Pages/UsersManagement";
import UserDetails from "./Components/UsersManagement/UserDetails";
import EventManagement from "./Pages/EventManagement";
import AddEvent from "./Components/EventManagement/AddEvent";
import RestaurantManagement from "./Pages/RestaurantManagement";
import AddRestaurant from "./Components/RestaurantManagement/AddRestaurant";
import TipsManagement from "./Pages/TipsManagement";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const ProjectRoutes = () => {
    let element = useRoutes([
        { 
            path: "/", 
            element: (
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            ) 
        },
        { 
            path: "/dashboard", 
            element: (
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            ) 
        }, 
        { 
            path: "/users-management", 
            element: (
                <ProtectedRoute>
                    <UsersManagement />
                </ProtectedRoute>
            ) 
        },
        { 
            path: "/users-management/user-details", 
            element: (
                <ProtectedRoute>
                    <UserDetails />
                </ProtectedRoute>
            ) 
        },
        { 
            path: "/events", 
            element: (
                <ProtectedRoute>
                    <EventManagement />
                </ProtectedRoute>
            ) 
        },
        { 
            path: "/events/add-event", 
            element: (
                <ProtectedRoute>
                    <AddEvent />
                </ProtectedRoute>
            ) 
        },
        { 
            path: "/restaurants", 
            element: (
                <ProtectedRoute>
                    <RestaurantManagement />
                </ProtectedRoute>
            ) 
        },
        { 
            path: "/restaurants/add-restaurant", 
            element: (
                <ProtectedRoute>
                    <AddRestaurant />
                </ProtectedRoute>
            ) 
        },
        { 
            path: "/tips", 
            element: (
                <ProtectedRoute>
                    <TipsManagement />
                </ProtectedRoute>
            ) 
        },
    ]);
    return element;
  };
  export default ProjectRoutes;