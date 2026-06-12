export const backendBaseUrl = 'http://localhost:5000';

export const normalizeImageUrl = (src) => {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${backendBaseUrl}${src.startsWith('/') ? src : `/${src}`}`;
};

export const getProductImageUrl = (product) => {
  if (!product) return '/placeholder.svg';
  const source = product.image_url || product.images?.[0];
  return source ? normalizeImageUrl(source) : '/placeholder.svg';
};

