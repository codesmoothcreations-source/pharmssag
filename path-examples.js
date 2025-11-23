// Path module examples for your Node.js backend
const path = require('path');
// 1. JOIN PATHS - Safely concatenate path segments
const uploadsPath = path.join(__dirname, 'uploads', 'files', 'documents');
console.log('Joined path:', uploadsPath);
// Output: /absolute/path/to/your/project/uploads/files/documents

// 2. RESOLVE - Convert relative path to absolute path
const configPath = path.resolve('./config', 'database.js');
console.log('Resolved path:', configPath);
// Output: /absolute/path/to/your/project/config/database.js

// 3. BASENAME - Get the last part of a path
const fileName = path.basename('/path/to/document.pdf');
console.log('Filename:', fileName);
// Output: document.pdf

// 4. DIRNAME - Get the directory path
const dirName = path.dirname('/path/to/document.pdf');
console.log('Directory:', dirName);
// Output: /path/to

// 5. EXTNAME - Get the file extension
const extension = path.extname('/path/to/document.pdf');
console.log('Extension:', extension);
// Output: .pdf

// 6. PARSE - Parse path into components
const parsedPath = path.parse('/path/to/document.pdf');
console.log('Parsed:', parsedPath);
// Output: { root: '/', dir: '/path/to', base: 'document.pdf', ext: '.pdf', name: 'document' }

// 7. FORMAT - Create path from parsed object
const formattedPath = path.format({
    dir: '/path/to',
    name: 'document',
    ext: '.pdf'
});
console.log('Formatted:', formattedPath);
// Output: /path/to/document.pdf

// 8. NORMALIZE - Clean up path (remove extra slashes, resolve .. etc)
const messyPath = path.normalize('/path//to/../to/document.pdf');
console.log('Normalized:', messyPath);
// Output: /path/to/document.pdf

// 9. ISABSOLUTE - Check if path is absolute
const isAbs1 = path.isAbsolute('/path/to/file');
const isAbs2 = path.isAbsolute('./relative/path');
console.log('Is absolute 1:', isAbs1); // true
console.log('Is absolute 2:', isAbs2); // false

// 10. RELATIVE - Get relative path between two absolute paths
const relativePath = path.relative('/path/to/old/file', '/path/to/new/file');
console.log('Relative:', relativePath);
// Output: ../../new/file

// Real-world examples for your project:

// Example 1: File upload path
const uploadFilePath = path.join(__dirname, 'uploads', 'past-questions', 'math-101.pdf');
console.log('Upload file path:', uploadFilePath);

// Example 2: Log file path
const logFilePath = path.join(__dirname, 'logs', `${new Date().toISOString().split('T')[0]}.log`);
console.log('Log file path:', logFilePath);

// Example 3: Configuration file path
const configFilePath = path.resolve(__dirname, 'config', 'database.js');
console.log('Config file path:', configFilePath);

// Example 4: Static files serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Example 5: Dynamic file serving based on user ID
const getUserUploadPath = (userId, filename) => {
    return path.join(__dirname, 'uploads', 'users', userId, filename);
};

// Example 6: Creating backup directories
const createBackupPath = (timestamp) => {
    return path.join(__dirname, 'backups', `backup-${timestamp}`);
};

// Example 7: File name with timestamp
const getTimestampedFileName = (originalFileName) => {
    const ext = path.extname(originalFileName);
    const name = path.basename(originalFileName, ext);
    const timestamp = Date.now();
    return `${name}-${timestamp}${ext}`;
};

module.exports = {
    uploadFilePath,
    logFilePath,
    configFilePath,
    getUserUploadPath,
    createBackupPath,
    getTimestampedFileName
};