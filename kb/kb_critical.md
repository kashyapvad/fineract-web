# Fineract Web Application Critical Architectural Guardrails

> **Note:** This file contains only the most critical [P0] rules that are absolutely essential for fork safety and system stability.
> Additional architectural rules have been organized into specialized knowledge bases:
>
> - **Component & Angular Architecture**: See `kb_angular_architecture.md`
> - **UI Components & Display**: See `kb_ui_components.md`
> - **Security & Data Protection**: See `kb_security.md`
> - **Performance & Optimization**: See `kb_performance.md`

## Fork Safety and Extension Rules

### RULE: Upstream Component Modification Minimization [P0]

CONTEXT: Fork maintenance requires minimizing upstream file modifications to prevent merge conflicts and maintain upgrade path
REQUIREMENT: Custom functionality must be implemented through extension patterns with minimal upstream modifications
FAIL IF:

- Core Angular components heavily modified for custom functionality
- New business logic added directly to upstream component methods
- Upstream routing modules modified to add custom routes
- Core services modified to add custom business logic
- Upstream templates completely restructured for custom features
  VERIFICATION: Check git history of core files for extensive custom modifications
  REFERENCES:
  - FORK_SAFE_PATTERN: `/src/app/extend/` directory for all custom Angular functionality
  - FORK_SAFE_PATTERN: Angular directives for non-invasive UI extension (e.g., `appClientExtendMenu`)
  - FORK_SAFE_PATTERN: Plugin services for extensible business logic (`ClientExtendActionsService`)
  - FORK_SAFE_PATTERN: Standalone routing modules (`ExtendRoutingModule`) instead of modifying app-routing
  - FORK_SAFE_PATTERN: Feature modules with lazy loading instead of modifying core modules
  - MINIMAL_MODIFICATION_EXAMPLE: `<mat-menu appClientExtendMenu [clientData]="data">` - single attribute addition
  - VERIFICATION_CMD: `git log --oneline --since="1 month ago" -- src/app/ | grep -v "Merge\|Update\|extend/"`
  - VERIFICATION_CMD: `find src/app -name "*.ts" -not -path "*/extend/*" -exec git log --oneline -1 {} \;`
  - ANTI_PATTERN: Adding custom methods to upstream components instead of using services
  - ANTI_PATTERN: Modifying upstream templates extensively instead of using directives
  - EXCEPTION: Single attribute additions to existing elements for directive integration (like `appClientExtendMenu`)

### RULE: Extension Through Angular Directives

CONTEXT: UI extensions should use Angular directives to minimize template modifications
REQUIREMENT: Custom UI functionality must be added through directives that extend existing elements
FAIL IF:

- Custom UI elements added directly to upstream templates
- Extensive template restructuring for custom functionality
- Custom components embedded directly in upstream templates
- DOM manipulation performed outside of directive lifecycle
- Custom CSS classes added directly to upstream stylesheets
  VERIFICATION: Check for directive usage patterns and minimal template modifications
  REFERENCES:
  - PATTERN_EXAMPLE: `ClientExtendMenuDirective` - DOM manipulation through directive
  - PATTERN_EXAMPLE: Single attribute addition: `appClientExtendMenu [clientData]="clientViewData"`
  - DIRECTIVE_LIFECYCLE: Proper ngOnInit/ngOnDestroy implementation
  - DOM_MANIPULATION: Using Renderer2 for safe DOM operations
  - VERIFICATION_CMD: `grep -rn "appClientExtendMenu" src/app/`
  - ANTI_PATTERN: Direct template modification instead of directive-based extension

### RULE: Plugin Service Architecture

CONTEXT: Custom business logic must be provided through plugin services that don't modify upstream services
REQUIREMENT: Business logic extensions must use dedicated services with clear plugin interfaces
FAIL IF:

