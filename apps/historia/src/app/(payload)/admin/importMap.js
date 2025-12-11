import { TenantField as TenantField_1d0591e3cf4f332c83a86da13a0de59a } from '@payloadcms/plugin-multi-tenant/client'
import { RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e } from '@payloadcms/richtext-lexical/rsc'
import { RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e } from '@payloadcms/richtext-lexical/rsc'
import { LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e } from '@payloadcms/richtext-lexical/rsc'
import { LinkFeatureClient as LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { UnderlineFeatureClient as UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { ParagraphFeatureClient as ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { InlineToolbarFeatureClient as InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { SlugComponent as SlugComponent_92cc057d0a2abb4f6cf0307edf59f986 } from '@/fields/slug/SlugComponent'
import { AssignTenantFieldTrigger as AssignTenantFieldTrigger_1d0591e3cf4f332c83a86da13a0de59a } from '@payloadcms/plugin-multi-tenant/client'
import { OrderSaveButton as OrderSaveButton_78481da30083d3e8e0e4674008b510d6 } from '@/collections/Orders/components/OrderEditComponents'
import { FixedToolbarFeatureClient as FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { PersonNameComponent as PersonNameComponent_2a71690645e56540458fc560c4b28e52 } from '@/fields/PersonNameComponent'
import { PriceField as PriceField_07375945334b53a2da1ffe8b4244c331 } from '@/collections/Products/PriceField'
import { TotalPriceField as TotalPriceField_70f8c825e5769517eb93cd56bc5b44b3 } from '@/collections/Products/TotalPriceField'
import { WatchTenantCollection as WatchTenantCollection_1d0591e3cf4f332c83a86da13a0de59a } from '@payloadcms/plugin-multi-tenant/client'
import { LinkToDoc as LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634 } from '@payloadcms/plugin-search/client'
import { ReindexButton as ReindexButton_aead06e4cbf6b2620c5c51c9ab283634 } from '@payloadcms/plugin-search/client'
import { default as default_8a7ab0eb7ab5c511aba12e68480bfe5e } from '@/components/BeforeLogin'
import { TenantSelector as TenantSelector_d6d5f193a167989e2ee7d14202901e62 } from '@payloadcms/plugin-multi-tenant/rsc'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'
import { TenantSelectionProvider as TenantSelectionProvider_d6d5f193a167989e2ee7d14202901e62 } from '@payloadcms/plugin-multi-tenant/rsc'

export const importMap = {
  "@payloadcms/plugin-multi-tenant/client#TenantField": TenantField_1d0591e3cf4f332c83a86da13a0de59a,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell": RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalField": RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#LexicalDiffComponent": LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/client#LinkFeatureClient": LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BoldFeatureClient": BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ItalicFeatureClient": ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnderlineFeatureClient": UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ParagraphFeatureClient": ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient": InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HeadingFeatureClient": HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@/fields/slug/SlugComponent#SlugComponent": SlugComponent_92cc057d0a2abb4f6cf0307edf59f986,
  "@payloadcms/plugin-multi-tenant/client#AssignTenantFieldTrigger": AssignTenantFieldTrigger_1d0591e3cf4f332c83a86da13a0de59a,
  "@/collections/Orders/components/OrderEditComponents#OrderSaveButton": OrderSaveButton_78481da30083d3e8e0e4674008b510d6,
  "@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient": FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@/fields/PersonNameComponent#PersonNameComponent": PersonNameComponent_2a71690645e56540458fc560c4b28e52,
  "@/collections/Products/PriceField#PriceField": PriceField_07375945334b53a2da1ffe8b4244c331,
  "@/collections/Products/TotalPriceField#TotalPriceField": TotalPriceField_70f8c825e5769517eb93cd56bc5b44b3,
  "@payloadcms/plugin-multi-tenant/client#WatchTenantCollection": WatchTenantCollection_1d0591e3cf4f332c83a86da13a0de59a,
  "@payloadcms/plugin-search/client#LinkToDoc": LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  "@payloadcms/plugin-search/client#ReindexButton": ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
  "@/components/BeforeLogin#default": default_8a7ab0eb7ab5c511aba12e68480bfe5e,
  "@payloadcms/plugin-multi-tenant/rsc#TenantSelector": TenantSelector_d6d5f193a167989e2ee7d14202901e62,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@payloadcms/plugin-multi-tenant/rsc#TenantSelectionProvider": TenantSelectionProvider_d6d5f193a167989e2ee7d14202901e62
}
