// This script makes the dateUtils functions available to Templater

// Define all functions directly in this file for Templater
function getWeekMonth(mondayDate) {
  const mondayMonth = mondayDate.month();
  const mondayYear = mondayDate.year();
  
  // Get the last day of the month that contains Monday
  const lastDayOfMonth = window.moment([mondayYear, mondayMonth]).endOf('month');
  
  // If the last day of the month is Monday (1) or Tuesday (2)
  if (lastDayOfMonth.day() === 1 || lastDayOfMonth.day() === 2) {
    // Check if Monday is the last Monday or Tuesday of the month
    if (mondayDate.date() > lastDayOfMonth.date() - 7) {
      // This week belongs to the next month
      const nextMonth = mondayDate.clone().add(1, 'month');
      return nextMonth;
    }
  }
  
  // Otherwise, the week belongs to the month its Monday is in
  return mondayDate.clone();
}

function getWeeksInMonth(year, month) {
  const weeks = [];
  
  // Find the first Monday of the month
  let firstMonday = window.moment([year, month, 1]);
  while (firstMonday.day() !== 1) {
    firstMonday.add(1, 'day');
  }
  
  // Check if the last week of the previous month belongs to this month
  const prevMonth = window.moment([year, month, 1]).subtract(1, 'day');
  const prevMonthLastDay = prevMonth.clone().endOf('month');
  
  // If the last day of the previous month is Monday (1) or Tuesday (2)
  if (prevMonthLastDay.day() === 1 || prevMonthLastDay.day() === 2) {
    // Find the Monday of the last week of the previous month
    let lastMondayOfPrevMonth = prevMonthLastDay.clone();
    while (lastMondayOfPrevMonth.day() !== 1) {
      lastMondayOfPrevMonth.subtract(1, 'day');
    }
    
    // Check if this week belongs to the current month
    const weekMonth = getWeekMonth(lastMondayOfPrevMonth);
    if (weekMonth.month() === month && weekMonth.year() === year) {
      weeks.push(lastMondayOfPrevMonth);
    }
  }
  
  // Add all Mondays in the current month
  let currentMonday = firstMonday.clone();
  while (currentMonday.month() === month) {
    // Check if this week belongs to this month
    const weekMonth = getWeekMonth(currentMonday);
    if (weekMonth.month() === month && weekMonth.year() === year) {
      weeks.push(currentMonday.clone());
    }
    currentMonday.add(7, 'days');
  }
  
  return weeks;
}

function getMondayOfWeek(date) {
  const monday = date.clone().startOf('week').add(1, 'days'); // Start of week is Sunday, so add 1 day to get Monday
  return monday;
}

function getDailyNotePath(date) {
  const year = date.format("YYYY");
  const monthName = date.format("MM-MMMM");
  const formattedDate = date.format("YYYY-MM-DD");
  return `${year}/${monthName}/${formattedDate}`;
}

function getWeeklyNotePath(mondayDate) {
  const year = mondayDate.format("YYYY");
  const monthName = mondayDate.format("MM-MMMM");
  const formattedDate = mondayDate.format("YYYY-MM-DD");
  return `${year}/${monthName}/Week of ${formattedDate}`;
}

function getMonthlyNotePath(date) {
  const year = date.format("YYYY");
  const monthName = date.format("MM-MMMM");
  const month = date.format("YYYY-MM");
  return `${year}/${monthName}/${month}`;
}

function createDayHeading(date, dayName) {
  const path = getDailyNotePath(date);
  return `# [[${path}|${dayName}]]`;
}

// Export a function that returns all the utility functions
module.exports = function() {
  return {
    getWeekMonth,
    getWeeksInMonth,
    getMondayOfWeek,
    getDailyNotePath,
    getWeeklyNotePath,
    getMonthlyNotePath,
    createDayHeading
  };
};
