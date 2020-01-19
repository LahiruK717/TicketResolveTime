/**
 * Find resolve time for a Ticket with a given weekly schedule
 */
find = (submittedTime, schedule) => {
  // Validate empty or null inputs
  if (!submittedTime || !schedule) {
    console.log("Invalid inputs");
    return;
  }

  const dayOfNow = submittedTime.getDay();
  const defaultResolveTime = 180; // 3 Hours of time
  let timeLeftToResolve = defaultResolveTime;

  const reArrangedSchedule = getReArrangedSchedule(dayOfNow, schedule);

  return getResolveTime(submittedTime, timeLeftToResolve, reArrangedSchedule);
};

/**
 * Calculate resolve time for the ticket
 */
getResolveTime = (
  submittedTime,
  timeLeftToResolve,
  schedule,
  carryForward = false
) => {
  // Get next schedule for next available day
  const availableSchedule = schedule.find(x => x.open == true);
  const indexOfSchedule = schedule.indexOf(availableSchedule);
  let offDays = 0;

  // Skip non-working days
  for (let index = 0; index < indexOfSchedule; index++) {
    schedule.shift();
    offDays++;
  }

  var nextDate = new Date(submittedTime);
  nextDate.setDate(nextDate.getDate() + offDays);

  const openTimeInMinutes = getTimeInMinutes(availableSchedule.open_at);
  const closeTimeInMinutes = getTimeInMinutes(availableSchedule.close_at);
  let submittedTimeInMinutes = getTimeInMinutes(
    `${submittedTime.getHours()}:${submittedTime.getMinutes()}`
  );
  let resolveTimeInMinutes;
  let remainingTimeInMinutes;

  if (carryForward == true) {
    submittedTimeInMinutes = openTimeInMinutes;
  }

  // Set openTime as submitted time on next day
  if (carryForward == true || offDays > 0) {
    submittedTimeInMinutes = openTimeInMinutes;
  }

  // Check if it can resolve before closing
  if (submittedTimeInMinutes + timeLeftToResolve <= closeTimeInMinutes) {
    if (submittedTimeInMinutes >= openTimeInMinutes) {
      resolveTimeInMinutes = submittedTimeInMinutes + timeLeftToResolve;
    } else {
      resolveTimeInMinutes = openTimeInMinutes + timeLeftToResolve;
    }

    const resolveHours = Math.floor(resolveTimeInMinutes / 60);
    const resolveMinutes = resolveTimeInMinutes % 60;
    const ticketResolveDateTime = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      resolveHours,
      resolveMinutes
    );

    console.log(`Ticket expiry DateTime is ${ticketResolveDateTime}`);
    return ticketResolveDateTime;
  } else {
    // Remaining time needs to carry forward to next available schedule

    if (submittedTimeInMinutes >= closeTimeInMinutes) {
      remainingTimeInMinutes = timeLeftToResolve;
    } else {
      remainingTimeInMinutes =
        submittedTimeInMinutes + timeLeftToResolve - closeTimeInMinutes;
    }

    // Remove current day from the schedule
    schedule.shift();
    var nextDate = new Date(submittedTime);
    nextDate.setDate(nextDate.getDate() + 1);

    // Recursive call to getResolveTime
    getResolveTime(
      new Date(
        nextDate.getFullYear(),
        nextDate.getMonth(),
        nextDate.getDate(),
        schedule[0].open_at ? parseInt(schedule[0].open_at.split(":")[0]) : 0,
        schedule[0].open_at ? parseInt(schedule[0].open_at.split(":")[1]) : 0
      ),
      remainingTimeInMinutes,
      schedule,
      true
    );
  }
};

/**
 * Re-arrange schedule from today to next 7 days
 */
getReArrangedSchedule = (dayOfNow, schedule) => {
  const remainingSchedule = schedule.slice(dayOfNow, schedule.length);
  const previousSchedule = schedule.slice(0, dayOfNow);

  return remainingSchedule.concat(previousSchedule);
};

/**
 * Get time in minutes for a given day
 */
getTimeInMinutes = time => {
  const timeHours = parseInt(time.split(":")[0]);
  const timeMinutes = parseInt(time.split(":")[1]);

  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let requiredTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    timeHours,
    timeMinutes
  );

  let diff = requiredTime - today;
  return Math.round(diff / (1000 * 60));
};

const schedule = [
  { open: false, open_at: "", close_at: "", d: "Sun" },
  { open: true, open_at: "09:00", close_at: "18:00", d: "Mon" },
  { open: true, open_at: "09:00", close_at: "18:00", d: "Tue" },
  { open: true, open_at: "09:00", close_at: "18:00", d: "Wed" },
  { open: true, open_at: "09:00", close_at: "18:00", d: "Thu" },
  { open: true, open_at: "09:00", close_at: "17:00", d: "Fri" },
  { open: false, open_at: "", close_at: "", d: "Sat" }
];

// find(new Date("2020-01-17T08:00:00+0800"), schedule);
find(new Date("2020-01-17T16:00:00+0800"), schedule);
// find(new Date("2020-01-20T16:00:00"), schedule);
