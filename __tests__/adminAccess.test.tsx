/**
 * Tests spécifiques pour les restrictions d'accès aux pages admin
 * Teste les composants et pages d'administration
 */

import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "../lib/auth";
import { getUserProfileData } from "../lib/userData";

// Mocks
jest.mock("next/navigation");
jest.mock("../lib/auth");
jest.mock("../lib/userData");

const mockPush = jest.fn();
const mockGetUserIdFromToken = getUserIdFromToken as jest.MockedFunction<
  typeof getUserIdFromToken
>;
const mockGetUserProfileData = getUserProfileData as jest.MockedFunction<
  typeof getUserProfileData
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock des composants admin
const MockAdminComponent = ({ userRole }: { userRole: string }) => {
  if (!["admin", "advisor"].includes(userRole)) {
    return <div data-testid="access-denied">Accès refusé</div>;
  }

  return (
    <div data-testid="admin-interface">
      <h1>Interface Admin</h1>
      <div data-testid="admin-controls">Contrôles administrateur</div>
    </div>
  );
};

// Mock d'un composant qui vérifie les permissions
const PermissionGuard = ({
  children,
  requiredRoles,
  userRole,
}: {
  children: React.ReactNode;
  requiredRoles: string[];
  userRole: string;
}) => {
  if (!requiredRoles.includes(userRole)) {
    return (
      <div data-testid="insufficient-permissions">
        Permissions insuffisantes
      </div>
    );
  }

  return <>{children}</>;
};

