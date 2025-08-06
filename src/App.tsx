import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import CustomerTable from "./components/sales/customers/CustomerTables/CustomerTable";
import VendorTable from "./components/purchase/vendors/VendorTable/VendorTable";
import Invoice from "./components/sales/invoice/Invoice";
import ExpenseTable from "./components/purchase/expenses/ExpenseTable/ExpenseTable";
import BookingDetails from "./components/sales/customers/BookingDetails/Booking Details";
import RoomTable from "./components/rooms/RoomsTable/RoomsTable";
import RoomDetails from "./components/rooms/RoomDetails/RoomDetails";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />

           
           

            {/* Tables */}
           
            <Route path="/customer-tables" element={<CustomerTable />} />
            <Route path="/vendor-tables" element={<VendorTable />} />
            <Route path="/expenses" element={<ExpenseTable />} />
            <Route path="/invoices" element={<Invoice />} />
            <Route path="/rooms" element={<RoomTable />} />
            <Route path="/details" element={<BookingDetails/>} />
            <Route path="/bookings" element={<BookingDetails />} />
            
            {/* Customers */}

            {/* room */}
            
            <Route path="/rooms" element={<RoomTable />} />
            <Route path="/room-details/:roomId" element={<RoomDetails />} />

            

            
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
