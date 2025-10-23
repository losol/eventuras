import { Definition, DescriptionList, Item, Term } from '@eventuras/ratio-ui/core/DescriptionList';

import { OrganizationDto } from "@/lib/eventuras-sdk";

/** Renders org fields with DescriptionList */
export const OrganizationDetails: React.FC<{ org: OrganizationDto }> = ({ org }) => {
  // guard against empty strings
  const has = (v?: string | null) => !!(v && v.trim().length);
  return (
    <DescriptionList>
      {/* Name */}
      <Item>
        <Term>Name</Term>
        <Definition data-testid="org-name">{org.name}</Definition>
      </Item>
      {/* Description */}
      {has(org.description) && (
        <Item>
          <Term>Description</Term>
          <Definition data-testid="org-description">{org.description}</Definition>
        </Item>
      )}
      {/* URL */}
      {has(org.url) && (
        <Item>
          <Term>Website</Term>
          <Definition data-testid="org-url">
            <a href={org.url!} target="_blank" rel="noopener noreferrer" className="underline">
              {org.url}
            </a>
          </Definition>
        </Item>
      )}
      {/* Phone */}
      {has(org.phone) && (
        <Item>
          <Term>Phone</Term>
          <Definition data-testid="org-phone">{org.phone}</Definition>
        </Item>
      )}
      {/* Email */}
      {has(org.email) && (
        <Item>
          <Term>Email</Term>
          <Definition data-testid="org-email">{org.email}</Definition>
        </Item>
      )}
      {/* Logo URL */}
      {has(org.logoUrl) && (
        <Item>
          <Term>Logo URL</Term>
          <Definition data-testid="org-logourl">
            <a href={org.logoUrl!} target="_blank" rel="noopener noreferrer" className="underline">
              {org.logoUrl}
            </a>
          </Definition>
        </Item>
      )}
    </DescriptionList>
  );
};
