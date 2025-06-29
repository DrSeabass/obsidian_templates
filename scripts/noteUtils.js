// This script makes the noteUtils functions available to Templater

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {Object} app - The Obsidian app object
 * @param {string} dirPath - The path to the directory
 */
function ensureDirectoryExists(app, dirPath) {
  try {
    const dirs = dirPath.split('/');
    let currentPath = '';
    
    for (const dir of dirs) {
      if (dir === '') continue;
      
      currentPath += dir + '/';
      const folder = app.vault.getAbstractFileByPath(currentPath);
      
      if (!folder) {
        try {
          app.vault.createFolder(currentPath);
          console.log(`Created directory: ${currentPath}`);
        } catch (error) {
          // If the error is because the folder already exists, that's fine
          if (error.message && error.message.includes('already exists')) {
            console.log(`Directory already exists: ${currentPath}`);
          } else {
            console.error(`Error creating directory ${currentPath}:`, error);
            console.error(`Error details:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Unexpected error in ensureDirectoryExists:`, error);
    console.error(`Error details:`, error.message);
  }
}

/**
 * Finds the next available date for a daily note
 * @param {Object} app - The Obsidian app object
 * @param {Object} date - A moment.js date object
 * @param {Object} dateUtils - The dateUtils object
 * @returns {Object} - An object containing the next available date and path
 */
function findNextAvailableDailyNote(app, date, dateUtils) {
  let currentDate = date.clone();
  let path = dateUtils.getDailyNotePath(currentDate) + '.md';
  
  while (app.vault.getAbstractFileByPath(path)) {
    // Move to the next day
    currentDate.add(1, 'days');
    path = dateUtils.getDailyNotePath(currentDate) + '.md';
  }
  
  // Ensure the directory exists
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  ensureDirectoryExists(app, dirPath);
  
  return {
    date: currentDate,
    path: path.substring(0, path.length - 3) // Remove .md extension
  };
}

/**
 * Finds the next available date for a weekly note
 * @param {Object} app - The Obsidian app object
 * @param {Object} mondayDate - A moment.js date object representing a Monday
 * @param {Object} dateUtils - The dateUtils object
 * @returns {Object} - An object containing the next available date and path
 */
function findNextAvailableWeeklyNote(app, mondayDate, dateUtils) {
  let currentMonday = mondayDate.clone();
  let path = dateUtils.getWeeklyNotePath(currentMonday) + '.md';
  
  while (app.vault.getAbstractFileByPath(path)) {
    // Move to the next week
    currentMonday.add(7, 'days');
    path = dateUtils.getWeeklyNotePath(currentMonday) + '.md';
  }
  
  // Ensure the directory exists
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  ensureDirectoryExists(app, dirPath);
  
  return {
    date: currentMonday,
    path: path.substring(0, path.length - 3) // Remove .md extension
  };
}

/**
 * Finds the next available date for a monthly note
 * @param {Object} app - The Obsidian app object
 * @param {Object} monthDate - A moment.js date object
 * @param {Object} dateUtils - The dateUtils object
 * @returns {Object} - An object containing the next available date and path
 */
function findNextAvailableMonthlyNote(app, monthDate, dateUtils) {
  let currentMonth = monthDate.clone();
  let path = dateUtils.getMonthlyNotePath(currentMonth) + '.md';
  
  while (app.vault.getAbstractFileByPath(path)) {
    // Move to the next month
    currentMonth.add(1, 'months');
    path = dateUtils.getMonthlyNotePath(currentMonth) + '.md';
  }
  
  // Ensure the directory exists
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  ensureDirectoryExists(app, dirPath);
  
  return {
    date: currentMonth,
    path: path.substring(0, path.length - 3) // Remove .md extension
  };
}

// Export a function that returns all the utility functions
module.exports = function() {
  return {
    findNextAvailableDailyNote,
    findNextAvailableWeeklyNote,
    findNextAvailableMonthlyNote,
    ensureDirectoryExists
  };
};
