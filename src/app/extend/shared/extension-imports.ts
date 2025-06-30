// Extension-specific shared imports for standalone components
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatCard,
  MatCardContent,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle
} from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {
  MatTable,
  MatHeaderCell,
  MatCell,
  MatHeaderRow,
  MatRow,
  MatColumnDef,
  MatHeaderCellDef,
  MatCellDef,
  MatHeaderRowDef,
  MatRowDef
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

// NOTE:
// - Do NOT import badge components here - they are standalone with specific imports
// - Do NOT import directives here - they are provided via ExtendModule
// - Keep this focused on common standalone component needs

/**
 * Extension Shared Imports
 *
 * Common imports for complex extension standalone components.
 * Optimized for form dialogs, data tables, and complex UI components.
 *
 * WHO SHOULD USE THIS:
 * ✅ Form components (KYC forms, credit bureau forms, etc.)
 * ✅ Dialog components (modals, confirmations, complex dialogs)
 * ✅ Table/list components with forms/dialogs
 *
 * WHO SHOULD NOT USE THIS:
 * ❌ Badge components (use specific Material imports)
 * ❌ Simple menu components (use specific Material imports)
 * ❌ Components needing directives (use ExtendModule)
 *
 * Purpose: DRY principle for complex components, optimal tree-shaking for simple ones
 */
export const EXTENSION_SHARED_IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  TranslateModule,

  // Material Design Components
  MatCard,
  MatCardContent,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatFormField,
  MatLabel,
  MatError,
  MatSuffix,
  MatHint,
  MatInput,
  MatSelect,
  MatOption,
  MatButton,
  MatIcon,
  MatDivider,
  MatMenu,
  MatMenuItem,
  MatCheckbox,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatTable,
  MatHeaderCell,
  MatCell,
  MatHeaderRow,
  MatRow,
  MatColumnDef,
  MatHeaderCellDef,
  MatCellDef,
  MatHeaderRowDef,
  MatRowDef,
  MatTooltip,

  // Third-party Components
  FaIconComponent

  // NOTE:
  // - Badge components are NOT included here to prevent circular dependencies
  // - Directives are NOT included here - use ExtendModule for directive access
  // - Import specific components directly when needed
] as const;
