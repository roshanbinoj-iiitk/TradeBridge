import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import LoginPage from "@/app/login/page";
import { createClient } from "@/utils/supabase/client";
import "@testing-library/jest-dom";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Mock UI components that might cause issues in tests
vi.mock("@/components/aceternity/background-beams", () => ({
  BackgroundBeams: () => null,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className}>Loading...</div>
  ),
}));

describe("LoginPage", () => {
  const mockPush = vi.fn();
  const mockSupabaseSignIn = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorage.clear();

    // Mock window.location.search
    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true,
    });

    // Setup router mock
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    // Setup search params mock
    (useSearchParams as any).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    });

    // Setup Supabase mock
    (createClient as any).mockReturnValue({
      auth: {
        signInWithPassword: mockSupabaseSignIn,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders login form with all elements", async () => {
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Log in to manage your rentals and continue sharing.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it("renders TradeBridge logo and link", async () => {
    render(<LoginPage />);

    await waitFor(() => {
      const logoLink = screen.getByRole("link", { name: /tradebridge/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  it("renders sign up link", async () => {
    render(<LoginPage />);

    await waitFor(() => {
      const signUpLink = screen.getByRole("link", { name: /sign up/i });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute("href", "/signup");
    });
  });

  it("updates email and password input values", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(
      /email address/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("successfully logs in and redirects to dashboard", async () => {
    const user = userEvent.setup();
    mockSupabaseSignIn.mockResolvedValue({ error: null });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockSupabaseSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on failed login", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid login credentials";
    mockSupabaseSignIn.mockResolvedValue({ error: { message: errorMessage } });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "wrong@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("shows loading state during login", async () => {
    const user = userEvent.setup();
    let resolveLogin: any;
    mockSupabaseSignIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /log in/i });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();
    });

    // Resolve the login
    resolveLogin({ error: null });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("redirects to URL from query params after login", async () => {
    const user = userEvent.setup();
    const redirectTo = "/products/123";

    (useSearchParams as any).mockReturnValue({
      get: vi.fn((key: string) => (key === "redirectTo" ? redirectTo : null)),
    });

    Object.defineProperty(window, "location", {
      value: { search: `?redirectTo=${redirectTo}` },
      writable: true,
    });

    mockSupabaseSignIn.mockResolvedValue({ error: null });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(redirectTo);
    });
  });

  it("stores redirect URL in localStorage on mount", async () => {
    const redirectTo = "/products/456";

    (useSearchParams as any).mockReturnValue({
      get: vi.fn((key: string) => (key === "redirectTo" ? redirectTo : null)),
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(localStorage.getItem("redirectAfterLogin")).toBe(redirectTo);
    });
  });

  it("clears redirect URL from localStorage after successful login", async () => {
    const user = userEvent.setup();
    const redirectTo = "/products/789";
    localStorage.setItem("redirectAfterLogin", redirectTo);

    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true,
    });

    mockSupabaseSignIn.mockResolvedValue({ error: null });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("redirectAfterLogin")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith(redirectTo);
    });
  });

  it("does not redirect to login or signup pages from redirectTo", async () => {
    const user = userEvent.setup();
    localStorage.setItem("redirectAfterLogin", "/login");

    mockSupabaseSignIn.mockResolvedValue({ error: null });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("disables submit button while loading", async () => {
    const user = userEvent.setup();
    let resolveLogin: any;
    mockSupabaseSignIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /log in/i });
    expect(submitButton).not.toBeDisabled();

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(submitButton);

    await waitFor(() => {
      const loadingButton = screen.getByRole("button", { name: /logging in/i });
      expect(loadingButton).toBeDisabled();
    });

    resolveLogin({ error: null });
  });

  it("requires email and password fields", async () => {
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
