import PropTypes from "prop-types";
import { Menu, Card } from "antd";
import { Link, useLocation } from "react-router-dom";

const Navigation = ({ role }) => {
  let items = [];
  if (role === "MANAGE") {
    items = [
      {
        key: "1",
        label: "Đơn hàng",
        path: "/orders",
      },
      {
        key: "2",
        label: "Sản phẩm",
        path: "/products",
      },
      {
        key: "3",
        label: "Danh mục",
        path: "/categories",
      },
      {
        key: "4",
        label: "Khách hàng",
        path: "/customers",
      },
      {
        key: "5",
        label: "Nhà cung cấp",
        path: "/suppliers",
      },
      {
        key: "6",
        label: "Nhân viên",
        path: "/employees",
      },
    ];
  } else if (role === "SALES") {
    items = [
      {
        key: "1",
        label: "Tạo đơn hàng",
        path: "/create-order",
      },
      {
        key: "2",
        label: "Đơn hàng chờ xử lý",
        path: "/pending-orders",
      },
      {
        key: "3 ",
        label: "Đơn hàng của tôi",
        path: "/orders-me",
      },
    ];
  } else if (role === "SHIPPER") {
    items = [
      {
        key: "1",
        label: "Đơn hàng chờ xử lý",
        path: "/pending-orders",
      },
      {
        key: "2",
        label: "Đơn hàng của tôi",
        path: "/orders-me",
      },
      {
        key: "3",
        label: "Doanh thu cá nhân",
        path: "/revenue",
      },
    ];
  }
  const commonProfileMenu = [
    {
      key: "1",
      label: "Hồ sơ cá nhân",
      path: "/account",
    },
    {
      key: "2",
      label: "Thay đổi mật khẩu",
      path: "/change-password",
    },
  ];

  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  // Kiểm tra nếu đang ở trang cá nhân thì sử dụng menu chung
  const isUserProfilePage = location.pathname === "/account" || location.pathname === "/change-password";

  const displayMenu = isUserProfilePage ? commonProfileMenu : items;

  return (
    <Card
      style={{
        width: 220,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ borderRight: "none", padding: 0 }}
        breakpoint="lg"
      >
        {displayMenu.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Card>
  );
};

Navigation.propTypes = {
  role: PropTypes.string,
};

export default Navigation;
