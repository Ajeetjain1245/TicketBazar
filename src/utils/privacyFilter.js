/**
 * Privacy filter to mask sensitive contact info (emails, phone numbers)
 * Used as a secondary safeguard on the frontend.
 */
export const maskSensitiveInfo = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Regex for emails 
  const emailRegex = /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+)\s*\.\s*([a-zA-Z]{2,})/g;
  
  // Regex for phone numbers (matches various formats globally)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
  return text
    .replace(emailRegex, '********@***.***')
    .replace(phoneRegex, '**********');
};

export default maskSensitiveInfo;
