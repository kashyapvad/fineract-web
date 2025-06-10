# Fineract Web Application Knowledge Base Index

## Overview

This Knowledge Base provides architectural guardrails and development guidelines for the Fineract Web Application - a modern Angular-based single-page application (SPA) built for financial inclusion, serving the Mifos user community with comprehensive core banking functionality.

## PROJECT STRUCTURE - CRITICAL FOR NAVIGATION

### TWO SEPARATE CODEBASES

This project consists of **TWO COMPLETELY SEPARATE CODEBASES** that must be handled differently:

#### 🎨 FRONTEND CODEBASE (Angular/TypeScript) - THIS CODEBASE

- **Location**: `/Users/kash/Documents/GitHub/fineract-web/` (main working directory)
- **Technology**: Angular 14+, TypeScript, Material UI, SCSS, RxJS
- **File Types**: `.ts`, `.html`, `.scss`, `.json`, `package.json`
- **Key Directories**:
  - `src/app/` - Angular components and services
  - `src/app/extend/` - Custom frontend modules
  - `src/app/custom/` - Fork-specific features
  - `kb/` - Frontend knowledge base documentation (this directory)
  - Root level has `package.json`, `angular.json`, etc.

#### 🔧 BACKEND CODEBASE (Java/Spring Boot) - SEPARATE CODEBASE

- **Location**: `/Users/kash/Documents/GitHub/fineract/` (separate directory!)
- **Technology**: Java 21, Spring Boot 3.x, PostgreSQL, Gradle
- **File Types**: `.java`, `.xml`, `.sql`, `.properties`, `.gradle`
- **Key Directories**:
  - `fineract-provider/` - Main Spring Boot application
  - `fineract-core/` - Core domain models
  - `fineract-loan/`, `fineract-savings/` - Feature modules
  - `kb/` - Backend knowledge base documentation

### NAVIGATION RULES FOR AI ASSISTANTS

- **Frontend Tasks**: Stay in `/fineract-web/` directory, use `npm`/`ng` commands
- **Backend Tasks**: Navigate to `/fineract/` directory, use `gradle` commands
- **File Identification**: Check file extensions (`.ts` = frontend, `.java` = backend)
- **Build Tools**: Never mix npm (frontend) with Gradle (backend)
- **Formatting**: Use Prettier from current directory for TypeScript/Angular files

### API INTEGRATION CONTEXT

- **Backend API**: REST endpoints from separate Spring Boot application
- **Frontend Services**: Angular HTTP services consume backend APIs
- **Development**: Frontend (port 4200) ↔ Backend (port 8080)
- **Authentication**: Angular handles OAuth2/JWT tokens from backend

## Priority-Based Quick Start

- **P0 (Critical)**: [kb_critical.md](./kb_critical.md) - Security, authentication, data integrity
- **P1 (Important)**: [kb_angular_architecture.md](./kb_angular_architecture.md) - Feature modules, service patterns
- **P2 (Recommended)**: [kb_customization.md](./kb_customization.md) - Theming, i18n, optimization
- **P1 (Important)**: [kb_development_workflow.md](./kb_development_workflow.md) - Linting, formatting, quality assurance

## Cross-Project Integration

For multi-project tasks: **[../fineract/kb/kb_cross_project.md](../fineract/kb/kb_cross_project.md)** - Dependencies with Backend & Android

## Knowledge Base Structure

### 🎯 Core Architecture [P0]

- **[kb_critical.md](./kb_critical.md)** (16 rules)
  - Essential Angular architectural guardrails
  - Feature module organization patterns
  - Service layer and dependency injection
  - State management and data flow principles
  - **Use when**: Starting new features, architectural decisions, code reviews

### 🅰️ Angular Architecture Patterns

- **[kb_angular_architecture.md](./kb_angular_architecture.md)** (18 rules)
  - Feature module design and lazy loading
  - Core/Shared module organization
  - Service layer patterns and HTTP interceptors
  - Routing and navigation strategies
  - Component lifecycle management
  - **Use when**: Module design, service implementation, routing setup

### 🎨 UI Components & Design System

- **[kb_ui_components.md](./kb_ui_components.md)** (14 rules)
  - Angular Material component patterns
  - Responsive design implementation
  - Form validation and user input handling
  - Accessibility (WCAG) compliance
  - Design system consistency
  - **Use when**: Building UI components, form development, accessibility reviews

### 🔄 State Management & Data Flow

- **[kb_state_management.md](./kb_state_management.md)** (12 rules)
  - RxJS reactive patterns
  - Service-based state management
  - HTTP client and data caching strategies
  - Error handling and user feedback
  - Real-time data updates
  - **Use when**: Data management, API integration, reactive programming

### 🔐 Security & Authentication

- **[kb_security.md](./kb_security.md)** (11 rules)
  - OAuth2 and session management
  - HTTP security headers and HTTPS
  - Input validation and XSS prevention
  - Financial data protection patterns
  - Multi-tenant security boundaries
  - **Use when**: Authentication features, security reviews, data protection

### ⚡ Performance & Optimization

- **[kb_performance.md](./kb_performance.md)** (10 rules)
  - Lazy loading and code splitting
  - Angular performance optimization
  - Bundle size management
  - Progressive Web App (PWA) features
  - Web vitals and user experience
  - **Use when**: Performance optimization, build configuration, PWA implementation

### 🔧 Customization & Theming

- **[kb_customization.md](./kb_customization.md)** (8 rules)
  - Angular Material theming system
  - Multi-tenant UI customization
  - Internationalization (i18n) patterns
  - Brand integration strategies
  - Environment-specific configurations
  - **Use when**: Theming, branding, multi-tenant features, localization

