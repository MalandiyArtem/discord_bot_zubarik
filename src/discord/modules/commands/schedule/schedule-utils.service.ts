import { Injectable } from '@nestjs/common';
import { IDateParams } from './interfaces/date-params.interface';

@Injectable()
export class ScheduleUtilsService {
  public isDateParamsValid(dateParams: IDateParams, timezone: number): boolean {
    try {
      const currentDate = new Date().getTime();
      const scheduledTime =
        this.getTimestamp(dateParams) -
        this.convertHoursToMilliseconds(timezone) +
        this.convertHoursToMilliseconds(this.getCurrentTimezoneOffset());

      if (scheduledTime <= currentDate) {
        throw new Error('Invalid date');
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  public getTimestamp(dateParams: IDateParams): number {
    try {
      const month = this.getStringFormattedTime(dateParams.month);
      const day = this.getStringFormattedTime(dateParams.day);
      const hours = this.getStringFormattedTime(dateParams.hours);
      const minutes = this.getStringFormattedTime(dateParams.minutes);
      const seconds = this.getStringFormattedTime(dateParams.seconds);

      const stringTime = `${dateParams.year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      const timestamp = new Date(stringTime).getTime();

      if (Number.isNaN(timestamp)) {
        throw new Error('Invalid date');
      }

      return timestamp;
    } catch (e) {
      throw new Error('Invalid date');
    }
  }

  public getScheduledDate(dateParams: IDateParams, timezone: number): Date {
    const currentDate = new Date().getTime();
    const scheduledTime =
      this.getTimestamp(dateParams) -
      this.convertHoursToMilliseconds(timezone) +
      this.convertHoursToMilliseconds(this.getCurrentTimezoneOffset());

    const deltaTime = scheduledTime - currentDate;
    const date = new Date(currentDate + deltaTime);
    return date;
  }

  public getReadableDate(scheduledDate: IDateParams): string {
    const day = this.getStringFormattedTime(scheduledDate.day);
    const month = this.getStringFormattedTime(scheduledDate.month);
    const year = scheduledDate.year;
    const hours = this.getStringFormattedTime(scheduledDate.hours);
    const minutes = this.getStringFormattedTime(scheduledDate.minutes);
    const seconds = this.getStringFormattedTime(scheduledDate.seconds);

    const readableDate = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    return readableDate;
  }

  private getStringFormattedTime(time: number): string {
    return time < 10 ? String(time).padStart(2, '0') : String(time);
  }
  private convertHoursToMilliseconds(hours: number) {
    return hours * 60 * 60 * 1000;
  }
  private getCurrentTimezoneOffset() {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset();

    const hoursOffset = Math.abs(Math.floor(timeZoneOffset / 60));

    return timeZoneOffset > 0 ? hoursOffset * -1 : hoursOffset;
  }
}
