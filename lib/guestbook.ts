/** Guestbook rules shared by the form and the API, so both validate the same way. */

export const NAME_MAX = 32;
export const MESSAGE_MAX = 240;
const MAX_LINKS = 1;

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  /** ISO timestamp. */
  createdAt: string;
};

export type FieldErrors = Partial<Record<"name" | "message", string>>;

// Control characters other than newline, plus zero-width and bidi-override characters.
const INVISIBLE = /[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁠-⁤﻿]/g;

export function cleanName(value: string): string {
  return value.replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
}

export function cleanMessage(value: string): string {
  return value
    .replace(INVISIBLE, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateEntry(input: { name: string; message: string }): {
  value: { name: string; message: string };
  errors: FieldErrors;
} {
  const name = cleanName(input.name);
  const message = cleanMessage(input.message);
  const errors: FieldErrors = {};

  if (!name) errors.name = "Add a name so people know who signed.";
  else if ([...name].length > NAME_MAX) errors.name = `Keep the name to ${NAME_MAX} characters.`;

  if (!message) errors.message = "Write a short message first.";
  else if ([...message].length > MESSAGE_MAX)
    errors.message = `Keep the message to ${MESSAGE_MAX} characters.`;
  else if ((message.match(/https?:\/\/|www\./gi) ?? []).length > MAX_LINKS)
    errors.message = "One link per message, please.";

  return { value: { name, message }, errors };
}

export function isEntry(value: unknown): value is GuestbookEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.message === "string" &&
    typeof v.createdAt === "string"
  );
}
