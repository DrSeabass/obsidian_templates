# Goals
<%*
// Import the utility modules and call them to get the functions
const dateUtils = tp.user.dateUtils();
const goalUtils = tp.user.goalUtils();
const noteUtils = tp.user.noteUtils();
const dashboardUtils = tp.user.dashboardUtils();

// Determine the Monday date
let monday;

// Check if the filename contains a date (format: "Week of YYYY-MM-DD")
const dateMatch = tp.file.title.match(/Week of (\d{4}-\d{2}-\d{2})/);
if (dateMatch) {
  // If filename contains a date, use that date
  monday = window.moment(dateMatch[1], "YYYY-MM-DD");
} else {
  // Otherwise, use the current date and find the Monday of this week
  const today = window.moment();
  monday = dateUtils.getMondayOfWeek(today);
}

// Check if the note already exists and find the next available date if needed
const nextAvailable = noteUtils.findNextAvailableWeeklyNote(app, monday, dateUtils);
const finalMonday = nextAvailable.date;
const finalPath = nextAvailable.path;

// Move the file to the correct location
try {
  await tp.file.move(finalPath);
  console.log(`Moved file to: ${finalPath}`);
} catch (error) {
  console.error(`Error moving file to ${finalPath}:`, error);
  console.error(`Error details:`, error.message);
}

// Get the month this week belongs to
const weekMonth = dateUtils.getWeekMonth(finalMonday);

// Generate the monthly link based on the determined month
const monthPath = dateUtils.getMonthlyNotePath(weekMonth);

// Extract goals from the monthly note
const monthlyGoals = await goalUtils.extractMonthlyGoals(app, monthPath);
const formattedMonthlyGoals = goalUtils.formatMonthlyGoals(monthlyGoals);

// Update the Dashboard with links to the current day, week, and month
dashboardUtils.updateDashboard(app, finalMonday, dateUtils);
%>
| Scope                                | Goal                                                |
| ------------------------------------ | --------------------------------------------------- |
| [[${monthPath}|Monthly]]<br>         | ${formattedMonthlyGoals} |
| Weekly                               | <% tp.cursor %>                                     |
# To Be Scheduled
## Rolled Over From Last Week
* [ ] ==ROLL OVER TASK FROM LAST WEEKLY NOTE== #place_holder
## Rolled Over Day Boundary
* [ ] ==PLACE HOLDER FOR MONDAY'S ROLL OVER TASKS== #place_holder
## New This Week
* [ ] ==PLACE HOLDER FOR NEW TASKS== #place_holder

<%*
// Generate headings for each day using the dateUtils module
const mondayHeading = dateUtils.createDayHeading(finalMonday, "Monday");
const tuesday = finalMonday.clone().add(1, "days");
const tuesdayHeading = dateUtils.createDayHeading(tuesday, "Tuesday");
const wednesday = finalMonday.clone().add(2, "days");
const wednesdayHeading = dateUtils.createDayHeading(wednesday, "Wednesday");
const thursday = finalMonday.clone().add(3, "days");
const thursdayHeading = dateUtils.createDayHeading(thursday, "Thursday");
const friday = finalMonday.clone().add(4, "days");
const fridayHeading = dateUtils.createDayHeading(friday, "Friday");
const saturday = finalMonday.clone().add(5, "days");
const saturdayHeading = dateUtils.createDayHeading(saturday, "Saturday");
const sunday = finalMonday.clone().add(6, "days");
const sundayHeading = dateUtils.createDayHeading(sunday, "Sunday");
%>

<%* tR += mondayHeading %>
* [ ] Trash Out to Curb

<%* tR += tuesdayHeading %>
* [ ] Prep Topics for Couples Therapy

<%* tR += wednesdayHeading %>
* [ ] Prep Topics for Individual Therapy (OR, alternating weeks)
* [ ] Review Last Week's Journal for Mental Health
	* [ ] Major Theme: ==WHAT HAPPENED EMOTIONALLY LAST WEEK== #place_holder
	* [ ] What to Change: ==ONE NEW THING TO HELP NEGATIVES== #place_holder
	* [ ] What Helped the Most: ==ONE BIG HABIT / ACTIVITY to KEEP== #place_holder

