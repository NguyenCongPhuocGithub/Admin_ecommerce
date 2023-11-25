import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Form,
  Card,
  Divider,
  Select,
  Row,
  Col,
  Collapse,
  Spin,
  DatePicker,
  Pagination,
  Input,
  Popconfirm,
  message,
} from "antd";
import PropTypes from "prop-types";
import {
  WarningOutlined,
  LoadingOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import axiosClient from "../libraries/axiosClient";
import moment from "moment";
import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");

import styles from "./stylesPage/OrderMePage.module.scss";

const { Panel } = Collapse;
const { Option } = Select;
const DEFAULT_LIMIT = 8;
const OrderMePage = ({ role }) => {
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [typeOrder, setTypeOrder] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filterResult, setFilterResult] = useState([]);
  const [noFilterResult, setNoFilterResult] = useState(false);
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });
  const [selectedStatusMap, setSelectedStatusMap] = useState({});

  const filterOrder = async () => {
    try {
      const res = await axiosClient.get("/orders/filter/me", {
        params: {
          id,
          status,
          typeOrder,
          paymentType,
          startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
          endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        },
      });
      console.log("startDate:", startDate);
      console.log("endDate:", endDate);
      const Results = res.data.payload || [];
      setFilterResult(Results);
      setNoFilterResult(Results.length === 0);
    } catch (error) {
      console.error("Lỗi khi gọi API: ", error);
    }
  };
  const getOrder = useCallback(async () => {
    try {
      const res = await axiosClient.get(
        `/orders/me?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      setOrders(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalOrder,
      }));
    } catch (error) {
      console.log(error);
    }
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  const onChangePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        page,
        pageSize,
      }));
      getOrder();
    },
    [getOrder]
  );

  const handleFilter = () => {
    filterOrder(id, status, typeOrder, paymentType, startDate, endDate);
  };

  const handleFilterOnEnter = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };
  const setSelectedStatus = (record, value) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [record._id]: value,
    }));
  };
  const handleUpdateStatus = async (record) => {
    const status = selectedStatusMap[record._id];
    if (status) {
      try {
        await axiosClient.patch(`/orders/status/${record._id}`, {
          newStatus: status,
        });
        getOrder();
        message.success("Cập nhật trạng thái đơn hàng thành công");
      } catch (error) {
        message.error("Cập nhật trạng thái đơn hàng thất bại");
        console.error("Lỗi khi cập nhật trạng thái đơn hàng: ", error);
      }
    } else {
      message.warning("Vui lòng chọn trạng thái trước khi xác nhận");
    }
  };
  const getStatusContent = (record) => {
    if (record.status === "COMPLETED") {
      return moment(record.updatedAt).format("DD/MM/YYYY");
    }
    if (
      record.status === "PLACED" ||
      record.status === "DELIVERING" ||
      record.status === "PREPARED"
    ) {
      return (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      );
    } else {
      return (
        <p style={{ color: "#E31837", fontSize: "120%" }}>
          <CloseOutlined />
        </p>
      );
    }
  };
  const columns = [
    {
      title: "STT",
      rowScope: "row",
      width: "1%",
      align: "center",
      responsive: ["sm"],
      render: function (text, record, index) {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      render: (text, record) => (
        <a href={`/orders/${record._id}`}>{record._id}</a>
      ),
    },
    // {
    //   title: "Hình thức mua hàng",
    //   dataIndex: "isOnline",
    //   key: "isOnline",
    //   align: "center",
    //   responsive: ["lg"],
    //   render: (text, record) => (
    //     <p>{record.isOnline ? "Trực tuyến" : "Trực tiếp"}</p>
    //   ),
    //   // Ẩn cột nếu role không phải là "SALES"
    //   className: role !== "SALES" ? styles.hiddenColumn : "",
    // },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      align: "center",
      
      render: (text, record) => {
        const statusText = {
          PLACED: "Đã đặt hàng",
          PREPARED: "Đã chuẩn bị xong",
          DELIVERING: "Đang vận chuyển",
          COMPLETED: "Đã hoàn thành",
          CANCELED: "Cửa hàng hủy",
          REJECTED: "Khách hàng hủy",
          FLAKER: "Boom hàng",
        }[record.status];
        const getStatusColor = (status) => {
          switch (status) {
            case "PLACED":
              return "blue";
            case "COMPLETED":
              return "green";
            case "DELIVERING":
              return "#FF8E5B";
            case "PREPARED":
              return "#FFC522";
            default:
              return "#E31837";
          }
        };
        return (
          <p
            style={{
              color: getStatusColor(record.status),
              border: `1px solid ${getStatusColor(record.status)}`,
              borderRadius: "8px",
            }}
          >
            {statusText}
          </p>
        );
      },
    },
    {
      title: role === "SALES" ? "Ngày tạo đơn" : "Ngày tiếp nhận đơn",
      dataIndex: role === "SALES" ? "createdDate" : "updatedAt",
      key: role === "SALES" ? "createdDate" : "updatedAt",
      align: "center",
      responsive: ["lg"],
      render: (text, record) => (
        <p>
          {moment(
            role === "SALES" ? record.createdDate : record.updatedAt
          ).format("DD/MM/YYYY")}
        </p>
      ),
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      responsive: ["lg"],
      render: (text, record) => <p>{getStatusContent(record)}</p>,
    },
    {
      title: "Tổng số tiền",
      align: "right",
      responsive: ["sm"],
      render: (text, record) => {
        const orderTotal = record.productList.reduce((orderTotal, product) => {
          // Tính số tiền của từng sản phẩm trong đơn hàng
          const productTotal =
            product.price * product.quantity * (1 - product.discount / 100);
          // Cộng vào tổng tiền của đơn hàng
          return orderTotal + productTotal;
        }, 0);

        // Trừ giảm giá của đơn hàng để có số tiền thực tế thanh toán
        const amountPaidForOrder =
          orderTotal - (record.orderDisscount || 0) + (record.totalFee || 0);
        return numeral(amountPaidForOrder).format("0,0$");
      },
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      align: "center",
      render: (text, record) => {
        const statusText = {
          CASH: "Tiền mặt",
          CARD: "Thẻ NH",
        }[record.paymentType]; // Sửa 'status' thành 'paymentType'

        return <span>{statusText}</span>; // Sửa { statusText } thành <span>{statusText}</span>
      },
    },
    {
      title: "Cập nhật trạng thái",
      key: "action",
      align: "center",
      render: (text, record) => {
        // Kiểm tra xem status có phải là "DELIVERING" không
        if (record.status === "DELIVERING") {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Select
                style={{ width: "140px", marginRight: "10px" }}
                placeholder="Trạng thái"
                value={selectedStatusMap[record._id]}
                onChange={(value) => setSelectedStatus(record, value)}
              >
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="FLAKER">Boom đơn hàng</Option>
              </Select>
              <Popconfirm
                placement="topRight"
                title={`Xác nhận thay đổi trạng thái đơn hàng ${record._id}?`}
                onConfirm={() => handleUpdateStatus(record)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="dashed" icon={<CheckOutlined />} />
              </Popconfirm>
            </div>
          );
        }

        // Nếu status không phải là "DELIVERING", hiển thị một component hoặc giá trị khác
        return <span>Không được cập nhật</span>;
      },
      // Ẩn cột nếu role là "SALES" hoặc status không phải là "DELIVERING"
      className: role === "SALES" ? styles.hiddenColumn : "",
    },
  ];
  const clearFilters = () => {
    setId("");
    setStatus("");
    setTypeOrder("");
    setPaymentType("");
    setStartDate(null);
    setEndDate(null);
    getOrder();
  };
  return (
    <main className="container">
      <Card>
        <Collapse
          bordered={false}
          // defaultActiveKey={["searchFilter"]}
          style={{ backgroundColor: "#E6F4FF" }}
        >
          <Panel
            header="Bộ lọc tìm kiếm đơn hàng:"
            key="searchFilter"
            showArrow={false}
          >
            <div className={styles.filter}>
              <Form>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Mã đơn hàng">
                      <Input
                        placeholder="Nhập mã đơn hàng"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        onPressEnter={handleFilterOnEnter}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Hình thức thanh toán">
                      <Select
                        placeholder="Chọn hình thức thanh toán"
                        value={paymentType}
                        onChange={(value) => setPaymentType(value)}
                      >
                        <Option value="CASH">Tiền mặt</Option>
                        <Option value="CARD">Thẻ</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Hình thức mua hàng">
                      <Select
                        placeholder="Chọn hình thức mua hàng"
                        value={typeOrder}
                        onChange={(value) => setTypeOrder(value)}
                      >
                        <Option value={true}>Trực tuyến</Option>
                        <Option value={false}>Trực tiếp</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="Trạng thái">
                      <Select
                        placeholder="Chọn trạng thái"
                        value={status}
                        onChange={(value) => setStatus(value)}
                      >
                        <Option value="COMPLETED">Đã hoàn thành</Option>
                        <Option value="DELIVERING">Đang vận chuyển</Option>
                        <Option value="PREPARING">Đang chuẩn bị</Option>
                        <Option value="PLACED">Đã đặt hàng</Option>
                        <Option value="CANCELED">Shop hủy</Option>
                        <Option value="REJECTED">KH hủy</Option>
                        <Option value="FLAKER">Boom hàng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Từ ngày">
                      <DatePicker
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Đến ngày">
                      <DatePicker
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Button type="primary" onClick={handleFilter}>
                      Lọc
                    </Button>
                    <Button
                      onClick={clearFilters}
                      style={{ marginLeft: "10px" }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Panel>
        </Collapse>
        <Divider />
        {noFilterResult ? (
          <Table
            style={{ backgroundColor: "#E6F4FF" }}
            columns={columns}
            pagination={false}
            rowKey="_id"
            locale={{
              emptyText: (
                <span style={{ fontSize: "110%" }}>
                  <WarningOutlined style={{ color: "#FFC522" }} /> Không tìm
                  thấy đơn hàng khả dụng
                </span>
              ),
            }}
          />
        ) : (
          <>
            <Table
              style={{ backgroundColor: "#E6F4FF"}}
              columns={columns}
              dataSource={filterResult.length > 0 ? filterResult : orders}
              pagination={false}
              rowKey="_id"
              locale={{
                emptyText: <Spin size="large" />,
              }}
            />
            {filterResult.length > 0 || orders.length === 0 ? null : (
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
    </main>
  );
};
OrderMePage.propTypes = {
  role: PropTypes.string,
};

export default OrderMePage;
