# Goals
<%*
// Import the utility modules and call them to get the functions
const dateUtils = tp.user.dateUtils();
const goalUtils = tp.user.goalUtils();
const noteUtils = tp.user.noteUtils();
const dashboardUtils = tp.user.dashboardUtils();

// Get the date from the filename or use the current date
const dateString = tp.file.title.match(/\d{4}-\d{2}-\d{2}/) ? tp.file.title : tp.date.now("YYYY-MM-DD");
const date = window.moment(dateString, "YYYY-MM-DD");

// Check if the note already exists and find the next available date if needed
const nextAvailable = noteUtils.findNextAvailableDailyNote(app, date, dateUtils);
const finalDate = nextAvailable.date;
const finalPath = nextAvailable.path;

// Move the file to the correct location
try {
  await tp.file.move(finalPath);
  console.log(`Moved file to: ${finalPath}`);
} catch (error) {
  console.error(`Error moving file to ${finalPath}:`, error);
  console.error(`Error details:`, error.message);
}

// Find the Monday of this week
const monday = dateUtils.getMondayOfWeek(finalDate);

// Determine which month this week belongs to
const weekMonth = dateUtils.getWeekMonth(monday);

// Generate paths to weekly and monthly notes
const weekPath = dateUtils.getWeeklyNotePath(monday);
const monthPath = dateUtils.getMonthlyNotePath(weekMonth);

// Extract goals from the monthly note
const monthlyGoals = await goalUtils.extractMonthlyGoals(app, monthPath);
const formattedMonthlyGoals = goalUtils.formatMonthlyGoals(monthlyGoals);

// Extract the weekly goal
const weeklyGoal = await goalUtils.extractWeeklyGoal(app, weekPath);

// Create the goals table
const table = [
  "| Scope   | Goal |",
  "| ------- | ---- |",
  `| [[${monthPath}\\|Monthly]] | ${formattedMonthlyGoals} |`,
  `| [[${weekPath}\\|Weekly]] | ${weeklyGoal} |`,
  "| Daily   | ==REPLACE WITH TODAY'S MAIN FOCUS== #place_holder |"
];

// Update the Dashboard with links to the current day, week, and month
dashboardUtils.updateDashboard(app, finalDate, dateUtils);

tR = table.join('\n')
%>

# Roll Over Tasks
* [ ] Copy Unfinished Elements from Yesterday

# Today's Tasks
* [ ] Generate This File
* [ ] Pull Weekly Tasks Into This File
* [ ] Write in your diary
* [ ] Roll Unfinished Tasks Over To Week Level

# Generated / Discovered Tasks
* [ ] ==REPLACE WITH FIRST THING YOU FOUND TODAY== #place_holder

# Time Log
| Start | End | Type | Activity | Notes |
| ----- | --- | ---- | -------- | ----- |
|       |     |      |          |       |

# Time Visualization

```dataviewjs
// Get the current file
const currentFile = dv.current();

// Extract the time log table
const content = await dv.io.load(currentFile.file.path);

// Parse the time log table
function parseTimeLog(content) {
  const result = {
    tagHours: {},
    rawData: [],
    totalHours: 0
  };
  
  try {
    // Extract the time log table using regex
    const tableRegex = /# Time Log\s*\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|\s*\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|\s*((?:\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|\s*)*)/;
    const tableMatch = content.match(tableRegex);
    
    if (!tableMatch || !tableMatch[1]) {
      console.log("No time log table found or table is empty");
      return result;
    }
    
    // Process each row of the table
    const rows = tableMatch[1].trim().split('\n');
    
    for (const row of rows) {
      // Skip empty rows
      if (!row.trim()) continue;
      
      // Extract cells from the row
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      
      // Skip rows with insufficient data
      if (cells.length < 3) continue;
      
      const startTime = cells[0];
      const endTime = cells[1];
      const typeCell = cells[2];
      const activity = cells.length > 3 ? cells[3] : '';
      const notes = cells.length > 4 ? cells[4] : '';
      
      // Skip rows without valid start/end times
      if (!startTime || !endTime) continue;
      
      // Parse start and end times (assuming format like "08:30" or "8:30")
      const startParts = startTime.split(':').map(part => parseInt(part, 10));
      const endParts = endTime.split(':').map(part => parseInt(part, 10));
      
      if (startParts.length !== 2 || endParts.length !== 2) continue;
      
      const startHour = startParts[0];
      const startMinute = startParts[1];
      const endHour = endParts[0];
      const endMinute = endParts[1];
      
      // Calculate duration in hours
      let durationHours = endHour - startHour;
      let durationMinutes = endMinute - startMinute;
      
      if (durationMinutes < 0) {
        durationHours -= 1;
        durationMinutes += 60;
      }
      
      const duration = durationHours + (durationMinutes / 60);
      
      // Skip entries with negative or zero duration
      if (duration <= 0) continue;
      
      // Extract tags from the type cell
      const tags = [];
      const tagMatches = typeCell.match(/#[a-zA-Z0-9_]+/g);
      
      if (tagMatches) {
        for (const tag of tagMatches) {
          tags.push(tag);
          
          // Add hours to tag totals
          if (!result.tagHours[tag]) {
            result.tagHours[tag] = 0;
          }
          result.tagHours[tag] += duration;
        }
      }
      
      // Add to raw data
      result.rawData.push({
        startTime,
        endTime,
        duration,
        tags,
        activity,
        notes
      });
      
      // Add to total hours
      result.totalHours += duration;
    }
  } catch (error) {
    console.error("Error parsing time log:", error);
  }
  
  return result;
}

// Generate chart code
function generateChartCode(timeData, chartType) {
  try {
    // Sort tags alphabetically
    const sortedTags = Object.keys(timeData.tagHours).sort();
    
    // Format hours to 1 decimal place
    const formatHours = (hours) => Math.round(hours * 10) / 10;
    
    // Generate a simple bar chart for daily hours by tag
    return `\`\`\`chart
type: bar
labels: [${sortedTags.map(tag => `"${tag}"`).join(', ')}]
series:
  - data: [${sortedTags.map(tag => formatHours(timeData.tagHours[tag])).join(', ')}]
width: 100%
labelColors: true
fill: true
legend: false
\`\`\``;
  } catch (error) {
    console.error("Error generating chart code:", error);
    return "```\nError generating chart\n```";
  }
}

// Parse the time log and generate the chart
const timeLog = parseTimeLog(content);
const chartCode = generateChartCode(timeLog, 'daily');

// Render the chart
dv.paragraph(chartCode);
```
