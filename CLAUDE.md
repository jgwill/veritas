# TandT Digital Thinking Guidance - Claude Code Documentation

## Overview
TandT (Think and Think) Digital Thinking Guidance is a React/TypeScript application for creating and analyzing decision-making and performance review models using AI assistance. This application successfully migrated from Google AI Studio prototype to production-ready Vercel deployment.

## Build Commands

### Essential Commands
\`\`\`bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview build
npm run preview
\`\`\`

### Deployment-Ready Build Process
✅ **Build Status**: Successfully building and deployment-ready
- Build time: ~28 seconds
- Output: Clean dist/ folder with optimized assets
- No TypeScript errors
- All dependencies resolved correctly

## Architecture & Technology Stack

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand store with localStorage persistence
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: Google Gemini API for model generation and analysis
- **Build Tool**: Vite (no custom config needed)

### Key Architecture Patterns
- **Component-based**: Modular UI components with proper TypeScript interfaces
- **Service Layer**: Separated business logic in `services/` directory
- **Type Safety**: Complete TypeScript coverage with proper type definitions
- **Persistent State**: LocalStorage-based model management
- **AI Fallbacks**: Mock data when API unavailable

## Configuration Files

### Critical Configuration
- **No vite.config.ts needed**: Builds successfully with Vite defaults
- **tailwind.config.js**: Standard shadcn/ui configuration
- **tsconfig.json**: Strict TypeScript settings
- **vercel.json**: SPA routing configuration for deployment

### Environment Variables
\`\`\`bash
# Required for AI features (optional - app works without)
GEMINI_API_KEY=your_api_key_here
GOOGLE_API_KEY=your_api_key_here  # Alternative
VITE_GEMINI_API_KEY=your_api_key_here  # Client-side alternative
\`\`\`

## Directory Structure

\`\`\`
/
├── components/           # React components
│   ├── ui/              # shadcn/ui components  
│   ├── AnalyzingView.tsx
│   ├── ModelingView.tsx
│   └── StructuringView.tsx
├── services/            # Business logic
│   ├── modelService.ts  # Model CRUD operations
│   └── geminiService.ts # AI integration
├── types.ts            # TypeScript definitions
├── store.ts            # Zustand global state
├── constants.ts        # Default data
└── app/                # Next.js compatibility layer
    └── globals.css     # Global styles
\`\`\`

## Key Components & Features

### Model Management
- **Create Models**: Manual or AI-generated from descriptions
- **Model Types**: Decision Making (type 1) vs Performance Review (type 2)
- **Persistence**: Automatic localStorage with history tracking
- **Import/Export**: JSON-based model sharing

### AI Features (Gemini Integration)
- **Model Generation**: Create complete models from natural language descriptions
- **Element Suggestions**: AI-powered element recommendations by topic
- **Analysis Summaries**: Contextual insights based on model type
- **Action Suggestions**: Practical recommendations for model improvement
- **Chat Assistant**: Conversational analysis interface

### Analysis Modes
- **Modeling**: Create and edit model structure
- **Analyzing**: Evaluate elements (Two-flag analysis for decisions)
- **Structuring**: Performance dashboard and action planning

## Migration Lessons Learned

### V0 Agent Issues Encountered
1. **Type System Conflicts**: V0 agent created incompatible type definitions
2. **Path Resolution Problems**: Complex vite.config.ts caused build failures  
3. **CSS Configuration**: shadcn import issues in tailwind.config.js
4. **Dependency Mismatches**: Service interfaces not matching component expectations

### Successful Resolution Strategy
1. **Simplified Configuration**: Removed complex vite.config.ts 
2. **Fixed Type Compatibility**: Aligned service returns with component expectations
3. **Standard Tailwind Config**: Used proven shadcn/ui configuration pattern
4. **Service Layer Redesign**: Created type-safe service interfaces

### Critical Build Fixes Applied
- Removed problematic vite.config.ts (builds fine with defaults)
- Fixed tailwind.config.js shadcn import issues
- Aligned geminiService return types with store expectations
- Added proper TypeScript declarations for CSS imports
- Converted DigitalElement arrays to expected interface formats

## Development Guidelines

### Adding New Features
1. **Follow Type System**: Use existing `DigitalModel` and `DigitalElement` interfaces
2. **Service Pattern**: Add business logic to appropriate service files
3. **State Management**: Use Zustand store for global state
4. **AI Integration**: Follow existing patterns in `geminiService.ts`

### Testing Build Health
\`\`\`bash
# Quick health check
npm run build
# Should complete in ~30 seconds with no errors
\`\`\`

### Common Pitfalls to Avoid
- ❌ Don't add complex vite.config.ts (causes path resolution issues)
- ❌ Don't modify core type interfaces without checking all dependencies  
- ❌ Don't import from non-existent shadcn paths in tailwind config
- ✅ Use service layer for business logic
- ✅ Maintain type compatibility between services and components
- ✅ Test build process after significant changes

## Deployment Status
✅ **Production Ready**: Successfully building for Vercel deployment
- Build output optimized and compressed
- All assets properly bundled
- No blocking errors or type issues
- Vercel SPA routing configured

## Performance Notes
- Bundle size: ~639KB (within acceptable range)
- CSS size: ~88KB optimized
- Build warnings (non-blocking):
  - Large chunk size (can be optimized with code splitting)
  - Tailwind content pattern (performance suggestion)
  - "use client" directives ignored (expected in Vite)

## Migration Documentation Reference
See `MIGRATION_PROCEDURE.md` for detailed step-by-step migration process from Google AI Studio to Vercel deployment, including v0 agent issue resolution strategies.
