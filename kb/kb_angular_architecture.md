# Angular Architecture Implementation Rules

## Feature Module Design Patterns

### RULE: Feature Module Structure Organization

CONTEXT: Feature modules must be consistently organized to support maintainability and scalability of financial application
REQUIREMENT: Feature modules must follow standard directory structure with components, services, and routing properly organized
FAIL IF:

- Feature module structure inconsistent across different features
- Components not properly organized in feature-specific subdirectories
- Services mixed with components instead of separate organization
- Routing configuration not co-located with feature module
- Feature-specific models not organized within feature boundaries
  VERIFICATION: Check feature module directory structure and component organization
  REFERENCES: Feature module implementations, directory organization patterns, module structure

### RULE: Feature Module Boundary Enforcement

CONTEXT: Clear feature boundaries prevent tight coupling and support independent development
REQUIREMENT: Feature modules must maintain clear boundaries with minimal cross-feature dependencies
FAIL IF:

- Components from one feature module imported directly in another
- Business logic shared between features without proper abstraction
- Feature modules tightly coupled through shared mutable state
- Cross-feature communication not mediated through services
- Feature-specific interfaces leaked across module boundaries
  VERIFICATION: Check feature module imports and cross-module dependencies
  REFERENCES: Module dependency analysis, feature boundary definitions, service abstractions

### RULE: Feature Routing Integration

CONTEXT: Feature routing must integrate seamlessly with main application routing for proper navigation
REQUIREMENT: Feature modules must implement lazy loading with proper route configuration and guards
FAIL IF:

- Feature routes not properly configured for lazy loading
- Route guards not implemented for protected feature areas
- Route parameters not properly typed and validated
- Feature routing not integrated with main application navigation
- Route data not properly resolved before component activation
  VERIFICATION: Check feature routing configuration and lazy loading implementation
  REFERENCES: Feature routing modules, lazy loading configuration, route guard implementation

### RULE: Feature Module Provider Configuration

CONTEXT: Feature modules must properly configure services and providers for dependency injection
REQUIREMENT: Feature-specific services must be provided at appropriate module level with correct scoping
FAIL IF:

- Feature services provided at root level unnecessarily
- Service scoping not appropriate for feature requirements
- Providers not properly configured for feature module needs
- Service instances not properly managed within feature scope
- Feature module providers conflicting with core or shared services
  VERIFICATION: Check feature module provider configuration and service scoping
  REFERENCES: Feature service providers, dependency injection configuration, service scoping

## Core Module Architecture

### RULE: Core Module Service Organization

CONTEXT: Core module must provide essential singleton services for entire application
REQUIREMENT: Core module must centralize app-wide services with proper singleton implementation
FAIL IF:

- Essential services provided outside of core module
- Core services not properly implemented as singletons
- Service responsibilities not clearly defined at core level
- Core module services not properly abstracted with interfaces
- Service initialization not properly handled in core module
  VERIFICATION: Check core module service organization and singleton implementation
  REFERENCES: Core module implementation, service singleton patterns, interface abstractions

### RULE: HTTP Interceptor Chain Configuration

CONTEXT: HTTP interceptors must be properly configured for authentication, error handling, and progress tracking
REQUIREMENT: HTTP interceptors must be organized in correct order with proper error handling
FAIL IF:

- Interceptor order not optimized for request/response processing
- Error handling not consistent across all HTTP interceptors
- Authentication interceptor not properly handling token management
- Progress tracking not properly implemented for user feedback
- Interceptor configuration not supporting multiple API endpoints
  VERIFICATION: Check HTTP interceptor configuration and processing order
  REFERENCES: HTTP interceptor implementations, authentication handling, error processing

### RULE: Shell Component Architecture

CONTEXT: Shell components must provide consistent layout and navigation structure
REQUIREMENT: Shell components must handle layout, navigation, and global UI state management
FAIL IF:

- Shell components containing business logic instead of layout concerns
- Navigation state not properly managed at shell level
- Layout responsiveness not properly implemented
- Global UI state scattered across multiple shell components
- Shell component responsibilities overlapping with feature components
  VERIFICATION: Check shell component implementation and responsibility separation
  REFERENCES: Shell component structure, navigation implementation, layout management

## Shared Module Patterns

### RULE: Shared Component Reusability

CONTEXT: Shared components must be truly reusable across different feature contexts
REQUIREMENT: Shared components must be generic and configurable through inputs and outputs
FAIL IF:

- Shared components containing feature-specific logic
- Components not properly parameterized for different use cases
- Shared components tightly coupled to specific data structures
- Component interfaces not flexible enough for reuse
- Shared components requiring modification for new use cases
  VERIFICATION: Check shared component interfaces and reusability across features
  REFERENCES: Shared component implementations, component interfaces, reusability patterns

### RULE: Shared Module Export Strategy

CONTEXT: Shared module must export appropriate components and modules for feature consumption
REQUIREMENT: Shared module must carefully manage exports to prevent circular dependencies
FAIL IF:

- Shared module not exporting commonly needed components
- Export strategy creating circular dependencies with feature modules
- Internal shared components exposed unnecessarily
- Module exports not properly organized by functionality
- Export dependencies not properly managed
  VERIFICATION: Check shared module export configuration and dependency management
  REFERENCES: Shared module exports, dependency graph analysis, circular dependency prevention

### RULE: Material Design Integration

CONTEXT: Angular Material must be properly integrated and customized for financial application needs
REQUIREMENT: Material components must be consistently themed and properly imported
FAIL IF:

- Material components not properly themed for application branding
- Material module imports scattered across feature modules
- Custom Material theme not following Material Design guidelines
- Material component usage not consistent across application
- Accessibility features of Material components not properly utilized
  VERIFICATION: Check Material Design integration and theming consistency
  REFERENCES: Material module configuration, theme customization, accessibility implementation

## Service Layer Architecture

### RULE: Service Responsibility Segregation

CONTEXT: Services must have clear, single responsibilities aligned with business domains
REQUIREMENT: Services must be organized by business domain with clear interfaces and responsibilities
FAIL IF:

- Services containing mixed responsibilities from different domains
- Service interfaces not clearly defined or documented
- Business logic mixed with data access logic in same service
- Service methods not focused on single responsibility
- Service dependencies creating tight coupling between domains
  VERIFICATION: Check service organization and responsibility alignment
  REFERENCES: Service implementations, interface definitions, domain separation

### RULE: Validation Service Pattern Implementation

CONTEXT: Form validation logic must be centralized in dedicated services for reusability and maintainability
REQUIREMENT: Complex form validation must be implemented in separate validation services with clear interfaces
FAIL IF:

- Validation logic embedded directly in component classes
- Validation rules duplicated across multiple components
- Form validation not properly abstracted from UI components
- Validation services mixing validation logic with other responsibilities
- Custom validators not properly typed or documented
  VERIFICATION: Check validation service implementations and component usage
  REFERENCES:
  - PATTERN_EXAMPLE: `CreditReportValidationService.ts:18-21` (dedicated validation service with single responsibility)
  - PATTERN_EXAMPLE: `CreditReportValidationService.ts:45-113` (centralized form creation with validation)
  - PATTERN_EXAMPLE: `CreditReportValidationService.ts:260-275` (custom JSON validator implementation)
  - PATTERN_EXAMPLE: `CreditReportValidationService.ts:336-426` (centralized error message handling)
  - SERVICE_PATTERN: `@Injectable({ providedIn: 'root' })` for singleton validation services
  - REUSABILITY_BENEFIT: Validation logic reusable across multiple form components
  - MAINTAINABILITY_BENEFIT: Single point of change for validation rules
  - VERIFICATION_CMD: `grep -rn "ValidationService" src/app/extend/ | head -10`
  - ANTI_PATTERN: Validation logic scattered across component classes
  - ANTI_PATTERN: Duplicated validation rules in multiple components

### RULE: Form Autofill Service Pattern

CONTEXT: Form autofill logic must be centralized in dedicated services to reduce component complexity
REQUIREMENT: Complex form population logic must be implemented in separate autofill services with clear interfaces
FAIL IF:

