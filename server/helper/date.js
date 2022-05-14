function getFirstDateOfMonth(dateStr) {
  const date = new Date(dateStr);
  const firstDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), 1);
  return firstDate;
}

function getLastDateOfMonth(dateStr) {
  const date = new Date(dateStr);
  const lastDate = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
  lastDate.setHours(23, 59, 59, 999);
  return lastDate;
}

module.exports = { getFirstDateOfMonth, getLastDateOfMonth };
