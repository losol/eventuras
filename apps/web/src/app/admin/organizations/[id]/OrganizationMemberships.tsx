'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Section } from '@eventuras/ratio-ui';
import MemberProfile from './MemberProfile';
import AddMemberDrawer from './AddMemberDrawer';
import { updateMemberRoles, addMember } from './actions';
import { UserDto } from '@eventuras/event-sdk';

export interface OrganizationMembershipsProps {
  /** Org id used by mutation */
  organizationId: number;
  /** Name shown in header/drawer */
  organizationName: string;
  /** Initial members from server */
  members: UserDto[];
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

  // validate + call server action (receives ID from the drawer)
  const handleAddMember = async (enteredId: string) => {
    console.log('[client] received from drawer', { organizationId, enteredId });
    const trimmedUserId = enteredId?.trim();
    if (!trimmedUserId) {
      console.warn('[client] empty user id from drawer');
      return;
    }

    try {
      console.log('[client] invoking action', { organizationId, trimmedUserId });
      const res = await addMember(organizationId, trimmedUserId);
      console.log('[client] action result', res);
      // refresh data
      router.refresh();
      // close drawer
      setIsDrawerOpen(false);
    } catch (e) {
      console.error('[client] action error', e);
    }
  };

  // close + reset
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <Section container>
      {/* header */}
      <Heading as="h2" padding="py-3">
        Organization members ({members.length})
      </Heading>

      {/* open drawer */}
      <div className="mb-6">
        <Button onClick={() => setIsDrawerOpen(true)}>Add Member</Button>
      </div>

      {/* list members */}
      <div className="space-y-4">
        {members.map(user => (
          <MemberProfile key={(user as any).id} user={user} />
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
