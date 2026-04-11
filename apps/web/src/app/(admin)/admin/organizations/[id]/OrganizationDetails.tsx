import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';

import { OrganizationDto } from '@/lib/eventuras-sdk';

/** Renders org fields with DescriptionList */
export const OrganizationDetails: React.FC<{ org: OrganizationDto }> = ({ org }) => {
  // guard against empty strings
  const has = (v?: string | null) => !!(v?.trim().length);
  return (
    <DescriptionList>
      {/* Name */}
      <DescriptionList.Item>
        <DescriptionList.Term>Name</DescriptionList.Term>
        <DescriptionList.Definition testId="org-name">{org.name}</DescriptionList.Definition>
      </DescriptionList.Item>
      {/* Description */}
      {has(org.description) && (
        <DescriptionList.Item>
          <DescriptionList.Term>Description</DescriptionList.Term>
          <DescriptionList.Definition testId="org-description">
            {org.description}
          </DescriptionList.Definition>
        </DescriptionList.Item>
      )}
      {/* URL */}
      {has(org.url) && (
        <DescriptionList.Item>
          <DescriptionList.Term>Website</DescriptionList.Term>
          <DescriptionList.Definition testId="org-url">
            <a href={org.url!} target="_blank" rel="noopener noreferrer" className="underline">
              {org.url}
            </a>
          </DescriptionList.Definition>
        </DescriptionList.Item>
      )}
      {/* Phone */}
      {has(org.phone) && (
        <DescriptionList.Item>
          <DescriptionList.Term>Phone</DescriptionList.Term>
          <DescriptionList.Definition testId="org-phone">{org.phone}</DescriptionList.Definition>
        </DescriptionList.Item>
      )}
      {/* Email */}
      {has(org.email) && (
        <DescriptionList.Item>
          <DescriptionList.Term>Email</DescriptionList.Term>
          <DescriptionList.Definition testId="org-email">{org.email}</DescriptionList.Definition>
        </DescriptionList.Item>
      )}
      {/* Logo URL */}
      {has(org.logoUrl) && (
        <DescriptionList.Item>
          <DescriptionList.Term>Logo URL</DescriptionList.Term>
          <DescriptionList.Definition testId="org-logourl">
            <a href={org.logoUrl!} target="_blank" rel="noopener noreferrer" className="underline">
              {org.logoUrl}
            </a>
          </DescriptionList.Definition>
        </DescriptionList.Item>
      )}
    </DescriptionList>
  );
};
