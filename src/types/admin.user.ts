// DTO для админской панели (user management)

export interface UserWithRoleResponse {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  gender: string;
  roles: string[];
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  countryCode?: string;
  gender?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  gender?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}
