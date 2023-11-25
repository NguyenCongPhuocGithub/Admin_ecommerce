import { useEffect, useState, useCallback } from "react";
import {
  Pagination,
  Button,
  Modal,
  Form,
  Card,
  Divider,
  Select,
  Row,
  Col,
  Collapse,
  List,
  InputNumber,
  message,
  Spin,
  Input,
} from "antd";
import {
  DeleteOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;
import styles from "./stylesPage/CreateOrder.module.scss";
import { FileExclamationOutlined } from "@ant-design/icons";
import axiosClient from "../libraries/axiosClient";
import numeral from "numeral";
import "numeral/locales/vi";
import OrderModal from "../components/OrderModal/OrderModal";
const { Option } = Select;

numeral.locale("vi");
const DEFAULT_LIMIT = 9;

const ProductPage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortPrice, setSortPrice] = useState("");
  const [sortDiscount, setSortDiscount] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filterResult, setFilterResult] = useState([]);
  const [noFilterResult, setNoFilterResult] = useState(false); // State để theo dõi kết quả tìm kiếm
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });

  const filterProducts = async () => {
    try {
      setLoadings([true]);
      const res = await axiosClient.get(
        `products/filter?keyword=${keyword}&categoryId=${selectedCategory}&sortPrice=${sortPrice}&sortDiscount=${sortDiscount}`
      );

      const Results = res.data.payload || [];
      // console.log("««««« filterResults »»»»»", Results);
      setFilterResult(Results);
      // Nếu không có kết quả tìm kiếm, đặt giá trị noFilterResult thành true
      setNoFilterResult(Results.length === 0);
      setLoadings([false]);
    } catch (error) {
      console.error("Lỗi khi gọi API: ", error);
      setLoadings([false]);
    }
  };

  const getProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get(
        `/products?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      setProducts(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalProduct,
      }));
    } catch (error) {
      console.log(error);
    }
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    getProducts();
  }, [pagination.page, pagination.pageSize, getProducts]);

  const getCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/categories/all");
      setCategories(res.data.payload || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const onChangePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        page,
        pageSize,
      }));
      getProducts();
    },
    [getProducts]
  );
  const handleFilter = () => {
    filterProducts(keyword, selectedCategory, sortPrice, sortDiscount);
  };

  const handleFilterOnEnter = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setSortPrice("");
    setSortDiscount("");
    filterProducts();
  };
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (product) => {
    // Kiểm tra xem sản phẩm đã tồn tại trong đơn hàng chưa
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      // Nếu đã tồn tại, tăng số lượng lên 1
      setCartItems((prevCartItems) =>
        prevCartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Nếu chưa tồn tại, thêm mới với số lượng là 1
      setCartItems((prevCartItems) => [
        ...prevCartItems,
        { ...product, quantity: 1 },
      ]);
    }
    // console.log("««««« cartItems »»»»»", cartItems);
  };
  const handleQuantityChange = (product, value) => {
    setCartItems((prevCartItems) =>
      prevCartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: value } : item
      )
    );
  };

  const handleRemoveItemCart = (product) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== product.id);
    setCartItems(updatedCartItems);
  };
  const handleRemoveCart = () => {
    setCartItems([]);
  };
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const handleCreate = async (values) => {
    try {
      await axiosClient.post("/orders/create", values);
      // console.log("««««« values »»»»»", values);
      setOrderModalOpen(false);
      setCartItems([]);
      message.success("Tạo đơn hàng thành công");
    } catch (error) {
      message.error("Tạo đơn hàng thất bại");
      console.error("Lỗi khi tạo đơn hàng: ", error);
    }
  };
  return (
    <main className="container">
      <div className={styles.main_box}>
        <div className={styles.menu}>
          <Card
            title={
              <div className={styles.title_menu}>
                <p>Thực đơn</p>
                {cartItems && cartItems.length > 0 && (
                  <div className={styles.cart}>
                    {/* <Button danger type="dashed" icon={<DeleteOutlined />} /> */}
                    <div
                      className={styles.icon}
                      onClick={() => setOrderModalOpen(true)}
                    >
                      <ShoppingCartOutlined />
                    </div>
                    <p>{cartItems.length}</p>
                  </div>
                )}
              </div>
            }
          >
            <Collapse
              bordered={false}
              defaultActiveKey={["searchFilter"]}
              style={{ backgroundColor: "#E6F4FF" }}
            >
              <Panel
                header="Bộ lọc tìm kiếm sản phẩm:"
                key="searchFilter"
                showArrow={false}
              >
                <div className={styles.filter}>
                  <Form>
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={8} lg={12} xl={8}>
                        <Form.Item label="Tên SP">
                          <Input
                            placeholder="Nhập tên sản phẩm"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={handleFilterOnEnter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={12} xl={8}>
                        <Form.Item label="Giá">
                          <Select
                            placeholder="Giá"
                            value={sortPrice}
                            onChange={(value) => setSortPrice(value)}
                          >
                            <Option value="asc">Tăng dần</Option>
                            <Option value="desc">Giảm dần</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={12} xl={8}>
                        <Form.Item label="Giảm giá">
                          <Select
                            placeholder="Giảm giá"
                            value={sortDiscount}
                            onChange={(value) => setSortDiscount(value)}
                          >
                            <Option value="asc">Từ thấp đến cao</Option>
                            <Option value="desc">Từ cao đến thấp</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={12} xl={8}>
                        <Form.Item label="Danh mục">
                          <Select
                            placeholder="Chọn danh mục"
                            value={selectedCategory}
                            onChange={(value) => setSelectedCategory(value)}
                          >
                            {categories.map((category) => (
                              <Option key={category._id} value={category._id}>
                                {category.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={8} lg={12} xl={8}>
                        <Button type="primary" onClick={handleFilter}>
                          Lọc
                        </Button>
                        <Button
                          loading={loadings[0]}
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
              <List
                grid={{ gutter: 16, column: 3 }}
                locale={{
                  emptyText: (
                    <span style={{ fontSize: "110%" }}>
                      <WarningOutlined style={{ color: "#FFC522" }} /> Không tìm
                      thấy sản phẩm nào
                    </span>
                  ),
                }}
              />
            ) : (
              <>
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 3,
                    xl: 3,
                    xxl: 4,
                  }}
                  dataSource={filterResult.length > 0 ? filterResult : products}
                  locale={{
                    emptyText: <Spin size="large" />,
                  }}
                  renderItem={(product) => (
                    <List.Item>
                      <div
                        className={styles.item}
                        onClick={() => handleAddToCart(product)}
                      >
                        <img
                          src={product.media?.coverImageUrl}
                          alt={product.name}
                        />
                        <div className={styles.content}>
                          <div className={styles.name}>
                            <strong>{product.name}</strong>
                          </div>
                          <div className={styles.price}>
                            <p>{numeral(product.price).format("0,0$")}</p>
                            {product.discount !== 0 ? (
                              <small>-{product.discount}%</small>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />

                {filterResult.length > 0 || products.length === 0 ? null : (
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
        </div>
        <div className={styles.order}>
          <Card
            title={
              <div className={styles.title_order}>
                <p>Đơn hàng</p>
                {cartItems && cartItems.length > 0 && (
                  <>
                    <Button danger onClick={handleRemoveCart}>
                      Xóa đơn hàng
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => setOrderModalOpen(true)}
                    >
                      Tạo đơn
                    </Button>
                  </>
                )}
              </div>
            }
          >
            <List
              dataSource={cartItems ? cartItems : "Trống"}
              locale={{
                emptyText: (
                  <span>
                    <FileExclamationOutlined
                      style={{ fontSize: "200%", color: "#FFC522" }}
                    />
                    <p>Đơn hàng trống</p>
                  </span>
                ),
              }}
              renderItem={(item) => (
                <List.Item>
                  <div className={styles.item_cart}>
                    <div className={styles.item_name}>
                      <img src={item.media?.coverImageUrl} alt={item.name} />
                      {item.name}
                    </div>
                    <div className={styles.item_action}>
                      <Button
                        style={{ padding: "0", height: "22px" }}
                        danger
                        type="dashed"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItemCart(item)}
                      />
                      <p>Số lượng:</p>
                      <InputNumber
                        style={{ width: "60px" }}
                        min={1}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(item, value)}
                        step={1}
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
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
      {cartItems.length > 0 ? (
        <Modal
          width={1000}
          centered
          title="Tạo đơn hàng"
          open={orderModalOpen}
          onCancel={() => setOrderModalOpen(false)}
          footer={null}
        >
          <OrderModal
            data={cartItems}
            handleCancel={() => setOrderModalOpen(false)}
            handleRemoveItemCart={handleRemoveItemCart}
            handleQuantityChangeFromParent={handleQuantityChange}
            onSubmit={handleCreate}
            handleRemoveCart={handleRemoveCart}
          />
        </Modal>
      ) : null}
    </main>
  );
};

export default ProductPage;
