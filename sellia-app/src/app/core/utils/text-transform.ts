export class TextTransform {
  static toUpperCase(text: string): string {
    return text ? text.trim().toUpperCase() : '';
  }

  static capitalize(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  static onlyNumbers(text: string): string {
    return text ? text.replace(/\D/g, '') : '';
  }
}