- Custom business logic added directly to upstream services
- Plugin services tightly coupled to upstream service implementations
- Extension points not properly abstracted through interfaces
- Custom functionality not properly scoped to feature modules
- Plugin services not following dependency injection patterns
  VERIFICATION: Check service architecture and plugin pattern implementation
  REFERENCES:
  - PATTERN_EXAMPLE: `ClientExtendActionsService` - plugin service for extensible actions
  - INTERFACE_PATTERN: `ExtendAction` interface for plugin action definitions
  - CONDITION_LOGIC: `condition: (clientData: any) => clientData?.status?.value === 'Active'`
  - REGISTRATION_PATTERN: `registerAction()` method for dynamic plugin registration
  - SERVICE_INJECTION: `@Injectable({ providedIn: 'root' })` for singleton plugin services
  - VERIFICATION_CMD: `grep -rn "ExtendActionsService" src/app/`
  - ANTI_PATTERN: Modifying upstream services to add custom business logic

### RULE: Dynamic Component Extension Pattern [P0]

CONTEXT: Component extensions must avoid upstream file modifications while providing full functionality
REQUIREMENT: Use dynamic extension services and directives to extend upstream components without code changes
FAIL IF:

- Upstream component files modified to add custom columns or UI elements
- Template files modified to add custom content or sections
- Service files modified to add custom business logic
- Multiple upstream files modified for single feature extension
- Component extension creating tight coupling with upstream code
  VERIFICATION: Verify extension implementation with minimal upstream changes
  REFERENCES:
  - PATTERN_EXAMPLE: `ClientColumnExtensionService` - dynamic column injection without template modification
  - PATTERN_EXAMPLE: `ClientExtensionDirective` - automatic component extension via directive
  - EXTENSION_SERVICE: `extendClientsTable(component)` - runtime component modification
  - DIRECTIVE_PATTERN: `[mifosxClientExtension]="table"` - single attribute for extension
  - DYNAMIC_INJECTION: Runtime displayedColumns array modification
  - SERVICE_BASED: Extension logic isolated in dedicated services
  - CLEANUP_PATTERN: Proper ngOnDestroy cleanup of injected elements
  - VERIFICATION_CMD: `git status --porcelain | grep -v "extend/" | wc -l` (should be 0)
  - PREFERRED_APPROACH: Zero upstream modifications with full functionality
  - ANTI_PATTERN: Modifying clients.component.ts and clients.component.html for status columns

### RULE: Single-Line Plugin Architecture [P0]

CONTEXT: Complex UI extensions must be achievable through single attribute additions to minimize fork maintenance
REQUIREMENT: Extension directives must provide full functionality through single attribute additions with automatic component detection
FAIL IF:

- Extension requires multiple template modifications per component
- Extension directive requires manual component configuration
- Extension functionality not automatically applied based on context
- Extension directive not handling multiple extension types through single interface
- Extension not working with dynamic component creation patterns
  VERIFICATION: Verify single attribute enables complete functionality
  REFERENCES:
  - PATTERN_EXAMPLE: `[mifosxClientExtension]="'table'"` - adds KYC status column to clients table
  - PATTERN_EXAMPLE: `[mifosxClientExtension]="'infoBar'" [clientData]="clientViewData"` - adds KYC badge to client info
  - DIRECTIVE_VARIANTS: Single directive handling multiple extension types ('table', 'infoBar')
  - DYNAMIC_COMPONENTS: Using ComponentFactoryResolver for runtime Angular component creation
  - DOM_INTEGRATION: Renderer2 for safe DOM manipulation with Angular components
  - COMPONENT_LIFECYCLE: Proper ngOnInit/ngAfterViewInit timing for different extension types
  - MODULE_INTEGRATION: ExtendSharedModule import pattern for extension availability
  - VERIFICATION_CMD: `grep -rn "mifosxClientExtension" src/app/ | wc -l` (should show minimal usage)
  - SUCCESS_METRIC: Single attribute addition provides complete feature functionality
  - ANTI_PATTERN: Requiring multiple template changes for single feature extension

### RULE: Service Extension Through Dependency Injection Override [P0]

CONTEXT: Complex component behavior customization must be achieved through service injection and override patterns
REQUIREMENT: Extension implementations must use Angular DI to override services providing extension points with minimal upstream changes
FAIL IF:

