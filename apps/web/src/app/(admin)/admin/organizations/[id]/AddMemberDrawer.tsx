'use client';

import { useState } from 'react';
import { Button } from '@eventuras/ratio-ui';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { Input } from '@eventuras/ratio-ui/forms';

interface AddMemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (userId: string) => Promise<void>;
  organizationId: number;
  organizationName?: string;
}

const AddMemberDrawer: React.FC<AddMemberDrawerProps> = ({
  isOpen,
  onClose,
  onAddMember,
  organizationId,
  organizationName,
}) => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAddMember(userId.trim());
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member. Please try again.');
      console.error('Error adding member:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserId('');
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    if (error) {
      setError(null); // Clear error when user starts typing
    }
  };

  return (
    <Drawer isOpen={isOpen} onCancel={handleClose}>
      <Drawer.Header as="h2">
        Add New Member
        {organizationName && (
          <span className="text-sm font-normal text-gray-600 block mt-1">
            to {organizationName}
          </span>
        )}
      </Drawer.Header>

      <Drawer.Body>
        <div className="space-y-4">
          <div>
            <Input
              id="userId"
              type="text"
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Enter user ID (e.g., 12345)"
              className="w-full"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <h4 className="font-medium mb-1">How to find a User ID:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Go to the Users management page</li>
                <li>Search for the user you want to add</li>
                <li>Copy their User ID from the user list</li>
              </ul>
            </div>
          </div>
        </div>
      </Drawer.Body>

      <Drawer.Footer>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !userId.trim()}>
            {isLoading ? 'Adding Member...' : 'Add Member'}
          </Button>
        </div>
      </Drawer.Footer>
    </Drawer>
  );
};

export default AddMemberDrawer;
