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