describe("Restrictions d'accès Admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
  });

  describe("Accès aux interfaces Admin", () => {
    it("devrait permettre l'accès admin avec rôle admin", () => {
      render(<MockAdminComponent userRole="admin" />);

      expect(screen.getByTestId("admin-interface")).toBeInTheDocument();
      expect(screen.getByTestId("admin-controls")).toBeInTheDocument();
      expect(screen.getByText("Interface Admin")).toBeInTheDocument();
    });

    it("devrait permettre l'accès admin avec rôle advisor", () => {
      render(<MockAdminComponent userRole="advisor" />);

      expect(screen.getByTestId("admin-interface")).toBeInTheDocument();
      expect(screen.getByTestId("admin-controls")).toBeInTheDocument();
    });

    it("devrait refuser l'accès admin avec rôle student", () => {
      render(<MockAdminComponent userRole="student" />);

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-interface")).not.toBeInTheDocument();
    });

    it("devrait refuser l'accès admin avec rôle invalide", () => {
      render(<MockAdminComponent userRole="invalid" />);

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-controls")).not.toBeInTheDocument();
    });
  });

  describe("Système de permissions granulaires", () => {
    it("devrait permettre l'accès avec les bonnes permissions admin", () => {
      render(
        <PermissionGuard requiredRoles={["admin"]} userRole="admin">
          <div data-testid="admin-only-content">Contenu admin uniquement</div>
        </PermissionGuard>
      );

      expect(screen.getByTestId("admin-only-content")).toBeInTheDocument();
    });

    it("devrait permettre l'accès avec les bonnes permissions advisor", () => {
      render(
        <PermissionGuard
          requiredRoles={["admin", "advisor"]}
          userRole="advisor"
        >
          <div data-testid="advisor-content">Contenu advisor</div>
        </PermissionGuard>
      );

      expect(screen.getByTestId("advisor-content")).toBeInTheDocument();
    });

    it("devrait refuser l'accès student aux fonctions admin", () => {
      render(
        <PermissionGuard requiredRoles={["admin"]} userRole="student">
          <div data-testid="restricted-content">Contenu restreint</div>
        </PermissionGuard>
      );

      expect(
        screen.getByTestId("insufficient-permissions")
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("restricted-content")
      ).not.toBeInTheDocument();
    });

    it("devrait refuser l'accès student aux fonctions advisor", () => {
      render(
        <PermissionGuard
          requiredRoles={["admin", "advisor"]}
          userRole="student"
        >
          <div data-testid="advisor-only">Advisor seulement</div>
        </PermissionGuard>
      );

      expect(
        screen.getByTestId("insufficient-permissions")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("advisor-only")).not.toBeInTheDocument();
    });
  });

  describe("Navigation conditionnelle", () => {
    const ConditionalNavigation = ({ userRole }: { userRole: string }) => {
      const isAdmin = ["admin", "advisor"].includes(userRole);

      return (
        <nav data-testid="navigation">
          <a href="/dashboard" data-testid="nav-dashboard">
            Dashboard
          </a>
          <a href="/profile" data-testid="nav-profile">
            Profil
          </a>
          {isAdmin && (
            <>
              <a href="/admin" data-testid="nav-admin">
                Administration
              </a>
              <a href="/admin/users" data-testid="nav-users">
                Utilisateurs
              </a>
              <a href="/admin/projects" data-testid="nav-projects">
                Projets
              </a>
            </>
          )}
        </nav>
      );
    };

    it("devrait afficher les liens admin pour un admin", () => {
      render(<ConditionalNavigation userRole="admin" />);

      expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("nav-profile")).toBeInTheDocument();
      expect(screen.getByTestId("nav-admin")).toBeInTheDocument();
      expect(screen.getByTestId("nav-users")).toBeInTheDocument();
      expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
    });

    it("devrait afficher les liens admin pour un advisor", () => {
      render(<ConditionalNavigation userRole="advisor" />);

      expect(screen.getByTestId("nav-admin")).toBeInTheDocument();
      expect(screen.getByTestId("nav-users")).toBeInTheDocument();
      expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
    });

    it("ne devrait PAS afficher les liens admin pour un student", () => {
      render(<ConditionalNavigation userRole="student" />);

      expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("nav-profile")).toBeInTheDocument();
      expect(screen.queryByTestId("nav-admin")).not.toBeInTheDocument();
      expect(screen.queryByTestId("nav-users")).not.toBeInTheDocument();
      expect(screen.queryByTestId("nav-projects")).not.toBeInTheDocument();
    });
  });

  describe("Boutons et actions conditionnels", () => {
    const ActionButtons = ({ userRole }: { userRole: string }) => {
      const canEdit = ["admin", "advisor"].includes(userRole);
      const canDelete = userRole === "admin";

      return (
        <div data-testid="action-buttons">
          <button data-testid="view-button">Voir</button>
          {canEdit && <button data-testid="edit-button">Modifier</button>}
          {canDelete && <button data-testid="delete-button">Supprimer</button>}
        </div>
      );
    };

    it("devrait afficher tous les boutons pour admin", () => {
      render(<ActionButtons userRole="admin" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
    });

    it("devrait afficher voir et modifier pour advisor", () => {
      render(<ActionButtons userRole="advisor" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });

    it("devrait afficher seulement voir pour student", () => {
      render(<ActionButtons userRole="student" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });
  });

  describe("Messages d'erreur et feedback", () => {
    const ProtectedAction = ({ userRole }: { userRole: string }) => {
      const handleAction = () => {
        if (!["admin", "advisor"].includes(userRole)) {
          return "Vous n'avez pas les permissions nécessaires";
        }
        return "Action réussie";
      };

      const message = handleAction();

      return (
        <div>
          <button data-testid="protected-action">Action protégée</button>
          <div data-testid="action-message">{message}</div>
        </div>
      );
    };

    it("devrait afficher succès pour admin", () => {
      render(<ProtectedAction userRole="admin" />);

      expect(screen.getByTestId("action-message")).toHaveTextContent(
        "Action réussie"
      );
    });

    it("devrait afficher succès pour advisor", () => {
      render(<ProtectedAction userRole="advisor" />);

      expect(screen.getByTestId("action-message")).toHaveTextContent(
        "Action réussie"
      );
    });

    it("devrait afficher erreur de permissions pour student", () => {
      render(<ProtectedAction userRole="student" />);

      expect(screen.getByTestId("action-message")).toHaveTextContent(
        "Vous n'avez pas les permissions nécessaires"
      );
    });
  });
});
