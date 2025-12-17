import * as migration_20251213_223630_initial from './20251213_223630_initial';
import * as migration_20251216_202151_mcp from './20251216_202151_mcp';
import * as migration_20251217_233706_contactinfos from './20251217_233706_contactinfos';

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
    name: '20251217_233706_contactinfos'
  },
];