<%* tR += thursdayHeading %>
* [ ] Plan Weekend Leisure Time
	* [ ] Hudgins or Games on Friday
	* [ ] Videogames or Tabletop on Saturday

<%* tR += fridayHeading %>
* [ ] Log into client company accounts and clear email, do training, etc.
* [ ] Capture Weekly Accomplishments
* [ ] Friday Night Fun with Our & Hudgins Family (OR!)
* [ ] Friday Night Games with Dave & Kean

<%* tR += saturdayHeading %>
* [ ] Cleaning
	* [ ] Bathroom Surfaces
	* [ ] Toilets
	* [ ] Kitchen Surfaces
* [ ] Laundry
	* [ ] Wash & Dry
	* [ ] Fold
* [ ] Refill pill caddie

<%* tR += sundayHeading %>
* [ ] Review & Sync Calendars
	* [ ] Physical Kitchen Calendar
	* [ ] Outlook
	* [ ] Gmail
* [ ] Move last week's notes into month folder
* [ ] Prepare Next Week's Note

# Time Tracking
## Weekly Summary
```dataviewjs
// Get the current file path (assuming it's a weekly note)
const currentFile = dv.current();
const weekPath = currentFile.file.path.replace('.md', '');

// Extract the date from the weekly note path (assuming format like "Week of 2025-05-05")
const dateMatch = weekPath.match(/Week of (\d{4}-\d{2}-\d{2})/);
if (!dateMatch) {
  dv.paragraph("Could not extract date from weekly note path");
  return;
}

const mondayDate = window.moment(dateMatch[1], "YYYY-MM-DD");

// Helper functions for date and path handling
function getDailyNotePath(date) {
  const year = date.format("YYYY");
  const monthName = date.format("MM-MMMM");
  const formattedDate = date.format("YYYY-MM-DD");
  return `${year}/${monthName}/${formattedDate}`;
}

// Get paths for all days in this week
const dailyPaths = [];
for (let i = 0; i < 7; i++) {
  const dayDate = mondayDate.clone().add(i, 'days');
  const dayPath = getDailyNotePath(dayDate);
  dailyPaths.push(dayPath);
}

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

// Aggregate time data from multiple notes
async function aggregateTimeLogs(notePaths) {
  const result = {
    tagHours: {},
    rawData: [],
    totalHours: 0,
    noteData: {} // Data organized by note
  };
  
  try {
    for (const notePath of notePaths) {
      try {
        // Try to load the note content
        const noteContent = await dv.io.load(notePath + ".md");
        
        // Parse the time log
        const timeLog = parseTimeLog(noteContent);
        
        // Add to aggregated data
        for (const tag in timeLog.tagHours) {
          if (!result.tagHours[tag]) {
            result.tagHours[tag] = 0;
          }
          result.tagHours[tag] += timeLog.tagHours[tag];
        }
        
        // Add raw data with note reference
        for (const entry of timeLog.rawData) {
          result.rawData.push({
            ...entry,
            notePath
          });
        }
        
        // Add to total hours
        result.totalHours += timeLog.totalHours;
        
        // Store data by note
        result.noteData[notePath] = timeLog;
      } catch (error) {
        // Note might not exist, just continue
        continue;
      }
    }
  } catch (error) {
    console.error("Error aggregating time logs:", error);
  }
  
  return result;
}

// Generate chart code for weekly summary
function generateWeeklySummaryChart(timeData) {
  try {
    // Sort tags alphabetically
    const sortedTags = Object.keys(timeData.tagHours).sort();
    
    // Format hours to 1 decimal place
    const formatHours = (hours) => Math.round(hours * 10) / 10;
    
    // Generate a bar chart for weekly summary
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

// Aggregate time data from all daily notes
const timeData = await aggregateTimeLogs(dailyPaths);

// Generate and render the chart
const summaryChart = generateWeeklySummaryChart(timeData);
dv.paragraph(summaryChart);
```

