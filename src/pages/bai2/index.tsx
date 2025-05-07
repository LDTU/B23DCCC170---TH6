import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Tag, Modal, Form, DatePicker, Select, Space, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

const NoteApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      setFilteredNotes(parsedNotes);
    }
  }, []);

  useEffect(() => {
    filterNotes();
  }, [searchText, selectedTags, dateRange, notes]);

  const filterNotes = () => {
    let filtered = [...notes];

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.every(tag => note.tags.includes(tag))
      );
    }

    // Lọc theo khoảng thời gian
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(note => {
        const noteDate = dayjs(note.createdAt);
        return noteDate.isAfter(dateRange[0]) && noteDate.isBefore(dateRange[1]);
      });
    }

    setFilteredNotes(filtered);
  };

  // Lấy danh sách tất cả các tags duy nhất
  const getAllTags = () => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const saveNotesToLocalStorage = (updatedNotes: Note[]) => {
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    setEditingNote(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    form.setFieldsValue({
      ...note,
      createdAt: dayjs(note.createdAt),
    });
    setIsModalVisible(true);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotesToLocalStorage(updatedNotes);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newNote: Note = {
        id: editingNote?.id || Date.now().toString(),
        title: values.title,
        content: values.content,
        createdAt: values.createdAt.format('YYYY-MM-DD HH:mm:ss'),
        tags: values.tags || [],
      };

      if (editingNote) {
        const updatedNotes = notes.map(note =>
          note.id === editingNote.id ? newNote : note
        );
        setNotes(updatedNotes);
        saveNotesToLocalStorage(updatedNotes);
      } else {
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        saveNotesToLocalStorage(updatedNotes);
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Ghi chú cá nhân</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNote}>
          Thêm ghi chú
        </Button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Lọc theo tags"
              value={selectedTags}
              onChange={setSelectedTags}
              allowClear
            >
              {getAllTags().map(tag => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={dates => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Col>
        </Row>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredNotes.map(note => (
          <Card
            key={note.id}
            title={note.title}
            extra={
              <div>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditNote(note)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteNote(note.id)}
                />
              </div>
            }
          >
            <p>{note.content}</p>
            <p>Ngày tạo: {note.createdAt}</p>
            <div>
              {note.tags.map(tag => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={editingNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="createdAt"
            label="Ngày tạo"
            rules={[{ required: true, message: 'Vui lòng chọn ngày tạo' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập tags và nhấn Enter"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoteApp;
