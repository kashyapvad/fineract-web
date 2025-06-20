# State Management & Data Flow Implementation Rules

## RxJS Reactive Programming Patterns

### RULE: Observable-Based Service Design

CONTEXT: Financial applications require reactive data flows for real-time updates and consistency
REQUIREMENT: Services must use Observable patterns for all asynchronous operations and state management
FAIL IF:

- Services using Promises instead of Observables for HTTP operations
- Service methods not returning Observables for async operations
- State changes not communicated through reactive streams
- Observer pattern not used for service-to-service communication
- Data transformations not properly chained using RxJS operators
  VERIFICATION: Check service method signatures and verify Observable return types
  REFERENCES: Service implementations, Observable patterns, RxJS operator usage

### RULE: Subscription Management

CONTEXT: Proper subscription management prevents memory leaks in long-running financial applications
REQUIREMENT: Components must properly manage Observable subscriptions with cleanup in OnDestroy
FAIL IF:

- Subscriptions not unsubscribed in component OnDestroy lifecycle
- Memory leaks from long-running subscriptions
- Subscription errors not properly handled
- Multiple subscriptions not managed with takeUntil or async pipe
- Hot observables not properly shared between subscribers
  VERIFICATION: Check component subscription management and cleanup patterns
  REFERENCES: Subscription cleanup patterns, takeUntil usage, async pipe implementations

### RULE: Error Handling in Reactive Streams

CONTEXT: Financial operations require robust error handling to prevent data loss or corruption
REQUIREMENT: Observable streams must implement comprehensive error handling and recovery
FAIL IF:

- Observable errors not properly caught and handled
- Error recovery strategies not implemented for critical operations
- Error context not preserved for debugging and user feedback
- Stream termination not properly handled after errors
- Retry mechanisms not implemented for transient failures
  VERIFICATION: Check error handling implementations in Observable chains
  REFERENCES: Error handling operators, retry strategies, error recovery patterns

### RULE: Data Transformation and Operators

CONTEXT: Financial data requires complex transformations and calculations in reactive streams
REQUIREMENT: RxJS operators must be used appropriately for data transformation and business logic
FAIL IF:

- Data transformations performed imperatively instead of using operators
- Complex operator chains not properly organized or documented
- Side effects not properly managed with tap operator
- Data filtering and mapping not optimized for performance
- Custom operators not created for reusable business logic
  VERIFICATION: Check operator usage and data transformation patterns
  REFERENCES: RxJS operator implementations, custom operator patterns, data transformation logic

## Service-Based State Management

### RULE: State Service Architecture

CONTEXT: Angular applications need centralized state management for complex financial workflows
REQUIREMENT: State management must be implemented through services with reactive patterns
FAIL IF:

- Application state scattered across multiple components
- State management not using reactive patterns (BehaviorSubject/ReplaySubject)
- State mutations not controlled through service methods
- State synchronization not handled properly between services
- State persistence not implemented for critical user data
  VERIFICATION: Check state service implementations and state management patterns
  REFERENCES: State service patterns, reactive state management, state synchronization

### RULE: Data Caching Strategies

CONTEXT: Financial applications require efficient data caching for performance and offline capability
REQUIREMENT: HTTP responses must be cached appropriately with proper invalidation strategies
FAIL IF:

- Frequently accessed data not cached for performance
- Cache invalidation not triggered by data mutations
- Cache size not managed to prevent memory issues
- Stale data served from cache without proper validation
- Cache not shared appropriately between services and components
  VERIFICATION: Check caching implementations and invalidation strategies
  REFERENCES: HTTP cache interceptor, cache service implementations, invalidation patterns

### RULE: Real-Time Data Updates

CONTEXT: Financial data may change frequently and users need real-time updates
REQUIREMENT: Real-time data must be handled through WebSocket or polling with proper user feedback
FAIL IF:

- Real-time updates not implemented for time-sensitive financial data
- WebSocket connections not properly managed (connect/disconnect)
- Polling intervals not optimized for data freshness vs performance
- Real-time updates not properly synchronized with cached data
- Network failures not properly handled for real-time connections
  VERIFICATION: Check real-time data implementations and connection management
  REFERENCES: WebSocket service patterns, polling strategies, real-time synchronization

### RULE: State Persistence and Hydration

CONTEXT: User workflow state should persist across browser sessions for productivity
REQUIREMENT: Critical application state must be persisted and restored appropriately
FAIL IF:

- User workflow state lost on browser refresh
- State persistence not selective (storing sensitive data)
- State hydration not handled properly on application startup
- Serialization/deserialization not handling complex objects correctly
- State versioning not implemented for application updates
  VERIFICATION: Check state persistence implementations and hydration logic
  REFERENCES: Local storage usage, state serialization, application startup patterns

## HTTP Client Architecture

### RULE: HTTP Service Abstraction

CONTEXT: API communication must be abstracted and consistent across the application
REQUIREMENT: HTTP operations must be encapsulated in service layer with proper configuration
FAIL IF:

- Components directly using HttpClient instead of service abstraction
- API endpoints hardcoded throughout the application
- HTTP configuration not centralized in service layer
- Request/response interceptors not properly configured
- API versioning not handled consistently
  VERIFICATION: Check HTTP service usage and API abstraction patterns
  REFERENCES: HTTP service implementations, API abstraction layers, interceptor configurations

### RULE: Request Interceptor Configuration

CONTEXT: HTTP requests require consistent handling for authentication, logging, and error management
REQUIREMENT: HTTP interceptors must be properly configured for cross-cutting concerns
FAIL IF:

- Authentication tokens not automatically attached to requests
- Request/response logging not implemented for debugging
- Error responses not consistently handled across all endpoints
- Progress indication not provided for long-running requests
- Request retry not implemented for transient failures
  VERIFICATION: Check HTTP interceptor implementations and configuration
  REFERENCES: HTTP interceptor patterns, authentication interceptors, error handling interceptors

### RULE: Response Type Safety

CONTEXT: Financial data requires type safety to prevent calculation errors and data corruption
REQUIREMENT: HTTP responses must be properly typed with interfaces and validated
FAIL IF:

- HTTP responses not typed with TypeScript interfaces
- Response data not validated against expected schemas
- Type assertions used without proper validation
- Optional properties not properly handled in response interfaces
- Response transformation not preserving type safety
  VERIFICATION: Check response interface definitions and type safety implementations
  REFERENCES: Response type definitions, interface implementations, type validation patterns

## Error Handling and User Feedback

### RULE: Comprehensive Error Classification

CONTEXT: Different types of errors require different handling strategies in financial applications
REQUIREMENT: Errors must be properly classified and handled according to their type and severity
FAIL IF:

- All errors handled with generic error messages
- Network errors not distinguished from business logic errors
- Error severity not properly classified (warning vs critical)
- User-recoverable errors not providing recovery actions
- Technical errors not properly logged for debugging
  VERIFICATION: Check error classification and handling strategies
  REFERENCES: Error handling implementations, error classification patterns, logging strategies

### RULE: User-Friendly Error Messages

CONTEXT: Financial application users need clear, actionable error messages
REQUIREMENT: Error messages must be user-friendly and provide clear guidance for resolution
FAIL IF:

- Technical error messages shown directly to users
- Error messages not translated for internationalization
- Error context not provided for user understanding
- Recovery actions not suggested when possible
- Error messages not accessible to screen readers
  VERIFICATION: Check error message implementations and user experience
  REFERENCES: Error message patterns, user feedback guidelines, accessibility implementations

### RULE: Loading State Communication

CONTEXT: Financial operations may take time and users need clear feedback about progress
REQUIREMENT: Loading states must be properly communicated with appropriate indicators
FAIL IF:

- Long-running operations not showing loading indicators
- Loading states not preventing duplicate submissions
- Progress not shown for operations with known duration
- Loading feedback not accessible to screen readers
- Loading states not properly cleared on completion or error
  VERIFICATION: Check loading state implementations and user feedback
  REFERENCES: Loading indicator patterns, progress feedback, user experience guidelines

## Data Validation and Integrity

### RULE: Client-Side Data Validation

CONTEXT: Input validation prevents invalid data from reaching the server and improves user experience
REQUIREMENT: All data inputs must be validated on the client side with immediate feedback
FAIL IF:

- Input validation only performed on server side
- Validation feedback not immediate or clear to users
- Validation rules not consistent with server-side validation
- Custom validation not implemented for complex business rules
- Validation not preventing form submission with invalid data
  VERIFICATION: Check client-side validation implementations and user feedback
  REFERENCES: Form validation patterns, custom validator implementations, validation feedback

### RULE: Data Consistency Checks

CONTEXT: Financial data integrity is critical for regulatory compliance and business operations
REQUIREMENT: Data consistency must be validated before processing financial operations
FAIL IF:

- Related data fields not validated for consistency
- Business rule violations not detected before submission
- Data integrity constraints not enforced on client side
- Calculated fields not properly validated against inputs
- Data ranges not validated for financial reasonableness
  VERIFICATION: Check data consistency validation and business rule enforcement
  REFERENCES: Business rule validation, data consistency patterns, financial validation rules

### RULE: Optimistic Update Handling

CONTEXT: Optimistic updates improve user experience but require proper conflict resolution
REQUIREMENT: Optimistic updates must be properly implemented with rollback capabilities
FAIL IF:

- Optimistic updates not reverted on server rejection
- Conflict resolution not implemented for concurrent updates
- User feedback not provided for update conflicts
- Data synchronization not handled properly after conflicts
- Optimistic updates not disabled for critical financial operations
  VERIFICATION: Check optimistic update implementations and conflict resolution
  REFERENCES: Optimistic update patterns, conflict resolution strategies, data synchronization
