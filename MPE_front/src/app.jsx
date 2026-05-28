import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFound";
import EnterpriseBooking from "./pages/EnterpriseBooking/EnterpriseBooking";
import { useState } from "react";
import { Provider } from "jotai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocketIo } from "./services/UseSocketIo";
import AuthInitializer from "./context/AuthInitializer";

// Context Providers
import { UserProvider } from "./context/UserContext";
import { ModalProvider } from "./context/ModalContext";
import ScrollToTop from "./context/Scrolltotop";

// Components
import NavBar from "./components/Navbar/navbar";
import Footer from "./components/Footer/footer";
import Pricing_page from "./components/pricing_page/pricing_page";

// Pages
import HomeClient from "./pages/home/HomeClient";
import Contact from "./pages/contact/contact";
import SearchEntreprise from "./pages/searchentreprises/SearchEntreprise";
import FAQ from "./pages/FAQ/FAQ";
import RegisterCompany from "./pages/user/registercompany";
import EnterprisePage from "./pages/EnterpriseShow/EnterpriseShow";
import CookieBanner from "./pages/NotificationBanner/NotificationBanner";
import CookiePolicies from "./pages/Policies/CookiePolicies";
import LegalNotices from "./pages/Policies/LegalNotices";
import ConfidentialityPolicies from "./pages/Policies/ConfidentialityPolicies";
import UsagePolicies from "./pages/Policies/UsagePolicies";

// User Pages
import Signup from "./components/User/signup";
import Signin from "./components/User/signin";
import UpdateCompany from "./pages/user/updatecompany";

// Dashboard Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import User_db from "./pages/DashboardUser/User_db";
import AcceptCompanyPage from "./pages/DashboardAdmin/Accept_company";
import Company from "./pages/DashboardAdmin/ValidatedCompaniesPage";
import ManageUser from "./pages/DashboardAdmin/UsersPage";
import DeleteAccount from "./components/DashboardUser/DeleteAccount";
import UpdatePassWord from "./components/DashboardUser/UpdatePassword";
import ForgotPasswordForm from "./pages/user/ForgotPassword.jsx";
import ResetPassword from "./pages/user/ResetPassword";
import Planning from "./pages/user/Planning";
import StatsEnterprises from "./pages/DashboardEnterprise/StatsEnterprises";
import OffersPage from "./pages/DashboardEnterprise/OffersPage";
import SubscribePage from "./pages/subscribe/SubscribePage";
import SubscribeSuccess from "./pages/subscribe/SubscribeSuccess";
import Admindb from "./pages/DashboardAdmin/Admin_db";
import CreateJobsandCountry from "./pages/DashboardAdmin/CreateJobsandCountry";
import AdminDashboard from "./pages/DashboardAdmin/Admin_db";
import SubscriptionManagement from "./pages/DashboardAdmin/SubscriptionManagement";

// Protected Routes
import AuthenticatedRoute from "./context/AuthenticatedRoute";
import EntrepreneurRoute from "./context/EntrepreneurRoute";
import AdminRoute from "./context/AdminRoute";
import OfferList from "./components/DashboardEnterprise/OffersList";
import ReservationsList from "./components/DashboardEnterprise/ReservationsList";

function App() {
  useSocketIo();

  return (
    <Provider>
      <AuthInitializer>
        <UserProvider>
          <ModalProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AppContent />
              <ToastContainer />
            </BrowserRouter>
          </ModalProvider>
        </UserProvider>
      </AuthInitializer>
    </Provider>
  );
}

function AppContent() {
  const location = useLocation();
  const [isDashboardRoute, setIsDashboardRoute] = useState(false);
  const [isFullWidthRoute, setIsFullWidthRoute] = useState(false);

  useEffect(() => {
    setIsDashboardRoute(location.pathname.startsWith("/dashboard"));
    setIsFullWidthRoute(
      location.pathname === "/" || location.pathname === "/searchentreprise"
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <CookieBanner />
      <main
        className={
          isDashboardRoute || isFullWidthRoute
            ? "flex-1 w-full"
            : "flex-1 lg:container mx-auto 2xl:w-5/6 w-full"
        }
      >
        <Routes>
          <Route path="/" element={<HomeClient />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/searchentreprise" element={<SearchEntreprise />} />
          <Route path="/cookie-policies" element={<CookiePolicies />} />
          <Route path="/legal-notices" element={<LegalNotices />} />
          <Route path="/condifentiality-policies" element={<ConfidentialityPolicies />} />
          <Route path="/usage-policies" element={<UsagePolicies />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/pricing" element={<Pricing_page />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/subscribe/success" element={<SubscribeSuccess />} />
          <Route path="/enterprise/:slug" element={<EnterprisePage />} />
          <Route path="/enterprise/:slug/booking" element={<EnterpriseBooking />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Routes protégées pour les utilisateurs authentifiés */}
          <Route element={<AuthenticatedRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<User_db />} />
              <Route path="user-db" element={<User_db />} />
              <Route path="register-company" element={<RegisterCompany />} />
              <Route path="update-password" element={<UpdatePassWord />} />
              <Route path="deleteAccount" element={<DeleteAccount />} />
              {/* Routes protégées pour les entrepreneurs */}
              <Route element={<EntrepreneurRoute />}>
                <Route path="enterprise/:slug/edit" element={<UpdateCompany />} />
                <Route path="enterprise/:slug/offer" element={<OfferList />} />
                <Route path="enterprise/:slug/planning" element={<Planning />} />
                <Route path="enterprise/:slug/reservations" element={<ReservationsList />} />
                <Route path="enterprise/:slug/dashboard" element={<StatsEnterprises />} />
                <Route path="enterprise/:slug/offers" element={<OffersPage />} />
              </Route>
              {/* Routes protégées pour les administrateurs */}
              <Route element={<AdminRoute />}>
                <Route path="accept-company" element={<AcceptCompanyPage />} />
                <Route path="manage-companies" element={<Company />} />
                <Route path="manage-users" element={<ManageUser />} />
                <Route path="jobsandcountrycreate" element={<CreateJobsandCountry />} />
                <Route path="admin-overview" element={<AdminDashboard />} />
                <Route path="admin-db" element={<Admindb />} />
                <Route path="subscriptionmanagement" element={<SubscriptionManagement />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
