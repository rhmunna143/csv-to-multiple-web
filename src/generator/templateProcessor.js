const fs = require('fs-extra');
const path = require('path');

/**
 * Escape string for JavaScript context
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeForJS(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

/**
 * Process template replacements in file content
 * @param {string} content - File content to process
 * @param {Object} data - Data object with replacement values
 * @param {string} filePath - File path for context-aware processing
 * @returns {string} Processed content
 */
function processTemplate(content, data, filePath = '') {
  let processedContent = content;

  // Replace dynamic variables {{ variable }}
  processedContent = processedContent.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      let processedValue = String(value);
      
      // If this is a JavaScript file, escape quotes properly
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        processedValue = escapeForJS(processedValue);
      }
      
      return processedValue;
    }
    console.warn(`Warning: Template variable '${key}' not found in data`);
    return match; // Keep original if not found
  });

  // Process random selections [[ option1 | option2 | option3 ]]
  processedContent = processedContent.replace(/\[\[(.*?)\]\]/g, (match, options) => {
    const choices = options.split('|').map(s => s.trim()).filter(s => s.length > 0);
    if (choices.length === 0) {
      console.warn(`Warning: No valid options found in random selection: ${match}`);
      return match;
    }
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  });

  return processedContent;
}

/**
 * Process a single file for template replacements
 * @param {string} filePath - Path to file to process
 * @param {Object} data - Data object with replacement values
 */
async function processFile(filePath, data) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const processedContent = processTemplate(content, data, filePath);
    await fs.writeFile(filePath, processedContent, 'utf8');
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Get all files with specific extensions recursively
 * @param {string} dirPath - Directory path to search
 * @param {Array<string>} extensions - File extensions to include (e.g., ['.js', '.jsx'])
 * @returns {Promise<Array<string>>} Array of file paths
 */
async function getAllFiles(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.json']) {
  const files = [];
  
  async function traverseDirectory(currentPath) {
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'build', 'dist', '.git'].includes(item.name)) {
          await traverseDirectory(fullPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await traverseDirectory(dirPath);
  return files;
}

/**
 * Process all template files in a directory
 * @param {string} dirPath - Directory path to process
 * @param {Object} data - Data object with replacement values
 * @param {Array<string>} extensions - File extensions to process
 */
async function processDirectory(dirPath, data, extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.json']) {
  try {
    const files = await getAllFiles(dirPath, extensions);
    
    console.log(`Processing ${files.length} template files...`);
    
    for (const file of files) {
      await processFile(file, data);
    }
    
    console.log(`✓ Processed ${files.length} files successfully`);
  } catch (error) {
    console.error('Error processing directory:', error.message);
    throw error;
  }
}

module.exports = {
  processTemplate,
  processFile,
  getAllFiles,
  processDirectory,
  escapeForJS
};