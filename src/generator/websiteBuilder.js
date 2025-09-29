const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('cross-spawn');
const { processDirectory } = require('./templateProcessor');

/**
 * Execute a command and return a promise
 * @param {string} command - Command to execute
 * @param {Array<string>} args - Command arguments
 * @param {string} cwd - Working directory
 * @returns {Promise<void>}
 */
function runCommand(command, args = [], cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    // Use the full command string on Windows
    const isWindows = process.platform === 'win32';
    const fullCommand = isWindows ? `${command} ${args.join(' ')}` : command;
    
    const child = spawn(fullCommand, isWindows ? [] : args, {
      cwd,
      stdio: 'pipe',
      shell: true,
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}:\n${stderr || stdout}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Install npm dependencies for a project
 * @param {string} projectPath - Path to project directory
 */
async function installDependencies(projectPath) {
  console.log('Installing dependencies...');
  
  try {
    // Check if package-lock.json exists, use npm ci if it does, npm install otherwise
    const packageLockPath = path.join(projectPath, 'package-lock.json');
    const useCI = await fs.pathExists(packageLockPath);
    
    const command = useCI ? 'ci' : 'install';
    await runCommand('npm', [command, '--silent'], projectPath);
    
    console.log('✓ Dependencies installed successfully');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    throw error;
  }
}

/**
 * Build React application
 * @param {string} projectPath - Path to project directory
 */
async function buildReactApp(projectPath) {
  console.log('Building React application...');
  
  try {
    await runCommand('npm', ['run', 'build'], projectPath);
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
 * Build multiple websites in parallel
 * @param {Array<Object>} websites - Array of website data
 * @param {string} templatePath - Path to template directory
 * @param {string} outputPath - Output directory path
 * @param {number} maxConcurrent - Maximum concurrent builds
 */
async function buildWebsitesParallel(websites, templatePath, outputPath, maxConcurrent = 3) {
  const results = [];
  const chunks = [];
  
  // Split websites into chunks for parallel processing
  for (let i = 0; i < websites.length; i += maxConcurrent) {
    chunks.push(websites.slice(i, i + maxConcurrent));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(website => 
      buildWebsite(website.domain, website, templatePath, outputPath)
    );
    
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
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
  buildWebsitesParallel,
  generateBuildSummary,
  runCommand,
  installDependencies,
  buildReactApp
};