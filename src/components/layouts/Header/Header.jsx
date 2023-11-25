import { useState } from "react";

import styles from "./Header.module.scss";
import Navigation from "../../Navigation/Navigation";
import { Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";

import PropTypes from "prop-types";
import { Link } from "react-router-dom";
const Header = ({ typeRole, avatar }) => {
  const [navVisible, setNavVisible] = useState(true);
  const toggleNavVisibility = () => {
    setNavVisible(!navVisible);
  };
  const handleLogout = () => {
    // Xóa token và refreshToken từ localStorage
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    // Điều hướng người dùng đến trang đăng nhập
    window.location.href = "/login";
  };
  const items = [
    {
      key: "1",
      label: <Link to="/account">Thông tin cá nhân</Link>,
    },
    {
      key: "2",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  return (
    <header>
      <div className={styles.header_middle}>
        <div className={styles.header_left}>
          <Link to="/orders" className={styles.header_logo}>
            <img
              src="https://statics.vincom.com.vn/http/vincom-ho/thuong_hieu/anh_logo/Jollibee.png/6ec6dd2b7a0879c9eb1b77a204436a30.webp"
              alt=""
            />
          </Link>
          <i onClick={toggleNavVisibility}>
            <MenuOutlined />
          </i>
        </div>
        <div className={styles.header_right}>
          <Dropdown
            menu={{
              items,
            }}
            placement="bottomRight"
            arrow
          >
            <img className={styles.avatar} src={avatar} alt="" />
          </Dropdown>
        </div>
      </div>
      {navVisible && (
        <nav className={styles.nav}>
          <Navigation role={typeRole} />
        </nav>
      )}
    </header>
  );
};
Header.propTypes = {
  typeRole: PropTypes.string,
  avatar: PropTypes.string,
};

export default Header;
