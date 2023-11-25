import { useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import PropTypes from "prop-types";

const SupplierForm = ({loading, onSubmit, form, handleCancel, nameSubmit }) => {

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
      <Form.Item
        label="Tên"
        name="name"
        labelCol={{
          span: 3,
        }}
        wrapperCol={{
          span: 21,
        }}
        rules={[
          { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
          { type: "string", max: 500, message: "Tối đa 500 ký tự" },
        ]}
      >
        <Input type="text" />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 18,
            }}
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
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 18,
            }}
            rules={[
              {
                type: "string",
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
      <Form.Item
        label="Địa chỉ"
        name="address"
        labelCol={{
          span: 3,
        }}
        wrapperCol={{
          span: 21,
        }}
        rules={[
          { required: true, message: "Vui lòng nhập địa chỉ nhà cung cấp" },
          { type: "string", max: 500, message: "Tối đa 500 ký tự" },
        ]}
      >
        <Input type="text" />
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

SupplierForm.propTypes = {
  onSubmit: PropTypes.func,
  form: PropTypes.object,
  handleCancel: PropTypes.func,
  nameSubmit: PropTypes.string,
  loading: PropTypes.bool,
};

export default SupplierForm;
