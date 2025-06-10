# Fineract Web Application Development Workflow & Quality Assurance

## Angular Development Workflow Critical Rules

### RULE: Pre-Commit Quality Assurance [P0]

CONTEXT: All code must pass automated quality checks before commit to maintain codebase integrity
REQUIREMENT: Every commit must pass ESLint, Stylelint, and Prettier checks without warnings or errors
FAIL IF:

- ESLint errors not resolved before commit
- Stylelint specificity or formatting issues present
- Prettier formatting inconsistencies exist
- Pre-commit hooks bypassed with --no-verify
- Directive selectors don't follow naming conventions
  VERIFICATION: Run `npm run lint` and ensure all files pass quality checks
  REFERENCES: .eslintrc, .stylelintrc, .prettierrc configuration files

### RULE: Angular Directive Naming Convention [P0]

CONTEXT: Angular directives must follow project naming conventions for consistency
REQUIREMENT: All custom directive selectors must start with "mifosx" prefix
FAIL IF:

- Directive selectors use "app" prefix instead of "mifosx"
- Directive selectors don't follow camelCase naming
- Directive naming doesn't match Angular style guide
  VERIFICATION: Check ESLint rules for @angular-eslint/directive-selector
  REFERENCES: Angular style guide, ESLint configuration for directive naming

### RULE: CSS Specificity Management [P0]

CONTEXT: CSS specificity must be managed to prevent styling conflicts and linting errors
REQUIREMENT: General selectors must come before more specific selectors in SCSS files
FAIL IF:

- More specific selectors appear before general ones (no-descending-specificity)
- CSS selector compound depth exceeds 5 levels
- Pseudo-class selectors use unknown or invalid syntax
- Font-family declarations use inconsistent quote styles
  VERIFICATION: Run `npx stylelint "src/**/*.scss" --fix` to identify and fix issues
  REFERENCES: Stylelint configuration, CSS specificity guidelines

### RULE: Automated Code Formatting [P1]

CONTEXT: Code formatting must be consistent across the entire codebase
REQUIREMENT: All files must be formatted using Prettier before commit
FAIL IF:

- Files contain inconsistent indentation or spacing
- Quotes are inconsistent (single vs double)
- Line endings are inconsistent across files
- Markdown files don't follow proper formatting
  VERIFICATION: Run `npx prettier --write .` to format all files
  REFERENCES: .prettierrc configuration, Prettier documentation

### RULE: SCSS Linting Exemptions [P2]

CONTEXT: Complex component styling may require linting rule exemptions
REQUIREMENT: Use stylelint-disable comments judiciously for legitimate styling conflicts
FAIL IF:

- Linting rules disabled globally without justification
- Multiple unrelated rules disabled in single comment
- Disable comments used to hide poor CSS architecture
- Disable comments not properly documented
  VERIFICATION: Ensure disable comments are targeted and necessary
  REFERENCES: Stylelint disable syntax, component styling patterns

## Development Workflow Best Practices

### Quality Check Workflow

1. **Before Starting Development:**

   ```bash
   # Ensure clean working directory
   git status
   npm run lint
   ```

2. **During Development:**

   ```bash
   # Check specific files as you work
   npx eslint src/app/path/to/file.ts
   npx stylelint src/app/path/to/file.scss --fix
   npx prettier --write src/app/path/to/file.ts
   ```

3. **Before Committing:**
   ```bash
   # Run all quality checks
   npm run lint
   npm run test
   git add .
   git commit -m "feat: descriptive commit message"
   ```

### Common Linting Issue Resolutions

#### ESLint Directive Selector Issues

```typescript
// ❌ WRONG - Will fail ESLint
@Directive({
  selector: '[appMyDirective]'
})

// ✅ CORRECT - Follows project naming convention
@Directive({
  selector: '[mifosxMyDirective]'
})
```

#### Stylelint Specificity Issues

```scss
// ❌ WRONG - Specificity order violation
.specific-class .nested-element {
  color: blue;
}

.nested-element {
  color: red; // This will fail no-descending-specificity
}

// ✅ CORRECT - General selectors first
.nested-element {
  color: red;
}

.specific-class .nested-element {
  color: blue;
}
```

#### Stylelint Disable Comments

```scss
/* stylelint-disable no-descending-specificity */
// Use only when legitimate architectural constraints exist
.component-specific-styles {
  // Complex component styling that requires specificity exceptions
}
```

### Font Family Consistency

```scss
// ✅ CORRECT - Consistent single quotes
font-family: 'Roboto', 'Helvetica Neue', sans-serif;

// ❌ WRONG - Mixed quotes
font-family: 'Roboto', 'Helvetica Neue', sans-serif;
```

### Emergency Commit Procedures

If quality checks are blocking urgent fixes:

1. Fix the linting issues first (preferred)
2. Only use `--no-verify` for emergency deployments
3. Create immediate follow-up ticket to fix quality issues
4. Never commit persistent linting exemptions without documentation

### Unit Exemptions

CSS Grid and Flexbox units that may trigger linting:

```scss
/* stylelint-disable unit-allowed-list */
.grid-container {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

## Troubleshooting Common Issues

### Pre-commit Hook Failures

1. **ESLint Cache Issues:**

   ```bash
   rm -rf .eslintcache
   npx eslint --fix .
   ```

2. **Prettier Formatting Conflicts:**

   ```bash
   npx prettier --write .
   git add .
   ```

3. **Stylelint Auto-fix:**
   ```bash
   npx stylelint "src/**/*.scss" --fix
   ```

### Performance Optimization

- Use `--cache` flag for ESLint on large codebases
- Run linting on specific directories during development
- Configure IDE to show linting errors in real-time

### IDE Integration

Configure your IDE to:

- Show ESLint errors inline
- Auto-format on save with Prettier
- Highlight stylelint issues in SCSS files
- Use project-specific settings for consistent formatting

## Quality Metrics

### Acceptable Thresholds

- ESLint errors: 0 (zero tolerance)
- ESLint warnings: < 5 per feature
- Stylelint errors: 0 (zero tolerance)
- Prettier issues: 0 (zero tolerance)
- Test coverage: > 80% for new features

### Monitoring

- Pre-commit hooks enforce quality standards
- CI/CD pipeline includes quality gates
- Regular code quality reviews
- Automated quality reports

## References

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [ESLint Angular Rules](https://github.com/angular-eslint/angular-eslint)
- [Stylelint Rules](https://stylelint.io/user-guide/rules/list)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Husky Pre-commit Hooks](https://typicode.github.io/husky/#/)

_This document ensures consistent code quality and prevents common development workflow issues in the Fineract Web Application._
