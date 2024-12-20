export function parseDate(
  unsafeValue: string,
  isFutureDate?: boolean,
): Date | null {
  // Step 1: Clean the input value
  const cleanedValue = unsafeValue
    .replace(/\s/g, '') // Remove all spaces
    .replace(/[\/\-]/g, '.') // Replace slashes and hyphens with dots
    .replace(/[^a-zA-Z0-9.]/g, ''); // Remove all non-alphanumeric characters except dots

  // Step 2: Extract day, month, and year using regex
  const dateParts = cleanedValue.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);

  if (!dateParts) {
    return null; // Return null if the format is invalid
  }

  // Step 3: Parse the extracted parts into integers
  const day = parseInt(dateParts[1], 10);
  const month = parseInt(dateParts[2], 10) - 1; // Months are 0-based in JavaScript Date
  const year = parseInt(dateParts[3], 10);

  const today = new Date();
  const currentYear = today.getFullYear();
  const date = new Date(year, month, day);

  if (isFutureDate && date < today) {
    return null;
  } else if (!isFutureDate && (year < 1870 || year > currentYear)) {
    return null; // Return null if the year is out of range
  }

  // Step 5: Validate the parsed values
  if (
    date.getDate() === day &&
    date.getMonth() === month &&
    date.getFullYear() === year
  ) {
    return date;
  }

  return null; // Return null if the date is invalid
}
