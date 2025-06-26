import React from "react";
import { useRoutes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";

const ProjectRoutes = () => {
    let element = useRoutes([
        { path: "/", element: <LoginPage /> },
        { path: "/dashboard", element: <Dashboard /> },     
    ]);
    return element;
  };
  export default ProjectRoutes;