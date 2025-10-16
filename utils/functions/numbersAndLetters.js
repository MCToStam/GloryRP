const moment = require("moment");

function getDateTs(date, style, style2) {
  const dateMomented = typeof date === "object" ? date : new Date(moment(date));
  const milliseconds = dateMomented.getTime() / 1000;
  const milliTrunced = Math.trunc(milliseconds);

  if (isNaN(milliTrunced)) {
    return "Date invalide";
  }

  if (style2) {
    return `<t:${milliTrunced}:${style}> • <t:${milliTrunced}:${style2}>`;
  } else {
    return `<t:${milliTrunced}:${style}>`;
  }
}

async function toTimeStamp(date) {
  const isDate = typeof date === "object" ? date : new Date();
  return Math.trunc((await isDate.getTime()) / 1000);
}

module.exports = { getDateTs, toTimeStamp };
