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
  DatePicker,
  Pagination,
  Input,
  Popconfirm,
  message,
} from "antd";
import { WarningOutlined, CheckOutlined } from "@ant-design/icons";
import axiosClient from "../libraries/axiosClient";
import moment from "moment";
import numeral from "numeral";
import "numeral/locales/vi";
import styles from "./stylesPage/ProductPage.module.scss";

const { Panel } = Collapse;
const { Option } = Select;
numeral.locale("vi");

const DEFAULT_LIMIT = 8;

const PendingOrderSalesPage = () => {
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [typeOrder, setTypeOrder] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filterResult, setFilterResult] = useState([]);
  const [noFilterResult, setNoFilterResult] = useState(false);
  const [selectedStatusMap, setSelectedStatusMap] = useState({});
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });

  const filterOrder = async () => {
    try {
      const res = await axiosClient.get("/orders/filter", {
        params: {
          id,
          status,
          typeOrder,
          paymentType,
          startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
          endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        },
      });
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
        `/orders/pending-sales?page=${pagination.page}&pageSize=${pagination.pageSize}&status=PLACED`
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
    filterOrder();
  };

  const handleFilterOnEnter = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
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

  const setSelectedStatus = (record, value) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [record._id]: value,
    }));
  };

  const columns = [
    {
      title: "STT",
      rowScope: "row",
      width: "1%",
      align: "center",
      responsive: ["xl"],
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
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      width: "150px",
      key: "status",
      align: "center",
      responsive: ["sm"],
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
              return "orange";
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
      title: "Ngày tạo đơn",
      dataIndex: "createdDate",
      key: "createdDate",
      align: "center",
      responsive: ["sm"],
      render: (text, record) => (
        <p>{moment(record.createdDate).format("DD/MM/YYYY")}</p>
      ),
    },
    {
      title: "Tổng số tiền",
      align: "right",
      responsive: ["sm"],
      render: (text, record) => {
        const orderTotal = record.productList.reduce((orderTotal, product) => {
          const productTotal =
            product.price * product.quantity * (1 - product.discount / 100);
          return orderTotal + productTotal;
        }, 0);
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
      responsive: ["xl"],
      render: (text, record) => {
        const statusText = {
          CASH: "Tiền mặt",
          CARD: "Thẻ NH",
        }[record.paymentType];
        return <span>{statusText}</span>;
      },
    },
    {
      title: "Cập nhật trạng thái",
      key: "action",
      align: "center",
      width: "20px",
      render: (text, record) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Select
              style={{ width: "140px", marginRight: "10px" }}
              placeholder="Trạng thái"
              value={selectedStatusMap[record._id]}
              onChange={(value) => setSelectedStatus(record, value)}
            >
              <Option value="PREPARED">Chuẩn bị xong</Option>
              <Option value="CANCELED">Hủy đơn hàng</Option>
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
      },
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
        <Collapse bordered={false} style={{ backgroundColor: "#E6F4FF" }}>
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
              style={{ backgroundColor: "#E6F4FF" }}
              columns={columns}
              dataSource={filterResult.length > 0 ? filterResult : orders}
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

export default PendingOrderSalesPage;