- Extension logic implemented through DOM manipulation or component interception
- Multiple upstream files modified for single behavioral extension
- Extension requiring timing-dependent or fragile integration patterns
- Service extension not following standard Angular DI override patterns
- Extension functionality not scalable across different module types
  VERIFICATION: Verify service-based extension with clean DI override pattern
  REFERENCES:
  - PATTERN_EXAMPLE: `BreadcrumbUrlProcessorService` - base service with extension point
  - PATTERN_EXAMPLE: `ExtendBreadcrumbUrlProcessorService` - extension implementation
  - OVERRIDE_PATTERN: `{ provide: BreadcrumbUrlProcessorService, useClass: ExtendBreadcrumbUrlProcessorService }`
  - MINIMAL_UPSTREAM: Single constructor injection: `private urlProcessor: BreadcrumbUrlProcessorService`
  - EXTENSION_CALL: Single method call: `url = this.urlProcessor.processUrl(url, routeData, breadcrumbLabel)`
  - SCALABLE_DESIGN: Service handles multiple module types (clients, accounts, organizations)
  - VERIFICATION_CMD: `grep -rn "BreadcrumbUrlProcessorService" src/app/`
  - SUCCESS_METRIC: 2-3 line upstream changes enable complete behavioral customization
  - ANTI_PATTERN: Complex directive-based solutions with DOM manipulation and timing dependencies

### RULE: Upstream Post-Processing Extension Pattern [P1]

CONTEXT: Custom behavior must be implemented through post-processing rather than intercepting or preventing upstream logic
REQUIREMENT: Extension implementations must process upstream component data/behavior after generation rather than modifying the original logic flow
FAIL IF:

- Extension logic preventing upstream component methods from executing
- Upstream component behavior modified before it completes
- Extension logic intercepting Angular lifecycle hooks of upstream components
- Custom implementation replacing upstream functionality instead of extending it
- Extension causing upstream components to fail or behave incorrectly
  VERIFICATION: Verify extensions process data after upstream component completes its logic
  REFERENCES:
  - PATTERN_EXAMPLE: `BreadcrumbUrlProcessorService.processUrl()` - processes URLs after upstream generation
  - PATTERN_EXAMPLE: `ClientColumnExtensionService` - adds columns after upstream component initializes table
  - POST_PROCESS_TIMING: Extension logic executes after upstream logic completion
  - PRESERVE_BEHAVIOR: All existing upstream behavior preserved and functional
  - ADDITIVE_APPROACH: Extension adds functionality without removing or changing existing logic
  - SERVICE_INTEGRATION: Extension logic isolated in dedicated services called by upstream components
  - VERIFICATION_CMD: `git log --oneline -5 -- src/app/core/` (should show minimal changes)
  - PREFERRED_APPROACH: Extension logic executes as post-processing step after upstream completion
  - ANTI_PATTERN: Overriding upstream component methods or preventing their execution
  - ANTI_PATTERN: Intercepting component initialization to modify behavior

## Feature Module Architecture Rules

### RULE: Feature Module Isolation

CONTEXT: Feature modules must be self-contained and loosely coupled for maintainability and lazy loading
REQUIREMENT: Each feature module must encapsulate its own components, services, and routing without dependencies on other features
FAIL IF:

- Feature modules directly import components from other feature modules
- Business logic shared between features not extracted to shared services
- Feature-specific services not provided at feature module level
- Feature modules importing other feature modules directly
- Cross-feature navigation not using proper routing abstractions
  VERIFICATION: Check feature module imports and verify no direct cross-feature dependencies
  REFERENCES: Feature module structures, lazy loading configuration, module dependency analysis

### RULE: Core Module Singleton Pattern

CONTEXT: Core module must provide singleton services and be imported only once in AppModule
REQUIREMENT: Core module must implement singleton pattern with import guard and provide app-wide services
FAIL IF:

- Core module imported in feature modules instead of AppModule
- Core services not properly scoped as singletons
- Multiple instances of core services created
- Core module import guard not preventing multiple imports
- Essential app services provided outside core module
  VERIFICATION: Check core module implementation and verify singleton service provision
  REFERENCES: CoreModule implementation, import guard pattern, service singleton verification

### RULE: Shared Module Organization

