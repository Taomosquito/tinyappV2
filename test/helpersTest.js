const { assert } = require('chai');
const { 
  getUserByEmail, // +
  generateRandomString, // + 
  urlsForUser 
} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

  // Sample urlDatabase for testing
  const urlDatabase = {
    'shortURL1': { longURL: 'http://example.com', userID: 'user1' },
    'shortURL2': { longURL: 'http://test.com', userID: 'user2' },
    'shortURL3': { longURL: 'http://another.com', userID: 'user1' },
    // Add more URLs for testing other scenarios if needed
  };

describe('Testing helper functions: getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined if the user cannot be found', function() {
    const user = getUserByEmail("users@example.com", testUsers)
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});

describe("Testing helper functions: generateRandomString", () => {
  it('should return a string with less than 6 characters', function() {
    const randomString = generateRandomString();
    console.log(randomString);

    // Assert that the string length is less than 6
    assert.isAtMost(randomString.length, 6, 'String length should be less than 6');
  });
});

describe("Testing helper functions: urlsForUser", () => {
  it('should return urls that belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    // Define expected output
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });
  
  it('should return URLs that belong to the specified user', function() {
        const userID = 'user1';
        const expectedResult = {
            'shortURL1': { longURL: 'http://example.com', userID: 'user1' },
            'shortURL3': { longURL: 'http://another.com', userID: 'user1' }
        };

        const result = urlsForUser(userID, urlDatabase);
        assert.deepEqual(result, expectedResult, 'Returned URLs should match expected URLs for user1');
  });

  it('should return an empty object if urlDatabase does not contain any URLs for the specified user', function() {
        const userID = 'user3'; // User that does not exist in urlDatabase
        const result = urlsForUser(userID, urlDatabase);
        assert.isEmpty(result, 'Should return an empty object for user3');
  });

  it('should return an empty object if urlDatabase is empty', function() {
        const emptyUrlDatabase = {};
        const userID = 'user1';
        const result = urlsForUser(userID, emptyUrlDatabase);
        assert.isEmpty(result, 'Should return an empty object if urlDatabase is empty');
  });

  it('should not return any URLs that do not belong to the specified user', function() {
        const userID = 'user1';
        const result = urlsForUser(userID, urlDatabase);

        // Ensure no URLs in the result belong to other users
        const otherUserUrls = Object.values(result).filter(url => url.userID !== userID);
        assert.isEmpty(otherUserUrls, 'Should not return any URLs that belong to other users');
  });
});