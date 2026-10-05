import { describe, expect, it } from "vitest";
import {
  createChildSchema,
  createFamilySchema,
  selectCurriculumSchema,
} from "../onboarding";
import { loginSchema, signupSchema, validateSignup } from "../auth";

describe("signupSchema", () => {
  it("accepts a valid signup with consent", () => {
    const res = signupSchema.safeParse({
      name: "Jane Wambui",
      email: "Jane@Example.COM",
      password: "correct-horse-battery",
      confirmPassword: "correct-horse-battery",
      consent: true,
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.email).toBe("jane@example.com");
  });

  it("rejects missing parental consent", () => {
    const res = signupSchema.safeParse({
      name: "Jane Wambui",
      email: "jane@example.com",
      password: "correct-horse-battery",
      confirmPassword: "correct-horse-battery",
      consent: false,
    });
    expect(res.success).toBe(false);
  });

  it("rejects a short password", () => {
    const res = signupSchema.safeParse({
      name: "Jane Wambui",
      email: "jane@example.com",
      password: "short",
      confirmPassword: "short",
      consent: true,
    });
    expect(res.success).toBe(false);
  });
});

describe("validateSignup", () => {
  it("flags mismatched confirmPassword", () => {
    const res = validateSignup({
      name: "Jane Wambui",
      email: "jane@example.com",
      password: "correct-horse-battery",
      confirmPassword: "different",
      consent: true,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const message = res.error.issues.some(
        (i) => i.path.join(".") === "confirmPassword",
      );
      expect(message).toBe(true);
    }
  });
});

describe("loginSchema", () => {
  it("normalizes email and requires a password", () => {
    const res = loginSchema.safeParse({
      email: " Parent@Example.com ",
      password: "x",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.email).toBe("parent@example.com");
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(
      false,
    );
  });
});

describe("createFamilySchema", () => {
  it("trims and requires a family name", () => {
    expect(createFamilySchema.safeParse({ displayName: "  Mutua  " }).success).toBe(
      true,
    );
    expect(createFamilySchema.safeParse({ displayName: " " }).success).toBe(false);
  });
});

describe("createChildSchema", () => {
  it("accepts a valid child profile", () => {
    const res = createChildSchema.safeParse({
      fullName: "Amina Mutua",
      dateOfBirth: "2014-05-01",
      gender: "female",
    });
    expect(res.success).toBe(true);
  });

  it("rejects an implausible date of birth", () => {
    expect(
      createChildSchema.safeParse({
        fullName: "Amina Mutua",
        dateOfBirth: "1999-05-01",
        gender: "female",
      }).success,
    ).toBe(false);
  });
});

describe("selectCurriculumSchema", () => {
  it("accepts a CBC grade-band selection", () => {
    expect(
      selectCurriculumSchema.safeParse({
        childId: "c-child",
        curriculumCode: "CBC",
        gradeBand: "G5",
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown grade band", () => {
    expect(
      selectCurriculumSchema.safeParse({
        childId: "c-child",
        curriculumCode: "CBC",
        gradeBand: "G13",
      }).success,
    ).toBe(false);
  });
});
