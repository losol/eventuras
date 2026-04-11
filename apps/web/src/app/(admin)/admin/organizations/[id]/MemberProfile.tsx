'use client';
import React from 'react';

import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { UserDto } from '@/lib/eventuras-sdk';
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
    <Card marginY="xs">
      <Heading as="h2" paddingY="xs">
        {user.name ?? 'Member'}
        {archivedBadge}
      </Heading>
      {/* Identity */}
      <DescriptionList>
        {/* Name */}
        <DescriptionList.Item>
          <DescriptionList.Term>Name</DescriptionList.Term>
          <DescriptionList.Definition>
            {has(user.name) ? user.name : '—'}
          </DescriptionList.Definition>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Id</DescriptionList.Term>
          <DescriptionList.Definition>{has(user.id) ? user.id : '—'}</DescriptionList.Definition>
        </DescriptionList.Item>
        {/* Contact */}
        <DescriptionList.Item>
          <DescriptionList.Term>Email</DescriptionList.Term>
          <DescriptionList.Definition>
            {has(user.email) ? (
              <a href={`mailto:${user.email}`} className="underline">
                {user.email}
              </a>
            ) : (
              '—'
            )}
          </DescriptionList.Definition>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Phone</DescriptionList.Term>
          <DescriptionList.Definition>
            {has(user.phoneNumber) ? user.phoneNumber : '—'}
          </DescriptionList.Definition>
        </DescriptionList.Item>
        {/* Notes */}
        {has(user.supplementaryInformation) && (
          <DescriptionList.Item>
            <DescriptionList.Term>Notes</DescriptionList.Term>
            <DescriptionList.Definition>{user.supplementaryInformation}</DescriptionList.Definition>
          </DescriptionList.Item>
        )}
        {/* Memberships */}
        {user.organizationMembership && user.organizationMembership.length > 0 && (
          <DescriptionList.Item>
            <DescriptionList.Term>Roles</DescriptionList.Term>
            <DescriptionList.Definition>
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
            </DescriptionList.Definition>
          </DescriptionList.Item>
        )}
      </DescriptionList>
    </Card>
  );
};
export default MemberProfile;
