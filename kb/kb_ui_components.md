# UI Components & Design System Implementation Rules

## Angular Material Integration

### RULE: Material Design Component Usage

CONTEXT: Consistent Material Design implementation ensures professional financial application appearance
REQUIREMENT: All UI components must use Angular Material components with proper theming and customization
FAIL IF:

- Custom components created when equivalent Material components exist
- Material components not properly themed for application branding
- Component usage not following Material Design guidelines
- Material component accessibility features not properly utilized
- Component density and spacing not consistent with Material specifications
  VERIFICATION: Check component implementations and Material Design compliance
  REFERENCES: Material module configuration, component usage patterns, Material Design guidelines

### RULE: Material Theme Customization

CONTEXT: Application theme must reflect financial institution branding while maintaining usability
REQUIREMENT: Material theme must be properly customized with brand colors and typography
FAIL IF:

- Default Material theme used without customization
- Brand colors not properly integrated into Material color palette
- Typography not optimized for financial data display
- Theme not supporting both light and dark modes
- Color contrast not meeting accessibility requirements (WCAG 2.1 AA)
  VERIFICATION: Check theme configuration and brand integration
  REFERENCES: Theme customization files, brand style guide, accessibility color testing

### RULE: Form Field Configuration

CONTEXT: Form fields must be consistently configured for optimal user experience in financial workflows
REQUIREMENT: Form fields must use consistent appearance and behavior across application
FAIL IF:

- Form field appearance inconsistent across different forms
- Form field validation not properly integrated with Material components
- Form field labels and hints not following consistent patterns
- Required field indicators not clearly visible
- Form field error states not properly styled or accessible
  VERIFICATION: Check form field configuration and consistency across application
  REFERENCES: Form field implementations, validation patterns, error handling

### RULE: Icon System Integration

CONTEXT: Icons must be consistently used to enhance user interface clarity and navigation
REQUIREMENT: Icon usage must follow consistent patterns with proper sizing and accessibility
FAIL IF:

- Icons not properly imported or configured in icon module
- Icon usage not consistent across similar UI elements
- Icons not properly sized for different screen densities
- Icon accessibility (alt text, ARIA labels) not properly implemented
- Custom icons not following Material Design icon principles
  VERIFICATION: Check icon module configuration and usage consistency
  REFERENCES: Icons module implementation, icon usage patterns, accessibility guidelines

## Responsive Design Implementation

### RULE: Breakpoint Management

CONTEXT: Financial application must work effectively on desktop, tablet, and mobile devices
REQUIREMENT: Responsive design must use Angular Flex Layout with proper breakpoint management
FAIL IF:

- Layouts not properly responsive across different screen sizes
- Breakpoints not aligned with Material Design specifications
- Flex Layout directives not used consistently
- Mobile-first design principles not followed
- Touch interfaces not optimized for mobile devices
  VERIFICATION: Check responsive implementation across different screen sizes
  REFERENCES: Flex Layout usage, breakpoint definitions, mobile optimization

### RULE: Data Table Responsiveness

CONTEXT: Financial data tables must remain usable on all device sizes
REQUIREMENT: Data tables must implement responsive patterns for mobile and tablet viewing
FAIL IF:

- Data tables not scrollable or usable on mobile devices
- Important columns not prioritized for smaller screens
- Table pagination not mobile-friendly
- Row actions not accessible on touch devices
- Table headers not properly sticky on scroll
  VERIFICATION: Test data table usability across different device sizes
  REFERENCES: Table implementations, responsive table patterns, mobile usability

### RULE: Navigation Adaptability

CONTEXT: Navigation must adapt appropriately to different screen sizes and input methods
REQUIREMENT: Navigation components must provide optimal experience across all device types
FAIL IF:

- Navigation not collapsible on mobile devices
- Navigation items not accessible via touch on mobile
- Breadcrumb navigation not responsive or truncated properly
- Menu hierarchies not optimized for touch interaction
- Navigation state not preserved across screen size changes
  VERIFICATION: Check navigation behavior across different screen sizes
  REFERENCES: Navigation implementations, mobile navigation patterns, touch optimization

## Form Design and Validation

### RULE: Form Validation Patterns

CONTEXT: Financial forms require comprehensive validation to prevent data entry errors
REQUIREMENT: Forms must implement comprehensive validation with clear error messaging
FAIL IF:

