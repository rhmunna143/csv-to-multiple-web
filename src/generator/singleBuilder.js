require('dotenv').config();
const chalk = require('chalk');
const { program } = require('commander');
const { parseCSV } = require('./csvParser');
const { buildWebsite } = require('./websiteBuilderFixed');

/**
 * Build a single website by domain
 */
async function buildSingleWebsite(domain) {
  console.log(chalk.blue.bold(`\n🏗️  Single Website Builder: ${domain}\n`));
  
  try {
    const config = {
      csvPath: process.env.CSV_PATH || './src/data/websites.csv',
      templatePath: process.env.TEMPLATE_PATH || './src/template',
      buildPath: process.env.BUILD_PATH || './build'
    };
    
    console.log(chalk.yellow('📄 Parsing CSV file...'));
    const websites = await parseCSV(config.csvPath);
    
    // Find the specific website
    const websiteData = websites.find(w => w.domain === domain);
    
    if (!websiteData) {
      throw new Error(`Domain '${domain}' not found in CSV file. Available domains: ${websites.map(w => w.domain).join(', ')}`);
    }
    
    console.log(chalk.yellow(`🏗️  Building website: ${domain}...`));
    
    const result = await buildWebsite(
      domain,
      websiteData,
      config.templatePath,
      config.buildPath
    );
    
    if (result.success) {
      console.log(chalk.green.bold('\n🎉 Single website build complete!'));
      console.log(chalk.blue(`📁 Output: ${result.path}`));
    } else {
      console.error(chalk.red.bold('\n❌ Build failed:'));
      console.error(chalk.red(result.error));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Build failed:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Setup CLI
program
  .name('single-builder')
  .description('Build a single website from CSV data')
  .option('-d, --domain <domain>', 'Domain name to build')
  .action((options) => {
    if (!options.domain) {
      console.error(chalk.red('Error: Domain is required. Use --domain <domain>'));
      process.exit(1);
    }
    buildSingleWebsite(options.domain);
  });

if (require.main === module) {
  program.parse();
}

module.exports = { buildSingleWebsite };