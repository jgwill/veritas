# TandT - Digital Thinking Guidance Application

A sophisticated decision-making and performance evaluation platform that supports two distinct analytical approaches: **Digital Decision Making** and **Digital Performance Review**.

## 🎯 Core Concepts & Model Types

The application's logic fundamentally changes based on the type of model you are working with.

### 1. Digital Decision Making Model (Type 1)

This model type is designed to help you make a clear **"YES" or "NO"** decision.

- **Purpose**: To make a definitive choice by first establishing what's most important to you (e.g., "Should we hire this candidate?", "Is this the right apartment for me?").
- **Modeling Mode**: The core of this mode is **building a dominance hierarchy**. For a chosen element, you are asked a series of questions: "If you have [this element] but you don't have [another element], would you still decide YES?". Your "YES" or "NO" answers systematically determine which elements are more critical than others. This process calculates a **Dominance Factor** for each element, giving you a clear, ranked list of your priorities.
- **Analyzing Mode**: You evaluate a real-world scenario (e.g., a specific apartment listing) against your model using simple **Acceptable (👍) / Unacceptable (👎)** flags. The final decision is heavily influenced by the dominance hierarchy you built.
- **Structuring/Dashboard View**: This view shows the results of your modeling phase—a **Dominance Chart** and a ranked list of factors, visually representing your established hierarchy of importance.

### 2. Digital Performance Review Model (Type 2)

This model type is designed to evaluate the current state of a system, project, or process and to identify what needs attention. It **does not use comparison or dominance**.

- **Purpose**: To get a clear, prioritized list of what to work on (e.g., "How is our company performing this quarter?").
- **Modeling Mode**: This mode is simple: you only **define the elements** that need to be reviewed. There is no comparison.
- **Analyzing Mode**: You evaluate the current performance of each element using a two-tiered system:
  1. **State**: Is the current state **Acceptable (👍)** or **Unacceptable (👎)**?
  2. **Trend**: Is performance **Getting Better (📈)**, **Staying the Same (➖)**, or **Getting Worse (📉)**?
- **Structuring/Dashboard View**: This view presents a **Performance Dashboard**. It's an automatically prioritized action list, highlighting elements that are "Unacceptable" or "Getting Worse" so you know exactly where to focus your efforts.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tandt-application

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Sample Data
The application includes sample models in the `samples/` directory:
- `ModelDigitalPerformanceReview__*.json` - Performance Review model example
- `habitav1b24042419__*.json` - Decision Making model example (housing selection)

## 🏗️ Technical Stack

- **Framework**: Next.js 14+ with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system
- **Data Storage**: JSON files (development), Database ready (production)

## 🎛️ Application Modes

### Editing Mode
Build and configure your evaluation models:
- Add/remove/edit elements
- Set up comparison matrices (Decision Making models only)
- Configure model parameters
- Define evaluation criteria

### Analyzing Mode
Evaluate and assess your models:
- Visual card-based evaluation interface
- Real-time element assessment
- Performance trend tracking (Performance Review models)
- Results visualization

### Results Mode
View analysis results and insights:
- Decision recommendations (Decision Making models)
- Performance dashboards (Performance Review models)
- Prioritized action lists
- Visual charts and analytics

## 📊 Current Status

This is a **stable, forkable version** ready for experimentation and development:

- ✅ **Build Status**: Successfully compiles with `npm run build`
- ✅ **Development Server**: Running successfully
- ✅ **Core Features**: Model creation, element management, analysis workflows
- ✅ **UI/UX**: Modern, responsive design with card-based layouts
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Component Architecture**: Clean, maintainable structure

## 🔧 API Endpoints

- `GET /api/models` - List all models
- `POST /api/models` - Create new model
- `GET /api/models/[id]` - Get specific model
- `PUT /api/models/[id]` - Update model
- `DELETE /api/models/[id]` - Delete model
- `POST /api/models/[id]/elements/[elementId]/evaluate` - Evaluate element

## 🚧 Development Notes

### Recent Migration
This version represents a successful migration from a prototype with enhanced:
- Superior visual components and layouts
- Improved user experience patterns
- Modern UI component integration
- Stable build and development environment

### For Forking/Experimentation
This codebase is ready for:
- Feature experimentation
- UI/UX improvements
- Algorithm enhancements
- Integration testing
- Performance optimization

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the `book/_/ledgers/` directory for development history
- Review sample models in `samples/` directory
- Create issues for bugs or feature requests

## 🎨 User Interface

The application features a clean, modern interface with:
- **Dashboard**: Overview of all models with creation and management tools
- **Model Editor**: Tabbed interface for elements, comparisons, and results
- **Analyzing Grid**: Visual card-based evaluation interface
- **Results View**: Charts and analytics for decision insights

## 🔮 Future Enhancements

- Real-time collaboration features
- Advanced analytics and reporting
- Template system for common model types
- Integration APIs for external systems
- Mobile application
- Cloud deployment options
