/**
 * Icon exports from the Eventuras design system.
 * 
 * This module re-exports icons from lucide-react to provide:
 * - A centralized place for all icons used in the design system
 * - Ability to add custom icons alongside lucide icons in the future
 * - Consistent icon usage across all apps
 * 
 * Usage:
 * ```tsx
 * import { Calendar, User } from '@eventuras/ratio-ui/icons';
 * ```
 */

// Re-export commonly used lucide-react icons
export {
  // Navigation & UI Controls
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  X,
  
  // Status & Feedback
  Check,
  CircleX,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldX,
  
  // Actions & Content
  Eye,
  Pencil,
  Trash2,
  User,
  FileText,
  ShoppingCart,
  Calendar,
  MapPin,
  Home,
  
  // Loading & System
  LoaderCircle,
  
  // Add more icons as needed
} from 'lucide-react';

// Future: Custom icons can be added here
// export { CustomEventIcon } from './custom-icons/CustomEventIcon';
