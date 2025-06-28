import React from "react";
import { useRoutes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";
import UsersManagement from "./Pages/UsersManagement";
import UserDetails from "./Components/UsersManagement/UserDetails";
import EventManagement from "./Pages/EventManagement";

const ProjectRoutes = () => {
    let element = useRoutes([
        { path: "/", element: <LoginPage /> },
        { path: "/dashboard", element: <Dashboard /> }, 
        { path: "/users-management", element: <UsersManagement /> },
        { path: "/users-management/user-details", element: <UserDetails /> },
        { path: "/events", element: <EventManagement /> },
    ]);
    return element;
  };
  export default ProjectRoutes;