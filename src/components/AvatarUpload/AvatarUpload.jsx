import { useState } from "react";
import axios from "axios";
import { Upload, Button, message, Form, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const AvatarUpload = ({ onSubmit, handleCancel, loading }) => {
  const [fileList, setFileList] = useState([]);

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // Giữ duy nhất 1 file
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    console.log("file:", file);
    try {
      const formData = new FormData();
      formData.append("avatar", file.name);

      // Gửi file đến máy chủ của bạn để xử lý
      console.log("FormData:", formData);
      const response = await axios.post(
        "http://localhost:9000/medias/upload-avatar-me",
        formData
      );
      console.log('««««« response »»»»»', response);

      if (response.ok) {
        message.success("Tải lên thành công");
        onSubmit();
        onSuccess();
      } else {
        message.error("Tải lên thất bại");
        onError();
      }
    } catch (error) {
      console.error("Lỗi trong quá trình tải lên file:", error);
      message.error("Tải lên thất bại");
      onError();
    }
  };

  const [componentSize, setComponentSize] = useState("default");

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const onFinish = (values) => {
    onSubmit(values);
    console.log(values);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Form
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 14,
      }}
      layout="horizontal"
      initialValues={{
        size: componentSize,
      }}
      onValuesChange={onFormLayoutChange}
      style={{
        maxWidth: 600,
      }}
      size={componentSize}
      onFinish={onFinish}
    >
      <Form.Item
        label="Ảnh đại diện"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload
          customRequest={customRequest}
          fileList={fileList}
          onChange={onChange}
          listType="picture-card"
        >
          {fileList.length === 0 ? (
            <div>
              <PlusOutlined />
              <p>Chọn ảnh</p>
            </div>
          ) : null}
        </Upload>
      </Form.Item>
      <Row justify="end">
        <Button onClick={handleCancel}>Hủy</Button>
        <Button
          loading={loading}
          type="primary"
          htmlType="submit"
          style={{ marginLeft: "10px" }}
        >
          Lưu
        </Button>
      </Row>
    </Form>
  );
};

AvatarUpload.propTypes = {
  onSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
  loading: PropTypes.bool,
};

export default AvatarUpload;
