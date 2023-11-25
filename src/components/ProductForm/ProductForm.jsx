import { useEffect, useState, useCallback } from "react";
import { Form, Input, InputNumber, Select, Button, Row, Col } from "antd";
import PropTypes from "prop-types";
import axiosClient from "../../libraries/axiosClient";

const { Option } = Select;

const ProductForm = ({loading, onSubmit, form, handleCancel, nameSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const getCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/categories/all");
      setCategories(res.data.payload || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getSuppliers = useCallback(async () => {
    try {
      const res = await axiosClient.get("/suppliers/all");
      setSuppliers(res.data.payload);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    getSuppliers();
    getCategories();
  }, [getSuppliers, getCategories]);
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
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
              { max: 500, message: "Tối đa 500 ký tự" },
            ]}
          >
            <Input type="text" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Form.Item
            label="Giá gốc(đ)"
            name="price"
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            rules={[
              {
                type: "number",
                min: 0,
              },
              { required: true, message: "Vui lòng nhập giá" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={8} lg={8} xl={8}>
          <Form.Item
            label="Khuyến mãi(%)"
            name="discount"
            labelCol={{ span: 14 }}
            wrapperCol={{ span: 10 }}
            rules={[
              {
                type: "number",
                min: 0,
                max: 75,
                message: "Vui lòng nhập giảm giá từ 0 đến 75",
              },
              { required: true, message: "Vui lòng nhập giảm giá" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={8} lg={8} xl={8}>
          <Form.Item
            label="Tồn kho"
            name="stock"
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
            rules={[
              {
                type: "number",
                min: 0,
                message: "Vui lòng nhập tồn kho lớn hơn 0",
              },
              { required: true, message: "Vui lòng nhập tồn kho" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Form.Item
            label="Dài(cm)"
            name="length"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            rules={[
              {
                type: "number",
                min: 0,
              },
              { required: true, message: "Vui lòng nhập chiều dài" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Form.Item
            label="Rộng(cm)"
            name="width"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            rules={[
              {
                type: "number",
                min: 0,
              },
              { required: true, message: "Vui lòng nhập chiều rộng" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Form.Item
            label="Cao(cm)"
            name="height"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            rules={[
              {
                type: "number",
                min: 0,
              },
              { required: true, message: "Vui lòng nhập chiều cao" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Form.Item
            label="Khối lượng(g)"
            name="weight"
            labelCol={{ span: 15 }}
            wrapperCol={{ span: 9 }}
            rules={[
              {
                type: "number",
                min: 0,
              },
              { required: true, message: "Vui lòng nhập khối lượng" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            label="Danh mục"
            name="categoryId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn danh mục",
              },
            ]}
          >
            <Select>
              {categories &&
                categories.length > 0 &&
                categories.map((item) => (
                  <Option key={item._id} value={item.id || item._id}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            label="NCC"
            name="supplierId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nhà cung cấp",
              },
            ]}
          >
            <Select>
              {suppliers &&
                suppliers.length > 0 &&
                suppliers.map((item) => (
                  <Option key={item._id} value={item.id || item._id}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={24} lg={24} xl={24}>
          <Form.Item
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label="Mô tả"
            name="description"
          >
            <Input.TextArea rows={2} />
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
ProductForm.propTypes = {
  onSubmit: PropTypes.func,
  form: PropTypes.object,
  handleCancel: PropTypes.func,
  nameSubmit: PropTypes.string,
  loading: PropTypes.bool,
};

export default ProductForm;
