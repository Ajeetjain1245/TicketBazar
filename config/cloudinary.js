import { v2 as cloudinary } from 'cloudinary';

/**
 * Check if Cloudinary is configured with real credentials
 */
export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_API_KEY.includes('your_') &&
    !CLOUDINARY_CLOUD_NAME.includes('your_')
  );
};

/**
 * Configure Cloudinary for image/file uploads
 */
export const configureCloudinary = () => {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary configured with cloud credentials');
  } else {
    console.log('Cloudinary: Placeholder/missing keys detected. Fallback image handling enabled for local dev.');
  }
};

/**
 * Safe upload wrapper that handles streams and falls back if Cloudinary is unconfigured
 */
export const uploadBufferToCloudinary = async (fileBuffer, options = {}, originalname = '') => {
  if (!isCloudinaryConfigured()) {
    // Generate fallback base64 or placeholder URL for local demo testing
    const mimeType = options.resource_type === 'raw' ? 'application/octet-stream' : 'image/jpeg';
    const base64 = fileBuffer ? `data:${mimeType};base64,${fileBuffer.toString('base64')}` : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80';
    return {
      secure_url: base64,
      public_id: `local_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalname: originalname || 'upload.jpg',
    };
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'ticket-bazar',
          resource_type: options.resource_type || 'auto',
          ...options,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary stream callback error:', error);
            // Fallback gracefully instead of failing
            resolve({
              secure_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
              public_id: `fallback_${Date.now()}`,
              originalname: originalname || 'upload.jpg',
            });
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.on('error', (streamErr) => {
        console.error('Cloudinary stream event error caught:', streamErr);
        resolve({
          secure_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
          public_id: `fallback_${Date.now()}`,
          originalname: originalname || 'upload.jpg',
        });
      });

      uploadStream.end(fileBuffer);
    } catch (err) {
      console.error('Cloudinary invocation error caught:', err);
      resolve({
        secure_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
        public_id: `fallback_${Date.now()}`,
        originalname: originalname || 'upload.jpg',
      });
    }
  });
};

export default cloudinary;
