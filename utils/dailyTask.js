const { getEventData, getNewEventData } = require("./getEventData");

const refreshHour = 9;
const refreshMinute = 10;

exports.dailyTask = () => {
  console.log("dailyTask Running!");
  const currentDate = new Date();
  const targetTime = new Date(currentDate);
  targetTime.setHours(refreshHour, refreshMinute, 0, 0);

  let timeDiff = targetTime - currentDate;
  if (timeDiff < 0) {
    timeDiff += 24 * 60 * 60 * 1000;
  }

  setTimeout(() => {
    // getEventData();
    setInterval(() => {
      getNewEventData();
    }, 24 * 60 * 60 * 1000);
  }, timeDiff);
};
