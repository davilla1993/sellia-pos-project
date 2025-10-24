import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  /**
   * Formate un montant en FCFA
   * @param amount Montant en FCFA
   * @returns Montant formaté en FCFA sans décimales
   */
  formatPrice(amount: number): string {
    if (amount == null || amount === 0) return '0 FCFA';
    const amountInFcfa = Math.round(amount);
    return amountInFcfa.toLocaleString('fr-FR') + ' FCFA';
  }

  /**
   * Convertit un montant en FCFA (pas d'opération nécessaire)
   * @param amount Montant en FCFA
   * @returns Montant en FCFA
   */
  toCurrency(amount: number): number {
    if (amount == null) return 0;
    return Math.round(amount);
  }
}
