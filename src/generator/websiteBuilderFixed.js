const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const { processDirectory } = require('./templateProcessor');

/**
 * Execute command synchronously with better Windows support
 * @param {string} command - Command to execute
 * @param {string} cwd - Working directory
 */
function execCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Executing: ${command}`);
    const result = execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return result;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Install npm dependencies using execSync
 * @param {string} projectPath - Path to project directory
 */
async function installDependencies(projectPath) {
  console.log('Installing dependencies...');
  
  try {
    // Use execSync for better Windows compatibility
    execCommand('npm install --silent', projectPath);
    console.log('✓ Dependencies installed successfully');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    throw error;
  }
}

/**
 * Build React application using execSync
 * @param {string} projectPath - Path to project directory
 */
async function buildReactApp(projectPath) {
  console.log('Building React application...');
  
  try {
    execCommand('npm run build', projectPath);
    console.log('✓ React application built successfully');
  } catch (error) {
    console.error('Error building React application:', error.message);
    throw error;
  }
}

/**
 * Build a single website from template
 * @param {string} domain - Website domain
 * @param {Object} data - Website data from CSV
 * @param {string} templatePath - Path to template directory
 * @param {string} outputPath - Output directory path
 */
async function buildWebsite(domain, data, templatePath, outputPath) {
  const websitePath = path.join(outputPath, domain);
  
  try {
    console.log(`\n🏗️  Building website: ${domain}`);
    
    // Ensure output directory exists
    await fs.ensureDir(outputPath);
    
    // Remove existing website directory if it exists
    await fs.remove(websitePath);
    
    // Copy template to website directory
    console.log('Copying template files...');
    await fs.copy(templatePath, websitePath, {
      filter: (src) => {
        // Exclude node_modules and build directories from template
        const relativePath = path.relative(templatePath, src);
        return !relativePath.startsWith('node_modules') && 
               !relativePath.startsWith('build') && 
               !relativePath.startsWith('.git');
      }
    });
    
    // Process template files
    await processDirectory(websitePath, data);
    
    // Update package.json with unique name
    const packageJsonPath = path.join(websitePath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = domain.replace(/\./g, '-').toLowerCase();
      packageJson.homepage = `https://${domain}`;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    
    // Install dependencies
    await installDependencies(websitePath);
    
    // Build the React application
    await buildReactApp(websitePath);
    
    console.log(`✅ Website ${domain} built successfully`);
    return { domain, success: true, path: websitePath };
    
  } catch (error) {
    console.error(`❌ Failed to build website ${domain}:`, error.message);
    return { domain, success: false, error: error.message };
  }
}

/**
 * Build websites sequentially to avoid resource conflicts
 * @param {Array<Object>} websites - Array of website data
 * @param {string} templatePath - Path to template directory
 * @param {string} outputPath - Output directory path
 */
async function buildWebsitesSequential(websites, templatePath, outputPath) {
  const results = [];
  
  for (const website of websites) {
    const result = await buildWebsite(website.domain, website, templatePath, outputPath);
    results.push(result);
  }
  
  return results;
}

/**
 * Generate build summary
 * @param {Array<Object>} results - Build results
 * @param {string} outputPath - Output directory path
 */
async function generateBuildSummary(results, outputPath) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const summaryContent = `
# Build Summary

**Total websites:** ${results.length}
**Successful:** ${successful.length}
**Failed:** ${failed.length}

## Successful Builds
${successful.map(r => `- ✅ [${r.domain}](./${r.domain}/build/index.html)`).join('\n')}

## Failed Builds
${failed.map(r => `- ❌ ${r.domain}: ${r.error}`).join('\n')}

## Quick Links
${successful.map(r => `- [${r.domain}](file://${path.resolve(r.path, 'build', 'index.html')}`).join('\n')}

Generated on: ${new Date().toISOString()}
`;

  const summaryPath = path.join(outputPath, 'build-summary.md');
  await fs.writeFile(summaryPath, summaryContent);
  
  console.log(`\n📊 Build summary saved to: ${summaryPath}`);
  return summaryPath;
}

module.exports = {
  buildWebsite,
  buildWebsitesSequential,
  generateBuildSummary,
  execCommand,
  installDependencies,
  buildReactApp
};