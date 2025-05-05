export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    TEAM: '/team',
    TEAM_JOIN: '/team/join',
    TEAM_ID: (teamId: string) => `/team/${teamId}`,
  } as const;