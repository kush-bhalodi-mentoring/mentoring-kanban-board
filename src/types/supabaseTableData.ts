export enum TeamMemberRoles {
    ADMIN = 'Admin',
    USER = 'User',
  }
  
  export interface TeamsTable {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
  }
  