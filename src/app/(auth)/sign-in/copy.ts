export const SIGN_IN_COPY = {
  title: "Sign in",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  submitButton: "Sign in",
  forgotPasswordLink: "Forgot password?",
  signUpPrompt: "Don't have an account?",
  signUpLink: "Sign up",
  orDivider: "or",
  googleButton: "Continue with Google",
  appleButton: "Continue with Apple",
  errors: {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-blocked":
      "Sign-in popup was blocked. Please allow popups for this site and try again.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    default: "Something went wrong. Please try again.",
  },
} as const;
