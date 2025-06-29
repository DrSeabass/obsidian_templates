// This script makes the dashboardUtils functions available to Templater

/**
 * Updates the Dashboard.md file with links to the current day, week, and month
 * @param {Object} app - The Obsidian app object
 * @param {Object} currentDate - A moment.js date object
 * @param {Object} dateUtils - Optional dateUtils object, will be retrieved from app if not provided
 */
function updateDashboard(app, currentDate, dateUtilsParam) {
  try {
    // Get the Dashboard.md file
    const dashboardFile = app.vault.getAbstractFileByPath("Dashboard.md");
    
    if (!dashboardFile) {
      console.error("Dashboard.md not found");
      return;
    }
    
    // Use provided dateUtils or get it from app
    let dateUtils = dateUtilsParam;
    if (!dateUtils) {
      try {
        dateUtils = app.plugins.plugins.templater.templater.functions_generator.user_functions.dateUtils();
      } catch (error) {
        console.error("Error accessing dateUtils from app:", error);
        console.error("Error details:", error.message);
        return;
      }
    }
    
    // Get the current date, or use the provided date
    const date = currentDate || window.moment();
    
    // Get the Monday of the current week
    const monday = dateUtils.getMondayOfWeek(date);
    
    // Get the month the current week belongs to
    const month = dateUtils.getWeekMonth(date);
    
    // Generate paths to the current day, week, and month notes
    const dayPath = dateUtils.getDailyNotePath(date);
    const weekPath = dateUtils.getWeeklyNotePath(monday);
    const monthPath = dateUtils.getMonthlyNotePath(month);
    
    // Read the current Dashboard content
    app.vault.read(dashboardFile).then(content => {
      try {
        // Update the links in the Dashboard
        const updatedContent = content
          .replace(/# \[\[.*?\| This Month\]\]/, `# [[${monthPath}| This Month]]`)
          .replace(/# \[\[.*?\| This Week\]\]/, `# [[${weekPath}| This Week]]`)
          .replace(/# \[\[.*?\| Today\]\]/, `# [[${dayPath}| Today]]`);
        
        // Write the updated content back to the Dashboard
        app.vault.modify(dashboardFile, updatedContent);
        
        console.log("Dashboard updated successfully");
      } catch (error) {
        console.error("Error updating Dashboard content:", error);
        console.error("Error details:", error.message);
      }
    }).catch(error => {
      console.error("Error reading Dashboard.md:", error);
      console.error("Error details:", error.message);
    });
  } catch (error) {
    console.error("Unexpected error in updateDashboard:", error);
    console.error("Error details:", error.message);
  }
}

// Export a function that returns all the utility functions
module.exports = function() {
  return {
    updateDashboard
  };
};
