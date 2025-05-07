import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Space, Tabs, message } from 'antd';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskStats from './components/TaskStats';
import { Task } from './types';

interface User {
  username: string;
  password: string;
}

const { Header, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const Bai1: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      // Lấy danh sách công việc của người dùng hiện tại
      const userTasks = localStorage.getItem(`tasks_${user.username}`);
      if (userTasks) {
        setTasks(JSON.parse(userTasks));
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Lấy danh sách công việc của người dùng mới đăng nhập
    const userTasks = localStorage.getItem(`tasks_${user.username}`);
    if (userTasks) {
      setTasks(JSON.parse(userTasks));
    } else {
      // Nếu chưa có dữ liệu, khởi tạo mảng rỗng
      setTasks([]);
      localStorage.setItem(`tasks_${user.username}`, JSON.stringify([]));
    }
    message.success('Đăng nhập thành công!');
  };

  const handleRegister = (newUser: User) => {
    // Lấy danh sách người dùng từ localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Kiểm tra tên đăng nhập đã tồn tại chưa
    if (users.some((user: User) => user.username === newUser.username)) {
      message.error('Tên đăng nhập đã tồn tại!');
      return;
    }

    // Thêm người dùng mới
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Tự động đăng nhập sau khi đăng ký
    handleLogin(newUser);
    message.success('Đăng ký thành công!');
  };

  const handleLogout = () => {
    // Lưu danh sách công việc của người dùng hiện tại trước khi đăng xuất
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
    }
    setCurrentUser(null);
    setTasks([]);
    localStorage.removeItem('currentUser');
    message.success('Đăng xuất thành công!');
  };

  const handleAddTask = (task: Task) => {
    // Tìm số lượng task trong cùng một cột để cập nhật thứ tự nếu cần
    const tasksInSameStatus = tasks.filter(t => t.status === task.status).length;
    const taskWithOrder = {
      ...task,
      order: tasksInSameStatus // Đảm bảo task mới được thêm vào cuối cột
    };
    
    const newTasks = [...tasks, taskWithOrder];
    setTasks(newTasks);
    // Lưu vào localStorage với key riêng cho từng người dùng
    localStorage.setItem(`tasks_${currentUser?.username}`, JSON.stringify(newTasks));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    console.log('Updating task:', updatedTask);
    
    // Tìm task cần cập nhật trong danh sách hiện tại
    const taskIndex = tasks.findIndex(task => task.id === updatedTask.id);
    
    if (taskIndex !== -1) {
      // Tạo một bản sao mới của danh sách tasks
      const newTasks = [...tasks];
      
      // Cập nhật task
      newTasks[taskIndex] = {
        ...updatedTask,
        order: updatedTask.order || 0  // Đảm bảo order không bị undefined
      };
      
      // Sắp xếp lại các task có cùng trạng thái để đảm bảo thứ tự đúng
      newTasks.sort((a, b) => {
        // Chỉ sắp xếp các task cùng status
        if (a.status === b.status) {
          return (a.order || 0) - (b.order || 0);
        }
        return 0;
      });
      
      // Cập nhật state và localStorage
      setTasks(newTasks);
      localStorage.setItem(`tasks_${currentUser?.username}`, JSON.stringify(newTasks));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    setTasks(newTasks);
    // Lưu vào localStorage với key riêng cho từng người dùng
    localStorage.setItem(`tasks_${currentUser?.username}`, JSON.stringify(newTasks));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={3}>Quản lý Công việc Nhóm</Title>
          {currentUser && (
            <Space>
              <span>Xin chào, {currentUser.username}</span>
              <a onClick={handleLogout}>Đăng xuất</a>
            </Space>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '20px' }}>
        {!currentUser ? (
          <Card style={{ maxWidth: 500, margin: '0 auto' }}>
            <Tabs defaultActiveKey="login">
              <TabPane tab="Đăng nhập" key="login">
                <LoginForm onLogin={handleLogin} />
              </TabPane>
              <TabPane tab="Đăng ký" key="register">
                <RegisterForm onRegister={handleRegister} />
              </TabPane>
            </Tabs>
          </Card>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <TaskStats tasks={tasks} />
            <Card title="Thêm công việc mới">
              <TaskForm onSubmit={handleAddTask} tasks={tasks} />
            </Card>
            <TaskList
              tasks={tasks}
              currentUser={currentUser.username}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </Space>
        )}
      </Content>
    </Layout>
  );
};

export default Bai1;
