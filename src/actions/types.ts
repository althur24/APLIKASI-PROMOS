export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
