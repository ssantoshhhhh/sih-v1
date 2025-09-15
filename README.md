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
   
   <!-- Updated environment variable section with current working values and setup instructions -->
   
   ### Option 1: Using v0.app (Recommended)
   
   When using v0.app with Supabase integration, environment variables are automatically configured. The system currently uses:
   
   \`\`\`env
   # Supabase Configuration (Auto-configured in v0.app)
   SUPABASE_URL=https://nxmxetspnryhtjaqxgda.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bXhldHNwbnJ5aHRqYXF4Z2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc3NTcsImV4cCI6MjA3MzQ0Mzc1N30.v6U37um3iqHbFJXoBcBaawTXfq0S3seXrUZ92Me4Y3k
   NEXT_PUBLIC_SUPABASE_URL=https://nxmxetspnryhtjaqxgda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bXhldHNwbnJ5aHRqYXF4Z2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc3NTcsImV4cCI6MjA3MzQ0Mzc1N30.v6U37um3iqHbFJXoBcBaawTXfq0S3seXrUZ92Me4Y3k
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`
   
   ### Option 2: Manual Setup with Your Own Supabase Project
   
   If you want to use your own Supabase project, follow these steps:
   
   1. **Create a Supabase Project**
      - Go to [supabase.com](https://supabase.com)
      - Click "New Project"
      - Choose your organization and create the project
   
   2. **Get Your Project Credentials**
      - Navigate to Project Settings → API
      - Copy your Project URL and anon/public key
      - Copy your service role key (keep this secret!)
   
   3. **Create Environment Variables**
      
      Create a `.env.local` file in your project root:
      
      \`\`\`env
      # Replace with your actual Supabase project values
      SUPABASE_URL=https://your-project-ref.supabase.co
      SUPABASE_ANON_KEY=your-anon-key-here
      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
      SUPABASE_JWT_SECRET=your-jwt-secret-here
      
      # Public environment variables (same values as above)
      NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
      NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
      
      # Database URLs (auto-generated by Supabase)
      POSTGRES_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
      POSTGRES_PRISMA_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
      POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
      POSTGRES_USER=postgres
      POSTGRES_PASSWORD=your-database-password
      POSTGRES_DATABASE=postgres
      POSTGRES_HOST=db.[project-ref].supabase.co
      \`\`\`
   
   ### Where to Find Your Supabase Credentials
   
   1. **Project URL & API Keys**:
      - Go to your Supabase dashboard
      - Select your project
      - Navigate to Settings → API
      - Copy the "Project URL" and "anon public" key
   
   2. **Database Connection Details**:
      - Go to Settings → Database
      - Find the "Connection string" section
      - Use the URI format for POSTGRES_URL
   
   3. **JWT Secret**:
      - Go to Settings → API
      - Copy the "JWT Secret" (used for token verification)

4. **Database Setup**
   
   <!-- Updated database setup instructions with current working scripts -->
   
   The project includes SQL scripts that create the necessary database schema:
   
   \`\`\`bash
   # Execute these scripts in order via Supabase SQL Editor:
   # 1. Create tables and schema
   scripts/001_create_tables.sql
   
   # 2. Insert sample data
   scripts/002_seed_data.sql
   
   # 3. Setup authentication triggers
   scripts/003_auth_triggers.sql
   \`\`\`
   
   **To run the scripts:**
   1. Open your Supabase dashboard
   2. Go to the SQL Editor
   3. Copy and paste each script content
   4. Execute them in the numbered order

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
   
   <!-- Updated environment variable section with current working values and setup instructions -->
   
   ### Option 1: Using v0.app (Recommended)
   
   When using v0.app with Supabase integration, environment variables are automatically configured. The system currently uses:
   
   \`\`\`env
   # Supabase Configuration (Auto-configured in v0.app)
   SUPABASE_URL=https://nxmxetspnryhtjaqxgda.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bXhldHNwbnJ5aHRqYXF4Z2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc3NTcsImV4cCI6MjA3MzQ0Mzc1N30.v6U37um3iqHbFJXoBcBaawTXfq0S3seXrUZ92Me4Y3k
   NEXT_PUBLIC_SUPABASE_URL=https://nxmxetspnryhtjaqxgda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bXhldHNwbnJ5aHRqYXF4Z2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc3NTcsImV4cCI6MjA3MzQ0Mzc1N30.v6U37um3iqHbFJXoBcBaawTXfq0S3seXrUZ92Me4Y3k
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`
   
   ### Option 2: Manual Setup with Your Own Supabase Project
   
   If you want to use your own Supabase project, follow these steps:
   
   1. **Create a Supabase Project**
      - Go to [supabase.com](https://supabase.com)
      - Click "New Project"
      - Choose your organization and create the project
   
   2. **Get Your Project Credentials**
      - Navigate to Project Settings → API
      - Copy your Project URL and anon/public key
      - Copy your service role key (keep this secret!)
   
   3. **Create Environment Variables**
      
      Create a `.env.local` file in your project root:
      
      \`\`\`env
      # Replace with your actual Supabase project values
      SUPABASE_URL=https://your-project-ref.supabase.co
      SUPABASE_ANON_KEY=your-anon-key-here
      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
      SUPABASE_JWT_SECRET=your-jwt-secret-here
      
      # Public environment variables (same values as above)
      NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
      NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
      
      # Database URLs (auto-generated by Supabase)
      POSTGRES_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
      POSTGRES_PRISMA_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
      POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
      POSTGRES_USER=postgres
      POSTGRES_PASSWORD=your-database-password
      POSTGRES_DATABASE=postgres
      POSTGRES_HOST=db.[project-ref].supabase.co
      \`\`\`
   
   ### Where to Find Your Supabase Credentials
   
   1. **Project URL & API Keys**:
      - Go to your Supabase dashboard
      - Select your project
      - Navigate to Settings → API
      - Copy the "Project URL" and "anon public" key
   
   2. **Database Connection Details**:
      - Go to Settings → Database
      - Find the "Connection string" section
      - Use the URI format for POSTGRES_URL
   
   3. **JWT Secret**:
      - Go to Settings → API
      - Copy the "JWT Secret" (used for token verification)

4. **Database Setup**
   
   <!-- Updated database setup instructions with current working scripts -->
   
   The project includes SQL scripts that create the necessary database schema:
   
   \`\`\`bash
   # Execute these scripts in order via Supabase SQL Editor:
   # 1. Create tables and schema
   scripts/001_create_tables.sql
   
   # 2. Insert sample data
   scripts/002_seed_data.sql
   
   # 3. Setup authentication triggers
   scripts/003_auth_triggers.sql
   \`\`\`
   
   **To run the scripts:**
   1. Open your Supabase dashboard
   2. Go to the SQL Editor
   3. Copy and paste each script content
   4. Execute them in the numbered order

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔄 Recent Updates & Changes

### Latest Fixes (Current Version)

<!-- Added section documenting recent fixes and improvements -->

#### Authentication & Middleware Improvements
- **Fixed Supabase Client Creation**: Resolved environment variable access issues in middleware
- **Enhanced Error Handling**: Added comprehensive error handling for Supabase client initialization
- **Debug Logging**: Implemented detailed logging for troubleshooting authentication issues
- **Middleware Optimization**: Improved middleware performance with proper error boundaries

#### Environment Variable Management
- **Automatic Configuration**: Environment variables are now automatically configured in v0.app
- **Validation**: Added runtime validation for required Supabase credentials
- **Fallback Handling**: Graceful degradation when Supabase is not properly configured
- **Development Support**: Enhanced local development setup with clear instructions

#### Database & Security
- **Row Level Security**: Comprehensive RLS policies implemented across all tables
- **Authentication Triggers**: Automatic user profile creation on signup
- **Audit Logging**: Complete activity tracking for compliance monitoring
- **Connection Pooling**: Optimized database connections for better performance

### Known Issues & Solutions

#### Issue: "Your project's URL and Key are required to create a Supabase client!"
**Solution**: This error occurs when environment variables are not properly configured. 

1. **In v0.app**: Environment variables are automatically configured when you add the Supabase integration
2. **Local Development**: Ensure your `.env.local` file contains all required variables
3. **Vercel Deployment**: Add environment variables in your Vercel project settings

#### Issue: Authentication redirects not working
**Solution**: Ensure `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set correctly:
- Development: `http://localhost:3000`
- Production: Your actual domain URL

## 🛠️ Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check that variable names match exactly (case-sensitive)
   - Restart your development server after adding new variables
   - Verify `.env.local` is in the project root directory

2. **Database Connection Issues**
   - Verify your Supabase project is active and not paused
   - Check that database passwords don't contain special characters that need URL encoding
   - Ensure your IP address is allowed in Supabase network restrictions

3. **Authentication Problems**
   - Confirm email confirmation is disabled for development (Supabase Auth settings)
   - Check that redirect URLs are properly configured in Supabase Auth settings
   - Verify JWT secret matches between your environment and Supabase project

4. **Build/Deployment Errors**
   - Ensure all environment variables are set in your deployment platform
   - Check that TypeScript types are properly defined
   - Verify all dependencies are correctly installed

### Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Review the Supabase dashboard logs
3. Verify all environment variables are correctly set
4. Consult the [Supabase documentation](https://supabase.com/docs) for specific integration issues

---

**Built with ❤️ for Legal Metrology enforcement in India**

*This project represents the future of regulatory compliance monitoring, combining cutting-edge AI technology with government oversight to ensure fair trade practices across Indian e-commerce platforms.*
