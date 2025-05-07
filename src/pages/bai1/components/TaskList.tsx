import React, { useState } from 'react';
import { Input, Select, Space, Button, Tag, Card, Modal, Form, message } from 'antd';
import { Task, Status, Priority } from '../types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { Search } = Input;

interface TaskListProps {
  tasks: Task[];
  currentUser: string;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentUser,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [searchText, setSearchText] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Cao':
        return 'red';
      case 'Trung bình':
        return 'orange';
      case 'Thấp':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã xong':
        return 'success';
      case 'Đang làm':
        return 'processing';
      case 'Chưa làm':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesAssignee = !assigneeFilter || task.assignee === assigneeFilter;
    return matchesSearch && matchesAssignee;
  });

  const getTasksByStatus = (status: Status) => {
    return filteredTasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      status: task.status
    });
  };

  const handleSaveTask = () => {
    form.validateFields().then(values => {
      if (editingTask) {
        const updatedTask: Task = {
          ...editingTask,
          title: values.title,
          description: values.description,
          priority: values.priority,
          assignee: values.assignee,
          status: values.status
        };

        // Cập nhật completedAt nếu trạng thái thay đổi
        if (values.status === 'Đã xong' && editingTask.status !== 'Đã xong') {
          updatedTask.completedAt = new Date().toISOString();
        } else if (values.status !== 'Đã xong' && editingTask.status === 'Đã xong') {
          updatedTask.completedAt = undefined;
        }

        onUpdateTask(updatedTask);
        message.success('Cập nhật công việc thành công!');
        setEditingTask(null);
      }
    });
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // Nếu không có destination
    if (!destination) {
      return;
    }

    // Nếu vị trí nguồn và đích giống nhau, không cần làm gì
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStatus = source.droppableId as Status;
    const destStatus = destination.droppableId as Status;

    // Tạo một bản sao mới của toàn bộ danh sách task
    let updatedTasks = [...tasks];

    // Nếu kéo thả trong cùng một cột (thay đổi thứ tự)
    if (sourceStatus === destStatus) {
      // Lấy tất cả task cùng status và sắp xếp theo thứ tự
      const columnTasks = updatedTasks
        .filter(t => t.status === sourceStatus)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      if (columnTasks.length <= source.index) return;
      
      // Lấy task được di chuyển
      const taskToMove = columnTasks[source.index];
      
      if (!taskToMove) return;
      
      console.log('Moving task:', taskToMove);
      console.log('From:', source.index, 'To:', destination.index);
      
      // Xóa task khỏi vị trí cũ
      columnTasks.splice(source.index, 1);
      
      // Chèn task vào vị trí mới
      columnTasks.splice(destination.index, 0, taskToMove);
      
      // Cập nhật lại thứ tự của tất cả task trong cột
      columnTasks.forEach((task, index) => {
        task.order = index;
      });
      
      // Cập nhật tất cả các task đã thay đổi
      columnTasks.forEach(task => {
        const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = task;
          onUpdateTask(task);
        }
      });
    } else {
      // Nếu kéo thả sang cột khác (thay đổi trạng thái)
      const sourceTasks = updatedTasks
        .filter(t => t.status === sourceStatus)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      if (sourceTasks.length <= source.index) return;
      
      const taskToMove = sourceTasks[source.index];
      
      if (!taskToMove) return;
      
      // Lấy danh sách task trong cột đích đã sắp xếp theo thứ tự
      const destTasks = updatedTasks
        .filter(t => t.status === destStatus)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Tìm index của task trong danh sách gốc
      const taskIndex = updatedTasks.findIndex(t => t.id === taskToMove.id);
      
      if (taskIndex === -1) return;
      
      // Cập nhật status cho task và tạo bản sao
      const movedTask = {
        ...updatedTasks[taskIndex],
        status: destStatus,
      };
      
      // Thêm hoặc xóa thời gian hoàn thành dựa vào trạng thái mới
      if (destStatus === 'Đã xong') {
        // Nếu di chuyển sang cột "Đã xong", thêm thời gian hoàn thành
        movedTask.completedAt = new Date().toISOString();
      } else if (sourceStatus === 'Đã xong') {
        // Nếu di chuyển từ cột "Đã xong" sang cột khác, xóa thời gian hoàn thành
        movedTask.completedAt = undefined;
      }
      
      // Xóa task khỏi vị trí cũ trong cột nguồn
      updatedTasks[taskIndex] = movedTask;
      
      // Chèn task vào vị trí mới trong cột đích
      // Nếu destination.index <= destTasks.length, chèn vào vị trí destination.index
      // Ngược lại, chèn vào cuối cột
      const newOrder = destination.index <= destTasks.length 
        ? destination.index 
        : destTasks.length;
      
      // Cập nhật order cho task đã di chuyển
      movedTask.order = newOrder;
      
      // Cập nhật lại order cho tất cả các task trong cột đích
      // Tất cả các task có order >= newOrder cần được tăng order lên 1
      updatedTasks.forEach(task => {
        if (task.status === destStatus && task.id !== movedTask.id && task.order >= newOrder) {
          task.order += 1;
          onUpdateTask(task);
        }
      });
      
      // Cập nhật task đã di chuyển
      onUpdateTask(movedTask);
    }
  };

  const renderTaskCard = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            size="small"
            style={{ marginBottom: 8 }}
            title={
              <Space>
                <span>{task.title}</span>
                <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button
                  type="text"
                  onClick={() => handleEditTask(task)}
                >
                  Sửa
                </Button>
                <Button
                  type="text"
                  danger
                  onClick={() => onDeleteTask(task.id)}
                >
                  Xóa
                </Button>
              </Space>
            }
          >
            <p>Người được giao: {task.assignee}</p>
            <p>Ngày tạo: {new Date(task.createdAt).toLocaleDateString()}</p>
            {task.completedAt && (
              <p>Đã hoàn thành: {new Date(task.completedAt).toLocaleDateString()} {new Date(task.completedAt).toLocaleTimeString()}</p>
            )}
            {task.description && <p>Mô tả: {task.description}</p>}
          </Card>
        </div>
      )}
    </Draggable>
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm công việc"
          allowClear
          onSearch={setSearchText}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Lọc theo người được giao"
          allowClear
          style={{ width: 200 }}
          onChange={setAssigneeFilter}
        >
          {Array.from(new Set(tasks.map((task) => task.assignee))).map(
            (assignee) => (
              <Select.Option key={assignee} value={assignee}>
                {assignee}
              </Select.Option>
            )
          )}
        </Select>
      </Space>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {(['Chưa làm', 'Đang làm', 'Đã xong'] as Status[]).map((status) => (
            <div
              key={status}
              style={{
                flex: 1,
                minHeight: 500,
                padding: '8px',
                backgroundColor: '#f0f2f5',
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                <Tag color={getStatusColor(status)} style={{ fontSize: '16px', padding: '4px 8px' }}>
                  {status} ({getTasksByStatus(status).length})
                </Tag>
              </div>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: '100%' }}
                  >
                    {getTasksByStatus(status).map((task, index) =>
                      renderTaskCard(task, index)
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal
        title="Chỉnh sửa công việc"
        visible={!!editingTask}
        onOk={handleSaveTask}
        onCancel={() => setEditingTask(null)}
      >
        <Form
          form={form}
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
        </Form>
      </Modal>
    </div>
  );
};

export default TaskList; 