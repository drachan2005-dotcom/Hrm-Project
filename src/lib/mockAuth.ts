const STORAGE_KEY = 'hrm-project-mock-users';

export interface MockUser {
  id: string;
  email: string;
  username: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  rolePreference: string;
  department: string;
  position: string;
  description: string;
  twoFAEnabled: boolean;
  twoFASecret: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMockUserInput {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  rolePreference: string;
  department: string;
  position: string;
  description: string;
  twoFAEnabled?: boolean;
  twoFASecret?: string | null;
}

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadUsers(): MockUser[] {
  if (!hasStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MockUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: MockUser[]): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function mockUserExistsByEmail(email: string) {
  const normalizedEmail = normalize(email);
  return loadUsers().some((user) => normalize(user.email) === normalizedEmail);
}

export function mockUserExistsByUsername(username: string) {
  const normalizedUsername = normalize(username);
  return loadUsers().some((user) => normalize(user.username) === normalizedUsername);
}

export function mockUserExistsByPhone(phoneNumber: string) {
  const normalizedPhone = phoneNumber.trim();
  if (!normalizedPhone) {
    return false;
  }
  return loadUsers().some((user) => user.phoneNumber === normalizedPhone);
}

export function createMockUser(
  input: CreateMockUserInput
): { user: MockUser | null; error?: string } {
  const email = input.email.trim();
  const username = input.username.trim();
  const phoneNumber = input.phoneNumber.trim();

  if (!email) {
    return { user: null, error: 'Email không hợp lệ.' };
  }

  if (!username) {
    return { user: null, error: 'Username không hợp lệ.' };
  }

  if (mockUserExistsByEmail(email)) {
    return {
      user: null,
      error: 'Email này đã được đăng ký. Vui lòng sử dụng email khác.',
    };
  }

  if (mockUserExistsByUsername(username)) {
    return {
      user: null,
      error: 'Username này đã được sử dụng. Vui lòng chọn tên khác.',
    };
  }

  if (phoneNumber && mockUserExistsByPhone(phoneNumber)) {
    return {
      user: null,
      error: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số khác.',
    };
  }

  const now = new Date().toISOString();
  const user: MockUser = {
    id: generateId(),
    email,
    username,
    password: input.password,
    fullName: input.fullName,
    phoneNumber,
    rolePreference: input.rolePreference,
    department: input.department,
    position: input.position,
    description: input.description,
    twoFAEnabled: input.twoFAEnabled ?? false,
    twoFASecret: input.twoFASecret ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const users = loadUsers();
  users.push(user);
  saveUsers(users);

  return { user };
}

export function authenticateMockUser(identifier: string, password: string): MockUser | null {
  const normalizedIdentifier = normalize(identifier);
  const users = loadUsers();
  const user = users.find(
    (candidate) =>
      normalize(candidate.email) === normalizedIdentifier ||
      normalize(candidate.username) === normalizedIdentifier
  );

  if (!user) {
    return null;
  }

  if (user.password !== password) {
    return null;
  }

  return user;
}

