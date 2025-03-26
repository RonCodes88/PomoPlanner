export const validateTime = (timeStr) => {
    if (!timeStr) return true; // Empty is allowed as it defaults to "No time set"
  
    // Check for valid time format with AM or PM
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
    return timeRegex.test(timeStr);
  };
  
export const timeToMinutes = (timeStr) => {
    // Handle "No time set" case
    if (timeStr === "No time set") return Number.MAX_SAFE_INTEGER; // Put these at the end
  
    // Extract hours, minutes, and AM/PM
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)$/);
    if (!match) return Number.MAX_SAFE_INTEGER; // Invalid format goes to the end
  
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);
  
    // Convert to 24-hour format for proper sorting
    if (period.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    } else if (period.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }
  
    return hours * 60 + minutes;
};