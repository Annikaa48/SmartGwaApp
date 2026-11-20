export type Semester = {
  id: string;
  user_id?: string;
  name?: string;
  term_name?: string;
  year?: string;
  academic_year?: string;
  created_at?: string;
  subjects?: Subject[];
};

export type Subject = {
  id: string;
  semester_id: string;
  code?: string;
  subject_code?: string;
  title?: string;
  units: number;
  grade?: number | null;
  is_included_in_gwa: boolean;
  created_at?: string;
};