## Daily Breakdown
```dataviewjs
// Get the current file path (assuming it's a weekly note)
const currentFile = dv.current();
const weekPath = currentFile.file.path.replace('.md', '');

// Extract the date from the weekly note path (assuming format like "Week of 2025-05-05")
const dateMatch = weekPath.match(/Week of (\d{4}-\d{2}-\d{2})/);
if (!dateMatch) {
  dv.paragraph("Could not extract date from weekly note path");
  return;
}

const mondayDate = window.moment(dateMatch[1], "YYYY-MM-DD");

// Helper functions for date and path handling
function getDailyNotePath(date) {
  const year = date.format("YYYY");
  const monthName = date.format("MM-MMMM");
  const formattedDate = date.format("YYYY-MM-DD");
  return `${year}/${monthName}/${formattedDate}`;
}

// Get paths for all days in this week
const dailyPaths = [];
for (let i = 0; i < 7; i++) {
  const dayDate = mondayDate.clone().add(i, 'days');
  const dayPath = getDailyNotePath(dayDate);
  dailyPaths.push(dayPath);
}

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

// Aggregate time data from multiple notes
async function aggregateTimeLogs(notePaths) {
  const result = {
    tagHours: {},
    rawData: [],
    totalHours: 0,
    noteData: {} // Data organized by note
  };
  
  try {
    for (const notePath of notePaths) {
      try {
        // Try to load the note content
        const noteContent = await dv.io.load(notePath + ".md");
        
        // Parse the time log
        const timeLog = parseTimeLog(noteContent);
        
        // Add to aggregated data
        for (const tag in timeLog.tagHours) {
          if (!result.tagHours[tag]) {
            result.tagHours[tag] = 0;
          }
          result.tagHours[tag] += timeLog.tagHours[tag];
        }
        
        // Add raw data with note reference
        for (const entry of timeLog.rawData) {
          result.rawData.push({
            ...entry,
            notePath
          });
        }
        
        // Add to total hours
        result.totalHours += timeLog.totalHours;
        
        // Store data by note
        result.noteData[notePath] = timeLog;
      } catch (error) {
        // Note might not exist, just continue
        continue;
      }
    }
  } catch (error) {
    console.error("Error aggregating time logs:", error);
  }
  
  return result;
}

// Generate chart code for daily breakdown
function generateDailyBreakdownChart(timeData) {
  try {
    // Sort tags alphabetically
    const sortedTags = Object.keys(timeData.tagHours).sort();
    
    // Format hours to 1 decimal place
    const formatHours = (hours) => Math.round(hours * 10) / 10;
    
    // Get days in order
    const days = Object.keys(timeData.noteData).sort();
    const dayNames = days.map(day => {
      // Extract the day name from the path (assuming format like "2025/05-May/2025-05-08")
      const match = day.match(/(\d{4}-\d{2}-\d{2})$/);
      const dateStr = match ? match[1] : day;
      // Convert to day name (e.g., "Monday")
      const date = window.moment(dateStr, "YYYY-MM-DD");
      return date.format("dddd");
    });
    
    // Create labels for each day-tag combination
    const labels = [];
    for (const tag of sortedTags) {
      labels.push(tag);
    }
    
    // Create series for each day
    const daySeries = dayNames.map((dayName, index) => {
      const day = days[index];
      const dayData = timeData.noteData[day] || { tagHours: {} };
      
      return {
        title: dayName,
        data: sortedTags.map(tag => {
          return dayData.tagHours[tag] ? formatHours(dayData.tagHours[tag]) : 0;
        })
      };
    });
    
    return `\`\`\`chart
type: bar
labels: [${sortedTags.map(tag => `"${tag}"`).join(', ')}]
series:
${daySeries.map(series => `  - data: [${series.data.join(', ')}]`).join('\n')}
width: 100%
labelColors: true
legend: false
\`\`\``;
  } catch (error) {
    console.error("Error generating chart code:", error);
    return "```\nError generating chart\n```";
  }
}

// Aggregate time data from all daily notes
const timeData = await aggregateTimeLogs(dailyPaths);

// Generate and render the chart
const breakdownChart = generateDailyBreakdownChart(timeData);
dv.paragraph(breakdownChart);
```
