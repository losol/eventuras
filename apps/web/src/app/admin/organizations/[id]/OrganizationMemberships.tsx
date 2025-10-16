'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Section } from '@eventuras/ratio-ui';
import MemberProfile from './MemberProfile';
import AddMemberDrawer from './AddMemberDrawer';
import { addMember, setAdmin } from './actions';
import { UserDto } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/utils/src/Logger';
import { useToast } from '@eventuras/toast';

export interface OrganizationMembershipsProps {
  organizationId: number;
  organizationName: string;
  members: UserDto[] | null;
}

/** Memberships section for an organization
 *  @see OrganizationMembershipsProps
 */
export default function OrganizationMemberships({
  organizationId,
  organizationName,
  members,
}: OrganizationMembershipsProps) {
  // drawer visible state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // validate + call server action (receives ID from the drawer)
  const handleAddMember = async (enteredId: string) => {
    Logger.debug(
      { namespace: 'organization:memberships', developerOnly: true },
      '[client] received from drawer',
      { organizationId, enteredId }
    );
    const trimmedUserId = enteredId?.trim();

    if (!trimmedUserId) {
      toast.error('Please enter a valid user ID');
      return;
    }

    // Check if member already exists
    const existingMember = members?.find(member => (member as any).id === trimmedUserId);
    if (existingMember) {
      toast.info('This user is already a member of the organization');
      return;
    }

    try {
      Logger.debug(
        { namespace: 'organization:memberships', developerOnly: true },
        '[client] invoking action',
        { organizationId, trimmedUserId }
      );
      const res = await addMember(organizationId, trimmedUserId);
      Logger.info({ namespace: 'organization:memberships' }, '[client] member added successfully', {
        organizationId,
        userId: trimmedUserId,
        result: res,
      });

      toast.success('Member added successfully!');

      // refresh data
      router.refresh();
      // close drawer
      setIsDrawerOpen(false);
    } catch (e) {
      Logger.error(
        { namespace: 'organization:memberships', error: e },
        '[client] failed to add member',
        { organizationId, userId: trimmedUserId }
      );

      toast.error('Failed to add member. Please check the user ID and try again.');
    }
  };

  // close + reset
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // toggle Admin for a single user
  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    // Find the user name for better toast messages
    const user = members?.find(member => (member as any).id === userId);
    const userName = user?.name || 'User';

    toast.info(
      makeAdmin
        ? `Granting admin privileges to ${userName}...`
        : `Removing admin privileges from ${userName}...`
    );

    try {
      Logger.debug(
        { namespace: 'organization:memberships', developerOnly: true },
        '[client] toggling admin status',
        { organizationId, userId, makeAdmin }
      );
      await setAdmin(organizationId, userId, makeAdmin);
      Logger.info({ namespace: 'organization:memberships' }, '[client] admin status updated', {
        organizationId,
        userId,
        makeAdmin,
      });

      toast.success(
        makeAdmin ? `${userName} is now an admin!` : `Admin privileges removed from ${userName}`
      );

      router.refresh();
    } catch (e) {
      Logger.error(
        { namespace: 'organization:memberships', error: e },
        '[client] failed to toggle admin status',
        { organizationId, userId, makeAdmin }
      );

      toast.error(
        makeAdmin
          ? `Failed to grant admin privileges to ${userName}. Please try again.`
          : `Failed to remove admin privileges from ${userName}. Please try again.`
      );
    }
  };

  return (
    <Section container>
      {/* header */}
      <Heading as="h2" padding="py-3">
        Organization members
      </Heading>

      {/* open drawer */}
      <div className="mb-6">
        <Button
          onClick={() => {
            setIsDrawerOpen(true);
            toast.info('Add a new member to the organization');
          }}
        >
          Add Member
        </Button>
      </div>

      {/* list members - much cleaner now! */}
      <div className="space-y-4">
        {members?.map(user => (
          <MemberProfile
            key={(user as any).id}
            user={user}
            organizationId={organizationId}
            onToggleAdmin={handleToggleAdmin}
          />
        ))}
      </div>

      {/* add member drawer */}
      <AddMemberDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAddMember={handleAddMember}
        organizationId={organizationId}
        organizationName={organizationName}
      />
    </Section>
  );
}
