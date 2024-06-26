/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    articles: Article;
    happenings: Happening;
    licenses: License;
    media: Media;
    notes: Note;
    organizations: Organization;
    persons: Person;
    places: Place;
    users: User;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  globals: {};
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "articles".
 */
export interface Article {
  id: string;
  title: string;
  image?:
    | {
        image: string | Media;
        caption?: string | null;
        id?: string | null;
        blockName?: string | null;
        blockType: 'image';
      }[]
    | null;
  lead?: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  story: {
    richText: {
      root: {
        type: string;
        children: {
          type: string;
          version: number;
          [k: string]: unknown;
        }[];
        direction: ('ltr' | 'rtl') | null;
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
        indent: number;
        version: number;
      };
      [k: string]: unknown;
    };
    id?: string | null;
    blockName?: string | null;
    blockType: 'content';
  }[];
  slug?: string | null;
  creators?:
    | {
        person: string | Person;
        role: 'ai' | 'author' | 'editor' | 'contributor' | 'illustrator' | 'photographer';
        id?: string | null;
      }[]
    | null;
  contentPersons?: (string | Person)[] | null;
  contentLocations?: (string | Place)[] | null;
  license?: (string | null) | License;
  publishedOn: string;
  relatedArticles?: (string | Article)[] | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: string;
  name: string;
  description?: string | null;
  license?: (string | null) | License;
  creators?:
    | {
        person: string | Person;
        role: 'ai' | 'author' | 'editor' | 'contributor' | 'illustrator' | 'photographer';
        id?: string | null;
      }[]
    | null;
  sourceUrl?: string | null;
  publisher?: (string | null) | Organization;
  contentPersons?: (string | Person)[] | null;
  contentLocations?: (string | Place)[] | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    standard?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "licenses".
 */
export interface License {
  id: string;
  name: string;
  abbreviation?: string | null;
  description?: string | null;
  url?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "persons".
 */
export interface Person {
  id: string;
  name: string;
  image?:
    | {
        image: string | Media;
        caption?: string | null;
        id?: string | null;
        blockName?: string | null;
        blockType: 'image';
      }[]
    | null;
  description?: string | null;
  jobTitle?: string | null;
  employer?: string | null;
  story: {
    richText: {
      root: {
        type: string;
        children: {
          type: string;
          version: number;
          [k: string]: unknown;
        }[];
        direction: ('ltr' | 'rtl') | null;
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
        indent: number;
        version: number;
      };
      [k: string]: unknown;
    };
    id?: string | null;
    blockName?: string | null;
    blockType: 'content';
  }[];
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "organizations".
 */
export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  logo?: string | Media | null;
  location?: (string | null) | Place;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "places".
 */
export interface Place {
  id: string;
  name: string;
  type: 'city' | 'hotel' | 'house';
  description?: string | null;
  postalAddress?: {
    streetAddress?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  story: {
    richText: {
      root: {
        type: string;
        children: {
          type: string;
          version: number;
          [k: string]: unknown;
        }[];
        direction: ('ltr' | 'rtl') | null;
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
        indent: number;
        version: number;
      };
      [k: string]: unknown;
    };
    id?: string | null;
    blockName?: string | null;
    blockType: 'content';
  }[];
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "happenings".
 */
export interface Happening {
  id: string;
  name: string;
  description?: string | null;
  image?:
    | {
        image: string | Media;
        caption?: string | null;
        id?: string | null;
        blockName?: string | null;
        blockType: 'image';
      }[]
    | null;
  story: {
    richText: {
      root: {
        type: string;
        children: {
          type: string;
          version: number;
          [k: string]: unknown;
        }[];
        direction: ('ltr' | 'rtl') | null;
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
        indent: number;
        version: number;
      };
      [k: string]: unknown;
    };
    id?: string | null;
    blockName?: string | null;
    blockType: 'content';
  }[];
  type?: ('conference' | 'educational' | 'hackathon' | 'social') | null;
  startDate?: string | null;
  endDate?: string | null;
  contentLocations?: (string | Place)[] | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "notes".
 */
export interface Note {
  id: string;
  title: string;
  image?:
    | {
        image: string | Media;
        caption?: string | null;
        id?: string | null;
        blockName?: string | null;
        blockType: 'image';
      }[]
    | null;
  content?: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  contentPersons?: (string | Person)[] | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  roles?: ('admin' | 'user')[] | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}