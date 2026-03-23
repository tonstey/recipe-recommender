import { create } from "zustand";
import {
  BaseUser,
  type LoginUser,
  type SignUpUser,
  type User,
} from "../models/user.tsx";
import emailValidator from "email-validator";

interface UserStore {
  user: User;
  token: string;
  setToken: (token: string) => void;
  login: (arg0: LoginUser) => any; // arg0 = Parameter 1 that has no specified name
  signup: (arg0: SignUpUser) => any; // arg0 = Parameter 1 that has no specified name
  setUser: (token: string) => void;
  updateUser: (user_info: any) => void;
  deleteUser: () => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: BaseUser,
  token: "",
  setToken: (token: string) => {
    set({ token: token });
  },

  login: async ({ email, password }: LoginUser) => {
    if (!email || !emailValidator.validate(email)) {
      throw new Error("Invalid email.");
    }

    if (!password) {
      throw new Error("Missing password.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Logging in was unsuccessful");
    }

    if (!data.token.token) {
      throw new Error("No access token was returned.");
    }

    return data;
  },

  signup: async ({
    username,
    email,
    password,
    confirmPassword,
    passwordError,
  }: SignUpUser) => {
    // BEGIN CHECK EMPTY FIELDS
    if (!username || !email || !password || !confirmPassword) {
      throw new Error("There are missing fields.");
    }

    if (!emailValidator.validate(email)) {
      throw new Error("Invalid email.");
    }

    if (passwordError && passwordError.length > 0) {
      throw new Error("Password does not complete all requirements.");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/signup`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: null,
          username: username,
          email: email,
          password: password,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Signup failed.");
    }

    return {
      token: data.token,
      user_info: { username: username, email: email },
    };
  },

  setUser: async (token: string) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/data`,
      {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in fetching user info.");
    }

    set({ user: data });

    return { success: true, data: data };
  },

  updateUser: async (user_info: any) => {
    const { token } = get();
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/data`,
      {
        method: "PUT",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user: user_info }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in updating user.");
    }

    set({ user: data });
    return { success: true };
  },

  deleteUser: async () => {
    const { token } = get();
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/data`,
      {
        method: "DELETE",
        credentials: "include",
        headers: { Authentication: `Bearer ${token}` },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in deleting user.");
    }

    set({ user: BaseUser });
    return { success: true };
  },

  logout: () => {
    set({ user: BaseUser, token: "" });
  },
}));
