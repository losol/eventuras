'use client';
import React from 'react';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Container } from '@eventuras/ratio-ui/layout/Container';

;
import { DescriptionList, Item, Term, Definition } from '@eventuras/ratio-ui/core/DescriptionList';
;
;
;
import { UserDto } from '@eventuras/event-sdk';
import { Card } from '@eventuras/ratio-ui/core/Card';
/** Props for MemberProfile */
export interface MemberProfileProps {
  /** User data to render */
  user: UserDto;
  /** Organization ID for role checking */
  organizationId?: number;
  /** Callback for admin toggle */
  onToggleAdmin?: (userId: string, makeAdmin: boolean) => void;
}
/** Simple value guard */
const has = (v?: string | null) => !!(v && v.trim().length);
/** Yes/No label */
const yesno = (b?: boolean) => (b ? 'Yes' : 'No');
/**
 * Member profile using DescriptionList.
 * See {@link MemberProfileProps}.
 */
export const MemberProfile: React.FC<MemberProfileProps> = ({
  user,
  organizationId,
  onToggleAdmin,
}) => {
  // archived badge?
  const archivedBadge = user.archived ? <Badge>Archived</Badge> : null;
  // check if user is Admin in this organization
  const isAdminInOrg = () => {
    if (!organizationId) return false;
    const membership = (user as any)?.organizationMembership?.find(
      (mm: any) => mm.organizationId === organizationId
    );
    return !!membership?.roles?.some((r: any) => r.role === 'Admin');
  };
  // handle admin toggle
  const handleAdminToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggleAdmin && (user as any).id) {
      onToggleAdmin((user as any).id, e.target.checked);
    }
  };
  return (
    <Card margin="my-1">
      <Heading as="h2" padding="py-3">
        {user.name ?? 'Member'}
        {archivedBadge}
      </Heading>
      {/* Identity */}
      <DescriptionList>
        {/* Name */}
        <Item>
          <Term>Name</Term>
          <Definition>{has(user.name) ? user.name : '—'}</Definition>
        </Item>
        <Item>
          <Term>Id</Term>
          <Definition>{has(user.id) ? user.id : '—'}</Definition>
        </Item>
        {/* Contact */}
        <Item>
          <Term>Email</Term>
          <Definition>
            {has(user.email) ? (
              <a href={`mailto:${user.email}`} className="underline">
                {user.email}
              </a>
            ) : (
              '—'
            )}
          </Definition>
        </Item>
        <Item>
          <Term>Phone</Term>
          <Definition>{has(user.phoneNumber) ? user.phoneNumber : '—'}</Definition>
        </Item>
        {/* Notes */}
        {has(user.supplementaryInformation) && (
          <Item>
            <Term>Notes</Term>
            <Definition>{user.supplementaryInformation}</Definition>
          </Item>
        )}
        {/* Memberships */}
        {user.organizationMembership && user.organizationMembership.length > 0 && (
          <Item>
            <Term>Roles</Term>
            <Definition>
              {/* Admin toggle - only show if we have the required props */}
              {organizationId && onToggleAdmin && (
                <label className="inline-flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    checked={isAdminInOrg()}
                    onChange={handleAdminToggle}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Admin</span>
                </label>
              )}
            </Definition>
          </Item>
        )}
      </DescriptionList>
    </Card>
  );
};
export default MemberProfile;