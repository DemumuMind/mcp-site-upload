export const PASSWORD_MIN_LENGTH = 8;

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export type PasswordRuleChecks = {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
};

export function getPasswordRuleChecks(password: string): PasswordRuleChecks {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function getPasswordStrengthScore(password: string): PasswordStrengthScore {
  if (!password) {
    return 0;
  }

  const checks = getPasswordRuleChecks(password);
  let score = 0;

  if (checks.minLength) {
    score += 1;
  }

  if (checks.hasLowercase && checks.hasUppercase) {
    score += 1;
  }

  if (checks.hasNumber) {
    score += 1;
  }

  if (checks.hasSymbol) {
    score += 1;
  }

  return Math.min(score, 4) as PasswordStrengthScore;
}
