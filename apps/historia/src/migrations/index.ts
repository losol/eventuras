import * as migration_20251213_223630_initial from './20251213_223630_initial';
import * as migration_20251216_202151_mcp from './20251216_202151_mcp';
import * as migration_20251217_233706_contactinfos from './20251217_233706_contactinfos';
import * as migration_20260103_192818_nullables from './20260103_192818_nullables';
import * as migration_20260103_230557_carts from './20260103_230557_carts';
import * as migration_20260104_011858_transactiondata from './20260104_011858_transactiondata';
import * as migration_20260105_205907_cart_status from './20260105_205907_cart_status';
import * as migration_20260111_135638_taxexempt from './20260111_135638_taxexempt';
import * as migration_20260111_145904_show_image_products_block from './20260111_145904_show_image_products_block';
import * as migration_20260112_224002_imagesize from './20260112_224002_imagesize';
import * as migration_20260116_232350_image_updates from './20260116_232350_image_updates';
import * as migration_20260117_192436_site_roles from './20260117_192436_site_roles';
import * as migration_20260117_194401_remove_global_admin_user_roles from './20260117_194401_remove_global_admin_user_roles';
import * as migration_20260118_202627_user_data_policy from './20260118_202627_user_data_policy';

export const migrations = [
  {
    up: migration_20251213_223630_initial.up,
    down: migration_20251213_223630_initial.down,
    name: '20251213_223630_initial',
  },
  {
    up: migration_20251216_202151_mcp.up,
    down: migration_20251216_202151_mcp.down,
    name: '20251216_202151_mcp',
  },
  {
    up: migration_20251217_233706_contactinfos.up,
    down: migration_20251217_233706_contactinfos.down,
    name: '20251217_233706_contactinfos',
  },
  {
    up: migration_20260103_192818_nullables.up,
    down: migration_20260103_192818_nullables.down,
    name: '20260103_192818_nullables',
  },
  {
    up: migration_20260103_230557_carts.up,
    down: migration_20260103_230557_carts.down,
    name: '20260103_230557_carts',
  },
  {
    up: migration_20260104_011858_transactiondata.up,
    down: migration_20260104_011858_transactiondata.down,
    name: '20260104_011858_transactiondata',
  },
  {
    up: migration_20260105_205907_cart_status.up,
    down: migration_20260105_205907_cart_status.down,
    name: '20260105_205907_cart_status',
  },
  {
    up: migration_20260111_135638_taxexempt.up,
    down: migration_20260111_135638_taxexempt.down,
    name: '20260111_135638_taxexempt',
  },
  {
    up: migration_20260111_145904_show_image_products_block.up,
    down: migration_20260111_145904_show_image_products_block.down,
    name: '20260111_145904_show_image_products_block',
  },
  {
    up: migration_20260112_224002_imagesize.up,
    down: migration_20260112_224002_imagesize.down,
    name: '20260112_224002_imagesize',
  },
  {
    up: migration_20260116_232350_image_updates.up,
    down: migration_20260116_232350_image_updates.down,
    name: '20260116_232350_image_updates',
  },
  {
    up: migration_20260117_192436_site_roles.up,
    down: migration_20260117_192436_site_roles.down,
    name: '20260117_192436_site_roles',
  },
  {
    up: migration_20260117_194401_remove_global_admin_user_roles.up,
    down: migration_20260117_194401_remove_global_admin_user_roles.down,
    name: '20260117_194401_remove_global_admin_user_roles',
  },
  {
    up: migration_20260118_202627_user_data_policy.up,
    down: migration_20260118_202627_user_data_policy.down,
    name: '20260118_202627_user_data_policy'
  },
];