- Form validation not performed on both client and server side
- Error messages not user-friendly or actionable
- Validation not triggered at appropriate times (blur, submit, real-time)
- Field-level validation not properly integrated with form-level validation
- Validation state not clearly visible to users
  VERIFICATION: Check form validation implementation and user feedback
  REFERENCES: Form validation patterns, error messaging guidelines, user experience testing

### RULE: Financial Input Formatting

CONTEXT: Financial data input requires special formatting and validation for accuracy
REQUIREMENT: Financial input fields must implement proper formatting, validation, and precision
FAIL IF:

- Currency amounts not properly formatted with locale-specific patterns
- Decimal precision not appropriate for financial calculations
- Number input not preventing invalid characters
- Currency conversion not handled with proper precision
- Financial calculations using floating-point arithmetic instead of decimal libraries
  VERIFICATION: Check financial input implementations and calculation accuracy
  REFERENCES: Financial formatting patterns, precision handling, currency formatting

### RULE: Standardized Date Formatting with Angular Pipes [P1]

CONTEXT: Date display must be consistent across the application using Angular's built-in date handling capabilities
REQUIREMENT: All date fields must use Angular DatePipe or custom date pipes instead of manual string formatting or JavaScript date methods
FAIL IF:

- Date formatting performed using JavaScript Date methods in components
- Inconsistent date formats across different views and components
- Manual date string manipulation instead of using Angular pipes
- Date display not respecting user locale and timezone settings
- Custom date formatting logic scattered across multiple components
  VERIFICATION: Check for consistent date pipe usage and eliminate manual date formatting
  REFERENCES:
  - PATTERN_EXAMPLE: `{{ reportGeneratedDate | date:'mediumDate' }}` in templates
  - PATTERN_EXAMPLE: `{{ verificationDate | date:'short' }}` for datetime display
  - PATTERN_EXAMPLE: `{{ clientCreatedDate | date:'dd/MM/yyyy' }}` for custom format
  - PIPE_USAGE: `| date:'format'` in all template date bindings
  - LOCALE_SUPPORT: Date pipes respecting Angular locale configuration
  - CUSTOM_PIPES: `@Pipe({ name: 'financialDate' })` for specialized financial date formats
  - SERVICE_FORMATTING: DatePipe injection in services for programmatic formatting
  - VERIFICATION_CMD: `grep -rn "new Date\|toDateString\|toLocaleDateString" src/app/ --exclude-dir=test`
  - VERIFICATION_CMD: `grep -rn "| date" src/app/ | wc -l` (should show extensive usage)
  - PREFERRED_APPROACH: Template: `{{ date | date:'format' }}`, Service: `this.datePipe.transform(date, 'format')`
  - ANTI_PATTERN: `new Date(dateString).toLocaleDateString()` in component methods
  - ANTI_PATTERN: Manual date string concatenation or manipulation

### RULE: Accessibility in Forms

CONTEXT: Forms must be accessible to users with disabilities for regulatory compliance
REQUIREMENT: Forms must implement comprehensive accessibility features following WCAG guidelines
FAIL IF:

- Form fields missing proper labels or ARIA attributes
- Error messages not associated with relevant form fields
- Focus management not properly implemented for screen readers
- Keyboard navigation not working properly through form elements
- Form submission feedback not accessible to screen readers
  VERIFICATION: Check form accessibility with screen readers and keyboard navigation
  REFERENCES: Accessibility guidelines, ARIA implementation, keyboard navigation patterns

## Component Architecture Patterns

### RULE: Reusable Component Design

CONTEXT: Financial application components must be reusable across different business contexts
REQUIREMENT: Components must be designed for maximum reusability with proper parameterization
FAIL IF:

- Components tightly coupled to specific business logic or data structures
- Component interfaces not flexible enough for different use cases
- Components containing hardcoded business rules or display logic
- Component styling not configurable for different contexts
- Components not properly documented for reuse
  VERIFICATION: Check component reusability across different application areas
  REFERENCES: Component design patterns, interface definitions, reusability documentation

### RULE: Component Communication Patterns

CONTEXT: Component communication must be clean and maintainable for complex financial workflows
REQUIREMENT: Components must communicate through well-defined interfaces using Angular patterns
FAIL IF:

