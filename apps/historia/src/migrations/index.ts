import * as migration_20250113_214501_initial from './20250113_214501_initial';
import * as migration_20250117_230439_channels from './20250117_230439_channels';
import * as migration_20250118_225211_archiveblock from './20250118_225211_archiveblock';
import * as migration_20250119_142659_frontpage from './20250119_142659_frontpage';
import * as migration_20250511_212133_multitenant from './20250511_212133_multitenant';

export const migrations = [
  {
    up: migration_20250113_214501_initial.up,
    down: migration_20250113_214501_initial.down,
    name: '20250113_214501_initial',
  },
  {
    up: migration_20250117_230439_channels.up,
    down: migration_20250117_230439_channels.down,
    name: '20250117_230439_channels',
  },
  {
    up: migration_20250118_225211_archiveblock.up,
    down: migration_20250118_225211_archiveblock.down,
    name: '20250118_225211_archiveblock',
  },
  {
    up: migration_20250119_142659_frontpage.up,
    down: migration_20250119_142659_frontpage.down,
    name: '20250119_142659_frontpage',
  },
  {
    up: migration_20250511_212133_multitenant.up,
    down: migration_20250511_212133_multitenant.down,
    name: '20250511_212133_multitenant',
  }
];
