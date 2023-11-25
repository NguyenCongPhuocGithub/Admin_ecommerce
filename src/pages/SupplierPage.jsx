import axiosClient from "../libraries/axiosClient";
import { useEffect, useState, useCallback } from "react";
import {
  Divider,
  Card,
  Dropdown,
  Table,
  Button,
  Modal,
  Form,
  message,
  Spin,
  Popconfirm,
  Input,
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
import SupplierForm from "../components/SupplierForm/SupplierForm";
import styles from "./stylesPage/SupplierPage.module.scss";

const SupplierPage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [addSupplierModalVisible, setAddSupplierModalVisible] = useState(false);
  const [updateSupplierModalVisible, setUpdateSupplierModalVisible] =
    useState(false);
  const [supplierToUpdate, setSupplierToUpdate] = useState(null);
  const [noSearchResult, setNoSearchResult] = useState(false);
  const [updateForm] = Form.useForm();

  const searchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/suppliers/search", {
        params: { keyword: searchKeyword },
      });
      setSearchResult(res.data.payload || []);
      setNoSearchResult(res.data.payload.length === 0);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [searchKeyword]);

  const getSuppliers = useCallback(async () => {
    try {
      const res = await axiosClient.get("/suppliers/all");
      setSuppliers(res.data.payload || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getSuppliers();
  }, [getSuppliers]);

  const showUpdateModal = (supplier) => {
    setSupplierToUpdate(supplier);
    setUpdateSupplierModalVisible(true);
    updateForm.setFieldsValue(supplier);
  };

  const handleUpdate = async (values) => {
    try {
      if (supplierToUpdate) {
        setLoadings([true]);
        await axiosClient.patch(`/suppliers/${supplierToUpdate._id}`, values);
        if (searchResult.length > 0) {
          searchSuppliers();
        }
        getSuppliers();
        setUpdateSupplierModalVisible(false);
        message.success("Cập nhật nhà cung cấp thành công");
        setLoadings([false]);
      }
    } catch (error) {
      setLoadings([false]);
      console.error("Lỗi khi cập nhật nhà cung cấp: ", error);
    }
  };

  const handleDelete = async (record) => {
    try {
      await axiosClient.patch(`/suppliers/delete/${record._id}`);
      if (searchResult.length > 0) {
        searchSuppliers();
      }
      getSuppliers();
      message.success("Xóa nhà cung cấp thành công");
    } catch (error) {
      message.error("Xóa nhà cung cấp không thành công");
      console.error("Lỗi khi xóa nhà cung cấp: ", error);
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoadings([true]);
      await axiosClient.post("/suppliers", values);
      if (searchResult.length > 0) {
        searchSuppliers();
      }
      getSuppliers();
      setAddSupplierModalVisible(false);
      setLoadings([false]);

      message.success("Tạo nhà cung cấp mới thành công");
    } catch (error) {
      message.error("Tạo nhà cung cấp mới thất bại");
      setLoadings([false]);
      console.error("Lỗi khi tạo nhà cung cấp: ", error);
    }
  };
  const handleSearch = () => {
    searchSuppliers(searchKeyword);
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
      responsive: ["sm"],
      render: (text, record, index) => index + 1,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text, record) => (
        <span className={styles.name_supplier}>
          <img
            src={record.media?.coverImageUrl}
            alt={record.name}
            className={styles.avatar}
          />
          <p>{record.name}</p>
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      responsive: ["md"],
      render: (text, record) => record.email,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      render: (text, record) => record.phoneNumber,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      align: "center",
      responsive: ["sm"],
      render: (text, record) => (
        <p className={styles.address}>{record.address}</p>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (text, record) => (
        <div className={styles.action_colum}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "Cập nhật thông tin NCC",
                  onClick: () => showUpdateModal(record),
                },
                { key: "2", label: "Cập nhật hình ảnh NCC" },
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
            title={`Bạn đồng ý với việc xóa nhà cung cấp ${record.name}?`}
            onConfirm={() => handleDelete(record)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger type="dashed" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <main className="container">
      <Card>
        <Row gutter={16} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={16} lg={18} xl={12}>
            <Form.Item
              label="Tìm kiếm nhà cung cấp"
              labelCol={{ xs: 24, sm: 7, md: 8, lg: 7, xl: 7 }}
              wrapperCol={{ xs: 24, sm: 17, md: 16, lg: 17, xl: 17 }}
            >
              <Input
                placeholder="Nhập tên hoặc email hoặc số điện thại"
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
          <Button
            icon={<PlusOutlined />}
            type="link"
            onClick={() => setAddSupplierModalVisible(true)}
          >
            Thêm nhà cung cấp
          </Button>
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
                  thấy nhà cung cấp khả dụng
                </span>
              ),
            }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={searchResult.length > 0 ? searchResult : suppliers}
            pagination={false}
            rowKey="_id"
            locale={{
              emptyText: <Spin size="large" />,
            }}
          />
        )}
      </Card>

      <Modal
        width={600}
        title="Tạo nhà cung cấp mới"
        open={addSupplierModalVisible}
        onCancel={() => setAddSupplierModalVisible(false)}
        footer={null}
      >
        <SupplierForm
          loading={loadings[0]}
          onSubmit={handleCreate}
          handleCancel={() => setAddSupplierModalVisible(false)}
          nameSubmit="Tạo"
        />
      </Modal>
      <Modal
        width={600}
        title="Cập nhật nhà cung cấp"
        open={updateSupplierModalVisible}
        onCancel={() => setUpdateSupplierModalVisible(false)}
        footer={null}
      >
        <SupplierForm
          loading={loadings[0]}
          form={updateForm}
          onSubmit={handleUpdate}
          handleCancel={() => setUpdateSupplierModalVisible(false)}
          nameSubmit="Lưu"
        />
      </Modal>
    </main>
  );
};

export default SupplierPage;
