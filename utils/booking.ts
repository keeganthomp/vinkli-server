import { Booking } from 'db/types';

export const getBookingDuration = (booking: Booking) => {
  if (!booking.startDate || !booking.endDate) {
    return 0;
  }
  const startDateObj = new Date(booking.startDate);
  const endDateObj = new Date(booking.endDate);
  const durationInMilliseconds = endDateObj.getTime() - startDateObj.getTime();
  let durationInHours = durationInMilliseconds / (60 * 60 * 1000);
  durationInHours = Math.floor(durationInHours * 10) / 10; // round down to one decimal place
  return durationInHours;
};
