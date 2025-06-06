# Performance & Optimization Implementation Rules

## Build Optimization and Bundle Management

### RULE: Bundle Size Optimization

CONTEXT: Financial web applications must load quickly for optimal user experience
REQUIREMENT: Bundle sizes must be optimized through proper code splitting and tree shaking
FAIL IF:

- Main bundle size exceeds performance budget (12MB maximum)
- Vendor bundle not properly separated from application code
- Lazy loading not implemented for feature modules
- Unused code not eliminated through tree shaking
- Third-party libraries not analyzed for size impact
  VERIFICATION: Check bundle analysis reports and verify size optimization
  REFERENCES: Angular build configuration, bundle analyzer reports, performance budgets

### RULE: Code Splitting Strategy

CONTEXT: Effective code splitting improves initial load time and caching efficiency
REQUIREMENT: Application must implement strategic code splitting with lazy loading
FAIL IF:

- All feature modules loaded eagerly instead of lazy loading
- Code splitting not optimized for route-based loading
- Shared code not properly extracted into common chunks
- Dynamic imports not used for conditional feature loading
- Chunk optimization not configured for caching efficiency
  VERIFICATION: Check lazy loading configuration and chunk optimization
  REFERENCES: Lazy loading implementation, route configuration, chunk analysis

### RULE: Build Configuration Optimization

CONTEXT: Production builds must be optimized for performance and security
REQUIREMENT: Build configuration must enable all optimization features for production
FAIL IF:

- AOT compilation not enabled for production builds
- Build optimizer not configured for dead code elimination
- Source maps included in production builds
- Development dependencies included in production bundle
- Optimization flags not properly configured
  VERIFICATION: Check production build configuration and optimization settings
  REFERENCES: Angular build configuration, production optimization, compiler settings

### RULE: Performance Budget Enforcement

CONTEXT: Performance budgets prevent regression in application performance
REQUIREMENT: Build process must enforce performance budgets with warnings and errors
FAIL IF:

- Performance budgets not configured for bundle sizes
- Budget violations not causing build warnings or failures
- Component style budgets not enforced
- Performance monitoring not integrated into CI/CD pipeline
- Budget thresholds not appropriate for target performance
  VERIFICATION: Check performance budget configuration and enforcement
  REFERENCES: Performance budget settings, build configuration, CI/CD integration

## Lazy Loading and Module Optimization

### RULE: Feature Module Lazy Loading

CONTEXT: Lazy loading reduces initial bundle size and improves perceived performance
REQUIREMENT: All feature modules must be configured for lazy loading with proper preloading
FAIL IF:

- Feature modules not configured for lazy loading
- Preloading strategy not optimized for user navigation patterns
- Lazy loaded modules missing proper loading states
- Module loading errors not properly handled
- Lazy loading not tested across different network conditions
  VERIFICATION: Check lazy loading configuration and preloading strategy
  REFERENCES: Lazy loading routes, preloading strategies, module configuration

### RULE: Shared Module Optimization

CONTEXT: Shared modules must be optimized to prevent code duplication
REQUIREMENT: Shared modules must be structured to minimize bundle duplication
FAIL IF:

- Shared code duplicated across multiple feature bundles
- Shared module not properly configured for tree shaking
- Common dependencies not extracted to shared chunks
- Shared module imports creating circular dependencies
- Module federation not considered for large shared libraries
  VERIFICATION: Check shared module structure and bundle analysis
  REFERENCES: Shared module configuration, bundle duplication analysis, tree shaking

### RULE: Dynamic Import Optimization

CONTEXT: Dynamic imports enable fine-grained code splitting for optimal performance
REQUIREMENT: Dynamic imports must be used strategically for conditional features
FAIL IF:

- Dynamic imports not used for large conditional dependencies
- Import statements not optimized for webpack bundling
- Dynamic imports not properly typed for TypeScript
- Error handling not implemented for dynamic import failures
- Dynamic imports not cached appropriately
  VERIFICATION: Check dynamic import usage and optimization
  REFERENCES: Dynamic import patterns, conditional loading, error handling

## Progressive Web App (PWA) Features

### RULE: Service Worker Implementation

CONTEXT: Service workers enable offline functionality and performance improvements
REQUIREMENT: Service worker must be properly configured for caching and offline support
FAIL IF:

- Service worker not configured for application caching
- Caching strategy not appropriate for financial application needs
- Offline functionality not working for critical features
- Service worker updates not properly handled
- Cache invalidation not working correctly
  VERIFICATION: Check service worker configuration and offline functionality
  REFERENCES: Service worker setup, caching strategies, offline capabilities

### RULE: Application Shell Architecture

CONTEXT: App shell provides instant loading experience for returning users
REQUIREMENT: Application shell must be optimized for instant loading and caching
FAIL IF:

- App shell not properly separated from dynamic content
- Shell resources not cached for instant loading
- Navigation not working in offline mode
- Shell design not optimized for perceived performance
- Critical rendering path not optimized for shell loading
  VERIFICATION: Check app shell implementation and caching
  REFERENCES: App shell patterns, critical resource optimization, navigation caching

### RULE: Background Sync and Updates

CONTEXT: Background sync ensures data integrity and user experience continuity
REQUIREMENT: Background sync must be implemented for critical user data
FAIL IF:

- User data not synced when connection restored
- Background sync not handling conflicts properly
- Sync failures not communicated to users
- Background updates not preserving user workflow
- Sync strategies not optimized for financial data integrity
  VERIFICATION: Check background sync implementation and conflict resolution
  REFERENCES: Background sync patterns, data synchronization, conflict handling

## Angular Performance Optimization

### RULE: Change Detection Optimization

CONTEXT: Efficient change detection is critical for responsive financial interfaces
REQUIREMENT: Change detection must be optimized through OnPush strategy and proper binding
FAIL IF:

- Default change detection used for all components
- OnPush strategy not implemented where appropriate
- Function calls used in template bindings
- Complex expressions evaluated in templates
- Change detection not optimized for large data sets
  VERIFICATION: Check change detection strategy and template optimization
  REFERENCES: OnPush strategy implementation, template optimization, change detection profiling

### RULE: Memory Management and Leak Prevention

CONTEXT: Memory leaks can degrade performance in long-running financial sessions
REQUIREMENT: Memory usage must be managed through proper subscription cleanup and object management
FAIL IF:

- Subscriptions not properly unsubscribed in components
- Event listeners not removed on component destruction
- Large objects not properly released from memory
- Memory leaks detected in development or production
- Garbage collection not optimized for application patterns
  VERIFICATION: Check memory management and leak detection
  REFERENCES: Subscription cleanup patterns, memory leak prevention, garbage collection optimization

### RULE: Rendering Performance

CONTEXT: Smooth rendering is essential for professional financial application experience
REQUIREMENT: Rendering performance must be optimized through proper DOM management
FAIL IF:

- Virtual scrolling not used for large data lists
- Excessive DOM manipulation causing performance issues
- Layout thrashing from inefficient CSS or animations
- Large tables not optimized for scrolling performance
- Rendering not optimized for different device capabilities
  VERIFICATION: Check rendering performance and optimization techniques
  REFERENCES: Virtual scrolling implementation, DOM optimization, rendering performance

## Network and Data Optimization

### RULE: HTTP Caching Strategy

CONTEXT: Effective caching reduces server load and improves user experience
REQUIREMENT: HTTP responses must be cached appropriately with proper invalidation
FAIL IF:

- Static resources not cached with appropriate headers
- API responses not cached when appropriate
- Cache invalidation not working correctly
- Caching strategy not optimized for user patterns
- Cache size not managed to prevent storage issues
  VERIFICATION: Check HTTP caching implementation and effectiveness
  REFERENCES: HTTP cache headers, caching strategies, cache management

### RULE: Data Loading Optimization

CONTEXT: Efficient data loading prevents unnecessary network requests and improves performance
REQUIREMENT: Data loading must be optimized through pagination, filtering, and lazy loading
FAIL IF:

- Large datasets loaded without pagination
- Data not filtered at server level before transfer
- Lazy loading not implemented for expensive operations
- Data prefetching not optimized for user navigation
- Unnecessary data loaded for list views
  VERIFICATION: Check data loading patterns and optimization
  REFERENCES: Pagination implementation, data filtering, lazy loading patterns

### RULE: Image and Asset Optimization

CONTEXT: Optimized assets reduce bandwidth usage and improve loading times
REQUIREMENT: Images and assets must be optimized for web delivery
FAIL IF:

- Images not optimized for web formats (WebP, compression)
- Icons not using efficient formats (SVG, icon fonts)
- Assets not served with appropriate compression
- Responsive images not implemented for different screen sizes
- Asset loading not optimized for critical rendering path
  VERIFICATION: Check asset optimization and delivery
  REFERENCES: Image optimization, asset compression, responsive images

## Monitoring and Analytics

### RULE: Performance Monitoring

CONTEXT: Continuous monitoring ensures performance standards are maintained
REQUIREMENT: Application performance must be monitored with appropriate metrics
FAIL IF:

- Core Web Vitals not monitored in production
- Performance regression not detected through monitoring
- User experience metrics not tracked
- Performance alerts not configured for critical thresholds
- Monitoring data not actionable for optimization
  VERIFICATION: Check performance monitoring implementation and metrics
  REFERENCES: Performance monitoring tools, metrics collection, alerting systems

### RULE: Error Tracking and Performance

CONTEXT: Errors can significantly impact application performance and user experience
REQUIREMENT: Error tracking must include performance context and user impact
FAIL IF:

- Errors not tracked with performance impact context
- Performance degradation not correlated with error rates
- Error tracking not optimized for performance overhead
- Critical errors not prioritized by performance impact
- Error recovery not optimized for performance
  VERIFICATION: Check error tracking and performance correlation
  REFERENCES: Error tracking implementation, performance correlation, error impact analysis

### RULE: Real User Monitoring (RUM)

CONTEXT: Real user data provides insights into actual performance experienced by users
REQUIREMENT: RUM must be implemented to track actual user performance metrics
FAIL IF:

- Real user performance not monitored
- Synthetic monitoring not complemented by RUM data
- Performance data not segmented by user demographics
- Performance bottlenecks not identified through user data
- Optimization priorities not based on real user impact
  VERIFICATION: Check RUM implementation and data analysis
  REFERENCES: Real user monitoring setup, performance analytics, user experience optimization