CONTEXT: Shared module must provide reusable components and utilities without creating circular dependencies
REQUIREMENT: Shared module must export commonly used components, pipes, and directives for feature module consumption
FAIL IF:

- Shared module importing feature modules creating circular dependencies
- Feature-specific components placed in shared module
- Shared module not properly exporting reusable components
- Common utilities not centralized in shared module
- Shared module dependencies not properly managed
  VERIFICATION: Check shared module exports and verify no circular dependencies
  REFERENCES: SharedModule structure, component exports, dependency graph analysis

### RULE: Extension Module Integration Pattern [P1]

CONTEXT: Extension modules must be integrated with minimal upstream module modifications
REQUIREMENT: Extension functionality must be available through single module import in target feature modules
FAIL IF:

- Multiple extension module imports required per feature module
- Extension modules not properly consolidated into shared extension module
- Extension components not properly exported from extension modules
- Extension directives not available after module import
- Extension routing not properly integrated with feature routing
  VERIFICATION: Check extension module integration and availability
  REFERENCES:
  - PATTERN_EXAMPLE: `ExtendSharedModule` - consolidated extension module for all directives and components
  - MODULE_IMPORT: Single `ExtendSharedModule` import in `clients.module.ts` enables all extensions
  - COMPONENT_EXPORT: Extension components exported from feature modules (e.g., `KycStatusBadgeComponent`)
  - DIRECTIVE_EXPORT: Extension directives exported from shared module (e.g., `ClientExtensionDirective`)
  - ROUTING_INTEGRATION: Extension routing imported separately where needed
  - VERIFICATION_CMD: `grep -rn "ExtendSharedModule" src/app/ | grep import`
  - SUCCESS_METRIC: Single module import enables all extension functionality
  - ANTI_PATTERN: Requiring multiple extension module imports per feature

### RULE: Shared Module Routing Isolation [P0]

CONTEXT: Shared modules must never include routing to prevent conflicts with application-level routing and lazy loading
REQUIREMENT: Shared modules must only export components, directives, and services without any routing configuration
FAIL IF:

- Shared modules importing or exporting routing modules
- Feature modules with routing imported into shared modules
- Routing configuration loaded at application startup through shared module imports
- Empty path routes ('') defined in modules imported by shared modules
- Lazy loading routes accidentally loaded eagerly through shared module chain
- Routing conflicts causing incorrect navigation or component loading
  VERIFICATION: Verify shared modules contain no routing imports or exports
  REFERENCES:
  - PATTERN_EXAMPLE: `ExtendKycModule` - base module without routing for shared use
  - PATTERN_EXAMPLE: `ExtendKycRoutedModule` - separate module combining base + routing for lazy loading
  - SEPARATION_PATTERN: Base feature module (components only) vs routed feature module (base + routing)
  - SHARED_MODULE_RULE: `ExtendSharedModule` imports base modules only, never routed modules
  - LAZY_LOADING_RULE: Lazy loading imports routed modules (`ExtendKycRoutedModule`), not base modules
  - CLIENT_EXTENSIONS_PATTERN: `loadChildren: () => import('./kyc/kyc-routed.module').then(m => m.ExtendKycRoutedModule)`
  - VERIFICATION_CMD: `grep -rn "RoutingModule" src/app/extend/extend-shared.module.ts` (should return no results)
  - VERIFICATION_CMD: `grep -rn "RouterModule" src/app/extend/extend-shared.module.ts` (should return no results)
  - SUCCESS_METRIC: Shared modules contain zero routing imports, lazy loading works correctly
  - ANTI_PATTERN: Importing feature modules with routing into shared modules
  - ANTI_PATTERN: Single module serving both shared and lazy-loaded contexts with routing

### RULE: Lazy Loading Implementation

CONTEXT: Feature modules must be lazy loaded to optimize initial bundle size and improve performance
REQUIREMENT: All feature modules must be configured for lazy loading with proper route guards
FAIL IF:

- Feature modules eagerly loaded in AppModule
- Lazy loading routes not properly configured
- Route guards not preventing unauthorized access to lazy modules
- Lazy modules loaded without proper error handling
- Bundle analysis showing inefficient code splitting
  VERIFICATION: Check routing configuration and verify lazy loading implementation
  REFERENCES: AppRoutingModule, lazy loading routes, bundle analysis tools

