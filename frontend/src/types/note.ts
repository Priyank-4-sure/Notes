export interface Note {
  id: number;
  title: string;
  markdown: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  match_score?: number;
}

export interface NoteCreateInput {
  title: string;
  markdown: string;
  pinned?: boolean;
}

export type NoteUpdateInput = Partial<NoteCreateInput>;
