import { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import axiosClient from "../libraries/axiosClient";

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axiosClient.patch(
        "/employees/change-password",
        values
      );
      // Xử lý response từ server
      if (response.status === 200) {
        message.success("Thay đổi mật khẩu thành công");
        form.resetFields();
      } else {
        message.error("Thay đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <Card title="Thay đổi mật khẩu">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: "400px", margin: "auto" }}
        >
          <Form.Item
            label="Mật khẩu cũ:"
            name="passwordOld"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu cũ",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới:"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu mới",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("passwordOld") !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Mật khẩu mới phải khác mật khẩu cũ");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới:"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu mới",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Mật khẩu xác nhận không khớp");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
};

export default ChangePassword;
