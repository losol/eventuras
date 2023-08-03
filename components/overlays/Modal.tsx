import { Modal } from '@mantine/core';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  text?: string;
}
const AlertModal: React.FC<ModalProps> = ({ isOpen = false, onClose, title = '', text = '' }) => {
  return (
    <>
      <Modal.Root opened={isOpen} onClose={onClose}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>{text}</Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

export default AlertModal;
