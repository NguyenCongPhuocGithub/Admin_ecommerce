import "./App.css";
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axiosClient from "./libraries/axiosClient";
import Layout from "./components/layouts/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CreateOrder from "./pages/CreateOrder";
import decodeToken from "./libraries/tokenDecoding";
import EmployeePage from "./pages/EmployeePage";
import CustomerPage from "./pages/CustomerPage";
import SupplierPage from "./pages/SupplierPage";
import OrderPage from "./pages/OrderPage";
import AccountPage from "./pages/AccountPage";
import DetailOrderPage from "./pages/DetailOrderPage";
import OrderMePage from "./pages/OrderMePage";
import PendingOrderSalesPage from "./pages/PendingOrderSalesPage";
import PendingOrderShipperPage from "./pages/PendingOrderShipperPage";
import ChangePassword from "./pages/ChangePassword";
import RevenuePage from "./pages/RevenuePage";

const App = () => {
  // Sử dụng useNavigate để điều hướng trang
  const navigate = useNavigate();

  // Lấy token từ local storage
  const token = localStorage.getItem("TOKEN");

  // Sử dụng state để lưu thông tin giải mã từ token và trạng thái đã giải mã token hay chưa
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [hasDecodedToken, setHasDecodedToken] = useState(false);

  // Hàm để giải mã token và thiết lập decodedPayload
  const getDecodedPayload = () => {
    if (token && !hasDecodedToken) {// Giải mã token chỉ khi token tồn tại và chưa giải mã
      // Thiết lập token cho axiosClient để gửi trong mọi yêu cầu
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      const decodedPayload = decodeToken(token); // Sử dụng hàm decodeToken để giải mã token
      if (decodedPayload) {
        setDecodedPayload(decodedPayload);
        setHasDecodedToken(true); // Đánh dấu rằng đã giải mã token
        // Thực hiện điều hướng dựa trên vai trò ở đây
        // if (decodedPayload.typeRole === "MANAGE") {
        //   navigate("/orders");
        // }
        // if (decodedPayload.typeRole === "SALES") {
        //   navigate("/create-order");
        // }
        // if (decodedPayload.typeRole === "SALES") {
        //   navigate("/create-order");
        // }
      } else {
        // Nếu không thể giải mã token, điều hướng đến trang đăng nhập
        navigate("/login");
      }
    } else if (!token) {
      // Nếu không có token, điều hướng đến trang đăng nhập
      navigate("/login");
    }
  };

  // Sử dụng useEffect để gọi getDecodedPayload khi component được render
  useEffect(getDecodedPayload, [navigate, token, hasDecodedToken]);
  return (
    <>
      <Routes>
        {token && decodedPayload ? (
          <Route
            path="/"
            element={
              <Layout
                userRole={decodedPayload.typeRole}
                avatar={decodedPayload.avatar}
              />
            }
          >
            {decodedPayload && decodedPayload.typeRole === "MANAGE" && (
              <>
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/orders/:id" element={<DetailOrderPage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/employees" element={<EmployeePage />} />
                <Route path="/customers" element={<CustomerPage />} />
                <Route path="/suppliers" element={<SupplierPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/change-password" element={<ChangePassword/>} />
              </>
            )}
            {decodedPayload && decodedPayload.typeRole === "SALES" && (
              <>
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/pending-orders" element={<PendingOrderSalesPage/>} />
                <Route path="/orders-me" element={<OrderMePage role={decodedPayload.typeRole}/>} />
                <Route path="/orders/:id" element={<DetailOrderPage />} />
                <Route path="/revenue" element={<RevenuePage/>} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/change-password" element={<ChangePassword/>} />
              </>
            )}
            {decodedPayload && decodedPayload.typeRole === "SHIPPER" && (
              <>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/pending-orders" element={<PendingOrderShipperPage/>} />
                <Route path="/orders/:id" element={<DetailOrderPage />} />
                <Route path="/revenue" element={<RevenuePage/>} />
                <Route path="/orders-me" element={<OrderMePage role={decodedPayload.typeRole}/>} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/change-password" element={<ChangePassword/>} />
              </>
            )}
          </Route>
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}
      </Routes>
    </>
  );
};

export default App;
