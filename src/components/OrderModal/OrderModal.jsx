import { useState, useEffect } from "react";
import axiosClient from "../../libraries/axiosClient";
import styles from "./OrderModal.module.scss";
import {
  Form,
  message,
  Modal,
  Table,
  InputNumber,
  Row,
  Col,
  Button,
  AutoComplete,
} from "antd";
import PropTypes from "prop-types";
import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");
import { UserAddOutlined } from "@ant-design/icons";
import CustomerForm from "../CustomerForm/CustomerForm";

const OrderModal = ({
  data,
  handleRemoveItemCart,
  handleCancel,
  handleQuantityChangeFromParent,
  onSubmit,
  handleRemoveCart,
}) => {
  const [form] = Form.useForm();
  const [addCustomerModalVisible, setAddCustomerModalVisible] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, item) => (
        <span className={styles.name_product}>
          <Button
            style={{ padding: "0 2px", height: "22px", marginRight: "10px" }}
            danger
            onClick={() => handleRemoveItemCart(item)}
          >
            Xóa
          </Button>
          <div className={styles.detail_product}>
            <img
              className={styles.thumb}
              src={item.media?.coverImageUrl}
              alt={item.name}
            />
            <p>{item.name}</p>
          </div>
        </span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (text, item) => (
        <InputNumber
          style={{ width: "60px" }}
          min={1}
          value={item.quantity}
          step={1}
          onChange={(value) => handleQuantityChangeFromParent(item, value)}
          upHandler={
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                +
              </div>
            </div>
          }
          downHandler={
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                -
              </div>
            </div>
          }
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      responsive: ["sm"],
      render: function (text, item) {
        return <p>{numeral(item.price).format("0,0$")}</p>;
      },
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center",
      responsive: ["sm"],
      render: (text, item) => <p>{item.discount}%</p>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      render: (text, item) => {
        const amount = item.price * item.quantity * (1 - item.discount / 100);
        return numeral(amount).format("0,0$");
      },
    },
  ];

  const totalAmount = data.reduce((total, item) => {
    const amount = item.price * item.quantity * (1 - item.discount / 100);
    return total + amount;
  }, 0);

  const totalDiscount = 0;
  const totalAfterDiscount = totalAmount - totalDiscount;

  const [componentSize, setComponentSize] = useState("default");
  const [customerId, setCustomerId] = useState(null);
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const onFinish = () => {
    setLoadings([true]);
    const orderData = {
      productList: data.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    // Kiểm tra nếu customerId không phải là null, thêm trường customerId vào orderData
    if (customerId !== null) {
      orderData.customerId = customerId;
    }

    onSubmit(orderData);
  };
  // Hàm để xử lý khi tạo khách hàng mới
  const handleCreate = async (values) => {
    try {
      await axiosClient.post("/customers/create", values);
      setAddCustomerModalVisible(false);
      message.success("Tạo khách hàng mới thành công");
    } catch (error) {
      message.error("Tạo khách hàng mới thất bại");
      console.error("Lỗi khi tạo khách hàng: ", error);
    }
  };
  const handleSelectCustomer = (customerId, option) => {
    // Kiểm tra nếu option.key không phải là undefined
    if (option.key !== undefined) {
      setCustomerId(option.key);
      form.setFieldsValue({ customerId: option.key });
      console.log("««««« option »»»»»", option);
    } else {
      // Nếu option.key là undefined, gán giá trị null cho customerId
      setCustomerId(null);
      form.setFieldsValue({ customerId: null });
    }
  };

  const handleSearch = async (value) => {
    setSearchKeyword(value);
  };

  useEffect(() => {
    const searchCustomer = async () => {
      try {
        const res = await axiosClient.get(
          `/customers/search?keyword=${searchKeyword}`
        );
        const searchResults = res.data.payload || [];
        setSearchResult(searchResults);
        // console.log('««««« searchResults »»»»»', searchResults);
      } catch (error) {
        console.log(error);
      }
    };

    searchCustomer();
  }, [searchKeyword]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          size: componentSize,
        }}
        onValuesChange={onFormLayoutChange}
        size={componentSize}
        onFinish={onFinish}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={18} md={24} lg={18} xl={18}>
            <Form.Item label="Danh sách sản phẩm" name="data">
              <Table columns={columns} dataSource={data} pagination={false} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={18} md={24} lg={6} xl={6}>
            <Row gutter={[16, 16]}>
              <Col xs={20} sm={18} md={20} lg={18} xl={18}>
                <Form.Item label="Tìm kiếm khách hàng" name="customerId">
                  <AutoComplete
                    placeholder="Nhập email hoặc số điện thoại"
                    onSearch={handleSearch}
                    options={searchResult.map((item) => ({
                      value: item.fullName,
                      key: item._id,
                    }))}
                    onSelect={(option, key) =>
                      handleSelectCustomer(option, key)
                    }
                    style={{ width: "100%" }} // Đảm bảo AutoComplete rộng 100%
                  ></AutoComplete>
                </Form.Item>
              </Col>
              <Col xs={4} sm={6} md={4} lg={6} xl={6}>
                <Button
                  icon={<UserAddOutlined />}
                  type="link"
                  onClick={() => setAddCustomerModalVisible(true)}
                ></Button>
              </Col>
            </Row>

            <div className={styles.form_item}>
              <p>Tổng cộng:</p>
              <strong>{numeral(totalAmount).format("0,0$")}</strong>
            </div>
            <div className={styles.form_item}>
              <p>Chiết khấu:</p>
              <strong>{numeral(totalDiscount).format("0,0$")}</strong>
            </div>
            <div className={styles.form_item}>
              <p>Thanh toán:</p>
              <strong style={{ color: "#E31837", fontSize: "130%" }}>
                {numeral(totalAfterDiscount).format("0,0$")}
              </strong>
            </div>
            <div className={styles.act}>
              <div className={styles.delete_cart}>
                <Button danger onClick={handleRemoveCart}>
                  Xóa đơn hàng
                </Button>
              </div>
              <div className={styles.order_create}>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: "10px" }}
                  loading={loadings[0]}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
      <Modal
        title="Tạo khách hàng mới"
        open={addCustomerModalVisible}
        onCancel={() => setAddCustomerModalVisible(false)}
        footer={null}
      >
        <CustomerForm
          onSubmit={handleCreate}
          handleCancel={handleCancel}
          nameSubmit="Tạo"
        />
      </Modal>
    </>
  );
};

OrderModal.propTypes = {
  data: PropTypes.array,
  handleCancel: PropTypes.func,
  handleRemoveItemCart: PropTypes.func,
  handleQuantityChangeFromParent: PropTypes.func,
  onSubmit: PropTypes.func,
  handleRemoveCart: PropTypes.func,
};

export default OrderModal;
