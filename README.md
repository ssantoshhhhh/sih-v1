# ComplianceAI - Automated Legal Metrology Compliance Checker

*AI-powered automated compliance monitoring system for Legal Metrology enforcement across Indian e-commerce platforms*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/santoshstudentsrkr-6721s-projects/v0-automated-compliance-checker)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/LVIRjConj9C)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

## 🚀 Overview

ComplianceAI is a comprehensive, AI-powered automated compliance checker designed specifically for Legal Metrology enforcement across Indian e-commerce platforms. The system monitors product listings in real-time, detects violations against the Legal Metrology Rules 2011, and provides regulatory authorities with powerful tools for compliance monitoring and enforcement.

### Key Features

- **🤖 AI-Powered Detection**: Advanced machine learning algorithms for automated violation detection
- **⚡ Real-time Monitoring**: 24/7 surveillance of e-commerce platforms with instant alerts
- **📊 Comprehensive Dashboard**: Role-based access control with detailed analytics and reporting
- **🔒 Secure & Compliant**: Enterprise-grade security with full regulatory compliance
- **🌐 Multi-Platform Integration**: Seamless integration with major e-commerce platforms
- **📱 Responsive Design**: Modern, mobile-first interface with 3D scroll effects

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui component library
- **3D Graphics**: React Three Fiber for immersive landing page effects
- **Animations**: Framer Motion and custom CSS animations
- **State Management**: React hooks with SWR for data fetching

### Backend Stack
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with role-based access control
- **API**: Next.js API routes with RESTful endpoints
- **File Storage**: Supabase Storage for document management
- **Real-time**: Supabase Realtime for live updates

### AI/ML Components
- **Rule Engine**: Custom compliance validation engine
- **Data Processing**: Automated web scraping and data extraction
- **Violation Detection**: Pattern matching and anomaly detection
- **Report Generation**: Automated compliance reporting

## 📁 Project Structure

\`\`\`
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── categories/           # Category management
│   │   ├── compliance/           # Compliance scanning
│   │   ├── dashboard/            # Dashboard statistics
│   │   ├── platforms/            # Platform management
│   │   ├── products/             # Product management
│   │   ├── reports/              # Report generation
│   │   ├── scraping/             # Web scraping endpoints
│   │   ├── users/                # User management
│   │   └── violations/           # Violation management
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard
│   ├── globals.css               # Global styles with design tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── compliance/               # Compliance-specific components
│   ├── dashboard/                # Dashboard components
│   ├── landing/                  # Landing page components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication utilities
│   ├── compliance/               # Compliance rule engine
│   ├── data/                     # Data service layers
│   ├── supabase/                 # Supabase client configuration
│   └── types.ts                  # TypeScript type definitions
├── scripts/                      # Database scripts
│   ├── 001_create_tables.sql     # Initial database schema
│   ├── 002_seed_data.sql         # Sample data
│   └── 003_auth_triggers.sql     # Authentication triggers
└── middleware.ts                 # Next.js middleware for auth
\`\`\`

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication
- `users` - User profiles with role-based access
- `user_roles` - Role definitions (admin, officer, auditor)

#### Platform Management
- `platforms` - E-commerce platform configurations
- `categories` - Product category definitions with compliance rules

#### Product & Compliance
- `products` - Product listings with extracted data
- `violations` - Detected compliance violations
- `reports` - Generated compliance reports

#### Monitoring & Audit
- `scraping_sessions` - Web scraping activity logs
- `audit_logs` - System activity audit trail

### Key Features
- **Row Level Security (RLS)**: Comprehensive data protection
- **Real-time Subscriptions**: Live updates for dashboard
- **Automated Triggers**: User profile creation and audit logging
- **Indexing**: Optimized queries for large datasets

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Git for version control

### Local Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-org/automated-compliance-checker.git
   cd automated-compliance-checker
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Environment Configuration**
   
   The following environment variables are automatically configured when using v0.app with Supabase integration:
   
   \`\`\`env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   
   # Database Configuration (Auto-configured)
   POSTGRES_URL=your_postgres_connection_string
   POSTGRES_PRISMA_URL=your_postgres_prisma_url
   POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DATABASE=your_postgres_database
   POSTGRES_HOST=your_postgres_host
   \`\`\`

4. **Database Setup**
   
   Run the database scripts in order:
   \`\`\`bash
   # Execute in Supabase SQL Editor or via API
   # 1. Create tables and schema
   scripts/001_create_tables.sql
   
   # 2. Insert sample data
   scripts/002_seed_data.sql
   
   # 3. Setup authentication triggers
   scripts/003_auth_triggers.sql
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project from GitHub to Vercel
   - Configure environment variables in Vercel dashboard

2. **Automatic Deployments**
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests

3. **Custom Domain**
   - Configure custom domain in Vercel settings
   - SSL certificates automatically managed

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   npm start
   \`\`\`

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full system access, user management, platform configuration
- **Officer**: Compliance monitoring, violation management, report generation
- **Auditor**: Read-only access to reports and compliance data

### Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Role-based Permissions**: Granular access control
- **Audit Logging**: Complete activity tracking
- **Session Management**: Secure session handling

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### Product Management
- `GET /api/products` - List products with filtering
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Compliance Monitoring
- `POST /api/compliance/scan` - Trigger compliance scan
- `GET /api/violations` - List violations
- `PUT /api/violations/[id]/resolve` - Resolve violation
- `POST /api/violations/[id]/assign` - Assign violation

### Platform Management
- `GET /api/platforms` - List platforms
- `POST /api/platforms` - Add new platform
- `POST /api/platforms/[id]/test` - Test platform connection

### Reporting
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/dashboard/stats` - Dashboard statistics

