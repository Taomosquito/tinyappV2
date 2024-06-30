// Helper Function That does what the name states
const getUserByEmail = (email, users) => {
  for (let userID in users) {

    if (users[userID]['email'] === email) {
      return users[userID];
    }
  }
};

module.exports = { getUserByEmail };