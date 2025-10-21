-- Reset firstLogin flag to true for all users to enforce password change
UPDATE users SET first_login = true WHERE deleted = false;
