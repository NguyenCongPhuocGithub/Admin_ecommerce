import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
// import Footer from "../Footer/Footer";
import PropTypes from "prop-types";
const Layout = ({userRole, avatar}) => {
  return (
    <>
      <Header typeRole= {userRole} avatar={avatar}/>
        <Outlet />
      {/* <Footer /> */}
    </>
  );
};
Layout.propTypes= {
  userRole: PropTypes.string,
  avatar: PropTypes.string,
}

export default Layout;
