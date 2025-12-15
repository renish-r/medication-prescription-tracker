// src/components/layout/DashboardLayout.js
import React from "react";

function DashboardLayout({
  title,
  username,
  menuItems,
  activeKey,
  onMenuChange,
  onLogout,
  children,
}) {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">{title}</h2>
        <p className="sidebar-user">Welcome, {username}</p>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={
                "sidebar-menu-item" + (activeKey === item.key ? " active" : "")
              }
              onClick={() => onMenuChange(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
        <button className="sidebar-logout" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        {/* This is the center content area */}
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
