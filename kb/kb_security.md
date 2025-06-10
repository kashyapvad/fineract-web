# Security & Authentication Implementation Rules

## Authentication Architecture

### RULE: Multi-Mode Authentication Support

CONTEXT: Financial applications must support multiple authentication methods for different deployment scenarios
REQUIREMENT: Authentication system must support both Basic Auth and OAuth2 with seamless switching
FAIL IF:

- Authentication mode switching not properly implemented
- OAuth2 token management not properly handled
- Basic authentication credentials not securely stored
- Authentication method not configurable through environment settings
- Fallback authentication not working when primary method fails
  VERIFICATION: Check authentication service configuration and mode switching logic
  REFERENCES: AuthenticationService implementation, OAuth2 configuration, environment settings

### RULE: Token Management and Storage

CONTEXT: Authentication tokens must be securely stored and managed to prevent unauthorized access
REQUIREMENT: Tokens must be stored securely with proper expiration and refresh handling
FAIL IF:

- Authentication tokens stored in plain text
- Token storage not using appropriate browser storage (localStorage vs sessionStorage)
- Token expiration not properly handled with automatic refresh
- Refresh tokens not securely stored and managed
- Token cleanup not performed on logout or expiration
  VERIFICATION: Check token storage implementation and security measures
  REFERENCES: Token storage patterns, OAuth2 token handling, session management

### RULE: Session Management

CONTEXT: User sessions must be properly managed for security and user experience
REQUIREMENT: Sessions must have proper timeout, validation, and cleanup mechanisms
FAIL IF:

- Session timeout not implemented or configurable
- Session validation not performed on critical operations
- Multiple session handling not properly managed
- Session cleanup not performed on browser close
- Session hijacking protection not implemented
  VERIFICATION: Check session management implementation and security measures
  REFERENCES: Session handling patterns, timeout configuration, security validation

### RULE: Two-Factor Authentication Integration

CONTEXT: Financial applications require strong authentication for regulatory compliance
REQUIREMENT: Two-factor authentication must be properly integrated with seamless user experience
FAIL IF:

- 2FA not properly integrated with primary authentication flow
- 2FA token management not secure or properly implemented
- 2FA delivery methods not properly configured
- 2FA bypass mechanisms not properly secured
- 2FA user experience not optimized for financial workflows
  VERIFICATION: Check 2FA integration and security implementation
  REFERENCES: 2FA service implementation, token delivery, user experience flows

## Authorization and Access Control

### RULE: Role-Based Access Control

CONTEXT: Financial operations require granular access control based on user roles and permissions
REQUIREMENT: Authorization must be implemented with proper role validation and permission checking
FAIL IF:

- User roles not properly validated before granting access
- Permission checking not performed at component and route level
- Role hierarchy not properly implemented
- Dynamic permission changes not reflected in real-time
- Administrative privileges not properly protected
  VERIFICATION: Check role validation and permission checking implementation
  REFERENCES: Authorization guards, role service implementation, permission validation

### RULE: Route-Level Security

CONTEXT: Application routes must be protected based on user authentication and authorization
REQUIREMENT: Route guards must implement comprehensive security checks for protected areas
FAIL IF:

- Protected routes accessible without proper authentication
- Authorization not checked at route level
- Route guard logic not comprehensive or properly tested
- Unauthorized access not properly redirected
- Route protection not updated when user permissions change
  VERIFICATION: Check route guard implementation and security validation
  REFERENCES: Route guard patterns, authentication guards, authorization implementations

### RULE: Component-Level Security

CONTEXT: UI components must enforce security at the presentation layer
REQUIREMENT: Components must validate user permissions before displaying sensitive information
FAIL IF:

- Sensitive information displayed without permission validation
- Component security not synchronized with backend permissions
- Security checks not performed in component initialization
- Permission changes not reflected in component state
- Administrative functions not properly protected in UI
  VERIFICATION: Check component-level security implementation and permission validation
  REFERENCES: Component security patterns, permission validation, UI protection

## Multi-Tenant Security

### RULE: Tenant Isolation Enforcement

CONTEXT: Multi-tenant financial applications must ensure complete data isolation between tenants
REQUIREMENT: All API requests must include proper tenant identification with validation
FAIL IF:

- Tenant identification not included in all API requests
- Tenant switching not properly validated and secured
- Cross-tenant data access possible through API manipulation
- Tenant context not properly maintained across user session
- Tenant validation not performed on sensitive operations
  VERIFICATION: Check tenant identification and isolation implementation
  REFERENCES: Tenant interceptor implementation, tenant validation, API security

### RULE: Tenant-Aware Authentication

CONTEXT: Authentication must be scoped to specific tenants for proper access control
REQUIREMENT: User authentication must be validated within proper tenant context
FAIL IF:

- User authentication not scoped to tenant
- Cross-tenant user access not properly prevented
- Tenant switching not requiring re-authentication when appropriate
- User permissions not properly scoped to tenant
- Administrative access not properly controlled across tenants
  VERIFICATION: Check tenant-scoped authentication and validation
  REFERENCES: Tenant authentication patterns, user scoping, cross-tenant protection

