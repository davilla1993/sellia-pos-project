import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PhoneValidator {
  static validFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phone = control.value;
      
      if (!phone) {
        return null;
      }

      // Remove spaces and dashes for validation
      const cleaned = phone.replace(/[\s\-]/g, '');
      
      // Must be all digits
      if (!/^\d+$/.test(cleaned)) {
        return { phoneInvalid: true };
      }

      // Must be between 7 and 20 digits
      if (cleaned.length < 7 || cleaned.length > 20) {
        return { phoneLength: true };
      }

      return null;
    };
  }
}