## Service Layer Architecture Rules

### RULE: Service Layer Dependency Injection [P1]

CONTEXT: Services must use Angular's dependency injection system consistently for testability and maintainability
REQUIREMENT: All services must be properly decorated with @Injectable and use constructor injection
FAIL IF:

- Services not decorated with @Injectable decorator
- Dependencies injected using property injection instead of constructor
- Services instantiated manually with 'new' operator
- Circular dependencies between services not resolved
- Service dependencies not properly typed with interfaces
  VERIFICATION: Check service decorators and constructor injection patterns
  REFERENCES:
  - PATTERN_EXAMPLE: `AuthenticationService.ts:25-55` (@Injectable with constructor injection)
  - PATTERN_EXAMPLE: `ClientsService.ts:9-16` (@Injectable with providedIn: 'root')
  - PATTERN_EXAMPLE: `NavigationService.ts:10` (service with singleton scope)
  - SERVICE_DECORATOR: `@Injectable({ providedIn: 'root' })` for singleton services
  - CONSTRUCTOR_PATTERN: `constructor(private http: HttpClient, private service: OtherService) {}`
  - SCOPING_OPTIONS: `providedIn: 'root'` vs module-level provision
  - VERIFICATION_CMD: `grep -rn "@Injectable" src/app/ | head -10`
  - ANTI_PATTERN: Manual service instantiation with `new ServiceClass()` instead of injection

### RULE: HTTP Service Abstraction

CONTEXT: HTTP operations must be abstracted through dedicated services for consistency and error handling
REQUIREMENT: All HTTP operations must use dedicated service layer with proper error handling and interceptors
FAIL IF:

- Components directly using HttpClient instead of service layer
- HTTP operations not properly abstracted in service methods
- Error handling not consistent across HTTP services
- HTTP interceptors not configured for authentication and error handling
- API endpoints hardcoded in components
  VERIFICATION: Check HTTP service implementations and component HTTP usage
  REFERENCES:
  - PATTERN_EXAMPLE: `ClientsService.ts:16-50` (HttpClient injection with Observable returns)
  - PATTERN_EXAMPLE: `AuthenticationService.ts:95-130` (HTTP operations with proper headers)
  - HTTP_PATTERN: `this.http.get('/endpoint', { params: httpParams })`
  - OBSERVABLE_PATTERN: Service methods returning `Observable<T>` for HTTP operations
  - PARAMS_PATTERN: `HttpParams().set('key', 'value')` for query parameters
  - INTERCEPTOR_INTEGRATION: Services using interceptors for auth and error handling
  - VERIFICATION_CMD: `grep -rn "HttpClient" src/app/ | grep -v service | head -5`
  - ANTI_PATTERN: Components directly calling `http.get()` instead of service methods

### RULE: Authentication State Management [P0]

CONTEXT: Authentication state must be managed consistently across the application for security
REQUIREMENT: Authentication state must be centralized in AuthenticationService with proper session management
FAIL IF:

- Authentication state scattered across multiple services or components
- Session management not properly implemented
- Authentication tokens not securely stored
- OAuth2 flow not properly implemented when enabled
- Two-factor authentication not properly integrated
  VERIFICATION: Check authentication service implementation and state management
  REFERENCES:
  - PATTERN_EXAMPLE: `AuthenticationService.ts:25-85` (centralized auth state with storage management)
  - PATTERN_EXAMPLE: `AuthenticationService.ts:130-180` (OAuth2 token refresh implementation)
  - PATTERN_EXAMPLE: `AuthenticationService.ts:200-250` (session storage vs localStorage logic)
  - STORAGE_PATTERN: `sessionStorage` vs `localStorage` based on rememberMe flag
  - TOKEN_MANAGEMENT: Automatic token refresh with `refreshTokenOnExpiry()`
  - INTERCEPTOR_INTEGRATION: `AuthenticationInterceptor` for request authorization
  - VERIFICATION_CMD: `grep -rn "isAuthenticated\|getCredentials" src/app/ | head -5`
  - ANTI_PATTERN: Components directly accessing localStorage for auth tokens