- Form autofill logic embedded directly in component classes
- Data transformation logic duplicated across multiple components
- Form population not properly abstracted from UI components
- Autofill services mixing data transformation with other responsibilities
- Form population logic not properly handling async data sources
  VERIFICATION: Check autofill service implementations and component usage
  REFERENCES:
  - PATTERN_EXAMPLE: `CreditReportAutofillService.ts:15-18` (dedicated autofill service with single responsibility)
  - PATTERN_EXAMPLE: `CreditReportAutofillService.ts:21-95` (centralized client data autofill)
  - PATTERN_EXAMPLE: `CreditReportAutofillService.ts:334-436` (edit mode autofill with data transformation)
  - PATTERN_EXAMPLE: `CreditReportAutofillService.ts:437-473` (form group creation with validation)
  - SERVICE_PATTERN: `@Injectable({ providedIn: 'root' })` for singleton autofill services
  - ASYNC_HANDLING: Proper Observable patterns for async data population
  - SEPARATION_BENEFIT: Clean separation between data transformation and UI logic
  - VERIFICATION_CMD: `grep -rn "AutofillService" src/app/extend/ | head -10`
  - ANTI_PATTERN: Form population logic scattered across component classes
  - ANTI_PATTERN: Data transformation mixed with component presentation logic

### RULE: HTTP Service Abstraction Patterns

CONTEXT: HTTP services must provide clean abstractions over API endpoints
REQUIREMENT: HTTP services must encapsulate API communication with proper error handling and typing
FAIL IF:

- Components directly using HttpClient instead of service abstraction
- API endpoints hardcoded in multiple locations
- HTTP error handling not consistent across services
- Response types not properly typed with interfaces
- API communication not properly abstracted from business logic
  VERIFICATION: Check HTTP service implementations and component usage
  REFERENCES: HTTP service patterns, API abstraction, error handling implementations

### RULE: State Management Service Patterns

CONTEXT: Services must manage application state using reactive patterns
REQUIREMENT: State management must use RxJS observables with proper subscription management
FAIL IF:

- State management using imperative patterns instead of reactive
- Services not properly exposing state through observables
- State mutations not properly controlled and tracked
- Subscription management not properly implemented in components
- State synchronization not handled properly across services
  VERIFICATION: Check state management patterns and reactive programming usage
  REFERENCES: State management implementations, observable patterns, subscription management

## Component Architecture Patterns

### RULE: Component Responsibility Separation

CONTEXT: Components must follow single responsibility principle with clear separation of concerns
REQUIREMENT: Components must focus on presentation logic while delegating business logic to services
FAIL IF:

- Components containing business logic that belongs in services
- Data manipulation performed in component methods instead of services
- Components directly accessing external APIs
- Complex calculations performed in component templates
- Component responsibilities overlapping or unclear
  VERIFICATION: Check component implementation and verify single responsibility adherence
  REFERENCES: Component implementations, service delegation patterns, template complexity analysis

### RULE: Component Communication Patterns

CONTEXT: Components must communicate through well-defined interfaces using Angular's communication patterns
REQUIREMENT: Parent-child communication must use @Input/@Output patterns and services for sibling communication
FAIL IF:

- Components accessing other components directly through ViewChild without proper interfaces
- Global variables used for component communication
- Event emitters not properly typed with custom interfaces
- Service-based communication not following reactive patterns
- Component coupling too tight without proper abstractions
  VERIFICATION: Check component communication patterns and interface definitions
  REFERENCES: Component communication implementations, @Input/@Output usage, service communication

### RULE: Template and Style Organization

CONTEXT: Component templates and styles must be organized consistently for maintainability
REQUIREMENT: Components must use separate template and style files with proper naming conventions
FAIL IF:

- Inline templates used for complex components (>10 lines)
- Inline styles used instead of external stylesheets
- Template files not following naming conventions
- Component styles not properly scoped or encapsulated
- Template complexity not managed with proper structural directives
  VERIFICATION: Check component file organization and template/style separation
  REFERENCES: Component file structures, naming conventions, style encapsulation patterns

### RULE: Lifecycle Hook Implementation

CONTEXT: Component lifecycle hooks must be properly implemented for resource management
REQUIREMENT: Components must implement appropriate lifecycle hooks with proper cleanup
FAIL IF:

- OnDestroy not implemented when component has subscriptions
- Lifecycle hooks not properly typed with interfaces
- Resource cleanup not performed in OnDestroy
- Initialization logic not properly placed in appropriate hooks
- Change detection not optimized with OnPush when appropriate
  VERIFICATION: Check lifecycle hook implementations and resource cleanup
  REFERENCES: Lifecycle hook patterns, subscription cleanup, change detection strategies

## Routing and Navigation Architecture

### RULE: Route Configuration Organization

CONTEXT: Routing must be organized hierarchically with proper guards and lazy loading
REQUIREMENT: Routes must be configured with proper hierarchy, guards, and data resolution
FAIL IF:

