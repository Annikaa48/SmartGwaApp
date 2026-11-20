export type Subject = {
  id: string;
  semester_id: string;
  subject_code: string;
  units: number;
  grade: number | null;
  is_included_in_gwa: boolean;
  created_at?: string;
};

export type Semester = {
  id: string;
  user_id: string;
  term_name: string;
  created_at?: string;
  subjects?: Subject[];
};

export type SemesterWithSubjects = Semester & {
  subjects: Subject[];
};
