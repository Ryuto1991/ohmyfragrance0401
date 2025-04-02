import { useState, useCallback } from 'react';

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

interface ValidationErrors {
  [key: string]: string[];
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // フィールドの検証
  const validateField = useCallback((name: string, value: string) => {
    if (!rules[name]) return [];

    return rules[name]
      .filter(rule => !rule.validate(value))
      .map(rule => rule.message);
  }, [rules]);

  // すべてのフィールドの検証
  const validateForm = useCallback((values: { [key: string]: string }) => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, values[fieldName] || '');
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  // フィールドがフォーカスを失ったときの処理
  const handleBlur = useCallback((name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors,
    }));
  }, [validateField]);

  // フィールドの値が変更されたときの処理
  const handleChange = useCallback((name: string, value: string) => {
    if (touched[name]) {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors,
      }));
    }
  }, [touched, validateField]);

  return {
    errors,
    validateForm,
    handleBlur,
    handleChange,
    touched,
  };
};

// 共通のバリデーションルール
export const commonValidationRules = {
  required: {
    validate: (value: string) => value.trim().length > 0,
    message: '必須項目です',
  },
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: '有効なメールアドレスを入力してください',
  },
  password: {
    validate: (value: string) => 
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value),
    message: 'パスワードは8文字以上で、大文字、小文字、数字を含める必要があります',
  },
  phone: {
    validate: (value: string) => 
      /^(0[0-9]{9,10}|[+][0-9]{1,4}[0-9]{9,10})$/.test(value),
    message: '有効な電話番号を入力してください',
  },
  postalCode: {
    validate: (value: string) => /^\d{3}-?\d{4}$/.test(value),
    message: '有効な郵便番号を入力してください',
  },
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: `${max}文字以内で入力してください`,
  }),
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: `${min}文字以上で入力してください`,
  }),
}; 