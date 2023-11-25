import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
  Input,
  Pagination,
} from "antd";

import {
  WarningOutlined,
  LoadingOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axiosClient from "../libraries/axiosClient";

import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

import styles from "./stylesPage/OrderPage.module.scss";
const { Panel } = Collapse;
const { Option } = Select;
const DEFAULT_LIMIT = 8;
const OrderPage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);

  const [year, setYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Thiết lập ngôn ngữ tiếng Việt cho moment
        moment.locale("vi");
        const response = await axiosClient.get(
          `/orders/orders-by-year?year=${year}`
        );
        const orders = response.data.payload;

        // Sử dụng object để lưu trữ số lượng đơn hàng theo từng loại
        const orderCounts = {
          total: Array.from({ length: 12 }, () => 0),
          online: Array.from({ length: 12 }, () => 0),
          offline: Array.from({ length: 12 }, () => 0),
        };

        orders.forEach((order) => {
          const month = moment(order.createdDate).month();
          orderCounts.total[month]++;

          // Kiểm tra nếu là đơn hàng online hoặc offline
          if (order.isOnline) {
            orderCounts.online[month]++;
          } else {
            orderCounts.offline[month]++;
          }
        });

        // Tạo dữ liệu cho biểu đồ
        const chartData = Array.from({ length: 12 }, (_, month) => ({
          month: moment().month(month).format("MMMM"),
          total: orderCounts.total[month],
          online: orderCounts.online[month],
          offline: orderCounts.offline[month],
        }));

        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [year]);

  const handleChangeYear = (value) => {
    setYear(value);
  };

  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [typeOrder, setTypeOrder] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterResult, setFilterResult] = useState([]);
  const [orders, setOrders] = useState([]);
  const [noFilterResult, setNoFilterResult] = useState(false);
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });
  const filterOrder = async () => {
    try {
      setLoadings([true]);
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
      setLoadings([false]);
    } catch (error) {
      console.error("Lỗi khi gọi API: ", error);
      setLoadings([false]);
    }
  };
  const getOrder = useCallback(async () => {
    try {
      const res = await axiosClient.get(
        `/orders?page=${pagination.page}&pageSize=${pagination.pageSize}`
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
      responsive: ["md"],
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
      title: "Hình thức mua hàng",
      dataIndex: "isOnline",
      key: "isOnline",
      align: "center",
      responsive: ["sm"],
      render: (text, record) => (
        <p>{record.isOnline === true ? "Trực tuyến" : "Trực tiếp"}</p>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      width: "150px",
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
      title: "Ngày tạo đơn",
      dataIndex: "createdDate",
      key: "createdDate",
      align: "center",
      responsive: ["xl"],
      render: (text, record) => (
        <p>{moment(record.createdDate).format("DD/MM/YYYY")}</p>
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
      responsive: ["lg"],
      render: (text, record) => {
        const statusText = {
          CASH: "Tiền mặt",
          CARD: "Thẻ NH",
        }[record.paymentType]; // Sửa 'status' thành 'paymentType'

        return <span>{statusText}</span>; // Sửa { statusText } thành <span>{statusText}</span>
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
      <Card
        span={24}
        title={
          <div className={styles.title}>
            <p>Thống kê đơn hàng</p>
            <div className={styles.action}>
              <p>Năm:</p>
              <Select
                defaultValue={year.toString()}
                onChange={handleChangeYear}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <Option
                    key={i}
                    value={(new Date().getFullYear() - i).toString()}
                  >
                    {new Date().getFullYear() - i}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        }
      >
        {chartData && (
          <ResponsiveContainer
            className={styles.chartContainer}
            width="100%"
            height={400}
          >
            <LineChart data={chartData}>
              <XAxis
                dataKey="month"
                tickFormatter={(value) => {
                  const formattedMonth = moment().month(value).format("MMMM");
                  return formattedMonth;
                }}
              />
              <YAxis />
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="online"
                stroke="#FFC522"
                name="Đơn hàng trực tuyến"
              />
              <Line
                type="monotone"
                dataKey="offline"
                stroke="#E31837"
                name="Đơn hàng trực tiếp"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="blue"
                name="Tổng đơn hàng"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <Divider />
        <Collapse bordered={false} style={{ backgroundColor: "#E6F4FF" }}>
          <Panel
            header="Bộ lọc tìm kiếm đơn hàng:"
            key="searchFilter"
            showArrow={false}
          >
            <div className={styles.filter}>
              <Form>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Mã ĐH">
                      <Input
                        placeholder="Nhập mã đơn hàng"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        onPressEnter={handleFilterOnEnter}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Hình thức TT">
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
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Hình thức MH">
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
                  <Col xs={24} sm={12} md={8} lg={8} xl={6}>
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
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Từ ngày">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Đến ngày">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={8} xl={6}>
                    <Button
                      loading={loadings[0]}
                      type="primary"
                      onClick={handleFilter}
                    >
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
            )}{" "}
          </>
        )}
      </Card>
    </main>
  );
};

export default OrderPage;
