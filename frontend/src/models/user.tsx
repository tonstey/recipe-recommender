export interface User {
  uuid?: string;
  username: string;
  email: string;
}

export interface SignUpUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordError: string[] | undefined;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface SignUpResponse {
  token: string;
  user_info: {
    username: string;
    email: string;
  };
}

export const BaseUser: User = {
  uuid: "",
  username: "",
  email: "",
};
