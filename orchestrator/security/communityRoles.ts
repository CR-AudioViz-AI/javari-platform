/**
 * Community RBAC (Role-Based Access Control)
 * Phase G: Permission system for communities
 */

export type CommunityRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Permission {
  createContent: boolean;
  runWorkflows: boolean;
  inviteMembers: boolean;
  manageSettings: boolean;
  manageProjects: boolean;
  manageNeighborhoods: boolean;
  viewActivity: boolean;
  exportContent: boolean;
  deleteContent: boolean;
  manageRoles: boolean;
}

const ROLE_PERMISSIONS: Record<CommunityRole, Permission> = {
  owner: {
    createContent: true,
    runWorkflows: true,
    inviteMembers: true,
    manageSettings: true,
    manageProjects: true,
    manageNeighborhoods: true,
    viewActivity: true,
    exportContent: true,
    deleteContent: true,
    manageRoles: true,
  },
  admin: {
    createContent: true,
    runWorkflows: true,
    inviteMembers: true,
    manageSettings: true,
    manageProjects: true,
    manageNeighborhoods: true,
    viewActivity: true,
    exportContent: true,
    deleteContent: true,
    manageRoles: false, // Cannot manage owner
  },
  member: {
    createContent: true,
    runWorkflows: true,
    inviteMembers: false,
    manageSettings: false,
    manageProjects: true,
    manageNeighborhoods: false,
    viewActivity: true,
    exportContent: true,
    deleteContent: false,
    manageRoles: false,
  },
  guest: {
    createContent: false,
    runWorkflows: false,
    inviteMembers: false,
    manageSettings: false,
    manageProjects: false,
    manageNeighborhoods: false,
    viewActivity: true,
    exportContent: false,
    deleteContent: false,
    manageRoles: false,
  },
};

export function getPermissions(role: CommunityRole): Permission {
  return ROLE_PERMISSIONS[role];
}

export function canCreateContent(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].createContent;
}

export function canRunWorkflows(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].runWorkflows;
}

export function canInviteMembers(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].inviteMembers;
}

export function canManageSettings(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].manageSettings;
}

export function canManageProjects(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].manageProjects;
}

export function canManageNeighborhoods(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].manageNeighborhoods;
}

export function canManageRoles(role: CommunityRole): boolean {
  return ROLE_PERMISSIONS[role].manageRoles;
}

export function hasPermission(role: CommunityRole, permission: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][permission];
}
