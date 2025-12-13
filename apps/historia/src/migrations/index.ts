import * as migration_20251213_223630_initial from './20251213_223630_initial';

export const migrations = [
  {
    up: migration_20251213_223630_initial.up,
    down: migration_20251213_223630_initial.down,
    name: '20251213_223630_initial'
  },
];
