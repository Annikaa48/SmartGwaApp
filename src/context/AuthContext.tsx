import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { supabase } from "../lib/supabase";
import { normalizeEmail } from "../lib/validation";

export type AuthResult = {
  error: string | null;
  needsEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  fullName: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function friendlyError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (text.includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox for the confirmation link.";
  }
  if (
    text.includes("already registered") ||
    text.includes("already been registered")
  ) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (
    text.includes("network request failed") ||
    text.includes("failed to fetch")
  ) {
    return "No internet connection or database unreachable. Check your network and try again.";
  }
  if (text.includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);

  // Restore the saved session on app start, then listen for changes.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) setSession(data.session);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load the display name from the profiles table.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) {
      setProfileName("");
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data?.full_name) setProfileName(String(data.full_name));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizeEmail(email),
          password,
        });
        if (error) return { error: friendlyError(error.message) };
        if (data.session) setSession(data.session);
        return { error: null };
      } catch (e) {
        return {
          error: friendlyError(
            e instanceof Error ? e.message : "Something went wrong.",
          ),
        };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
    ): Promise<AuthResult> => {
      try {
        const redirectTo =
          typeof window !== "undefined" ? window.location.origin : undefined;
        const { data, error } = await supabase.auth.signUp({
          email: normalizeEmail(email),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: redirectTo,
          },
        });
        if (error) return { error: friendlyError(error.message) };
        if (data.session) setSession(data.session);
        return { error: null, needsEmailConfirmation: data.session === null };
      } catch (e) {
        return {
          error: friendlyError(
            e instanceof Error ? e.message : "Something went wrong.",
          ),
        };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors during sign out
    } finally {
      setSession(null);
      setProfileName("");
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const metaName =
      typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "";
    const fullName =
      profileName || metaName || (user?.email?.split("@")[0] ?? "");
    return { session, user, fullName, loading, signIn, signUp, signOut };
  }, [session, profileName, loading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
