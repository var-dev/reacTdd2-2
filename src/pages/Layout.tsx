import React from "react";
import { Link, Outlet } from "react-router-dom";

void React;

export default function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  );
}
