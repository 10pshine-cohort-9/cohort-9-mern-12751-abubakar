const sanitizeHtml = require('sanitize-html');

/**
 * Cleans HTML content to prevent XSS attacks.
 * Allows only safe tags and attributes.
 */
const clean = (dirty) => {
  return sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'u', 's', 'blockquote'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
    },
  });
};

module.exports = { clean };