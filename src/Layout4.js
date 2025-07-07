import React from 'react';
import Sidebar from "./Sidebar";
import Insights from "./components/Insights";
import './output.css';

export default function Layout4({ user }) {
  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1">
        <Insights user={user} />
      </div>
    </div>
  );
}