'use client';

import React from 'react';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import {
  Heading,
  DescriptionList,
  Item,
  Term,
  Definition,
  Section,
  Container,
} from '@eventuras/ratio-ui';
import { UserDto } from '@eventuras/event-sdk';
import { Card } from '@eventuras/ratio-ui/core/Card';

/** Props for MemberProfile */
export interface MemberProfileProps {
  /** User data to render */
  user: UserDto;
}

/** Simple value guard */
const has = (v?: string | null) => !!(v && v.trim().length);

/** Yes/No label */
const yesno = (b?: boolean) => (b ? 'Yes' : 'No');

/**
 * Member profile using DescriptionList.
 * See {@link MemberProfileProps}.
 */
export const MemberProfile: React.FC<MemberProfileProps> = ({ user }) => {
  // archived badge?
  const archivedBadge = user.archived ? <Badge>Archived</Badge> : null;

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
              {user.organizationMembership.map(membership =>
                membership.roles?.map((roleObj, roleIndex) => (
                  <Badge key={`${membership.id}-${roleIndex}`}>{roleObj.role}</Badge>
                ))
              )}
            </Definition>
          </Item>
        )}
      </DescriptionList>
    </Card>
  );
};

export default MemberProfile;
