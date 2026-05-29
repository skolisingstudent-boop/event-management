const validateEvent = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (data.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }
  
  if (!data.event_date || typeof data.event_date !== 'string') {
    errors.push('Event date is required and must be a valid date');
  } else {
    const date = new Date(data.event_date);
    if (isNaN(date.getTime())) {
      errors.push('Event date must be a valid ISO date string');
    }
  }
  
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  } else if (data.description && data.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (data.location && typeof data.location !== 'string') {
    errors.push('Location must be a string');
  } else if (data.location && data.location.length > 255) {
    errors.push('Location must be 255 characters or less');
  }
  
  return errors;
};

module.exports = { validateEvent };