- Route configuration not following hierarchical structure
- Route guards not properly implemented for protected routes
- Route data not properly resolved before component activation
- Wildcard routes not properly configured for error handling
- Route parameters not properly typed and validated
  VERIFICATION: Check routing configuration and guard implementations
  REFERENCES: Routing module configurations, route guard implementations, resolver patterns

### RULE: Navigation State Management

CONTEXT: Navigation state must be properly managed for user experience and browser compatibility
REQUIREMENT: Navigation must preserve state appropriately and handle browser navigation events
FAIL IF:

- Navigation state not preserved during route changes
- Browser back/forward buttons not working correctly
- Deep linking not properly supported for all routes
- Route transitions not providing proper user feedback
- Navigation guards not handling edge cases properly
  VERIFICATION: Check navigation implementation and browser compatibility
  REFERENCES: Navigation patterns, route state management, browser compatibility testing

## Angular Coding Standards

### RULE: Component and Directive Selector Naming [P0]

CONTEXT: Angular components and directives must follow consistent naming conventions for maintainability
REQUIREMENT: All selectors must use the "mifosx" prefix to maintain namespace consistency
FAIL IF:

- Component selectors not starting with "mifosx-" prefix
- Directive selectors not starting with "mifosx" prefix (e.g., [mifosxDirectiveName])
- Generic selectors like "app-" used instead of project-specific prefix
- Inconsistent casing in selector names (must use kebab-case for components)
- Selector names not descriptive of component/directive purpose
  VERIFICATION: Check all @Component and @Directive decorators for proper selector naming
  REFERENCES:
  - VERIFICATION_CMD: `grep -rn "selector:" src/app/ | grep -v "mifosx"`
  - PATTERN_EXAMPLE: `selector: 'mifosx-kyc-status-badge'` for components
  - PATTERN_EXAMPLE: `selector: '[mifosxClientExtension]'` for directives
  - ANTI_PATTERN: `selector: 'app-component-name'`
  - ANTI_PATTERN: `selector: '[appDirectiveName]'`

### RULE: Empty Lifecycle Methods Prevention [P0]

CONTEXT: Empty lifecycle methods create unnecessary overhead and indicate incomplete implementation
REQUIREMENT: Lifecycle methods must contain meaningful implementation or be removed
FAIL IF:

- ngOnInit, ngOnDestroy, or other lifecycle methods are empty
- Lifecycle methods contain only comments without implementation
- Lifecycle interfaces implemented without corresponding method implementation
- Placeholder lifecycle methods left in production code
- Lifecycle methods not properly cleaning up resources
  VERIFICATION: Check for empty lifecycle method implementations
  REFERENCES:
  - VERIFICATION_CMD: `grep -A 3 "ngOnInit\|ngOnDestroy\|ngAfterViewInit" src/app/ | grep -B 1 -A 2 "{}"`
  - PATTERN_EXAMPLE: `ngOnDestroy() { this.cleanup(); }` with actual cleanup logic
  - ANTI_PATTERN: `ngOnInit(): void {}`
  - ANTI_PATTERN: `ngOnDestroy(): void { // TODO: cleanup }`

### RULE: Console Logging and Debug Code Removal [P0]

CONTEXT: Production code must not contain debugging artifacts that impact performance and security
REQUIREMENT: All console logs, debug statements, and development artifacts must be removed from production code
FAIL IF:

- console.log, console.warn, console.error statements in production code
- debugger statements left in source code
- Development-only code blocks not removed
- Debug flags or development mode checks in production builds
- Temporary logging added during development not cleaned up
  VERIFICATION: Check for debugging artifacts in source code
  REFERENCES:
  - VERIFICATION_CMD: `grep -rn "console\." src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `grep -rn "debugger" src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `grep -rn "// TODO\|// FIXME\|// DEBUG" src/app/ --exclude-dir=test`
  - ANTI_PATTERN: `console.log('Debug info:', data);`
  - ANTI_PATTERN: `debugger;`
  - EXCEPTION: Error logging through proper logging service is allowed

### RULE: TypeScript Strict Mode Compliance [P0]

CONTEXT: TypeScript strict mode ensures type safety and prevents runtime errors in financial applications
REQUIREMENT: All code must comply with TypeScript strict mode settings without type assertions
FAIL IF:

