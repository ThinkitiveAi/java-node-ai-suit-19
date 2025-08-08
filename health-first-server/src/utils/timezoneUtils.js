const moment = require('moment-timezone');

/**
 * Convert local time to UTC
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:mm format
 * @param {string} timezone - Timezone (e.g., 'America/New_York')
 * @returns {Date} UTC date object
 */
const localToUTC = (date, time, timezone) => {
  const localDateTime = moment.tz(`${date} ${time}`, timezone);
  return localDateTime.utc().toDate();
};

/**
 * Convert UTC time to local timezone
 * @param {Date} utcDate - UTC date object
 * @param {string} timezone - Target timezone
 * @returns {Object} Local date and time
 */
const utcToLocal = (utcDate, timezone) => {
  const localDateTime = moment(utcDate).tz(timezone);
  return {
    date: localDateTime.format('YYYY-MM-DD'),
    time: localDateTime.format('HH:mm'),
    timezone: timezone
  };
};

/**
 * Generate recurring dates based on pattern
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} pattern - Recurrence pattern (daily, weekly, monthly)
 * @returns {Array} Array of dates
 */
const generateRecurringDates = (startDate, endDate, pattern) => {
  const dates = [];
  let currentDate = moment(startDate);
  const endMoment = moment(endDate);

  while (currentDate.isSameOrBefore(endMoment)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    
    switch (pattern) {
      case 'daily':
        currentDate.add(1, 'day');
        break;
      case 'weekly':
        currentDate.add(1, 'week');
        break;
      case 'monthly':
        currentDate.add(1, 'month');
        break;
      default:
        throw new Error('Invalid recurrence pattern');
    }
  }

  return dates;
};

/**
 * Check if two time ranges overlap
 * @param {string} start1 - Start time 1 (HH:mm)
 * @param {string} end1 - End time 1 (HH:mm)
 * @param {string} start2 - Start time 2 (HH:mm)
 * @param {string} end2 - End time 2 (HH:mm)
 * @returns {boolean} True if overlapping
 */
const isTimeOverlapping = (start1, end1, start2, end2) => {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  return (
    (start1Minutes < end2Minutes && end1Minutes > start2Minutes) ||
    (start2Minutes < end1Minutes && end2Minutes > start1Minutes)
  );
};

/**
 * Convert time string to minutes
 * @param {string} time - Time in HH:mm format
 * @returns {number} Minutes since midnight
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:mm format
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Get timezone offset in minutes
 * @param {string} timezone - Timezone
 * @param {Date} date - Date to get offset for
 * @returns {number} Offset in minutes
 */
const getTimezoneOffset = (timezone, date = new Date()) => {
  return moment.tz(date, timezone).utcOffset();
};

/**
 * Validate timezone
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} True if valid
 */
const isValidTimezone = (timezone) => {
  return moment.tz.zone(timezone) !== null;
};

/**
 * Get available timezones
 * @returns {Array} Array of timezone names
 */
const getAvailableTimezones = () => {
  return moment.tz.names();
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} timezone - Target timezone
 * @param {string} format - Moment.js format string
 * @returns {string} Formatted date string
 */
const formatDate = (date, timezone, format = 'YYYY-MM-DD HH:mm') => {
  return moment(date).tz(timezone).format(format);
};

/**
 * Get business hours for a specific date and timezone
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} timezone - Timezone
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {Object} Business hours in UTC
 */
const getBusinessHoursUTC = (date, timezone, startTime, endTime) => {
  const startUTC = localToUTC(date, startTime, timezone);
  const endUTC = localToUTC(date, endTime, timezone);
  
  return {
    start: startUTC,
    end: endUTC
  };
};

/**
 * Check if date is in the past
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if in the past
 */
const isDateInPast = (date) => {
  return moment(date).isBefore(moment(), 'day');
};

/**
 * Check if date is today
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if today
 */
const isDateToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Get next business day
 * @param {string} timezone - Timezone
 * @returns {string} Next business day in YYYY-MM-DD format
 */
const getNextBusinessDay = (timezone) => {
  let nextDay = moment().tz(timezone).add(1, 'day');
  
  // Skip weekends
  while (nextDay.day() === 0 || nextDay.day() === 6) {
    nextDay.add(1, 'day');
  }
  
  return nextDay.format('YYYY-MM-DD');
};

module.exports = {
  localToUTC,
  utcToLocal,
  generateRecurringDates,
  isTimeOverlapping,
  timeToMinutes,
  minutesToTime,
  getTimezoneOffset,
  isValidTimezone,
  getAvailableTimezones,
  formatDate,
  getBusinessHoursUTC,
  isDateInPast,
  isDateToday,
  getNextBusinessDay
}; 