# Fineract Web Application Open Source Compliance Rules

## License Compliance Rules

### RULE: MPL V2 License Header Requirements

CONTEXT: Mozilla Public License V2 requires proper license headers in all source files for legal compliance
REQUIREMENT: All TypeScript, JavaScript, SCSS, and HTML source files must include proper MPL V2 license headers
FAIL IF:

- Source files missing license headers or copyright notices
- License headers not following MPL V2 format requirements
- Third-party code included without proper attribution
- License compatibility not verified for dependencies
- Copyright years not updated for modified files
  VERIFICATION: Check license headers in all source files and verify MPL V2 compliance
  REFERENCES: LICENSE file, MPL V2 documentation, file header templates

### RULE: Dependency License Compatibility

CONTEXT: All npm dependencies must be compatible with MPL V2 to avoid license conflicts
REQUIREMENT: All package.json dependencies must use MPL V2 compatible licenses (MIT, Apache 2.0, BSD, etc.)
FAIL IF:

- Dependencies use incompatible licenses (GPL, AGPL, proprietary)
- License compatibility not verified before adding dependencies
- License scanning not performed on dependency updates
- Transitive dependencies violate license compatibility
- License information not documented for major dependencies
  VERIFICATION: Run license scanning tools and verify all dependencies are MPL V2 compatible
  REFERENCES: package.json, npm license checker tools, dependency documentation

### RULE: Third-Party Asset Attribution

CONTEXT: Proper attribution required for all third-party assets, icons, and libraries used in web application
REQUIREMENT: All third-party assets must be properly attributed with license information
FAIL IF:

- Third-party assets used without proper attribution
- Asset licenses not compatible with MPL V2
- Attribution information not accessible to end users
- Asset licensing not documented in project documentation
- Custom modifications to third-party assets not properly marked
  VERIFICATION: Check attribution for all third-party assets and verify license compatibility
  REFERENCES: Asset attribution files, third-party license documentation

## Contribution Standards Rules

### RULE: Angular Code Quality Standards

CONTEXT: Consistent code quality ensures maintainability and professional standards for financial software
REQUIREMENT: All code contributions must meet Angular style guide and project-specific quality standards
FAIL IF:

- Code not following Angular style guide conventions
- ESLint, Prettier, or Stylelint rules violated
- TypeScript strict mode violations present
- Code not properly documented with JSDoc comments
- Test coverage below project minimum requirements (80%)
  VERIFICATION: Run linting tools and verify code quality metrics meet standards
  REFERENCES: Angular style guide, .eslintrc configuration, code quality documentation

### RULE: Commit Message and PR Standards

CONTEXT: Clear commit history and pull request documentation essential for open source collaboration
REQUIREMENT: All commits and pull requests must follow conventional commit format and include proper documentation
FAIL IF:

- Commit messages not following conventional commit format
- Pull requests missing description or acceptance criteria
- Breaking changes not properly documented
- Related issues not referenced in commits or PRs
- Commit history not clean or contains merge commits
  VERIFICATION: Check commit message format and PR documentation completeness
  REFERENCES: Conventional commits specification, PR template, contribution guidelines

### RULE: Documentation Requirements

CONTEXT: Comprehensive documentation ensures accessibility for community contributors and users
REQUIREMENT: All new features and significant changes must include proper documentation
FAIL IF:

- New features missing user documentation
- API changes not documented in changelog
- Component documentation missing from style guide
- Installation or setup instructions outdated
- Code comments insufficient for complex business logic
  VERIFICATION: Check documentation completeness for new features and changes
  REFERENCES: Documentation templates, README files, inline code documentation

## Community Collaboration Rules

### RULE: Issue and Bug Report Handling

CONTEXT: Professional issue management builds community trust and improves software quality
REQUIREMENT: All issues must be properly triaged, labeled, and responded to within reasonable timeframes
FAIL IF:

- Issues not properly labeled or categorized
- Bug reports missing reproduction steps or environment details
- Feature requests not evaluated for project alignment
- Response time exceeds community expectations (48-72 hours)
- Issue resolution not properly documented
  VERIFICATION: Check issue management practices and response times
  REFERENCES: Issue templates, labeling guidelines, community response standards

### RULE: Code Review Process Compliance

CONTEXT: Thorough code reviews ensure quality and knowledge sharing in open source development
REQUIREMENT: All code changes must undergo proper peer review before merging
FAIL IF:

- Code merged without required reviewer approval
- Review feedback not addressed before merging
- Breaking changes not reviewed by maintainers
- Security-related changes not reviewed by security team
- Review process bypassed for urgent fixes without documentation
  VERIFICATION: Check PR review history and ensure compliance with review requirements
  REFERENCES: Review guidelines, maintainer responsibilities, security review processes

### RULE: Community Communication Standards

CONTEXT: Professional and inclusive communication fosters healthy open source community
REQUIREMENT: All community interactions must follow code of conduct and professional standards
FAIL IF:

- Communication not following project code of conduct
- Technical discussions not remaining constructive and professional
- Community guidelines not enforced consistently
- Discrimination or harassment not addressed promptly
- Communication channels not properly moderated
  VERIFICATION: Monitor community interactions and ensure code of conduct compliance
  REFERENCES: Code of conduct, community guidelines, communication policies

---

_MPL V2 License: Mozilla Public License Version 2.0_  
_Community: Mifos Open Source Financial Inclusion Initiative_  
_Repository: https://github.com/openMF/web-app_
