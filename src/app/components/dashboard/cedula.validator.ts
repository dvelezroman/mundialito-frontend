import { AbstractControl, ValidatorFn } from '@angular/forms';

export function cedulaValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Check if the input is a number and has the correct length
    if (!/^\d{10}$/.test(value)) {
      return { 'cedulaInvalid': true };
    }

    // Validate the cedula number using Ecuadorian rules
    return isValidCedula(value) ? null : { 'cedulaInvalid': true };
  };
}

function isValidCedula(cedula: string): boolean {
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const digit = Number(cedula.charAt(i));
    const weighted = digit * weights[i];
    sum += Math.floor(weighted / 10) + (weighted % 10);
  }

  const lastDigit = Number(cedula.charAt(9));
  const calculatedDigit = (10 - (sum % 10)) % 10;

  return lastDigit === calculatedDigit;
}
