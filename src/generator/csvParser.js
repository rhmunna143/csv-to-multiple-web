const fs = require('fs');
const papa = require('papaparse');

/**
 * Parse CSV file and return array of website data objects
 * @param {string} filepath - Path to CSV file
 * @returns {Promise<Array>} Array of website data objects
 */
async function parseCSV(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      throw new Error(`CSV file not found: ${filepath}`);
    }

    const csvFile = fs.readFileSync(filepath, 'utf8');
    
    if (!csvFile.trim()) {
      throw new Error('CSV file is empty');
    }

    const { data, errors } = papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Trim whitespace from all values
        return typeof value === 'string' ? value.trim() : value;
      }
    });
    
    if (errors.length > 0) {
      const errorMessages = errors.map(error => `Row ${error.row}: ${error.message}`);
      throw new Error(`CSV parsing errors:\n${errorMessages.join('\n')}`);
    }

    if (data.length === 0) {
      throw new Error('No valid data rows found in CSV file');
    }

    // Validate required fields
    const requiredFields = ['domain', 'title', 'description', 'phone', 'address'];
    const missingFields = [];

    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          missingFields.push(`Row ${index + 2}: Missing required field '${field}'`);
        }
      });
    });

    if (missingFields.length > 0) {
      throw new Error(`Validation errors:\n${missingFields.join('\n')}`);
    }

    console.log(`✓ Successfully parsed ${data.length} website(s) from CSV`);
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error.message);
    throw error;
  }
}

/**
 * Validate CSV structure without parsing all data
 * @param {string} filepath - Path to CSV file
 * @returns {Promise<boolean>} True if valid
 */
async function validateCSV(filepath) {
  try {
    await parseCSV(filepath);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { parseCSV, validateCSV };