- Components tightly coupled through direct property access
- Event emitters not properly typed with custom interfaces
- Component communication not following parent-child or service-mediated patterns
- Global state used for component communication without proper abstraction
- Component dependencies not properly managed through dependency injection
  VERIFICATION: Check component communication patterns and interface definitions
  REFERENCES: Component communication implementations, event handling patterns, service communication

### RULE: Component Testing Strategy

CONTEXT: UI components must be thoroughly tested for reliability in financial operations
REQUIREMENT: Components must have comprehensive unit tests covering functionality and edge cases
FAIL IF:

- Component tests not covering user interaction scenarios
- Component inputs and outputs not properly tested
- Error conditions not tested in component behavior
- Component accessibility not tested with automated tools
- Component performance not verified under load conditions
  VERIFICATION: Check component test coverage and quality
  REFERENCES: Component testing patterns, test coverage reports, accessibility testing

## User Experience Patterns

### RULE: Loading State Management

CONTEXT: Financial operations may take time and users need clear feedback about system status
REQUIREMENT: Loading states must be consistently implemented with appropriate user feedback
FAIL IF:

- Long-running operations not providing loading feedback
- Loading indicators not properly positioned or styled
- Loading states not accessible to screen readers
- Loading feedback not cancelled when operations complete
- Progress indicators not showing actual progress when possible
  VERIFICATION: Check loading state implementations and user feedback
  REFERENCES: Loading state patterns, progress indicator usage, user feedback guidelines

### RULE: Error State Handling

CONTEXT: Error states must be clearly communicated to prevent financial operation failures
REQUIREMENT: Error states must provide clear, actionable feedback to users
FAIL IF:

- Error messages not user-friendly or actionable
- Error states not clearly distinguishable from normal states
- Error recovery mechanisms not provided where appropriate
- Error context not preserved for user reference
- Critical errors not properly escalated or logged
  VERIFICATION: Check error handling implementations and user feedback
  REFERENCES: Error handling patterns, user message guidelines, error recovery mechanisms

### RULE: Accessibility Compliance

CONTEXT: Financial applications must be accessible to all users for regulatory compliance
REQUIREMENT: All UI components must meet WCAG 2.1 AA accessibility standards
FAIL IF:

- Components not keyboard navigable
- Color not used as sole means of conveying information
- Text contrast not meeting minimum requirements
- ARIA labels and descriptions missing or incorrect
- Focus indicators not clearly visible
  VERIFICATION: Run accessibility audits and test with assistive technologies
  REFERENCES: WCAG guidelines, accessibility testing tools, assistive technology testing

## Data Display and Visualization

### RULE: Financial Data Presentation

CONTEXT: Financial data must be presented clearly and accurately for decision-making
REQUIREMENT: Financial data displays must use appropriate formatting and precision
FAIL IF:

- Currency values not formatted according to locale conventions
- Large numbers not properly formatted with thousand separators
- Percentage values not displayed with appropriate precision
- Negative values not clearly distinguished with color and symbols
- Data alignment not appropriate for numeric comparison
  VERIFICATION: Check financial data formatting across different components
  REFERENCES: Financial formatting standards, locale-specific formatting, data presentation guidelines

### RULE: Chart and Graph Implementation

CONTEXT: Financial data visualization must be accurate and accessible
REQUIREMENT: Charts must be implemented with proper accessibility and responsive design
FAIL IF:

- Charts not accessible to screen readers with proper descriptions
- Chart colors not distinguishable for colorblind users
- Charts not responsive to different screen sizes
- Chart data not exportable or accessible in alternative formats
- Chart interactions not keyboard accessible
  VERIFICATION: Check chart implementations for accessibility and responsiveness
  REFERENCES: Chart accessibility guidelines, responsive chart patterns, data visualization standards

### RULE: Table Data Management

CONTEXT: Financial data tables must support efficient data browsing and analysis
REQUIREMENT: Data tables must implement proper sorting, filtering, and pagination
FAIL IF:

- Table sorting not working correctly for different data types
- Table filtering not providing appropriate search capabilities
- Pagination not efficient for large datasets
- Table columns not resizable or configurable
- Table data not exportable in standard formats (CSV, Excel)
  VERIFICATION: Check table functionality and performance with large datasets
  REFERENCES: Table implementation patterns, data management strategies, export functionality
