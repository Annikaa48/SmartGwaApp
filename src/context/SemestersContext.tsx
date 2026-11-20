import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Semester, Subject } from "../types";
import { useAuth } from "./AuthContext";

type SemestersContextType = {
  semesters: Semester[];
  isLoading: boolean;
  refreshSemesters: () => Promise<void>;
  addSemester: (termName: string) => Promise<{ error: string | null }>;
  deleteSemester: (id: string) => Promise<{ error: string | null }>;
  addSubject: (
    semesterId: string,
    subject: Omit<Subject, "id" | "created_at">,
  ) => Promise<void>;
  updateSubject: (
    subjectId: string,
    updates: Partial<Subject>,
  ) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
};

const SemestersContext = createContext<SemestersContextType | undefined>(
  undefined,
);

export function SemestersProvider({ children }: { children: React.ReactNode }) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  const refreshSemesters = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from("semesters")
        .select(`*, subjects (*)`)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSemesters((data as Semester[]) || []);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshSemesters();
    } else {
      setSemesters([]);
      setIsLoading(false);
    }
  }, [session]);

  const addSemester = async (termName: string) => {
    if (!session?.user) return { error: "User not authenticated" };
    try {
      const { data, error } = await supabase
        .from("semesters")
        .insert([{ term_name: termName, user_id: session.user.id }])
        .select(`*, subjects (*)`)
        .single();

      if (error) throw error;

      if (data) {
        setSemesters((prev) => [data as Semester, ...prev]);
      } else {
        await refreshSemesters();
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteSemester = async (id: string) => {
    try {
      setSemesters((prev) => prev.filter((sem) => sem.id !== id));
      const { error } = await supabase.from("semesters").delete().eq("id", id);
      if (error) {
        await refreshSemesters();
        throw error;
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const addSubject = async (
    semesterId: string,
    subjectData: Omit<Subject, "id" | "created_at">,
  ) => {
    const code = subjectData.subject_code || (subjectData as any).code || "";
    const rawGrade = subjectData.grade;
    const finalGrade =
      rawGrade === null || rawGrade === undefined || rawGrade === ("" as any)
        ? null
        : Number(rawGrade);

    const newSubjectRecord = {
      semester_id: semesterId,
      subject_code: code,
      units: Number(subjectData.units),
      grade: finalGrade,
      is_included_in_gwa: Boolean(subjectData.is_included_in_gwa),
    };

    const tempId = "temp-" + Date.now();
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === semesterId) {
          const subjects = sem.subjects ? [...sem.subjects] : [];
          return {
            ...sem,
            subjects: [
              ...subjects,
              { id: tempId, ...newSubjectRecord } as Subject,
            ],
          };
        }
        return sem;
      }),
    );

    const { error } = await supabase.from("subjects").insert([newSubjectRecord]);

    if (error) {
      await refreshSemesters();
      throw error;
    }
    await refreshSemesters();
  };

  const updateSubject = async (
    subjectId: string,
    updates: Partial<Subject>,
  ) => {
    const payload: any = {};

    if (
      updates.subject_code !== undefined ||
      (updates as any).code !== undefined
    ) {
      payload.subject_code = updates.subject_code || (updates as any).code;
    }
    if (updates.units !== undefined) payload.units = Number(updates.units);
    if (updates.grade !== undefined) {
      payload.grade =
        updates.grade === null ||
        updates.grade === undefined ||
        updates.grade === ("" as any)
          ? null
          : Number(updates.grade);
    }
    if (updates.is_included_in_gwa !== undefined) {
      payload.is_included_in_gwa = Boolean(updates.is_included_in_gwa);
    }

    // Optimistic local update
    setSemesters((prev) =>
      prev.map((sem) => {
        if (!sem.subjects) return sem;
        return {
          ...sem,
          subjects: sem.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, ...payload } : sub,
          ),
        };
      }),
    );

    const { error } = await supabase
      .from("subjects")
      .update(payload)
      .eq("id", subjectId);

    if (error) {
      await refreshSemesters();
      throw error;
    }
    await refreshSemesters();
  };

  const deleteSubject = async (subjectId: string) => {
    // Optimistic delete
    setSemesters((prev) =>
      prev.map((sem) => {
        if (!sem.subjects) return sem;
        return {
          ...sem,
          subjects: sem.subjects.filter((sub) => sub.id !== subjectId),
        };
      }),
    );

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (error) {
      await refreshSemesters();
      throw error;
    }
    await refreshSemesters();
  };

  return (
    <SemestersContext.Provider
      value={{
        semesters,
        isLoading,
        refreshSemesters,
        addSemester,
        deleteSemester,
        addSubject,
        updateSubject,
        deleteSubject,
      }}
    >
      {children}
    </SemestersContext.Provider>
  );
}

export const useSemesters = () => {
  const context = useContext(SemestersContext);
  if (context === undefined) {
    throw new Error("useSemesters must be used within a SemestersProvider");
  }
  return context;
};
