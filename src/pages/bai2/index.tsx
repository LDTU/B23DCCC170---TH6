import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Tag, Modal, Form, DatePicker, Select, Space, Row, Col, List, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined, StarOutlined, StarFilled, PushpinOutlined, PushpinFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import moment from 'moment';
import {
  StyledCard,
  NoteTitle,
  NoteContent,
  NoteDate,
  TagContainer,
  ActionButton,
  HeaderContainer,
  FilterContainer,
  NotesContainer,
  PageContainer,
  GridContainer
} from './styles';

const { Title } = Typography;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  isImportant: boolean;
  isPinned: boolean;
}

const NoteApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null]>([null, null]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    const [startDate, endDate] = dateRange;
    if (startDate && endDate) {
      filtered = filtered.filter(note => {
        const noteDate = moment(note.createdAt);
        return noteDate.isAfter(startDate) && noteDate.isBefore(endDate);
      });
    }

    // Sắp xếp: ghi chú được pin lên đầu, sau đó là ghi chú quan trọng
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      if (a.isImportant !== b.isImportant) return b.isImportant ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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

  const toggleImportant = (id: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, isImportant: !note.isImportant } : note
    );
    setNotes(updatedNotes);
    saveNotesToLocalStorage(updatedNotes);
  };

  const togglePin = (id: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );
    setNotes(updatedNotes);
    saveNotesToLocalStorage(updatedNotes);
  };

  const renderNoteCard = (note: Note) => (
    <StyledCard
      key={note.id}
      title={
        <NoteTitle>
          {note.title}
          {note.isPinned && (
            <Tooltip title="Đã ghim">
              <PushpinFilled style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </NoteTitle>
      }
      extra={
        <Space>
          <Tooltip title={note.isImportant ? "Bỏ đánh dấu quan trọng" : "Đánh dấu quan trọng"}>
            <ActionButton
              type="text"
              icon={note.isImportant ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => toggleImportant(note.id)}
            />
          </Tooltip>
          <Tooltip title={note.isPinned ? "Bỏ ghim" : "Ghim ghi chú"}>
            <ActionButton
              type="text"
              icon={note.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
              onClick={() => togglePin(note.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <ActionButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditNote(note)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <ActionButton
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteNote(note.id)}
            />
          </Tooltip>
        </Space>
      }
      style={{
        borderColor: note.isImportant ? '#faad14' : undefined,
        borderWidth: note.isImportant ? 2 : 1,
      }}
    >
      <NoteContent>{note.content}</NoteContent>
      <NoteDate>Ngày tạo: {note.createdAt}</NoteDate>
      <TagContainer>
        {note.tags.map(tag => (
          <Tag key={tag} color="blue">
            {tag}
          </Tag>
        ))}
      </TagContainer>
    </StyledCard>
  );

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newNote: Note = {
        id: editingNote?.id || Date.now().toString(),
        title: values.title,
        content: values.content,
        createdAt: values.createdAt.format('YYYY-MM-DD HH:mm:ss'),
        tags: values.tags || [],
        isImportant: editingNote?.isImportant || false,
        isPinned: editingNote?.isPinned || false,
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
    <PageContainer>
      <HeaderContainer>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Ghi chú cá nhân</Title>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Chế độ lưới">
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                />
              </Tooltip>
              <Tooltip title="Chế độ danh sách">
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('list')}
                />
              </Tooltip>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNote}>
                Thêm ghi chú
              </Button>
            </Space>
          </Col>
        </Row>
      </HeaderContainer>

      <FilterContainer>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              size="large"
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
              size="large"
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
              onChange={dates => setDateRange(dates as [moment.Moment | null, moment.Moment | null])}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              size="large"
            />
          </Col>
        </Row>
      </FilterContainer>

      <NotesContainer>
        {viewMode === 'grid' ? (
          <GridContainer>
            {filteredNotes.map(renderNoteCard)}
          </GridContainer>
        ) : (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={filteredNotes}
            renderItem={note => (
              <List.Item>
                {renderNoteCard(note)}
              </List.Item>
            )}
          />
        )}
      </NotesContainer>

      <Modal
        title={editingNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item
            name="createdAt"
            label="Ngày tạo"
            rules={[{ required: true, message: 'Vui lòng chọn ngày tạo' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập tags và nhấn Enter"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default NoteApp;
