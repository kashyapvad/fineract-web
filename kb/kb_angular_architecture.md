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

### RULE: Smart vs Dumb Component Separation

CONTEXT: Components must be properly categorized as smart (container) or dumb (presentational)
REQUIREMENT: Smart components handle business logic while dumb components focus on presentation
FAIL IF:

- Presentational components containing business logic or service dependencies
- Container components not properly delegating presentation to child components
- Component responsibilities not clearly separated
- Data flow not properly managed between smart and dumb components
- Component hierarchy not optimized for reusability
  VERIFICATION: Check component classification and responsibility separation
  REFERENCES: Component architecture patterns, smart/dumb component examples, data flow patterns

### RULE: Component Input/Output Design

CONTEXT: Component communication must use well-designed input/output interfaces
REQUIREMENT: Component interfaces must be type-safe and follow Angular best practices
FAIL IF:

- Component inputs not properly typed with interfaces
- Output events not properly typed with custom event interfaces
- Component interfaces too complex or tightly coupled
- Input validation not performed in component logic
- Change detection not optimized with OnPush where appropriate
  VERIFICATION: Check component interface design and type safety
  REFERENCES: Component input/output patterns, interface definitions, change detection optimization

### RULE: Component Lifecycle Management

CONTEXT: Components must properly implement lifecycle hooks for resource management
REQUIREMENT: Components must use appropriate lifecycle hooks with proper cleanup and initialization
FAIL IF:

- OnDestroy not implemented when component has subscriptions or timers
- Initialization logic not properly placed in appropriate lifecycle hooks
- Resource cleanup not comprehensive or properly implemented
- Lifecycle hooks not properly typed with Angular interfaces
- Memory leaks from improper lifecycle management
  VERIFICATION: Check lifecycle hook implementation and resource cleanup
  REFERENCES: Lifecycle hook patterns, subscription cleanup, memory leak prevention

## Routing and Navigation Architecture

### RULE: Route Configuration Hierarchy

CONTEXT: Application routing must be organized hierarchically with proper nesting and guards
REQUIREMENT: Routes must be configured with proper hierarchy, lazy loading, and protection
FAIL IF:

- Route hierarchy not reflecting application information architecture
- Nested routes not properly configured for feature modules
- Route guards not properly protecting sensitive areas
- Route data not properly typed and resolved
- Wildcard and error routes not properly configured
  VERIFICATION: Check routing configuration and hierarchy organization
  REFERENCES: Routing module implementations, route guard configurations, route hierarchy

### RULE: Route Guard Implementation

CONTEXT: Route guards must protect application areas based on user permissions and authentication
REQUIREMENT: Route guards must implement proper authorization and authentication checks
FAIL IF:

- Protected routes accessible without proper authentication
- Authorization logic scattered across multiple guard implementations
- Route guards not properly handling edge cases and error scenarios
- Guard return types not properly implemented (boolean vs UrlTree)
- Route guard dependencies not properly injected and managed
  VERIFICATION: Check route guard implementations and authorization logic
  REFERENCES: Route guard patterns, authentication checks, authorization implementations

### RULE: Route Data Resolution

CONTEXT: Route data must be properly resolved before component activation for optimal user experience
REQUIREMENT: Route resolvers must preload necessary data with proper error handling
FAIL IF:

- Components loading data after activation causing loading states
- Route resolvers not properly handling error scenarios
- Resolver data not properly typed and passed to components
- Resolver dependencies not properly managed through dependency injection
- Data resolution not optimized for performance and user experience
  VERIFICATION: Check route resolver implementations and data preloading
  REFERENCES: Route resolver patterns, data preloading, error handling in resolvers
