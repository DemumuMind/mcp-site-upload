export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrengthScore(password: string): PasswordStrengthScore {
  if (!password) {
    return 0;
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }

  if (/\d/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return Math.min(score, 4) as PasswordStrengthScore;
}
