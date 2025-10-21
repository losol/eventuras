import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';

interface ConfirmDiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const ConfirmDiscardModal: React.FC<ConfirmDiscardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mx-auto max-w-sm rounded-sm bg-white p-6">
          <p className="mt-2 text-sm text-gray-500">{description}</p>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={onConfirm}
            >
              Yes, discard
            </button>
            <button
              type="button"
              className="ml-4 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              No, go back
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDiscardModal;
