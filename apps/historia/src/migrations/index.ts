import * as migration_20250113_214501_initial from './20250113_214501_initial';

export const migrations = [
  {
    up: migration_20250113_214501_initial.up,
    down: migration_20250113_214501_initial.down,
    name: '20250113_214501_initial'
  },
];
