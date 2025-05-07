import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const onFinish = (values: { username: string; password: string }) => {
    // Lấy danh sách người dùng từ localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.username === values.username);

    if (!user) {
      message.error('Tên đăng nhập không tồn tại!');
      return;
    }

    if (user.password !== values.password) {
      message.error('Mật khẩu không đúng!');
      return;
    }

    onLogin(user);
  };

  return (
    <Card style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Tên đăng nhập"
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input placeholder="Nhập tên đăng nhập" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginForm; 