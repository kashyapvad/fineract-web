# Fineract Web Application Critical Architectural Guardrails

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

## Component Architecture Rules

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

## Routing and Navigation Rules

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

### RULE: Cross-Site Scripting (XSS) Prevention

CONTEXT: Application must prevent XSS attacks through proper data handling and sanitization
REQUIREMENT: All dynamic content must be properly sanitized and rendered safely
FAIL IF:

- User-generated content displayed without sanitization
- innerHTML used for dynamic content instead of Angular binding
- External content embedded without proper security checks
- Template injection vulnerabilities present
- Content Security Policy not properly configured
  VERIFICATION: Check dynamic content rendering and sanitization practices
  REFERENCES: XSS prevention patterns, content sanitization, security configurations

### RULE: Financial Data Security

CONTEXT: Financial data must be handled with appropriate security measures for compliance
REQUIREMENT: Sensitive financial data must be encrypted in transit and properly protected in memory
FAIL IF:

- Financial data transmitted without HTTPS encryption
- Sensitive data logged in browser console or application logs
- Financial calculations performed without proper precision handling
- Data masking not applied for sensitive information display
- Financial transactions not properly audited
  VERIFICATION: Check financial data handling and security implementations
  REFERENCES: Financial data protection patterns, encryption implementations, audit trail requirements

## Performance and Optimization Rules

### RULE: Change Detection Optimization

CONTEXT: Angular change detection must be optimized for financial application performance requirements
REQUIREMENT: Components must use appropriate change detection strategies for optimal performance
FAIL IF:

- Default change detection used for components with complex data
- OnPush strategy not implemented where appropriate
- Unnecessary change detection cycles triggered by improper binding
- Large datasets rendered without virtual scrolling
- Change detection not optimized for real-time data updates
  VERIFICATION: Check change detection strategy usage and performance profiling
  REFERENCES: Change detection optimization, OnPush strategy implementation, virtual scrolling patterns

### RULE: Bundle Size Management

CONTEXT: Application bundle size must be optimized for web performance and user experience
REQUIREMENT: Bundle size must be minimized through proper code splitting and tree shaking
FAIL IF:

- Bundle size exceeds performance budgets
- Unused code not eliminated through tree shaking
- Third-party libraries not properly analyzed for size impact
- Code splitting not implemented effectively
- Bundle analysis not performed regularly
  VERIFICATION: Check bundle analysis reports and size optimization
  REFERENCES: Bundle optimization techniques, code splitting strategies, performance budgets
