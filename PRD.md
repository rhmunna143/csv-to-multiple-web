# Product Requirements Document (PRD)
# CSV to Multi-Website Generator

## 1. Executive Summary

### Project Overview
A Node.js-based build tool that reads data from a CSV file and generates multiple standalone React websites, one for each row in the CSV. Each generated website will be a fully functional React application with personalized content based on the CSV data.

### Key Objective
Create an automated build system that transforms CSV data into multiple independent React websites with dynamic content replacement and randomized text variations.

## 2. Technical Stack

### Required Technologies
- **Frontend Framework**: React.js (18.x)
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **State Management**: Zustand
- **Build Tools**: Node.js, npm/yarn
- **CSV Processing**: papaparse or csv-parser
- **File System**: fs-extra for file operations
- **Template Engine**: Custom string replacement engine
- **Build System**: Webpack/Vite for React app bundling

### Additional Libraries
- **cross-spawn**: For executing npm commands programmatically
- **chalk**: For colored console output
- **commander**: For CLI interface
- **dotenv**: For environment configuration

## 3. System Architecture

### Directory Structure
```
project-root/
├── src/
│   ├── template/           # React template application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Hero.jsx
│   │   │   │   └── Contact.jsx
│   │   │   ├── App.jsx
│   │   │   ├── index.js
│   │   │   └── styles.css
│   │   ├── public/
│   │   │   └── index.html
│   │   └── package.json
│   ├── generator/          # Build script logic
│   │   ├── index.js
│   │   ├── csvParser.js
│   │   ├── templateProcessor.js
│   │   └── websiteBuilder.js
|   |--- stores/
│   └── data/
│       └── websites.csv
├── build/                  # Output directory
│   ├── foodexpress.com/
│   ├── techhubbd.com/
│   └── bookbazaar.com/
├── package.json
├── .env
└── README.md
```

## 4. Core Features

### 4.1 CSV Data Structure
```csv
domain,title,description,phone,address
foodexpress.com,Food Express,Delicious meals delivered fast,01712345678,"House 12, Road 5, Banani, Dhaka"
techhubbd.com,Tech Hub BD,Your trusted tech partner,01898765432,"Level 4, Block B, Dhanmondi, Dhaka"
bookbazaar.com,Book Bazaar,Buy and sell books online,01911223344,"Shop 22, New Market, Chittagong"
```

### 4.2 Template Replacement System

#### Dynamic Variables
- `{{ domain }}` - Website domain
- `{{ title }}` - Website title
- `{{ description }}` - Website description
- `{{ phone }}` - Contact phone number
- `{{ address }}` - Physical address

#### Randomized Text Selection
- Syntax: `[[ option1 | option2 | option3 ]]`
- Example: `[[ Quick | Fast | Speedy ]]` randomly selects one word

### 4.3 React Template Components

#### Hero Component Template
```jsx
// src/template/src/components/Hero.jsx
import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center">
          [[ Quick | Fast | Speedy ]] delivery service in dhaka.
        </h1>
        <p className="text-xl text-center mt-4">{{ description }}</p>
      </div>
    </section>
  );
};

export default Hero;
```

#### Contact Component Template
```jsx
// src/template/src/components/Contact.jsx
import React from 'react';

const Contact = () => {
  return (
    <section className="contact-section">
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
        <div className="space-y-4">
          <p className="text-lg">
            <strong>Phone:</strong> {{ phone }}
          </p>
          <p className="text-lg">
            <strong>Address:</strong> {{ address }}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
```

## 5. Build Process Workflow

### 5.1 Main Build Script (`npm start`)

1. **Parse CSV File**
   - Read `websites.csv`
   - Convert to JavaScript objects array
   - Validate required fields

2. **Clean Build Directory**
   - Remove existing build folder
   - Create fresh build directory

3. **For Each CSV Row:**
   - Copy template React app to `build/{domain}/`
   - Process all files for template replacements
   - Replace `{{ variable }}` placeholders with CSV data
   - Randomly select from `[[ option | option ]]` syntax
   - Update package.json with unique app name
   - Install dependencies
   - Build production version

4. **Post-Processing**
   - Generate summary report
   - Log success/failure for each website
   - Create index.html with links to all generated sites

### 5.2 Template Processing Algorithm

```javascript
// Pseudo-code for template processing
function processTemplate(template, data) {
  // Replace dynamic variables
  template = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return data[key] || match;
  });
  
  // Process random selections
  template = template.replace(/\[\[(.*?)\]\]/g, (match, options) => {
    const choices = options.split('|').map(s => s.trim());
    return choices[Math.floor(Math.random() * choices.length)];
  });
  
  return template;
}
```

## 6. Implementation Steps

### Step 1: Setup Project Structure
```bash
mkdir csv-website-generator
cd csv-website-generator
npm init -y
npm install react react-dom tailwindcss react-hook-form
npm install -D @babel/core webpack webpack-cli papaparse fs-extra chalk commander
```

### Step 2: Create React Template
- Build a minimal React app with Hero and Contact components
- Configure Tailwind CSS
- Set up placeholder syntax in components

### Step 3: Implement CSV Parser
```javascript
// src/generator/csvParser.js
const fs = require('fs');
const papa = require('papaparse');

async function parseCSV(filepath) {
  const csvFile = fs.readFileSync(filepath, 'utf8');
  const { data, errors } = papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true
  });
  
  if (errors.length > 0) {
    throw new Error(`CSV parsing errors: ${errors}`);
  }
  
  return data;
}

module.exports = { parseCSV };
```

