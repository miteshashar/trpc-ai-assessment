# TRPC AI Assessment

An AI-powered candidate evaluation system that analyzes a CV against a job descriptions using Google Cloud Vertex AI.
The application provides a tRPC server and command-line interfaces for evaluating candidates.

## Features

- **AI-Powered Evaluation**: Uses Google Cloud Vertex AI to analyze candidate qualifications
- **PDF Processing**: Automatically extracts text from PDF files of job description and CV
- **Skill Rating**: Provides skill ratings with a reasoning
- **Multiple Interfaces**: Choose between regular CLI, interactive CLI, or API server
- **TypeScript**: Fully typed codebase with strict type checking
- **tRPC Integration**: Type-safe API communication between client and server

## Prerequisites

- Node.js (v22 or higher)
- Yarn package manager
- Proxy server credentials to access the Vertex AI API

## Setup

### 1. Clone and Install Dependencies

```bash
git clone git@github.com:miteshashar/trpc-ai-assessment.git
cd trpc-ai-assessment
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
AI_API_URL=your-ai-server-endpoint
AI_API_TOKEN=your-api-token
```

### 3. Google Cloud Setup

Ensure you have:
- A Google Cloud project with Vertex AI API enabled
- Proper authentication configured (service account key or gcloud auth) on your proxy server
- The necessary permissions to access Vertex AI

## Development

### Start the Development Server

```bash
yarn dev:server
```

The server will start on the default port with hot reloading enabled.

### Type Checking

```bash
yarn typecheck
```

## Usage

### Option 1: Regular CLI (Command Line Arguments)

Direct command-line usage with JSON output:

```bash
# Development
yarn cli path/to/job-description.pdf path/to/cv.pdf

# Production (after building)
node dist/cli/regular.js path/to/job-description.pdf path/to/cv.pdf
```

### Option 2: Interactive CLI

User-friendly interactive interface:

```bash
# Development
yarn cli:interactive

# Production (after building)
node dist/cli/interactive.js
```

The interactive CLI provides:
- File selection interface
- Real-time evaluation progress
- Formatted results display
- Error handling with user-friendly messages

### Option 3: API Server

Start the tRPC server and make API calls:

```bash
# Start server
yarn dev:server

# Make API calls to the tRPC endpoints
# (Use your preferred HTTP client or tRPC client)
```

## Building for Production

### Build the Application

```bash
yarn build
```

This command:
1. Removes any existing `dist` directory
2. Compiles TypeScript to JavaScript
3. Copies prompt template files to the correct locations
4. Creates a production-ready `dist` folder

### Run Production Build

```bash
# Run the server
cd dist && node server/index.js

# Run the CLI tools
node dist/cli/regular.js job-description.pdf cv.pdf
node dist/cli/interactive.js
```

## Output Format

The evaluation provides detailed analysis including:

- **Candidate Information**: Name and years of experience
- **Job Details**: Company name and position title
- **Strengths**: Key candidate strengths
- **Weaknesses**: Key candidate weaknesses
- **Skill Ratings**: Detailed skill assessments (1-10 scale) with reasoning

## Caching & Consistency

The system implements a caching mechanism to ensure consistent skillsets for evaluation of a job description and improve performance when evaluating multiple candidates against the same job description:

#### How It Works

1. **Content-Based Hashing**: Each job description is converted to markdown and hashed using SHA-256
2. **Cache Storage**: AI output of job description evaluations are stored in `.ai_cache/` directory with hash-based filenames
3. **Automatic Reuse**: When the same job description is processed again, cached results are retrieved instead of making new AI API calls

#### Benefits

- **Consistency**: Identical job descriptions always produce identical skill requirements and company information
- **Performance**: Eliminates redundant AI API calls for job description analysis
- **Cost Efficiency**: Reduces API usage costs when evaluating multiple candidates for the same role

#### Use Cases

- **Batch Processing**: Evaluate multiple CVs against the same job posting
- **Consistent Hiring**: Ensure all candidates are evaluated against identical job requirements


## Scripts Reference

| Script | Description |
|--------|-------------|
| `yarn dev:server` | Start development server with hot reload |
| `yarn cli` | Run regular CLI in development mode |
| `yarn cli:interactive` | Run interactive CLI in development mode |
| `yarn build` | Build for production |
| `yarn typecheck` | Run TypeScript type checking |

## Error Handling

The application includes comprehensive error handling for:
- Invalid PDF files
- Missing environment variables
- API communication failures
- Invalid command-line arguments
- File system errors
