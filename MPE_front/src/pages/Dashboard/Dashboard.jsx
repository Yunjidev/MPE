// pages/Dashboard/Dashboard.js
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import ErrorBoundary from "../../components/Utils/ErrorBoundary";

const Dashboard = () => {
  return (
    <div className="min-h-screen 2xl:ml-44 2xl:mr-40">
      <div className="flex lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-4 min-w-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
