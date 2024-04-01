import { Dialog } from '@eventuras/ui';

export type EditUserRegistrationDialogProps = {
  editorOpen: boolean;
};

const EditUserRegistrationDialog = (props: EditUserRegistrationDialogProps) => {
  return (
    <Dialog title="Edit Participant" isOpen={props.editorOpen} onClose={() => {}}>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          Go ahead and edit your orders below. Please note that mandatory products of an event
          cannot be changed directly, please contact an administrator instead.
        </p>
      </div>
      <div></div>
    </Dialog>
  );
};

export default EditUserRegistrationDialog;
