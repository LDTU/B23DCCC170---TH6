import styled from 'styled-components';
import { Button, Card } from 'antd';

export const StyledCard = styled(Card)`
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ant-card-head {
    min-height: auto;
    padding: 12px 16px;
  }

  .ant-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  @media (max-width: 768px) {
    .ant-card-head {
      padding: 8px 12px;
    }

    .ant-card-body {
      padding: 12px;
    }
  }
`;

export const NoteTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const NoteContent = styled.div`
  margin: 12px 0;
  color: #666;
  flex: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;

  @media (max-width: 768px) {
    margin: 8px 0;
    font-size: 14px;
  }
`;

export const NoteDate = styled.div`
  color: #999;
  font-size: 12px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
`;

export const ActionButton = styled(Button)`
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export const HeaderContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const FilterContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const NotesContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const PageContainer = styled.div`
  padding: 24px;
  min-height: 100vh;
  background-color: #f0f2f5;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`; 