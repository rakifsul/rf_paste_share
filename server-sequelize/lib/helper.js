module.exports.textToMS = function (textTime) {
  //200
  if (textTime == "1 Day") {
    return 24 * 60 * 60 * 1000;
  } else if (textTime == "12 Hours") {
    return 12 * 60 * 60 * 1000;
  } else if (textTime == "3 Hours") {
    return 3 * 60 * 60 * 1000;
  } else if (textTime == "30 Minutes") {
    return 30 * 60 * 1000;
  } else if (textTime == "2 Minutes") {
    return 2 * 60 * 1000;
  }
};

module.exports.daysBetween = function (dari, ke) {
  //200
  return Math.floor(
    (new Date(
      ke.getFullYear(),
      ke.getMonth(),
      ke.getDate())).getTime() -
    (new Date(
      dari.getFullYear(),
      dari.getMonth(),
      dari.getDate())).getTime() /
    (1000 * 60 * 60 * 24)
  );
};