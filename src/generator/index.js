require('dotenv').config();
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { parseCSV } = require('./csvParser');
const { buildWebsitesSequential, generateBuildSummary } = require('./websiteBuilderFixed');

/**
 * Main generator function
 */
async function generate() {
  console.log(chalk.blue.bold('\n🚀 CSV to Multi-Website Generator\n'));
  
  const startTime = Date.now();
  
  try {
    // Get configuration from environment
    const config = {
      csvPath: process.env.CSV_PATH || './src/data/websites.csv',
      templatePath: process.env.TEMPLATE_PATH || './src/template',
      buildPath: process.env.BUILD_PATH || './build',
      parallelBuilds: parseInt(process.env.PARALLEL_BUILDS || '3')
    };
    
    console.log(chalk.cyan('Configuration:'));
    console.log(`  CSV Path: ${config.csvPath}`);
    console.log(`  Template Path: ${config.templatePath}`);
    console.log(`  Build Path: ${config.buildPath}`);
    console.log(`  Parallel Builds: ${config.parallelBuilds}\n`);
    
    // Validate paths exist
    if (!await fs.pathExists(config.csvPath)) {
      throw new Error(`CSV file not found: ${config.csvPath}`);
    }
    
    if (!await fs.pathExists(config.templatePath)) {
      throw new Error(`Template directory not found: ${config.templatePath}`);
    }
    
    // Parse CSV file
    console.log(chalk.yellow('📄 Parsing CSV file...'));
    const websites = await parseCSV(config.csvPath);
    
    // Clean and create build directory
    console.log(chalk.yellow('🧹 Cleaning build directory...'));
    await fs.remove(config.buildPath);
    await fs.ensureDir(config.buildPath);
    
    // Build all websites
    console.log(chalk.yellow(`🏗️  Building ${websites.length} website(s)...`));
    console.log(chalk.gray(`Using ${config.parallelBuilds} parallel builds\n`));
    
    const results = await buildWebsitesSequential(
      websites,
      config.templatePath,
      config.buildPath
    );
    
    // Generate summary
    await generateBuildSummary(results, config.buildPath);
    
    // Print results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(chalk.green.bold('\n🎉 Generation Complete!'));
    console.log(chalk.green(`✅ ${successful.length} website(s) built successfully`));
    
    if (failed.length > 0) {
      console.log(chalk.red(`❌ ${failed.length} website(s) failed`));
      failed.forEach(f => {
        console.log(chalk.red(`   - ${f.domain}: ${f.error}`));
      });
    }
    
    console.log(chalk.blue(`⏱️  Total time: ${duration}s`));
    console.log(chalk.cyan(`📁 Output directory: ${path.resolve(config.buildPath)}`));
    
    if (successful.length > 0) {
      console.log(chalk.yellow('\n🌐 Generated websites:'));
      successful.forEach(s => {
        const indexPath = path.join(s.path, 'build', 'index.html');
        console.log(chalk.blue(`   - ${s.domain}: file://${path.resolve(indexPath)}`));
      });
    }
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Generation failed:'));
    console.error(chalk.red(error.message));
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⏹️  Generation interrupted by user'));
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Run generator if this file is executed directly
if (require.main === module) {
  generate();
}

module.exports = { generate };