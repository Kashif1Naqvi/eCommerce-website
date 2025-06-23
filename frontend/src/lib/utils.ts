export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  
  // If the image path already includes the base URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base URL
return `${baseUrl}${imagePath}`;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};