import { Injectable } from '@nestjs/common';

@Injectable()
export class HappyBirthdayUtilsService {
  public isBirthdayDateValid(day: number, month: number): boolean {
    if (month < 1 || month > 12) {
      return false;
    }

    const maxDaysInMonth = this.getMaxDaysInMonth(month);
    if (day < 1 || day > maxDaysInMonth) {
      return false;
    }

    return true;
  }

  public convertToGMT0(time: string, timezone: number): string {
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const date = new Date(Date.UTC(0, 0, 0, hours, minutes, seconds));
    const gmt0Date = new Date(date.getTime() - timezone * 3600 * 1000);

    const gmt0Hours = String(gmt0Date.getUTCHours()).padStart(2, '0');
    const gmt0Minutes = String(gmt0Date.getUTCMinutes()).padStart(2, '0');
    const gmt0Seconds = String(gmt0Date.getUTCSeconds()).padStart(2, '0');

    return `${gmt0Hours}:${gmt0Minutes}:${gmt0Seconds}`;
  }

  private getMaxDaysInMonth(month: number): number {
    switch (month) {
      case 2:
        return 29;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      default:
        return 31;
    }
  }
}
