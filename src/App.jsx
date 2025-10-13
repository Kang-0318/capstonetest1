import React from "react";
import Sidebar from "./components/Sidebar.jsx";
import "./index.css";
import Dashboard from "./pages/Dashboard.jsx";


function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
