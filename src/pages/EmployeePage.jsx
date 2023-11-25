import axiosClient from "../libraries/axiosClient";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Divider,
  Table,
  Button,
  Modal,
  Form,
  message,
  Pagination,
  Spin,
  Popconfirm,
  Input,
  Col,
  Row,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
  UserAddOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/vi"; // Import the locale you want to use, for example, 'vi'

import styles from "./stylesPage/EmployeePage.module.scss";
import EmployeeForm from "../components/EmployeeForm/EmployeeForm";
const DEFAULT_LIMIT = 8;
const EmployeePage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [noSearchResult, setNoSearchResult] = useState(false); // State để theo dõi kết quả tìm kiếm

  // Phân trang
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });

  const searchEmployee = async (keyword) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/search?keyword=${keyword}`);
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

  // Get data nhân viên
  const [employees, setEmployees] = useState([]);
  // Hiển thị hộp thoại tạo nhân viên
  const [addEmployeeModalVisible, setAddEmployeeModalVisible] = useState(false);
  // Hiển thị hộp thoại cập nhật nhân viên
  const [updateEmployeeModalVisible, setUpdateEmployeeModalVisible] =
    useState(false);
  // Nhân viên cần sửa
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  // Đây là biến tham chiếu đến form cập nhật nhân viên
  const [updateForm] = Form.useForm();
  // Hàm lấy danh sách nhân viên từ API
  const getEmployees = useCallback(async () => {
    try {
      const res = await axiosClient.get(
        `/employees?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      setEmployees(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalEmployee,
      }));
    } catch (error) {
      console.log(error);
    }
  }, [pagination.page, pagination.pageSize]);
  // Gọi hàm getEmployees khi component được render hoặc khi có thay đổi
  useEffect(() => {
    getEmployees();
  }, [getEmployees]);
  // Hàm để hiển thị modal cập nhật nhân viên và điền thông tin nhân viên vào form
  const showUpdateRoleModal = (employee) => {
    setEmployeeToUpdate(employee);
    setUpdateEmployeeModalVisible(true);
    const formattedBirthday = employee.birthday
      ? moment(employee.birthday).format("YYYY-MM-DD")
      : null;
    updateForm.setFieldsValue({
      ...employee,
      birthday: formattedBirthday,
    });
  };
  // Hàm xử lý khi cập nhật nhân viên
  const handleupdateRoleEmployee = async (values) => {
    try {
      if (employeeToUpdate) {
        setLoadings([true]);
        await axiosClient.patch(`/employees/${employeeToUpdate._id}`, values);
        if (searchResult.length > 0) {
          searchEmployee();
        }
        getEmployees();
        setUpdateEmployeeModalVisible(false);
        message.success("Cập nhật nhân viên thành công");
        setLoadings([false]);
      }
    } catch (error) {
      message.error("Cập nhật nhân viên thất bại");
      console.error("Lỗi khi cập nhật nhân viên: ", error);
      setLoadings([false]);
    }
  };
  // Hàm xử lý khi xác nhận xóa nhân viên
  const handleDelete = async (record) => {
    try {
      await axiosClient.patch(`/employees/delete/${record._id}`);
      if (searchResult.length > 0) {
        searchEmployee();
      }
      getEmployees();
      message.success("Xóa nhân viên thành công");
    } catch (error) {
      message.error("Xóa nhân viên không thành công");
      console.error("Lỗi khi xóa nhân viên: ", error);
    }
  };
  // Hàm để xử lý khi tạo nhân viên mới
  const handleCreate = async (values) => {
    try {
      setLoadings([true]);
      await axiosClient.post("/employees/create", values);
      if (searchResult.length > 0) {
        searchEmployee();
      }
      getEmployees();
      setAddEmployeeModalVisible(false);
      message.success("Tạo nhân viên mới thành công");
      setLoadings([false]);
    } catch (error) {
      message.error("Tạo nhân viên mới thất bại");
      console.error("Lỗi khi tạo nhân viên: ", error);
      setLoadings([false]);
    }
  };
  // Cấu hình cột dữ liệu của bảng
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
      title: "Tên nhân viên",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text, record) => (
        <span
          className={styles.name_employee}
          style={{ display: "flex", alignItems: "center" }}
        >
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
      title: "Chức vụ",
      dataIndex: "typeRole",
      key: "typeRole",
      align: "center",
      render: (text, record) => {
        if (record.typeRole === "MANAGE") {
          return "Quản lý";
        }
        if (record.typeRole === "SALES") {
          return "Bán hàng";
        }
        if (record.typeRole === "SHIPPER") {
          return "Giao hàng";
        }
      },
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
      responsive: ["sm"],
      render: (text, record) => record.phoneNumber,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (text, record) => {
        return (
          <div className={styles.action_colum}>
            <Button
              type="dashed"
              icon={<EditOutlined />}
              onClick={() => showUpdateRoleModal(record)}
            />
            <Popconfirm
              placement="topRight"
              title={`Bạn đồng ý với việc xóa nhân viên ${record.fullName}?`}
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
  // Hàm để thay đổi trang và số lượng sản phẩm trên trang
  const onChangePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        page,
        pageSize,
      }));

      getEmployees();
    },
    [getEmployees]
  );

  const handleSearch = () => {
    searchEmployee(searchKeyword);
  };

  const handleSearchOnEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <main className="container">
      <Card>
        <Row gutter={16} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={16} lg={18} xl={12}>
            <Form.Item
              label="Tìm kiếm nhân viên"
            >
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
              onClick={() => setAddEmployeeModalVisible(true)}
            >
              Thêm nhân viên
            </Button>
          </Col>
        </Row>

        <Divider />
        {noSearchResult ? (
          <Table
            columns={columns}
            // dataSource={searchResult.length > 0 ? searchResult : categories}
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
              dataSource={searchResult.length > 0 ? searchResult : employees}
              pagination={false}
              rowKey="_id"
              locale={{
                emptyText: <Spin size="large" />,
              }}
            />
            {searchResult.length > 0 || employees.length === 0 ? null : (
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
        width={600}
        title="Tạo nhân viên mới"
        open={addEmployeeModalVisible}
        onCancel={() => setAddEmployeeModalVisible(false)}
        footer={null}
      >
        <EmployeeForm
          loading={loadings[0]}
          onSubmit={handleCreate}
          handleCancel={() => setAddEmployeeModalVisible(false)}
          nameSubmit="Tạo"
        />
      </Modal>
      <Modal
        width={600}
        title="Cập nhật nhân viên"
        open={updateEmployeeModalVisible}
        onCancel={() => setUpdateEmployeeModalVisible(false)}
        footer={null}
      >
        <EmployeeForm
          loading={loadings[0]}
          form={updateForm}
          onSubmit={handleupdateRoleEmployee}
          handleCancel={() => {
            setUpdateEmployeeModalVisible(false);
          }}
          nameSubmit="Lưu"
          isManage="true"
        />
      </Modal>
    </main>
  );
};

export default EmployeePage;
