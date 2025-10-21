import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      
      if (!password) {
        return null;
      }

      const errors: any = {};

      if (password.length < 6) {
        errors.minLength = true;
      }

      if (!/[A-Z]/.test(password)) {
        errors.uppercase = true;
      }

      if (!/\d/.test(password)) {
        errors.digit = true;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.special = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static getErrorMessage(errors: any): string {
    if (!errors) return '';

    const messages = [];
    
    if (errors.minLength) messages.push('au moins 6 caractères');
    if (errors.uppercase) messages.push('une lettre majuscule');
    if (errors.digit) messages.push('un chiffre');
    if (errors.special) messages.push('un caractère spécial (!@#$%^&*)');

    if (messages.length === 0) return '';
    
    return 'Le mot de passe doit contenir: ' + messages.join(', ');
  }
}
