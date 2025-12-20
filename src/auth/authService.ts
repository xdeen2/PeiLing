export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface UserCredentials {
  username: string;
  passwordHash: string;
  email: string;
}

const USERS_KEY = 'peiling-users';
const CURRENT_USER_KEY = 'peiling-current-user';
const DEMO_SEEDED_KEY = 'peiling-demo-seeded';

// Simple hash function (in production, use proper encryption)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Seed demo accounts on first run
function seedDemoAccounts(): void {
  const seeded = localStorage.getItem(DEMO_SEEDED_KEY);
  if (seeded) return;

  const users = authService.getUsers();

  // Create jayla demo account
  if (!users['jayla']) {
    users['jayla'] = {
      username: 'jayla',
      passwordHash: simpleHash('jayla123' + 'jayla'),
      email: 'jayla@demo.com',
    };
  }

  authService.saveUsers(users);
  localStorage.setItem(DEMO_SEEDED_KEY, 'true');
}

export const authService = {
  // Initialize demo accounts
  initializeDemoAccounts(): void {
    seedDemoAccounts();
  },

  // Get all users
  getUsers(): Record<string, UserCredentials> {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  },

  // Save users
  saveUsers(users: Record<string, UserCredentials>): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Register new user
  register(username: string, password: string, email: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();

    // Check if username exists
    if (users[username]) {
      return { success: false, message: 'userExists' };
    }

    // Validate password
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Create new user
    const passwordHash = simpleHash(password + username);
    const user: UserCredentials = {
      username,
      passwordHash,
      email,
    };

    users[username] = user;
    this.saveUsers(users);

    const publicUser: User = {
      id: username,
      username,
      email,
      createdAt: new Date().toISOString(),
    };

    return { success: true, message: 'registerSuccess', user: publicUser };
  },

  // Login user
  login(username: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const user = users[username];

    if (!user) {
      return { success: false, message: 'invalidCredentials' };
    }

    const passwordHash = simpleHash(password + username);
    if (user.passwordHash !== passwordHash) {
      return { success: false, message: 'invalidCredentials' };
    }

    const publicUser: User = {
      id: username,
      username,
      email: user.email,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));

    return { success: true, message: 'loginSuccess', user: publicUser };
  },

  // Logout user
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  // Change password
  changePassword(username: string, currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users[username];

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const currentHash = simpleHash(currentPassword + username);
    if (user.passwordHash !== currentHash) {
      return { success: false, message: 'Current password is incorrect' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    user.passwordHash = simpleHash(newPassword + username);
    users[username] = user;
    this.saveUsers(users);

    return { success: true, message: 'Password changed successfully' };
  },
};
