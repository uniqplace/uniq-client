// Utility functions for localStorage operations
export function saveToLocalStorage<T>(key: string, state: T) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}
export function loadFromLocalStorage<T>(key: string): T | undefined {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    // ignore
  }
  return undefined;
}