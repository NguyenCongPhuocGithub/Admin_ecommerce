import { useState } from "react";
import { Form, Input, Button, Row } from "antd";
import PropTypes from "prop-types";

const CategoryForm = ({loading, onSubmit, form, handleCancel, nameSubmit }) => {
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
        labelCol={{
          span: 3,
        }}
        wrapperCol={{
          span: 21,
        }}
        label="Tên"
        name="name"
        rules={[
          { required: true, message: "Vui lòng nhập tên sản phẩm" },
          { max: 50, message: "Tối đa 50 ký tự" },
        ]}
      >
        <Input type="text" />
      </Form.Item>

      <Form.Item
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        label="Mô tả"
        name="description"
      >
        <Input.TextArea rows={2} />
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
CategoryForm.propTypes = {
  onSubmit: PropTypes.func,
  form: PropTypes.object,
  handleCancel: PropTypes.func,
  nameSubmit: PropTypes.string,
  loading: PropTypes.bool,
};

export default CategoryForm;
