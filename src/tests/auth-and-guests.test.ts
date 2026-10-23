import { describe, it, expect } from 'vitest';
import { GuestImportRowSchema } from '@/lib/validation/schemas';

describe('Guest Deduplication & Validation Engine', () => {
  it('detects duplicate guests by normalized email or full name', () => {
    const existingGuests = [
      { firstName: 'Dattatray', lastName: 'Patil', email: 'dattatray.patil@gmail.com', phone: '+919822111223' },
      { firstName: 'Sunita', lastName: 'Kulkarni', email: 'sunita.k@yahoo.com', phone: '+919822445566' },
    ];

    function checkDuplicate(newGuest: { firstName: string; lastName: string; email?: string; phone?: string }) {
      const emailMatch = newGuest.email && existingGuests.some(
        (g) => g.email.toLowerCase() === newGuest.email!.trim().toLowerCase()
      );
      const nameMatch = existingGuests.some(
        (g) =>
          g.firstName.toLowerCase() === newGuest.firstName.trim().toLowerCase() &&
          g.lastName.toLowerCase() === newGuest.lastName.trim().toLowerCase()
      );
      const phoneMatch = newGuest.phone && existingGuests.some((g) => g.phone === newGuest.phone);

      return Boolean(emailMatch || nameMatch || phoneMatch);
    }

    expect(checkDuplicate({ firstName: 'Dattatray', lastName: 'Patil' })).toBe(true);
    expect(checkDuplicate({ firstName: 'Datta', lastName: 'P', email: 'DATTATRAY.PATIL@GMAIL.COM' })).toBe(true);
    expect(checkDuplicate({ firstName: 'Rohan', lastName: 'Deshmukh', email: 'rohan.d@gmail.com' })).toBe(false);
  });

  it('validates CSV guest import rows strictly with Zod', () => {
    const validRow = {
      firstName: 'Ananya',
      lastName: 'Sharma',
      email: 'ananya@example.com',
      household: 'Sharma Family',
      dietary: 'Vegetarian',
      plusOneAllowed: true,
    };
    expect(() => GuestImportRowSchema.parse(validRow)).not.toThrow();

    const invalidRow = {
      // missing firstName and lastName
      email: 'not-an-email',
    };
    expect(() => GuestImportRowSchema.parse(invalidRow)).toThrow();
  });
});
