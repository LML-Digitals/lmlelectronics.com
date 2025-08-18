export function getOfficeEmail (location?: string): string {
  switch (location) {
  case 'Seattle':
    return 'LML Repair <seattle@lmlrepair.com>';
  case 'West Seattle':
    return 'LML Repair <westseattle@lmlrepair.com>';
  case 'North Seattle':
    return 'LML Repair <northseattle@lmlrepair.com>';
  default:
    return 'LML Repair <seattle@lmlrepair.com>';
  }
}
