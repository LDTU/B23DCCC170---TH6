import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { Task, Priority, Status } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  tasks: Task[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, tasks }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const newTask: Task = {
      id: uuidv4(),
      title: values.title,
      description: values.description || '',
      status: values.status,
      priority: values.priority,
      assignee: values.assignee,
      createdAt: new Date().toISOString(),
      order: values.status === 'Chưa làm' ? 0 : values.status === 'Đang làm' ? 0 : 0
    };

    // Tạo task mới với thứ tự dựa trên số lượng task hiện có trong cột tương ứng
    const tasksInSameColumn = tasks.filter(task => task.status === values.status);
    newTask.order = tasksInSameColumn.length;

    onSubmit(newTask);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item
        name="title"
        label="Tên công việc"
        rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
      >
        <Input placeholder="Nhập tên công việc" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea rows={4} placeholder="Nhập mô tả công việc" />
      </Form.Item>

      <Form.Item
        name="assignee"
        label="Người được giao"
        rules={[{ required: true, message: 'Vui lòng chọn người được giao!' }]}
      >
        <Input placeholder="Nhập tên người được giao" />
      </Form.Item>

      <Form.Item
        name="priority"
        label="Mức độ ưu tiên"
        rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
      >
        <Select>
          <Select.Option value="Thấp">Thấp</Select.Option>
          <Select.Option value="Trung bình">Trung bình</Select.Option>
          <Select.Option value="Cao">Cao</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
      >
        <Select>
          <Select.Option value="Chưa làm">Chưa làm</Select.Option>
          <Select.Option value="Đang làm">Đang làm</Select.Option>
          <Select.Option value="Đã xong">Đã xong</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Thêm công việc
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskForm; 