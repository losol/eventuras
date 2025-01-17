import * as migration_20250113_214501_initial from './20250113_214501_initial';
import * as migration_20250117_230439_channels from './20250117_230439_channels';

export const migrations = [
  {
    up: migration_20250113_214501_initial.up,
    down: migration_20250113_214501_initial.down,
    name: '20250113_214501_initial',
  },
  {
    up: migration_20250117_230439_channels.up,
    down: migration_20250117_230439_channels.down,
    name: '20250117_230439_channels'
  },
];
