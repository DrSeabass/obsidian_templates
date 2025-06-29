// This script makes the goalUtils functions available to Templater

/**
 * Extract goals from a monthly note
 * @param {Object} app - The Obsidian app object
 * @param {string} monthPath - The path to the monthly note
 * @returns {Object} - An object containing the extracted goals
 */
async function extractMonthlyGoals(app, monthPath) {
  const goals = {
    career: "#place_holder",
    personal: "#place_holder",
    health: "#place_holder"
  };
  
  try {
    // Get the full path to the monthly note
    const monthlyNotePath = app.vault.getAbstractFileByPath(monthPath + ".md");
    
    if (monthlyNotePath) {
      console.log(`Found monthly note: ${monthPath}.md`);
      
      // Read the content of the monthly note
      const monthlyNoteContent = await app.vault.read(monthlyNotePath);
      
      // Extract goals using regex
      const careerMatch = monthlyNoteContent.match(/\|\s*Career\s*\|\s*([^|]*?)\s*\|/);
      if (careerMatch && careerMatch[1]) {
        goals.career = careerMatch[1].trim();
        console.log(`Found Career goal: ${goals.career}`);
      } else {
        console.log("Career goal not found in monthly note");
      }
      
      const personalMatch = monthlyNoteContent.match(/\|\s*Personal\s*\|\s*([^|]*?)\s*\|/);
      if (personalMatch && personalMatch[1]) {
        goals.personal = personalMatch[1].trim();
        console.log(`Found Personal goal: ${goals.personal}`);
      } else {
        console.log("Personal goal not found in monthly note");
      }
      
      const healthMatch = monthlyNoteContent.match(/\|\s*Health\s*\|\s*([^|]*?)\s*\|/);
      if (healthMatch && healthMatch[1]) {
        goals.health = healthMatch[1].trim();
        console.log(`Found Health goal: ${goals.health}`);
      } else {
        console.log("Health goal not found in monthly note");
      }
    } else {
      console.log(`Monthly note not found: ${monthPath}.md`);
    }
  } catch (error) {
    console.error("Error reading monthly note:", error);
    console.error(error.stack);
  }
  
  return goals;
}

/**
 * Extract the weekly goal from a weekly note
 * @param {Object} app - The Obsidian app object
 * @param {string} weekPath - The path to the weekly note
 * @returns {string} - The extracted weekly goal
 */
async function extractWeeklyGoal(app, weekPath) {
  let weeklyGoal = "#place_holder";
  
  try {
    // Get the full path to the weekly note
    const weeklyNotePath = app.vault.getAbstractFileByPath(weekPath + ".md");
    
    if (weeklyNotePath) {
      console.log(`Found weekly note: ${weekPath}.md`);
      
      // Read the content of the weekly note
      const weeklyNoteContent = await app.vault.read(weeklyNotePath);
      
      // Extract the weekly goal using regex
      const weeklyMatch = weeklyNoteContent.match(/\|\s*Weekly\s*\|\s*([^|]*?)\s*\|/);
      if (weeklyMatch && weeklyMatch[1]) {
        weeklyGoal = weeklyMatch[1].trim();
        console.log(`Found Weekly goal: ${weeklyGoal}`);
      } else {
        console.log("Weekly goal not found in weekly note");
      }
    } else {
      console.log(`Weekly note not found: ${weekPath}.md`);
    }
  } catch (error) {
    console.error("Error reading weekly note:", error);
    console.error(error.stack);
  }
  
  return weeklyGoal;
}

/**
 * Format monthly goals for display
 * @param {Object} goals - The monthly goals object
 * @returns {string} - Formatted monthly goals for display
 */
function formatMonthlyGoals(goals) {
  return `**Career:** ${goals.career}<br>**Personal:** ${goals.personal}<br>**Health:** ${goals.health}`;
}

// Export a function that returns all the utility functions
module.exports = function() {
  return {
    extractMonthlyGoals,
    extractWeeklyGoal,
    formatMonthlyGoals
  };
};