### 🚀 Deployment & Build Optimization

- **[kb_deployment.md](./kb_deployment.md)** (9 rules)
  - Angular build optimization
  - Docker containerization for web
  - CI/CD pipeline configuration
  - Environment management
  - Production deployment strategies
  - **Use when**: Build setup, deployment configuration, production optimization

### 📜 Open Source Compliance

- **[kb_open_source.md](./kb_open_source.md)** (6 rules)
  - MPL V2 license compliance
  - Angular community contribution guidelines
  - Code quality and testing standards
  - Documentation requirements
  - **Use when**: Contributing code, license compliance, community interaction

## Quick Navigation by Development Context

### 🆕 New Feature Development

1. Start with: `kb_critical.md` → `kb_angular_architecture.md`
2. For UI features: `kb_ui_components.md`
3. For data features: `kb_state_management.md`
4. For security features: `kb_security.md`

### 🎨 UI & Component Development

1. Primary: `kb_ui_components.md`
2. Architecture: `kb_angular_architecture.md` (component patterns)
3. Foundation: `kb_critical.md` (component organization)
4. Theming: `kb_customization.md`

### 🔄 Data & Service Implementation

1. Core: `kb_state_management.md`
2. Architecture: `kb_angular_architecture.md` (service patterns)
3. Foundation: `kb_critical.md` (data flow)
4. Security: `kb_security.md` (data protection)

### 🔒 Security & Authentication

1. Primary: `kb_security.md`
2. Foundation: `kb_critical.md` (security principles)
3. Data: `kb_state_management.md` (secure data handling)
4. Architecture: `kb_angular_architecture.md` (security patterns)

### 🏗️ Architecture & Module Design

1. Essential: `kb_critical.md`
2. Implementation: `kb_angular_architecture.md`
3. State patterns: `kb_state_management.md`
4. UI patterns: `kb_ui_components.md`

### ⚡ Performance Optimization

1. Primary: `kb_performance.md`
2. Architecture: `kb_angular_architecture.md` (lazy loading)
3. Foundation: `kb_critical.md` (performance principles)
4. UI: `kb_ui_components.md` (component optimization)

### 🔧 Customization & Multi-Tenant

1. Core: `kb_customization.md`
2. UI: `kb_ui_components.md` (theming)
3. Architecture: `kb_angular_architecture.md` (module customization)
4. State: `kb_state_management.md` (tenant data isolation)

### 🚀 Production Deployment

1. Primary: `kb_deployment.md`
2. Performance: `kb_performance.md` (optimization)
3. Security: `kb_security.md` (production hardening)
4. Foundation: `kb_critical.md`

## Rule Statistics

- **Total Rules**: ~100 architectural guardrails
- **Critical Rules**: 16 (must follow)
- **Architecture Rules**: 30 (Angular patterns)
- **UI Rules**: 22 (component & design system)
- **Performance Rules**: 19 (optimization & PWA)
- **Security Rules**: 11 (web security & financial data)

## Web-Specific Development Contexts

### 🌐 Single Page Application (SPA)

- **Primary**: `kb_critical.md` (SPA architecture)
- **Performance**: `kb_performance.md` (lazy loading, code splitting)
- **Architecture**: `kb_angular_architecture.md` (routing, modules)

### 💰 Financial Web Interface

- **Security**: `kb_security.md` (financial data protection)
- **UI**: `kb_ui_components.md` (financial forms, validation)
- **State**: `kb_state_management.md` (data integrity)

### 🌍 Multi-Tenant Web Platform

- **Customization**: `kb_customization.md` (tenant-specific UI)
- **Architecture**: `kb_angular_architecture.md` (tenant isolation)
- **Security**: `kb_security.md` (tenant security boundaries)

### 📱 Responsive Financial Dashboard

- **UI**: `kb_ui_components.md` (responsive design)
- **Performance**: `kb_performance.md` (mobile optimization)
- **Accessibility**: `kb_ui_components.md` (WCAG compliance)

### 🔄 Real-Time Banking Operations

- **State**: `kb_state_management.md` (reactive data)
- **Performance**: `kb_performance.md` (real-time optimization)
- **Architecture**: `kb_angular_architecture.md` (service communication)

## Usage Instructions

1. **Before coding**: Read relevant KB files for your development context
2. **During development**: Use RULE format for validation checks
3. **Code reviews**: Reference specific rules in feedback
4. **Architecture decisions**: Consult kb_critical.md first
5. **UI development**: Start with kb_ui_components.md for design patterns

## Angular Development Workflow

```
Feature Request → kb_index.md → Relevant KB files → Implementation → Rule verification → Testing
```

### Development Phase Mapping

- **Planning**: `kb_critical.md` + `kb_angular_architecture.md`
- **Design**: `kb_ui_components.md` + `kb_customization.md`
- **Implementation**: Context-specific KB files
- **Testing**: All relevant KB files for validation
- **Review**: `kb_critical.md` for non-negotiables

## Browser Support & Compatibility

- **Target Browsers**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Mobile Support**: Responsive design for tablets and mobile devices
- **PWA Features**: Offline capabilities and app-like experience
- **Accessibility**: WCAG 2.1 AA compliance for financial accessibility

## AI Development Assistant Instructions

This KB integrates with AI development tools to ensure consistent Angular architecture compliance and financial web application best practices.

---

_Last Updated: December 2024_  
_Angular Version: 14.3+_  
_Architecture: Feature Module-based SPA with Angular Material_  
_Target Users: Financial Institution Staff and MFI Operations Teams_
