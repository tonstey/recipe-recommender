import type { User } from "./user";

export interface LoginResponse {
  token: {
    token_type: "verify" | "login";
    token?: string;
    verify_token?: string;
  };
  user_info?: User;
}
