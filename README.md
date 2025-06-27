# TandT Application

A sophisticated decision-making and performance evaluation platform that supports two distinct analytical approaches: **Digital Decision Making** and **Digital Performance Review**.

## 🎯 Purpose

TandT helps individuals and organizations make better decisions and track performance through structured evaluation methodologies. The application provides visual interfaces for analyzing complex scenarios with multiple criteria.

## 🔄 Model Types

### Digital Decision Making
**Purpose**: Binary decision analysis for scenarios requiring YES/NO outcomes

**Key Features**:
- Binary evaluation system (Acceptable/Unacceptable)
- Element hierarchy through pairwise comparisons
- Decision framework: "If you have Element X but don't have Element Y, would the decision be YES or NO?"
- Identifies mandatory vs optional elements

**Use Cases**:
- Housing selection decisions
- Investment opportunities
- Hiring decisions
- Product feature prioritization

### Digital Performance Review
**Purpose**: Performance tracking and trend analysis over time

**Key Features**:
- Dual evaluation system:
  - Acceptability assessment (Acceptable/Unacceptable)
  - Performance trend tracking (Getting Better/Staying Same/Getting Worse)
- Historical performance data
- Trend visualization and analysis

**Use Cases**:
- Employee performance reviews
- Project health monitoring
- System performance tracking
- Continuous improvement initiatives

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
