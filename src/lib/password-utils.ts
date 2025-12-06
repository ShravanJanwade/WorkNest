export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidation {
  requirements: PasswordRequirements;
  isValid: boolean;
  strength: PasswordStrength;
}

export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

/**
 * Validates if password meets minimum length requirement
 */
export const hasMinLength = (password: string, minLength: number = 8): boolean => {
  return password.length >= minLength;
};

/**
 * Validates if password contains at least one uppercase letter
 */
export const hasUppercase = (password: string): boolean => {
  return /[A-Z]/.test(password);
};

/**
 * Validates if password contains at least one lowercase letter
 */
export const hasLowercase = (password: string): boolean => {
  return /[a-z]/.test(password);
};

/**
 * Validates if password contains at least one number
 */
export const hasNumber = (password: string): boolean => {
  return /[0-9]/.test(password);
};

/**
 * Validates if password contains at least one special character
 */
export const hasSpecialChar = (password: string): boolean => {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
};

/**
 * Validates all password requirements
 */
export const validatePasswordRequirements = (password: string): PasswordRequirements => {
  return {
    minLength: hasMinLength(password),
    hasUppercase: hasUppercase(password),
    hasLowercase: hasLowercase(password),
    hasNumber: hasNumber(password),
    hasSpecialChar: hasSpecialChar(password),
  };
};

/**
 * Calculates password strength based on requirements met
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return "weak";
  
  const requirements = validatePasswordRequirements(password);
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  // Additional factors for strength
  const hasLongLength = password.length >= 12;
  const hasVeryLongLength = password.length >= 16;
  
  let strengthScore = metRequirements;
  
  if (hasLongLength) strengthScore += 0.5;
  if (hasVeryLongLength) strengthScore += 0.5;
  
  if (strengthScore <= 2) return "weak";
  if (strengthScore <= 3.5) return "medium";
  if (strengthScore <= 5) return "strong";
  return "very-strong";
};

/**
 * Complete password validation
 */
export const validatePassword = (password: string): PasswordValidation => {
  const requirements = validatePasswordRequirements(password);
  const isValid = Object.values(requirements).every(Boolean);
  const strength = calculatePasswordStrength(password);
  
  return {
    requirements,
    isValid,
    strength,
  };
};

/**
 * Get strength color for UI display
 */
export const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case "weak":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "strong":
      return "text-blue-500";
    case "very-strong":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

/**
 * Get strength label for UI display
 */
export const getStrengthLabel = (strength: PasswordStrength): string => {
  switch (strength) {
    case "weak":
      return "Weak";
    case "medium":
      return "Medium";
    case "strong":
      return "Strong";
    case "very-strong":
      return "Very Strong";
    default:
      return "";
  }
};

/**
 * Get strength bar width percentage
 */
export const getStrengthWidth = (strength: PasswordStrength): number => {
  switch (strength) {
    case "weak":
      return 25;
    case "medium":
      return 50;
    case "strong":
      return 75;
    case "very-strong":
      return 100;
    default:
      return 0;
  }
};
