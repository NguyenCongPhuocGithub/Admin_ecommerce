import { useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import PropTypes from "prop-types";

const CustomerForm = ({
  loading,
  onSubmit,
  form,
  handleCancel,
  nameSubmit,
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
            rules={[
              { required: true, message: "Vui lòng nhập tên nhân viên" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input type="text" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Họ"
            name="lastName"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            rules={[
              { required: true, message: "Vui lòng nhập họ nhân viên" },
              { max: 50, message: "Tối đa 50 ký tự" },
            ]}
          >
            <Input type="text" />
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
            rules={[
              { type: "email", message: "Vui lòng nhập email hợp lệ" },
              { required: true, message: "Vui lòng nhập email" },
            ]}
          >
            <Input type="email" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="SĐT"
            name="phoneNumber"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            rules={[
              {
                pattern: /^(0[0-9]|84[0-9])\s?\d{8,9}$/,
                message: "Số điện thoại không hợp lệ",
              },
              { required: true, message: "Vui lòng nhập số điện thoại" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Ngày sinh"
            name="birthday"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
          >
            <Input type="date" placeholder="dd/mm/yyyy" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Địa chỉ"
            name="address"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            rules={[{ max: 500, message: "Tối đa 500 ký tự" }]}
          >
            <Input type="text" />
          </Form.Item>
        </Col>
      </Row>

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

CustomerForm.propTypes = {
  onSubmit: PropTypes.func,
  form: PropTypes.object,
  handleCancel: PropTypes.func,
  nameSubmit: PropTypes.string,
  loading: PropTypes.bool,
};

export default CustomerForm;
