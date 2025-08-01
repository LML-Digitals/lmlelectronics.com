const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReferralCode(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}
