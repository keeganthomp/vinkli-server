import { User, Booking } from '@type/db';
import { getArtistPrices } from './stripe';

export const getBookingDuration = (booking: Booking): number => {
  if (booking.type === 'CONSULTATION') {
    return 1;
  }
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

// returns price in cents
export const getAmountDue = async (
  user: User,
  booking: Booking,
): Promise<number | undefined | null> => {
  const { hourlyRatePrice, consultationFeePrice } = await getArtistPrices(user);
  const duration = getBookingDuration(booking);
  switch (booking.type) {
    case 'TATTOO_SESSION':
      return (hourlyRatePrice?.unit_amount || 0) * duration;
    case 'CONSULTATION':
      return consultationFeePrice?.unit_amount;
    default:
      return null;
  }
};
