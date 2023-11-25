import { useCallback, useState, useEffect } from "react";
import styles from "../pages/stylesPage/Accountpage.module.css";
import {
  Card,
  Divider,
  Dropdown,
  Button,
  Modal,
  Form,
  message,
  Spin,
  Row,
  Col,
} from "antd";
import axiosClient from "../libraries/axiosClient";
import { EditOutlined } from "@ant-design/icons";
import EmployeeForm from "../components/EmployeeForm/EmployeeForm";
import moment from "moment";
import "moment/locale/vi"; // Import the locale you want to use, for example, 'vi'
import AvatarUpload from "../components/AvatarUpload/AvatarUpload";

const AccountPage = () => {
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);

  const [detailMe, setDetailMe] = useState(null);
  const [updateForm] = Form.useForm();

  const getMe = useCallback(async () => {
    try {
      const res = await axiosClient.get("/employees/detailMe");
      setDetailMe(res.data.payload || null);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getMe();
  }, [getMe]);

  const [meToUpdate, setMeToUpdate] = useState(null);
  const [updateMeModalVisible, setUpdateMeModalVisible] = useState(false);
  const showUpdateModal = (detailMe) => {
    setMeToUpdate(detailMe);
    setUpdateMeModalVisible(true);
    const formattedBirthday = detailMe.birthday
      ? moment(detailMe.birthday).format("YYYY-MM-DD")
      : null;
    updateForm.setFieldsValue({
      ...detailMe,
      birthday: formattedBirthday,
    });
  };
  const [updateAvatarModalVisible, setupdateAvatarModalVisible] =
    useState(false);

  const showUpdateAvatarModal = (detailMe) => {
    setMeToUpdate(detailMe);
    setupdateAvatarModalVisible(true);
  };

  // Hàm xử lý khi cập nhật nhân viên
  const handleupdateMe = async (values) => {
    try {
      setLoadings([true]);
      await axiosClient.patch(`/employees/updateMe`, values);
      getMe();
      message.success("Cập nhật thông tin cá nhân thành công");
      setUpdateMeModalVisible(false);
      setLoadings([false]);
    } catch (error) {
      message.error("Cập nhật thông tin cá nhân thất bại");
      console.error("Lỗi khi cập nhật nhân viên: ", error);
      setLoadings([false]);
    }
  };

  const handleUploadAvatar = async (file) => {
    try {
      if (meToUpdate) {
        const formData = new FormData();
        formData.append("avatar", file);

        await fetch(`http://localhost:9000/medias/upload-avatar-me`, {
          method: "POST",
          body: formData,
        });

        getMe();
        setUpdateMeModalVisible(false);
        message.success("Cập nhật ảnh đại diện thành công");
      }
    } catch (error) {
      message.error("Cập nhật ảnh đại diện thất bại");
      console.error("Lỗi khi cập nhật nhân viên: ", error);
    }
  };
  return (
    <main className="container">
      <Card>
        <div className={styles.main_box}>
          <div className={styles.top_content}>
            <div className={styles.tittle}>
              <h3>Hồ sơ của tôi</h3>
              <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>
            <div className={styles.action}>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: "Cập nhật thông tin cá nhân",
                      onClick: () => showUpdateModal(detailMe),
                    },
                    {
                      key: "2",
                      label: "Cập nhật ảnh đại diện",
                      onClick: () => showUpdateAvatarModal(detailMe),
                    },
                  ],
                }}
                placement="bottomRight"
                arrow
              >
                <Button
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => showUpdateModal(detailMe)}
                >
                  Cập nhật hồ sơ
                </Button>
              </Dropdown>
            </div>
          </div>
          <Divider />

          {detailMe ? (
            <div className={styles.content}>
              <div className={styles.box_left}>
                <Row>
                  <Col span={8}>Họ và tên:</Col>
                  <Col span={16}>{detailMe.fullName}</Col>
                </Row>
                <Row>
                  <Col span={8}>Email:</Col>
                  <Col span={16}>{detailMe.email}</Col>
                </Row>
                <Row>
                  <Col span={8}>Số điện thoại:</Col>
                  <Col span={16}>{detailMe.phoneNumber}</Col>
                </Row>
                <Row>
                  <Col span={8}>Chức vụ:</Col>
                  <Col span={16}>{detailMe.typeRole}</Col>
                </Row>
                <Row>
                  <Col span={8}>Ngày sinh:</Col>
                  <Col span={16}>
                    {detailMe.birthday
                      ? moment(detailMe.birthday).format("DD/MM/YYYY")
                      : null}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Địa chỉ:</Col>
                  <Col span={16}>{detailMe.address}</Col>
                </Row>
              </div>
              <div className={styles.box_right}>
                <img src={detailMe.avatar?.avatarUrl} alt="Avatar" />
                <p>Hình ảnh đại diện</p>
              </div>
            </div>
          ) : (
            <div className={styles.loading}>
              <Spin style={{ textAlign: "center" }} size="large" />
            </div>
          )}
        </div>
      </Card>
      <Modal
        width={600}
        title="Cập nhật thông tin cá nhân"
        open={updateMeModalVisible}
        onCancel={() => setUpdateMeModalVisible(false)}
        footer={null}
      >
        <EmployeeForm
          form={updateForm}
          onSubmit={handleupdateMe}
          handleCancel={() => setUpdateMeModalVisible(false)}
          nameSubmit="Lưu"
          isMe="true"
          loading={loadings[0]}
        />
      </Modal>
      <Modal
        title="Cập nhật ảnh đại diện"
        open={updateAvatarModalVisible}
        onCancel={() => setupdateAvatarModalVisible(false)}
        footer={null}
      >
        <AvatarUpload
          onUpload={handleUploadAvatar}
          handleCancel={() => setupdateAvatarModalVisible(false)}
        />
      </Modal>
    </main>
  );
};

export default AccountPage;