### Step 4: Implement Template Processor
```javascript
// src/generator/templateProcessor.js
const fs = require('fs-extra');
const path = require('path');

async function processFile(filePath, data) {
  let content = await fs.readFile(filePath, 'utf8');
  
  // Replace variables
  content = content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return data[key] || match;
  });
  
  // Process random selections
  content = content.replace(/\[\[(.*?)\]\]/g, (match, options) => {
    const choices = options.split('|').map(s => s.trim());
    return choices[Math.floor(Math.random() * choices.length)];
  });
  
  await fs.writeFile(filePath, content);
}

module.exports = { processFile };
```

### Step 5: Implement Website Builder
```javascript
// src/generator/websiteBuilder.js
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('cross-spawn');

async function buildWebsite(domain, data, templatePath, outputPath) {
  const websitePath = path.join(outputPath, domain);
  
  // Copy template
  await fs.copy(templatePath, websitePath);
  
  // Process all JavaScript and JSX files
  const files = await getAllFiles(websitePath, ['.js', '.jsx', '.html']);
  
  for (const file of files) {
    await processFile(file, data);
  }
  
  // Update package.json
  const packageJsonPath = path.join(websitePath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.name = domain.replace(/\./g, '-');
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  
  // Install dependencies and build
  await runCommand('npm', ['install'], websitePath);
  await runCommand('npm', ['run', 'build'], websitePath);
}

module.exports = { buildWebsite };
```

### Step 6: Main Generator Script
```javascript
// src/generator/index.js
const chalk = require('chalk');
const { parseCSV } = require('./csvParser');
const { buildWebsite } = require('./websiteBuilder');

async function generate() {
  console.log(chalk.blue('Starting website generation...'));
  
  try {
    // Parse CSV
    const websites = await parseCSV('./src/data/websites.csv');
    
    // Clean build directory
    await fs.remove('./build');
    await fs.ensureDir('./build');
    
    // Build each website
    for (const website of websites) {
      console.log(chalk.yellow(`Building ${website.domain}...`));
      await buildWebsite(
        website.domain,
        website,
        './src/template',
        './build'
      );
      console.log(chalk.green(`✓ ${website.domain} built successfully`));
    }
    
    console.log(chalk.green('All websites generated successfully!'));
  } catch (error) {
    console.error(chalk.red('Error:', error.message));
    process.exit(1);
  }
}

generate();
```

## 7. Testing Requirements

### Unit Tests
- CSV parsing with various formats
- Template replacement accuracy
- Random selection functionality
- File system operations

### Integration Tests
- End-to-end website generation
- Multiple CSV rows processing
- Build output validation
- React app functionality

### Test Cases
1. **Valid CSV Processing**
   - Test with sample CSV data
   - Verify all fields are correctly parsed

2. **Template Replacement**
   - Verify `{{ variable }}` replacements
   - Test `[[ option ]]` random selection
   - Handle missing variables gracefully

3. **Build Output**
   - Verify folder structure
   - Check React app can run independently
   - Validate all files are processed

## 8. Performance Considerations

- **Parallel Processing**: Build multiple websites concurrently
- **Caching**: Cache npm dependencies between builds
- **Optimization**: Minimize file I/O operations
- **Memory Management**: Process large CSV files in chunks

## 9. Error Handling

### CSV Errors
- Missing required columns
- Invalid data format
- Empty CSV file

### Build Errors
- Template file not found
- npm install failures
- Build script errors

### File System Errors
- Permission issues
- Disk space limitations
- Path resolution errors

## 10. CLI Commands

```bash
# Main build command
npm start

# Development mode (watch for changes)
npm run dev

# Clean build directory
npm run clean

# Validate CSV without building
npm run validate

# Build specific domain
npm run build:single -- --domain=foodexpress.com
```

## 11. Configuration Options

### Environment Variables (.env)
```env
CSV_PATH=./src/data/websites.csv
TEMPLATE_PATH=./src/template
BUILD_PATH=./build
PARALLEL_BUILDS=3
NODE_ENV=production
```

## 12. Success Criteria

- ✅ Reads CSV file successfully
- ✅ Generates one React app per CSV row
- ✅ Each app contains replaced content from CSV
- ✅ Random word selection works correctly
- ✅ Generated apps are independently runnable
- ✅ Build process completes without errors
- ✅ Output follows specified folder structure

## 13. Deliverables

1. **Source Code**
   - Generator scripts
   - React template application
   - Build configuration

2. **Documentation**
   - README.md with setup instructions
   - API documentation for generator functions
   - Usage examples

3. **Build Output**
   - Generated websites in build folder
   - Each website fully functional and independent

## 14. Future Enhancements

- Web UI for CSV upload and configuration
- Support for multiple templates
- Theme customization options
- Deployment automation to hosting services
- Real-time preview during generation
- Support for more complex data structures
- Template marketplace integration

## 15. Notes for GitHub Copilot Implementation

When implementing with GitHub Copilot, use these prompts:

1. "Create a Node.js script that parses CSV files using papaparse"
2. "Implement a template processor that replaces {{ variables }} and [[ random | selections ]]"
3. "Build a React component with Tailwind CSS for a Hero section"
4. "Create a file copier that processes template replacements recursively"
5. "Implement npm command execution using cross-spawn"
6. "Add error handling for CSV parsing and file operations"
7. "Create a CLI interface using commander.js"

Remember to test each component individually before integration.