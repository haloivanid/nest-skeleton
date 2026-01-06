import time from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

time.extend(utc);
time.extend(timezone);

export { time };
