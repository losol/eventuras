import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';

export type EditUserRegistrationDialogProps = {
  editorOpen: boolean;
};

const EditUserRegistrationDialog = (props: EditUserRegistrationDialogProps) => {
  return (
    <Dialog isOpen={props.editorOpen} onClose={() => {}}>
      <Dialog.Heading>Edit Participant</Dialog.Heading>
      <Dialog.Content>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Go ahead and edit your orders below. Please note that mandatory products of an event
            cannot be changed directly, please contact an administrator instead.
          </p>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default EditUserRegistrationDialog;
