// Deadline math for the KEP workflow ("2 Working Days", "3 Working Days",
// "Max 10 Working Days", etc). Only weekends are excluded — national/
// university holidays are not accounted for, since that requires a
// maintained calendar. Plug a holiday table into `isWorkingDay` before
// relying on this for legally binding deadline enforcement.
export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

export function addWorkingDays(start: Date, workingDays: number): Date {
  const result = new Date(start);
  let remaining = workingDays;

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) {
      remaining -= 1;
    }
  }

  return result;
}

export function isOverdue(deadline: Date | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}