## 🧪 Testing

### Running Tests
\`\`\`bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
\`\`\`

### Test Coverage
- Unit tests for utility functions and components
- Integration tests for API endpoints
- E2E tests for critical user flows

## 🔍 Compliance Rules Engine

### Legal Metrology Rules 2011 Implementation

#### Weight & Measurement Declaration
- Mandatory weight/quantity declaration
- Proper unit specification (kg, g, ml, l)
- Accurate measurement validation

#### Price Display Requirements
- MRP (Maximum Retail Price) declaration
- Unit price calculation
- Discount and offer validation

#### Manufacturer Information
- Complete manufacturer details
- Import/export compliance for international products
- Country of origin declaration

#### Category-Specific Rules
- **Food Products**: Nutritional information, expiry dates, FSSAI compliance
- **Textiles**: Fabric composition, care instructions, size standards
- **Electronics**: Technical specifications, warranty information, BIS standards
- **Cosmetics**: Ingredient listing, shelf life, regulatory approvals

### Violation Detection Algorithm

1. **Data Extraction**: OCR and text parsing from product images and descriptions
2. **Rule Matching**: Pattern matching against compliance rules database
3. **Anomaly Detection**: Statistical analysis for unusual patterns
4. **Severity Assessment**: Risk-based violation categorization
5. **Alert Generation**: Real-time notifications for critical violations

## 📈 Performance & Scalability

### Optimization Features
- **Database Indexing**: Optimized queries for large datasets
- **Caching Strategy**: Redis caching for frequently accessed data
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Dynamic imports for better performance
- **CDN Integration**: Global content delivery

### Monitoring & Analytics
- **Real-time Metrics**: System performance monitoring
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns and behavior analysis
- **Compliance Metrics**: Violation trends and platform statistics

## 🛠️ Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates

### Component Architecture
- **Atomic Design**: Reusable component hierarchy
- **Custom Hooks**: Shared logic extraction
- **Context Providers**: State management patterns
- **Error Boundaries**: Graceful error handling

### Database Best Practices
- **Migrations**: Version-controlled schema changes
- **Seed Data**: Consistent development environment
- **Backup Strategy**: Regular automated backups
- **Performance Monitoring**: Query optimization

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Review Process
- All changes require peer review
- Automated testing must pass
- Documentation updates required
- Security review for sensitive changes

## 📞 Support & Contact

### Technical Support
- **Email**: support@complianceai.gov.in
- **Phone**: +91 11 2345 6789
- **Documentation**: [docs.complianceai.gov.in](https://docs.complianceai.gov.in)

### Government Relations
- **Ministry Contact**: Department of Consumer Affairs
- **Regulatory Body**: Legal Metrology Division
- **Policy Updates**: [consumeraffairs.nic.in](https://consumeraffairs.nic.in)

## 📄 License

This project is developed as a Government of India initiative for Legal Metrology enforcement. All rights reserved.

### Usage Rights
- Government agencies: Full access and modification rights
- Educational institutions: Research and academic use permitted
- Commercial entities: Contact for licensing agreements

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial release with core compliance monitoring features
- AI-powered violation detection system
- Role-based dashboard with real-time analytics
- Multi-platform integration capabilities
- Comprehensive reporting and audit trails

### Upcoming Features
- **v1.1.0**: Enhanced AI models with improved accuracy
- **v1.2.0**: Mobile application for field officers
- **v1.3.0**: Advanced analytics and predictive modeling
- **v2.0.0**: Multi-language support and regional customization

## 🙏 Acknowledgments

### Development Team
- **Project Lead**: Government of India - Department of Consumer Affairs
- **Technical Architecture**: v0.app AI-assisted development
- **UI/UX Design**: Modern government application standards
- **Compliance Expertise**: Legal Metrology Division consultants

### Technology Partners
- **Vercel**: Deployment and hosting platform
- **Supabase**: Database and authentication services
- **Next.js**: React framework for production applications
- **Tailwind CSS**: Utility-first CSS framework

---

**Built with ❤️ for Legal Metrology enforcement in India**

*This project represents the future of regulatory compliance monitoring, combining cutting-edge AI technology with government oversight to ensure fair trade practices across Indian e-commerce platforms.*
