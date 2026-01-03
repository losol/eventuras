import * as migration_20251213_223630_initial from './20251213_223630_initial';
import * as migration_20251216_202151_mcp from './20251216_202151_mcp';
import * as migration_20251217_233706_contactinfos from './20251217_233706_contactinfos';
import * as migration_20260103_192818_nullables from './20260103_192818_nullables';
import * as migration_20260103_230557_carts from './20260103_230557_carts';

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
    name: '20260103_230557_carts'
  },
];
