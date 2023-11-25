import { useState } from "react";
import { Form, Input, Button, Row, Col, Select } from "antd";
import PropTypes from "prop-types";

const { Option } = Select;

const EmployeeForm = ({
  onSubmit,
  form,
  handleCancel,
  nameSubmit,
  isManage,
  isMe,
  loading,
}) => {
  const [componentSize, setComponentSize] = useState("default");
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const onFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      initialValues={{
        size: componentSize,
      }}
      onValuesChange={onFormLayoutChange}
      size={componentSize}
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên"
            name="firstName"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            autoComplete="off" // Tắt gợi ý nhập tự động
            rules={[
              { required: true, message: "Vui lòng nhập tên nhân viên" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input type="text" disabled={isManage} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Họ"
            name="lastName"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            autoComplete="off" // Tắt gợi ý nhập tự động
            rules={[
              { required: true, message: "Vui lòng nhập họ nhân viên" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input type="text" disabled={isManage} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            autoComplete="off" // Tắt gợi ý nhập tự động
            rules={[
              { type: "email", message: "Vui lòng nhập email hợp lệ" },
              { required: true, message: "Vui lòng nhập email" },
            ]}
          >
            <Input type="email" disabled={isManage || isMe} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="SĐT"
            name="phoneNumber"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            autoComplete="off" // Tắt gợi ý nhập tự động
            rules={[
              {
                pattern: /^(0[0-9]|84[0-9])\s?\d{8,9}$/,
                message: "Số điện thoại không hợp lệ",
              },
              { required: true, message: "Vui lòng nhập số điện thoại" },
            ]}
          >
            <Input disabled={isManage} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Chức vụ"
            name="typeRole"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            rules={[
              { required: true, message: "Vui lòng chọn chức vụ nhân viên" },
            ]}
          >
            <Select defaultValue="Chọn chức vụ" disabled={isMe}>
              <Option value="MANAGE">Quản lý</Option>
              <Option value="SALES">Bán hàng</Option>
              <Option value="SHIPPER">Giao hàng</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Ngày sinh"
            name="birthday"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
          >
            <Input type="date" disabled={isManage} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Địa chỉ"
        name="address"
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        autoComplete="off" // Tắt gợi ý nhập tự động
        rules={[{ max: 500, message: "Tối đa 500 ký tự" }]}
      >
        <Input type="text" disabled={isManage} />
      </Form.Item>
      <Row justify="end">
        <Button onClick={handleCancel}>Hủy</Button>
        <Button
          loading={loading}
          type="primary"
          htmlType="submit"
          style={{ marginLeft: "10px" }}
        >
          {nameSubmit}
        </Button>
      </Row>
    </Form>
  );
};

EmployeeForm.propTypes = {
  onSubmit: PropTypes.func,
  form: PropTypes.object,
  handleCancel: PropTypes.func,
  nameSubmit: PropTypes.string,
  isManage: PropTypes.string,
  isMe: PropTypes.string,
  loading: PropTypes.bool,
};

export default EmployeeForm;
