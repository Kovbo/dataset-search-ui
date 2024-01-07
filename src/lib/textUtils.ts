export function removeSpecialAndLower(input: string) {
  return input.replace(/[^a-zA-Z ]/g, '').toLowerCase();
}
export function removeSpecial(input: string) {
  return input.replace(/[^a-zA-Z ]/g, '');
}
