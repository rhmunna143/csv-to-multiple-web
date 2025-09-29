require('dotenv').config();
const chalk = require('chalk');
const { validateCSV } = require('./csvParser');

/**
 * Validate CSV file without building websites
 */
async function validateCSVFile() {
  console.log(chalk.blue.bold('\n📋 CSV Validator\n'));
  
  try {
    const csvPath = process.env.CSV_PATH || './src/data/websites.csv';
    console.log(`Validating CSV file: ${csvPath}`);
    
    const isValid = await validateCSV(csvPath);
    
    if (isValid) {
      console.log(chalk.green('✅ CSV file is valid and ready for processing'));
    } else {
      console.log(chalk.red('❌ CSV file validation failed'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Validation error:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  validateCSVFile();
}

module.exports = { validateCSVFile };