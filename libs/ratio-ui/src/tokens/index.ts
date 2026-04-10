export { gridGapClasses, getGridClasses, type GapSize } from './spacing';

// ADR-0001: unified spacing, border, and color types
export type {
  Space,
  SpacingProps,
  BorderVariant,
  BorderProps,
  Color,
  Status,
} from './types';

export { buildSpacingClasses, buildBorderClasses } from './classBuilders';
