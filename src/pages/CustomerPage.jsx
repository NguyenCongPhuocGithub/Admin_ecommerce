import axiosClient from "../libraries/axiosClient";
import { useEffect, useState, useCallback } from "react";
import {
  Divider,
  Card,
  Button,
  Table,
  Pagination,
  Modal,
  message,
  Spin,
  Input,
  Form,
  Row,
  Col,
} from "antd";
import {
  WarningOutlined,
  UserAddOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import styles from "./stylesPage/CustomerPage.module.scss";
import CustomerForm from "../components/CustomerForm/CustomerForm";

import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");
const DEFAULT_LIMIT = 8;
const CustomerPage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);
  const [loading, setLoading] = useState(false);
  // Phân trang
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });
  // Get data khách hàng
  const [customers, setCustomers] = useState([]);
  // Hiển thị hộp thoại tạo khách hàng

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [noSearchResult, setNoSearchResult] = useState(false); // State để theo dõi kết quả tìm kiếm

  const searchCustomer = async (keyword) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/customers/search?keyword=${keyword}`);
      const searchResults = res.data.payload || [];
      setSearchResult(searchResults);

      // Nếu không có kết quả tìm kiếm, đặt giá trị noSearchResult thành true
      setNoSearchResult(searchResults.length === 0);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const [addCustomerModalVisible, setAddCustomerModalVisible] = useState(false);
  // Hàm để lấy danh sách khách hàng từ API
  const getCustomers = useCallback(async () => {
    try {
      const res = await axiosClient.get(
        `/customers?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      setCustomers(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalCustomer,
      }));
    } catch (error) {
      console.log(error);
    }
  }, [pagination.page, pagination.pageSize]);
  // Gọi hàm getCustomers khi component được render hoặc khi có thay đổi
  useEffect(() => {
    getCustomers();
  }, [getCustomers]);
  // Hàm để xử lý khi tạo khách hàng mới
  const handleCreate = async (values) => {
    try {
      setLoadings([true]);
      await axiosClient.post("/customers/create", values);
      if (searchResult.length > 0) {
        searchCustomer();
      }
      getCustomers();
      setAddCustomerModalVisible(false);
      message.success("Tạo khách hàng mới thành công");
      setLoadings([false]);
    } catch (error) {
      message.error("Tạo khách hàng mới thất bại");
      console.error("Lỗi khi tạo khách hàng: ", error);
      setLoadings([false]);
    }
  };
  // Hàm để xử lý để tắt Modal
  const handleCancel = () => {
    setAddCustomerModalVisible(false);
  };
  // Cấu hình cột dữ liệu của bảng
  const columns = [
    {
      title: "STT",
      rowScope: "row",
      width: "1%",
      align: "center",
      responsive: ["md"],
      render: (text, record, index) => index + 1, // Tạo STT bằng cách sử dụng biến index
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: "200px",
      render: (text, record) => (
        <span className={styles.name_customer}>
          <img
            src={record.media?.coverImageUrl}
            alt={record.fullName}
            className={styles.avatar}
          />
          {record.fullName}
        </span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      render: (text, record) => record.phoneNumber,
    },

    {
      title: "Số lần boom hàng",
      align: "center",
      dataIndex: "countCancellations",
      key: "countCancellations",
      responsive: ["md"],
      render: (text, record) => record.countCancellations,
    },
    {
      title: "Số đơn hàng",
      align: "center",
      dataIndex: "order",
      key: "countOrders",
      responsive: ["md"],
      render: (text, record) => {
        // Lọc các đơn hàng có trạng thái là "COMPLETED"
        const completedOrders = record.order.filter(
          (order) => order.status === "COMPLETED"
        );
        // Đếm số lượng đơn hàng đã hoàn thành
        const numberOfCompletedOrders = completedOrders.length;
        // Trả về số lượng đơn hàng đã hoàn thành
        return numberOfCompletedOrders;
      },
    },
    {
      title: "Số tiền đã thanh toán",
      align: "center",
      dataIndex: "order",
      key: "totalPaidAmount",
      render: (text, record) => {
        // Tính tổng số tiền đã thanh toán cho các đơn hàng có status là "PLACED"
        const totalPaidAmount = record.order.reduce((total, order) => {
          // Kiểm tra nếu đơn hàng có status là "COMPLETED"
          if (order.status === "COMPLETED") {
            // Tính tổng số tiền của mỗi đơn hàng
            const orderTotal = order.productList.reduce(
              (orderTotal, product) => {
                // Tính số tiền của từng sản phẩm trong đơn hàng
                const productTotal =
                  product.price *
                  product.quantity *
                  (1 - product.discount / 100);
                // Cộng vào tổng tiền của đơn hàng
                return orderTotal + productTotal;
              },
              0
            );

            // Trừ giảm giá của đơn hàng để có số tiền thực tế thanh toán
            const amountPaidForOrder = orderTotal - order.orderDisscount;

            // Cộng vào tổng tiền đã thanh toán của khách hàng
            return total + amountPaidForOrder;
          }

          // Nếu đơn hàng không có sttus là "PLACED", giữ nguyên giá trị total
          return total;
        }, 0);

        // Format và trả về số tiền đã thanh toán
        return (
          <p className={styles.money}>
            {numeral(totalPaidAmount).format("0,0$")}
          </p>
        );
      },
    },
  ];
  // Hàm để thay đổi trang và số lượng sản phẩm trên trang
  const onChangePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        page,
        pageSize,
      }));

      getCustomers();
    },
    [getCustomers]
  );
  const handleSearch = () => {
    searchCustomer(searchKeyword);
  };

  const handleSearchOnEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <main className="container">
      <Card>
        <Row align="middle" gutter={[16, 16]} justify="space-between">
          <Col xs={24} sm={24} md={16} lg={18} xl={12}>
            <Form.Item label="Tìm kiếm nhà cung cấp">
              <Input
                placeholder="Nhập tên hoặc email hoặc số điện thoại"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearchOnEnter}
                suffix={
                  loading ? (
                    <LoadingOutlined />
                  ) : (
                    <SearchOutlined onClick={handleSearch} />
                  )
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={5} lg={5} xl={4}>
            <Button
              icon={<UserAddOutlined />}
              type="link"
              onClick={() => setAddCustomerModalVisible(true)}
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>

        <Divider />
        {noSearchResult ? (
          <Table
            columns={columns}
            pagination={false}
            rowKey="_id"
            locale={{
              emptyText: (
                <span style={{ fontSize: "110%" }}>
                  <WarningOutlined style={{ color: "#FFC522" }} /> Không tìm
                  thấy nhân viên khả dụng
                </span>
              ),
            }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={searchResult.length > 0 ? searchResult : customers}
              pagination={false}
              rowKey="_id"
              locale={{
                emptyText: <Spin size="large" />,
              }}
            />
            {searchResult.length > 0 || customers.length === 0 ? null : (
              <div className={styles.pagination}>
                <Pagination
                  defaultCurrent={1}
                  total={pagination.total}
                  pageSize={DEFAULT_LIMIT}
                  current={pagination.page}
                  onChange={onChangePage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        title="Tạo khách hàng mới"
        open={addCustomerModalVisible}
        onCancel={() => setAddCustomerModalVisible(false)}
        footer={null}
      >
        <CustomerForm
          loading={loadings[0]}
          onSubmit={handleCreate}
          handleCancel={handleCancel}
          nameSubmit="Tạo"
        />
      </Modal>
    </main>
  );
};

export default CustomerPage;