- Type assertions (as any) used to bypass type checking
- Non-null assertion operator (!) used without proper null checks
- Implicit any types not properly typed
- Optional chaining not used for potentially undefined properties
- Type guards not implemented for union types
  VERIFICATION: Check TypeScript compilation with strict mode enabled
  REFERENCES:
  - VERIFICATION_CMD: `grep -rn "as any\|!" src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `npx tsc --noEmit --strict`
  - PATTERN_EXAMPLE: `if (data?.property) { ... }` instead of `data!.property`
  - ANTI_PATTERN: `(response as any).data`
  - ANTI_PATTERN: `data!.property` without null check

### RULE: Import Organization and Path Management [P0]

CONTEXT: Import statements must be organized consistently for maintainability and build optimization
REQUIREMENT: Imports must follow consistent ordering and use proper path resolution
FAIL IF:

- Relative imports used for cross-module dependencies (use absolute paths)
- Import statements not organized by type (Angular, third-party, local)
- Unused imports not removed from files
- Barrel exports not used for module organization
- Import paths not following established conventions
  VERIFICATION: Check import statement organization and path usage
  REFERENCES:
  - VERIFICATION_CMD: `grep -rn "import.*\.\./\.\." src/app/`
  - PATTERN_EXAMPLE: `import { Component } from '@angular/core';` (Angular first)
  - PATTERN_EXAMPLE: `import { Observable } from 'rxjs';` (third-party second)
  - PATTERN_EXAMPLE: `import { MyService } from 'src/app/services';` (local last)
  - ANTI_PATTERN: `import { Service } from '../../../services/my.service';`

## Component Size and Complexity Management

### RULE: Component Line Count Limits [P0]

CONTEXT: Large components violate single responsibility principle and become unmaintainable
REQUIREMENT: Components must stay within reasonable size limits to maintain code quality and readability
FAIL IF:

- Component TypeScript files exceed 400 lines
- Component template files exceed 200 lines
- Component has more than 15 public methods
- Component constructor has more than 5 dependencies
- Component manages more than 3 distinct concerns
  VERIFICATION: Check component file sizes and method counts regularly
  REFERENCES:
  - VERIFICATION_CMD: `find src/app -name "*.component.ts" -exec wc -l {} + | awk '$1 > 400 {print $2 " has " $1 " lines"}'`
  - VERIFICATION_CMD: `find src/app -name "*.component.html" -exec wc -l {} + | awk '$1 > 200 {print $2 " has " $1 " lines"}'`
  - REFACTOR_TRIGGER: Any component exceeding 400 lines must be decomposed
  - DECOMPOSITION_STRATEGY: Extract services for business logic, create focused child components
  - ANTI_PATTERN: Single component handling forms, validation, API calls, and UI logic
  - SUCCESS_METRIC: No component exceeds 400 lines after refactoring

### RULE: Mandatory Service Extraction for Business Logic [P0]

CONTEXT: Components should focus on presentation logic only, delegating business logic to services
REQUIREMENT: All business logic, data manipulation, and API interactions must be extracted to dedicated services
FAIL IF:

- Components contain complex data transformation logic
- Components directly make HTTP calls without service abstraction
- Components contain validation logic beyond basic form validation
- Components handle complex state management internally
- Components contain utility functions that could be reused
  VERIFICATION: Check components for business logic patterns
  REFERENCES:
  - PATTERN_EXAMPLE: `CreditReportAutofillService` - handles all auto-fill business logic
  - PATTERN_EXAMPLE: `CreditReportValidationService` - handles validation and form creation
  - SERVICE_RESPONSIBILITY: Data loading, transformation, validation, API communication
  - COMPONENT_RESPONSIBILITY: Template binding, user interaction, component communication
  - VERIFICATION_CMD: `grep -rn "subscribe\|map\|filter\|transform" src/app/components/ --include="*.ts"`
  - ANTI_PATTERN: Components with complex subscribe chains or data manipulation
  - REFACTOR_APPROACH: Extract to services with clear interfaces and observables

### RULE: Focused Component Decomposition [P0]

CONTEXT: Large forms and complex UIs must be broken down into focused, reusable components
REQUIREMENT: Complex components must be decomposed into smaller, single-purpose components
FAIL IF:

- Single component handles multiple form sections
- Component template has more than 3 distinct UI sections
- Component manages multiple unrelated data models
- Component has more than 10 @Input or @Output properties
- Component cannot be easily unit tested due to complexity
  VERIFICATION: Analyze component complexity and decomposition opportunities
  REFERENCES:
  - PATTERN_EXAMPLE: `CreditScoresFormComponent` - focused on credit scores only
  - PATTERN_EXAMPLE: `CustomerInfoFormComponent` - focused on customer data only
  - PATTERN_EXAMPLE: `FinancialInfoFormComponent` - focused on financial data only
  - DECOMPOSITION_STRATEGY: Create focused components for each major form section
  - COMMUNICATION_PATTERN: Parent-child communication via @Input/@Output
  - SHARED_STATE: Use shared FormGroup for coordinated form management
  - VERIFICATION_CMD: `grep -c "@Input\|@Output" src/app/components/*.ts | awk -F: '$2 > 10'`
  - SUCCESS_METRIC: Each component has single, clear responsibility

### RULE: Service-Based Architecture Enforcement [P0]

CONTEXT: Complex applications require proper service layer architecture to prevent code duplication
REQUIREMENT: All reusable logic must be implemented in services with clear interfaces and dependency injection
FAIL IF:

- Similar logic duplicated across multiple components
- Components not using dependency injection for shared functionality
- Services not following single responsibility principle
- Service methods not returning observables for async operations
- Services not properly tested in isolation
  VERIFICATION: Check service architecture and usage patterns
  REFERENCES:
  - ARCHITECTURE_PATTERN: Service layer handles all business logic
  - INJECTION_PATTERN: Constructor injection with interface abstractions
  - OBSERVABLE_PATTERN: All async operations return observables
  - TESTING_PATTERN: Services tested independently of components
  - REUSABILITY_PATTERN: Services designed for multiple component usage
  - VERIFICATION_CMD: `grep -rn "new " src/app/components/ --include="*.ts" | grep -v "FormBuilder\|Date"`
  - ANTI_PATTERN: Components creating instances instead of using DI
  - SUCCESS_METRIC: All business logic accessible through service layer

### RULE: Template Complexity Management [P0]

CONTEXT: Complex templates become unmaintainable and violate separation of concerns
REQUIREMENT: Component templates must be kept simple with logic delegated to TypeScript and child components
FAIL IF:

- Templates contain complex conditional logic (more than 2 levels of nesting)
- Templates have more than 5 structural directives (*ngFor, *ngIf)
- Templates contain inline functions or complex expressions
- Templates exceed 200 lines without decomposition
- Templates mix multiple concerns (forms, tables, modals) without child components
  VERIFICATION: Analyze template complexity and structure
  REFERENCES:
  - SIMPLIFICATION_STRATEGY: Extract complex sections to child components
  - LOGIC_DELEGATION: Move complex expressions to component methods
  - STRUCTURAL_LIMIT: Maximum 2 levels of nested *ngIf/*ngFor
  - CHILD_COMPONENT_USAGE: Break large templates into focused child components
  - VERIFICATION_CMD: `find src/app -name "*.component.html" -exec grep -c "\*ng" {} + | awk -F: '$2 > 5'`
  - ANTI_PATTERN: Templates with deeply nested conditional logic
  - SUCCESS_METRIC: Templates focus on presentation with minimal logic

### RULE: Proactive Refactoring Triggers [P0]

CONTEXT: Components must be refactored before they become unmaintainable monoliths
REQUIREMENT: Automatic refactoring must be triggered when components exceed complexity thresholds
FAIL IF:

- Components allowed to grow beyond 300 lines without review
- No regular code review for component complexity
- Refactoring postponed until components become unmaintainable
- No automated checks for component size and complexity
- Team not trained on decomposition patterns and techniques
  VERIFICATION: Implement automated checks and review processes
  REFERENCES:
  - AUTOMATED_CHECK: CI/CD pipeline checks for component size limits
  - REVIEW_TRIGGER: Code review required for components over 250 lines
  - REFACTORING_SCHEDULE: Regular refactoring sprints for technical debt
  - TRAINING_REQUIREMENT: Team training on Angular architecture patterns
  - MONITORING_TOOLS: Static analysis tools for complexity metrics
  - VERIFICATION_CMD: `npm run lint:complexity` (custom lint rule for component size)
  - SUCCESS_METRIC: No components exceed size limits in production code
  - PREVENTION_STRATEGY: Catch complexity early in development cycle
