// Function to generate a random SKU (6 numbers + 1 letter)
export const generateSKU = () => {
  // Generate 6 random numbers
  const numbers = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');

  // Generate 1 random letter (a-z or A-Z)
  const alphabets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = alphabets[Math.floor(Math.random() * alphabets.length)];

  return numbers + randomLetter;
};