### RULE: Reactive Programming Patterns

CONTEXT: Angular applications must use RxJS reactive patterns for data flow and state management
REQUIREMENT: Services must use Observable patterns for asynchronous operations and state management
FAIL IF:

- Services using Promises instead of Observables for HTTP operations
- Reactive patterns not consistently applied across services
- Observable streams not properly managed with subscription cleanup
- Error handling not integrated into reactive streams
- State changes not communicated through reactive patterns
  VERIFICATION: Check service method signatures and reactive pattern usage
  REFERENCES: Service implementations, Observable patterns, subscription management

## Security and Data Protection Rules

### RULE: Input Validation Implementation [P0]

CONTEXT: All user inputs must be validated to prevent security vulnerabilities and data corruption
REQUIREMENT: Forms must implement comprehensive validation with proper error messaging
FAIL IF:

- User inputs not validated before processing
- Client-side validation not complemented by server-side validation
- Validation errors not providing clear user feedback
- Form submission allowed with invalid data
- Input sanitization not performed for display
  VERIFICATION: Check form validation implementations and error handling
  REFERENCES: Form validation patterns, input sanitization, error messaging

### RULE: No Mock Data or Mock Implementations [P0]

CONTEXT: Production financial web application requires real implementations and authentic data processing
REQUIREMENT: All services must implement actual business logic without mock data, mock responses, or placeholder implementations
FAIL IF:

- Mock data used in any service implementations
- Placeholder TODO comments left in production code
- Fake responses returned from business services
- Mock API integrations used instead of real external connections
- Test data generators used in production services
- Development-only code paths left in production builds
- Services providing fallback mock responses for missing APIs
  VERIFICATION: Check for mock data, fake responses, and TODO comments in production code
  REFERENCES:
  - VERIFICATION_CMD: `grep -rn "mock\|Mock\|MOCK\|fake\|Fake\|FAKE" src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `grep -rn "TODO" src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `grep -rn "placeholder\|dummy\|test.*data" src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `grep -rn "catchError.*of(" src/app/ | grep -i mock`
  - ANTI_PATTERN: Services returning mock responses or fake data
  - ANTI_PATTERN: Fallback responses using `of()` with mock data in error handlers
  - ANTI_PATTERN: External integrations with mock implementations
  - ANTI_PATTERN: TODO comments in production service implementations
  - EXCEPTION: Test classes and test resources are exempt from this rule

### RULE: DRY Principle for Shared Components [P1]

CONTEXT: Common UI functionality must be consolidated into reusable shared components to avoid code duplication
REQUIREMENT: Duplicate component logic must be extracted into shared components with configurable inputs and outputs
FAIL IF:

- Similar component logic duplicated across multiple components
- Common form patterns not extracted into shared form components
- Repeated UI patterns not consolidated into reusable components
- Component functionality copied instead of creating shared abstractions
- Dialog components with similar structure not using shared base components
- Data display patterns duplicated instead of using shared presentation components
  VERIFICATION: Check for duplicated component logic and ensure shared components are used
  REFERENCES:
  - PATTERN_EXAMPLE: `SharedCreditReportFormComponent` - consolidated form logic for create/edit modes
  - PATTERN_EXAMPLE: `KycStatusBadgeComponent` - reusable status display component
  - SHARED_FORM_PATTERN: Single form component with mode input (`create` | `edit`) instead of separate forms
  - DIALOG_PATTERN: Shared dialog components with configurable data interfaces
  - PRESENTATION_PATTERN: Shared components for common data display (badges, status, formatting)
  - INPUT_OUTPUT_PATTERN: `@Input()` for configuration, `@Output()` for events
  - VERIFICATION_CMD: `grep -rn "duplicat\|copy.*paste\|similar.*logic" src/app/ --exclude-dir=test`
  - ANTI_PATTERN: Separate create/edit components with 80%+ similar code
  - ANTI_PATTERN: Copy-pasting component logic instead of creating shared abstractions
  - ANTI_PATTERN: Multiple dialog components with identical structure and different data

### RULE: DRY Principle for Service Layer Logic [P1]

CONTEXT: Common service operations must be consolidated to avoid code duplication and ensure consistency
REQUIREMENT: Duplicate service logic must be extracted into reusable methods with proper abstraction
FAIL IF:

- Similar API call patterns duplicated across multiple services
- Common data transformation logic repeated in multiple methods
- Identical error handling patterns not consolidated
- Template/dropdown data loading logic duplicated unnecessarily
- Client data auto-fill logic scattered across multiple components/services
- Form validation patterns repeated instead of using shared validators
  VERIFICATION: Check for duplicated service logic and ensure consolidation
  REFERENCES:
  - PATTERN_EXAMPLE: `fillClientDataFromSources()` - consolidated client data mapping logic
  - PATTERN_EXAMPLE: Shared HTTP error handling interceptors instead of per-service error handling
  - CONSOLIDATION_PATTERN: Single method handling multiple use cases with optional parameters
  - TEMPLATE_AVOIDANCE: Avoid unnecessary template API calls that provide unused dropdown data
  - DATA_MAPPING_PATTERN: Centralized data transformation methods with configurable field mapping
  - VALIDATION_PATTERN: Shared form validators for common patterns (PAN, Aadhaar, mobile)
  - VERIFICATION_CMD: `grep -rn "fillClientData\|autoFill\|template" src/app/ | grep -v test`
  - ANTI_PATTERN: Multiple methods with 70%+ identical logic for similar operations
  - ANTI_PATTERN: Template API calls that load unused dropdown data
  - ANTI_PATTERN: Scattered client data auto-fill logic across multiple components

### RULE: Comprehensive Error Handling in Dialogs [P0]

CONTEXT: Dialog components must handle HTTP errors properly to prevent incorrect success messages and maintain user workflow integrity
REQUIREMENT: Dialog components must implement proper error handling that keeps dialogs open on errors and only closes on successful operations
FAIL IF:

- Dialog components closing on HTTP errors instead of staying open for retry
- Success messages shown when HTTP errors occur
- Error handling not distinguishing between different HTTP status codes (400, 403, 500, etc.)
- Dialog result handling not properly checking for valid success responses
- Error callbacks in subscribe blocks closing dialogs or showing success messages
- Generic error handling not following upstream Fineract patterns
  VERIFICATION: Check dialog error handling and result processing logic
  REFERENCES:
  - PATTERN_EXAMPLE: `EditCreditReportDialogComponent.onSubmit()` - proper error handling without dialog close
  - PATTERN_EXAMPLE: `CreateCreditReportDialogComponent.onSubmit()` - error handling that keeps dialog open
  - UPSTREAM_PATTERN: `CreateClientComponent.submit()` - only success callback in subscribe, errors handled by interceptor
  - DIALOG_ERROR_PATTERN: `error: (error) => { this.isSubmitting = false; /* DO NOT close dialog */ }`
  - RESULT_CHECK_PATTERN: `if (result && result.resourceId)` for create, `if (result && (result.resourceId || result.changes))` for edit
  - ERROR_INTERCEPTOR: `ErrorHandlerInterceptor` handles all HTTP errors with user alerts and throws response
  - VERIFICATION_CMD: `grep -rn "dialogRef\.close.*error\|subscribe.*error.*close" src/app/ --include="*dialog*.ts"`
  - ANTI_PATTERN: `this.dialogRef.close()` in error callback of HTTP subscribe
  - ANTI_PATTERN: Showing success messages when `result` is undefined or contains error data
  - ANTI_PATTERN: Not checking for valid response structure before showing success messages

### RULE: Cross-Site Scripting (XSS) Prevention

CONTEXT: Application must prevent XSS attacks through proper data handling and sanitization
REQUIREMENT: All dynamic content must be properly sanitized and rendered safely

_NOTE: This rule has been moved to `kb_security.md` for better organization_

### RULE: Financial Data Security

CONTEXT: Financial data must be handled with appropriate security measures for compliance
REQUIREMENT: Sensitive financial data must be encrypted in transit and properly protected in memory

_NOTE: This rule has been moved to `kb_security.md` for better organization_
