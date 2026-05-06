/**
 * Privacy filter to mask sensitive contact info (emails, phone numbers)
 * Used to prevent off-platform transactions and protect user privacy.
 */
export const maskSensitiveInfo = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Regex for emails (handles spaces around @ and dots)
  const emailRegex = /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+)\s*\.\s*([a-zA-Z]{2,})/g;
  
  // Regex for phone numbers
  // Catches: 1234567890, 123-456-7890, (123) 456-7890, +91 1234567890, 123.456.7890 etc.
  // Look for sequences of 7 to 15 digits with optional separators
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  
  return text
    .replace(emailRegex, '[Email Masked]')
    .replace(phoneRegex, '[Number Masked]');
};

export default {
  maskSensitiveInfo
};