### RULE: Tenant Configuration Security

CONTEXT: Tenant-specific configurations must be properly secured and isolated
REQUIREMENT: Tenant configurations must be protected from unauthorized access and modification
FAIL IF:

- Tenant configurations accessible by unauthorized users
- Configuration changes not properly validated and audited
- Cross-tenant configuration leakage possible
- Configuration security not enforced at API level
- Tenant-specific secrets not properly protected
  VERIFICATION: Check tenant configuration security and access control
  REFERENCES: Configuration security patterns, tenant isolation, access validation

## Input Validation and XSS Prevention

### RULE: Comprehensive Input Validation

CONTEXT: Financial applications must prevent malicious input to protect data integrity
REQUIREMENT: All user inputs must be validated and sanitized before processing
FAIL IF:

- User inputs not validated before processing or storage
- Client-side validation not complemented by server-side validation
- Input sanitization not performed for display purposes
- File uploads not properly validated for type and content
- SQL injection prevention not implemented for dynamic queries
  VERIFICATION: Check input validation implementation and sanitization patterns
  REFERENCES: Input validation patterns, sanitization implementation, file upload security

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

### RULE: Content Security Policy Implementation

CONTEXT: CSP provides additional layer of protection against various attacks
REQUIREMENT: Content Security Policy must be properly configured and enforced
FAIL IF:

- CSP not configured or too permissive
- Inline scripts or styles not properly restricted
- External content sources not properly validated
- CSP violations not properly monitored and reported
- CSP configuration not updated for application changes
  VERIFICATION: Check CSP configuration and enforcement
  REFERENCES: CSP implementation patterns, security header configuration, violation reporting

## Financial Data Protection

### RULE: Sensitive Data Handling

CONTEXT: Financial data requires special protection for regulatory compliance
REQUIREMENT: Sensitive financial data must be properly protected in transit and at rest
FAIL IF:

- Sensitive data transmitted without HTTPS encryption
- Financial information logged in plain text
- Sensitive data stored in browser storage without encryption
- Data masking not applied for sensitive information display
- Financial calculations performed without proper precision
  VERIFICATION: Check sensitive data handling and protection measures
  REFERENCES: Data protection patterns, encryption implementation, secure transmission

### RULE: Payment Card Industry (PCI) Compliance

CONTEXT: Applications handling payment data must comply with PCI standards
REQUIREMENT: PCI compliance measures must be implemented for payment data handling
FAIL IF:

- Payment card data stored in application or browser storage
- Payment forms not using secure transmission
- PCI compliance not validated for third-party integrations
- Payment data not properly tokenized or encrypted
- Access to payment data not properly logged and audited
  VERIFICATION: Check PCI compliance implementation and payment data security
  REFERENCES: PCI compliance guidelines, payment security patterns, data tokenization

### RULE: Audit Trail and Compliance

CONTEXT: Financial operations require comprehensive audit trails for regulatory compliance
REQUIREMENT: All security-related events must be properly logged and auditable
FAIL IF:

- Authentication events not properly logged
- Authorization failures not recorded for audit
- Security violations not properly tracked and reported
- Audit logs not tamper-proof or properly secured
- Compliance reporting not supported by audit data
  VERIFICATION: Check audit logging implementation and compliance features
  REFERENCES: Audit logging patterns, compliance requirements, security monitoring

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

## Network Security

### RULE: HTTPS Enforcement

CONTEXT: Financial applications must use secure communication channels exclusively
REQUIREMENT: All application communication must use HTTPS with proper certificate validation
FAIL IF:

- HTTP used for any application communication
- Mixed content (HTTP resources on HTTPS pages) present
- Certificate validation not properly implemented
- SSL/TLS configuration not following security best practices
- Certificate pinning not implemented for critical connections
  VERIFICATION: Check HTTPS implementation and certificate validation
  REFERENCES: HTTPS configuration, SSL/TLS best practices, certificate management

### RULE: API Security Headers

CONTEXT: Security headers provide additional protection against various web attacks
REQUIREMENT: All API responses must include appropriate security headers
FAIL IF:

- Security headers not properly configured
- CORS policy not properly restricted
- X-Frame-Options not preventing clickjacking
- X-Content-Type-Options not preventing MIME sniffing
- Referrer-Policy not properly configured for privacy
  VERIFICATION: Check security header configuration and implementation
  REFERENCES: Security header patterns, CORS configuration, web security standards

### RULE: Cross-Origin Resource Sharing (CORS)

CONTEXT: CORS policy must be properly configured to prevent unauthorized cross-origin requests
REQUIREMENT: CORS must be configured with minimal necessary permissions for security
FAIL IF:

- CORS policy too permissive (wildcard origins in production)
- Allowed origins not properly validated
- Preflight requests not properly handled
- Credentials not properly controlled in CORS requests
- CORS configuration not environment-specific
  VERIFICATION: Check CORS configuration and origin validation
  REFERENCES: CORS implementation patterns, origin validation, cross-origin security
