import { create } from "zustand";
import { BaseUser, type User } from "../models/user";
import emailValidator from "email-validator";

interface VerifyStore {
  verifyUser: User;
  verifyToken: string;
  setVerifyUser: (user: User) => void;
  setVerifyToken: (token: string) => void;
  resetVerify: () => void;
  sendEmail: ({ email }: { email: string }) => any;
  changeEmail: ({ email }: { email: string }) => any;
  verifyAccount: (token: string) => any;
}

export const useVerifyStore = create<VerifyStore>((set, get) => ({
  verifyUser: BaseUser,
  verifyToken: "",

  setVerifyUser: (user: User) => set({ verifyUser: user }),
  setVerifyToken: (token: string) => set({ verifyToken: token }),

  resetVerify: () => set({ verifyUser: BaseUser, verifyToken: "" }),

  sendEmail: async ({ email }: { email: string }) => {
    const token = get().verifyToken;

    if (!token) {
      throw new Error("There is no token.");
    }

    if (!emailValidator.validate(email)) {
      throw new Error("Email is not valid.");
    }

    const res = await fetch(
      `${import.meta.env.BACKEND_URL}/api/users/verificationemail`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Sending verification email failed.");
    }

    return data;
  },

  changeEmail: async ({ email }: { email: string }) => {
    const oldEmail = get().verifyUser.email;
    const token = get().verifyToken;
    if (!token) {
      throw new Error("There is no token.");
    }

    if (!emailValidator.validate(email)) {
      throw new Error("Email is not valid.");
    }

    if (oldEmail === email) {
      throw new Error("New email is the same as the old one.");
    }

    set((state) => ({ verifyUser: { ...state.verifyUser, email: email } }));

    const newUserData = {
      oldEmail: oldEmail,
      newEmail: email,
    };

    const res = await fetch(
      `${import.meta.env.BACKEND_URL}/api/users/newemail`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email_data: newUserData }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Changing email failed.");
    }
    return data.token;
  },
  verifyAccount: async (token: string) => {
    const res = await fetch(
      `${import.meta.env.BACKEND_URL}/api/users/verification`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token, token_type: "verify" }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Verifying account failed.");
    }

    return true;
  },
}));
