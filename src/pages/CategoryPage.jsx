import axiosClient from "../libraries/axiosClient";
import { useEffect, useState, useCallback } from "react";
import {
  Pagination,
  Table,
  Button,
  Modal,
  Form,
  message,
  Dropdown,
  Card,
  Spin,
  Popconfirm,
  Input,
  Divider,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
  PlusOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import CategoryForm from "../components/CategoryForm/CategoryForm";
import styles from "./stylesPage/CategoryPage.module.scss";

const DEFAULT_LIMIT = 8;

const CategoryPage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [updateCategoryModalVisible, setUpdateCategoryModalVisible] =
    useState(false);
  const [categoryToUpdate, setCategoryToUpdate] = useState(null);
  const [updateForm] = Form.useForm();
  const [noSearchResult, setNoSearchResult] = useState(false); // State để theo dõi kết quả tìm kiếm
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });
  const searchCategories = async (keyword) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `/categories/search?keyword=${keyword}`
      );
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

  const getCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get(
        `/categories?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      setCategories(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalCategory,
      }));
    } catch (error) {
      console.log(error);
    }
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const showUpdateModal = (category) => {
    setCategoryToUpdate(category);
    setUpdateCategoryModalVisible(true);
    updateForm.setFieldsValue(category);
  };

  const handleUpdate = async (values) => {
    try {
      if (categoryToUpdate) {
        setLoadings([true]);
        await axiosClient.patch(`/categories/${categoryToUpdate._id}`, values);
        if (searchResult.length > 0) {
          searchCategories();
        }
        getCategories();
        setUpdateCategoryModalVisible(false);
        message.success("Cập nhật danh mục thành công");
        setLoadings([false]);
      }
    } catch (error) {
      message.error("Cập nhật danh mục thất bại");
      setLoadings([false]);
      console.error("Lỗi khi cập nhật danh mục: ", error);
    }
  };

  const handleDelete = async (record) => {
    try {
      await axiosClient.patch(`/categories/delete/${record._id}`);
      if (searchResult.length > 0) {
        searchCategories();
      }
      getCategories();
      message.success("Xóa danh mục thành công");
    } catch (error) {
      message.error("Xóa danh mục thất bại");
      console.error("Lỗi khi xóa danh mục: ", error);
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoadings([true]);
      await axiosClient.post("/categories/create2", values);
      if (searchResult.length > 0) {
        searchCategories();
      }
      getCategories();
      setAddCategoryModalVisible(false);
      message.success("Tạo danh mục mới thành công");
      setLoadings([false]);
    } catch (error) {
      message.error("Tạo danh mục mới thất bại");
      console.error("Lỗi khi tạo danh mục: ", error);
      setLoadings([false]);
    }
  };

  const onChangePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({ ...prev, page, pageSize }));
      getCategories();
    },
    [getCategories]
  );

  const handleSearch = () => {
    searchCategories(searchKeyword);
  };

  const handleSearchOnEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
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
        return (
          <span>{index + 1 + pagination.pageSize * (pagination.page - 1)}</span>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text, record) => (
        <span className={styles.name_category}>
          <img
            src={record.media?.coverImageUrl}
            alt={record.name}
            className={styles.thumb}
          />
          <p>{record.name}</p>
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (text, record) => {
        return (
          <div className={styles.action_colum}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: "Cập nhật thông tin danh mục",
                    onClick: () => showUpdateModal(record),
                  },
                  { key: "2", label: "Cập nhật hình ảnh danh mục" },
                ],
              }}
              placement="topRight"
              arrow
            >
              <Button
                type="dashed"
                icon={<EditOutlined />}
                // onClick={() => showUpdateModal(record)}
              />
            </Dropdown>
            <Popconfirm
              placement="topRight"
              title={`Bạn đồng ý với việc xóa danh mục ${record.name}?`}
              onConfirm={() => handleDelete(record)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button danger type="dashed" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  return (
    <main className="container">
      <Card>
        <Row gutter={16} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={16} lg={18} xl={12}>
            <Form.Item label="Tìm kiếm nhân viên">
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
              icon={<PlusOutlined />}
              type="link"
              onClick={() => setAddCategoryModalVisible(true)}
            >
              Thêm nhân viên
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
                  thấy danh mục khả dụng
                </span>
              ),
            }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={searchResult.length > 0 ? searchResult : categories}
              pagination={false}
              rowKey="_id"
              locale={{
                emptyText: <Spin size="large" />,
              }}
            />
            {searchResult.length > 0 || categories.length === 0 ? null : (
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
        title="Tạo danh mục mới"
        open={addCategoryModalVisible}
        onCancel={() => setAddCategoryModalVisible(false)}
        footer={null}
      >
        <CategoryForm
          loading={loadings[0]}
          onSubmit={handleCreate}
          handleCancel={() => setAddCategoryModalVisible(false)}
          nameSubmit="Tạo"
        />
      </Modal>
      <Modal
        title="Cập nhật danh mục"
        open={updateCategoryModalVisible}
        onCancel={() => setUpdateCategoryModalVisible(false)}
        footer={null}
      >
        <CategoryForm
          loading={loadings[0]}
          form={updateForm}
          onSubmit={handleUpdate}
          handleCancel={() => setUpdateCategoryModalVisible(false)}
          nameSubmit="Lưu"
        />
      </Modal>
    </main>
  );
};

export default CategoryPage;
