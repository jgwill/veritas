# TandT Application

A sophisticated decision-making and performance evaluation platform that supports two distinct analytical approaches: **Digital Decision Making** and **Digital Performance Review**.

## 🎯 Purpose

TandT helps individuals and organizations make better decisions and track performance through structured evaluation methodologies. The application provides visual interfaces for analyzing complex scenarios with multiple criteria.

## 🔄 Model Types

### Digital Decision Making Models
**Purpose**: Binary decision analysis for YES/NO scenarios requiring element hierarchy determination

**Core Algorithm**: Pairwise comparisons with dominance factor calculations

**Key Features**:
- Binary evaluation system (1=Acceptable, 0=Unacceptable)
- **Requires pairwise comparison matrix** for element hierarchy building
- Dominance factor calculations to identify mandatory vs optional elements
- Decision framework: "If you have Element X but don't have Element Y, would the decision be YES or NO?"
- **Output**: Clear YES/NO decision with supporting element hierarchy

**Technical Implementation**:
- Comparison matrix storage and validation
- Dominance calculation algorithms
- Consistency checking for transitivity
- Hierarchical element ranking

**Use Cases**:
- Housing selection decisions (mandatory vs nice-to-have features)
- Investment opportunities (essential vs desirable criteria)
- Hiring decisions (must-have vs preferred qualifications)
- Strategic planning (critical vs optional factors)

### Digital Performance Review Models  
**Purpose**: Performance tracking and trend analysis over time **without dominance calculations**

**Core Algorithm**: Performance trend tracking with priority identification

**Key Features**:
- Dual evaluation system:
  - Acceptability assessment (1=Acceptable, 0=Unacceptable)
  - Performance trend tracking (-1=Getting Worse, 0=Staying Same, 1=Getting Better)
- **NO pairwise comparisons or dominance calculations**
- Focus on identifying primary improvement areas
- **Output**: Performance dashboard with improvement priorities

**Technical Implementation**:
- Performance trend storage and analysis
- Priority calculation based on acceptability + trend
- Historical performance tracking
- Improvement recommendation algorithms

**Use Cases**:
- Employee performance reviews (competency tracking)
- Project health monitoring (milestone progress)
- System performance tracking (metric trends)
- Business unit assessments (KPI monitoring)

## 🎛️ Application Modes

### Editing Mode
Build and configure your evaluation models:
- Add/remove/edit elements
- Set up comparison matrices
- Configure model parameters
- Define evaluation criteria

### Analyzing Mode
Evaluate and assess your models:
- Visual card-based evaluation interface
- Real-time element assessment
- Performance trend tracking
- Results visualization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd tandt-application

# Install dependencies
npm install

# Run the development server
npm run dev
\`\`\`

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

## 📊 Data Structure

### Model Structure
\`\`\`typescript
interface DigitalModel {
  id: string
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: number // 1 = Decision Making, 2 = Performance Review
  twoOnly: boolean
  decided: boolean
  valid: boolean
  model: DigitalElement[]
}
\`\`\`

### Element Structure
\`\`\`typescript
interface DigitalElement {
  idug: string
  nameElement: string
  displayName: string
  description: string
  twoFlag: boolean // Acceptability evaluation
  threeFlag: number // Performance trend (-1, 0, 1)
  dominanceFactor: number
  comparationTableData: Record<string, number>
}
\`\`\`

## 🎨 User Interface

The application features a clean, modern interface with:
- **Dashboard**: Overview of all models with creation and management tools
- **Model Editor**: Tabbed interface for elements, comparisons, and results
- **Analyzing Grid**: Visual card-based evaluation interface
- **Results View**: Charts and analytics for decision insights

## 🔧 API Endpoints

- `GET /api/models` - List all models
- `POST /api/models` - Create new model
- `GET /api/models/[id]` - Get specific model
- `PUT /api/models/[id]` - Update model
- `DELETE /api/models/[id]` - Delete model
- `POST /api/models/[id]/elements/[elementId]/evaluate` - Evaluate element

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` directory
- Review sample models in the `samples/` directory

## 🔮 Future Enhancements

- Real-time collaboration features
- Advanced analytics and reporting
- Template system for common model types
- Integration APIs for external systems
- Mobile application
- Cloud deployment options
