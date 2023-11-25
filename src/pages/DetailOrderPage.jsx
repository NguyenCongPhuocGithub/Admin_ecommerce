import { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import { useParams } from "react-router-dom";
import axiosClient from "../libraries/axiosClient";
import styles from "../pages/stylesPage/DetailOrderPage.module.scss";
import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");
import { ExclamationOutlined } from "@ant-design/icons";

const DetailOrderPage = () => {
  const { id } = useParams();
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    const getDetailOrder = async () => {
      try {
        const res = await axiosClient.get(`/orders/${id}`);
        setDetailOrder(res.data.payload || null);
      } catch (error) {
        console.log(error);
      }
    };

    getDetailOrder();
  }, [id]);

  const calculateProductTotal = (product) => {
    return product.price * product.quantity * (1 - product.discount / 100);
  };

  const calculateOrderTotal = () => {
    return detailOrder.productList.reduce(
      (total, product) => total + calculateProductTotal(product),
      0
    );
  };

  const calculateGrandTotal = () => {
    const orderTotal = calculateOrderTotal();
    const grandTotal =
      orderTotal -
      (detailOrder?.orderDiscount || 0) +
      (detailOrder?.totalFee || 0);

    return grandTotal;
  };
  // Hàm trả về thông báo trạng thái
  const getStatusMessage = (status) => {
    switch (status) {
      case "PLACED":
        return "đã đặt hàng thành công";
      case "PREPARING":
        return "đang được chuẩn bị";
      case "DELIVERING":
        return "đã giao cho đơn vị vận chuyển";
      case "COMPLETED":
        return "đã hoàn thành";
      case "CANCELED":
        return "đã được cửa hàng hủy bỏ";
      case "REJECTED":
        return "đã bị khách hàng hủy bỏ";
      case "FLAKER":
        return "đã bị boom";
      default:
        return "Unknown Status";
    }
  };

  return (
    <main className="container">
      <Card
        title={
          <div className={styles.title}>
            <p>Mã đơn hàng: {id}</p>
            <p>Đơn hàng {getStatusMessage(detailOrder?.status)}</p>
          </div>
        }
      >
        {detailOrder ? (
          <div className={styles.content}>
            <div className={styles.box_left}>
              <div className={styles.customer}>
                <strong>Thông tin khách hàng</strong>
                {detailOrder.customer !== null ? (
                  <>
                    <p>Họ và tên: {detailOrder.customer.fullName}</p>
                    <p>Số điện thoại: {detailOrder.customer.phoneNumber}</p>
                  </>
                ) : (
                  <p>
                    <ExclamationOutlined />
                  </p>
                )}
              </div>
              <div className={styles.employee}>
                <strong>Thông tin nhân viên</strong>
                {detailOrder.employee !== null ? (
                  <>
                    <p>Họ và tên: {detailOrder.employee.fullName}</p>
                    <p>Số điện thoại: {detailOrder.employee.phoneNumber}</p>
                    <p>Chức vụ: {detailOrder.employee.typeRole}</p>
                  </>
                ) : (
                  <p>
                    <ExclamationOutlined /> Đang cập nhật
                  </p>
                )}
              </div>
            </div>
            <div className={styles.box_right}>
              <strong>Chi tiết sản phẩm</strong>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <td>Sản phẩm</td>
                    <td>Số lượng</td>
                    <td>Đơn giá</td>
                    <td>Giảm giá</td>
                    <td>Thành tiền</td>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.productList.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <span>
                          <img src={product.imageProduct} alt="" />
                          <p>{product.name}</p>
                        </span>
                      </td>
                      <td>{product.quantity}</td>
                      <td>{numeral(product.price).format("0,0$")}</td>
                      <td>{product.discount}%</td>
                      <td>
                        {numeral(calculateProductTotal(product)).format("0,0$")}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4" style={{ textAlign: "right" }}>
                      Tổng tiền hàng:
                    </td>
                    <td>{numeral(calculateOrderTotal()).format("0,0$")}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" style={{ textAlign: "right" }}>
                      Chiết khấu thêm:
                    </td>
                    <td>{numeral(detailOrder.orderDiscount).format("0,0$")}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" style={{ textAlign: "right" }}>
                      Phí vận chuyển:
                    </td>
                    <td>{numeral(detailOrder.totalFee).format("0,0$")}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" style={{ textAlign: "right" }}>
                      Tổng tiền thanh toán:
                    </td>
                    <td style={{ color: "#E31837", fontSize: "120%" }}>
                      <strong>
                        {numeral(calculateGrandTotal()).format("0,0$")}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={styles.loading}>
            <Spin style={{ textAlign: "center" }} size="large" />
          </div>
        )}
      </Card>
    </main>
  );
};

export default DetailOrderPage;
