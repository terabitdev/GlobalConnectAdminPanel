import React from "react";
import { useRoutes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";
import UsersManagement from "./Pages/UsersManagement";

const ProjectRoutes = () => {
    let element = useRoutes([
        { path: "/", element: <LoginPage /> },
        { path: "/dashboard", element: <Dashboard /> }, 
        { path: "/users-management", element: <UsersManagement /> },    
    ]);
    return element;
  };
  export default ProjectRoutes;