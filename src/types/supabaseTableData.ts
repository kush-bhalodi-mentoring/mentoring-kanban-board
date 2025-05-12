export enum TeamMemberRoles {
  ADMIN = 'Admin',
  USER = 'User',
}

export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  AWAITING = 'AWAITING',
  DEACTIVATED = 'DEACTIVATED',
}

export enum TeamTypes {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

export interface TeamsTable {
  id: string;
  name: string;
  description?: string;
  type: TeamTypes;
  created_at: string;
  updated_at: string;
}

export interface UserTeamTable {
  id: string;
  user_id: string;
  team_id: string;
  role: TeamMemberRoles;
  created_at: string;
}

export interface Boards {
  id: string;
  name: string;
  description: string;
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}