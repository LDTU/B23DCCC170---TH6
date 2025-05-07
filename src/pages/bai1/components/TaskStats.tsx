import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Task } from '../types';

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'Đã xong').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'Đang làm').length;
  const pendingTasks = tasks.filter((task) => task.status === 'Chưa làm').length;

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng số công việc"
            value={totalTasks}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Đã hoàn thành"
            value={completedTasks}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Đang thực hiện"
            value={inProgressTasks}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Chưa thực hiện"
            value={pendingTasks}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TaskStats; 