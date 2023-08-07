import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: (v: boolean) => void;
  title?: string;
  text?: string;
}
const AlertModal: React.FC<ModalProps> = ({ isOpen = false, onClose, title = '', text = '' }) => {
  function handleOpenChange(open: boolean) {
    if (!open) onClose(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} defaultOpen={false}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">{text}</div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertModal;
