export type EmailAuthValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type EmailAuthErrors = Partial<Record<keyof EmailAuthValues, string>>;
