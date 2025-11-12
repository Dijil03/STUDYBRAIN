export const saveUserSession = (user = {}) => {
  if (!user || typeof user !== 'object') {
    return;
  }

  const userId = user.id || user._id;
  const username = user.username || user.firstName || 'User';
  const email = user.email || '';
  const profilePicture = user.profilePicture || user.avatar || '';
  const hasCompletedPersonalization = !!user.hasCompletedPersonalization;
  const personalization = user.personalization || {};

  if (userId) {
    localStorage.setItem('userId', userId);
  }
  localStorage.setItem('username', username);
  if (email) {
    localStorage.setItem('userEmail', email);
  }
  if (profilePicture) {
    localStorage.setItem('userAvatar', profilePicture);
  }
  localStorage.setItem(
    'hasCompletedPersonalization',
    hasCompletedPersonalization ? 'true' : 'false'
  );
  localStorage.setItem('userPersonalization', JSON.stringify(personalization));
};

export const clearUserSession = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userAvatar');
  localStorage.removeItem('hasCompletedPersonalization');
  localStorage.removeItem('userPersonalization');
};

