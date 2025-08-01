export const formatSlug = (text: string): string => {
  // Only convert to lowercase for the URL
  return text.trim().toLowerCase().replace(/\s+/g, '-');
};

export const decodeSlug = (slug: string, preserveCase = false): string => {
  if (!preserveCase) {
    return slug.toLowerCase().replace(/-/g, ' ');
  }

  // Split by hyphens and capitalize each word
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

