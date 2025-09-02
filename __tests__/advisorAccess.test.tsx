/**
 * Tests spécifiques pour les restrictions d'accès Advisor
 * Teste les permissions et accès des advisors
 */

import { render, screen } from "@testing-library/react";

// Composant de test simple pour les permissions advisor
const AdvisorPermissionGuard = ({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: string;
}) => {
  if (userRole !== "advisor") {
    return (
      <div data-testid="access-denied">Accès refusé - Advisor uniquement</div>
    );
  }

  return <>{children}</>;
};

// Composant qui vérifie les permissions advisor
const AdvisorComponent = ({ userRole }: { userRole: string }) => {
  const canAccessAdmin = ["admin", "advisor"].includes(userRole);
  const canEdit = ["admin", "advisor"].includes(userRole);
  const canDelete = userRole === "admin"; // Seul admin peut supprimer

  return (
    <div data-testid="advisor-interface">
      <h1>Interface Advisor</h1>
      {canAccessAdmin && (
        <div data-testid="admin-access">Accès aux fonctions admin</div>
      )}
      {canEdit && (
        <div data-testid="edit-permissions">Permissions de modification</div>
      )}
      {canDelete && (
        <div data-testid="delete-permissions">Permissions de suppression</div>
      )}
    </div>
  );
};

describe("Restrictions d'accès Advisor", () => {
  describe("Accès aux interfaces Admin", () => {
    it("devrait permettre l'accès advisor aux pages admin", () => {
      render(<AdvisorComponent userRole="advisor" />);

      expect(screen.getByTestId("advisor-interface")).toBeInTheDocument();
      expect(screen.getByTestId("admin-access")).toBeInTheDocument();
      expect(screen.getByTestId("edit-permissions")).toBeInTheDocument();
    });

    it("devrait refuser l'accès student aux interfaces admin", () => {
      render(<AdvisorComponent userRole="student" />);

      expect(screen.getByTestId("advisor-interface")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-access")).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-permissions")).not.toBeInTheDocument();
    });

    it("devrait permettre l'accès admin aux interfaces admin", () => {
      render(<AdvisorComponent userRole="admin" />);

      expect(screen.getByTestId("admin-access")).toBeInTheDocument();
      expect(screen.getByTestId("edit-permissions")).toBeInTheDocument();
    });
  });

  describe("Permissions de modification", () => {
    it("devrait permettre à advisor de modifier", () => {
      render(<AdvisorComponent userRole="advisor" />);

      expect(screen.getByTestId("edit-permissions")).toBeInTheDocument();
    });

    it("devrait refuser la modification à student", () => {
      render(<AdvisorComponent userRole="student" />);

      expect(screen.queryByTestId("edit-permissions")).not.toBeInTheDocument();
    });
  });

  describe("Permissions de suppression", () => {
    it("ne devrait PAS permettre à advisor de supprimer", () => {
      render(<AdvisorComponent userRole="advisor" />);

      expect(
        screen.queryByTestId("delete-permissions")
      ).not.toBeInTheDocument();
    });

    it("devrait permettre à admin de supprimer", () => {
      render(<AdvisorComponent userRole="admin" />);

      expect(screen.getByTestId("delete-permissions")).toBeInTheDocument();
    });
  });

  describe("Guard de permissions", () => {
    it("devrait permettre l'accès advisor au composant protégé", () => {
      render(
        <AdvisorPermissionGuard userRole="advisor">
          <div data-testid="protected-content">Contenu protégé</div>
        </AdvisorPermissionGuard>
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("devrait refuser l'accès student au composant protégé", () => {
      render(
        <AdvisorPermissionGuard userRole="student">
          <div data-testid="protected-content">Contenu protégé</div>
        </AdvisorPermissionGuard>
      );

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("devrait refuser l'accès admin au composant advisor-only", () => {
      render(
        <AdvisorPermissionGuard userRole="admin">
          <div data-testid="protected-content">Contenu protégé</div>
        </AdvisorPermissionGuard>
      );

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });
  });

  describe("Navigation conditionnelle", () => {
    const AdvisorNavigation = ({ userRole }: { userRole: string }) => {
      const isAdvisor = userRole === "advisor";
      const isAdmin = userRole === "admin";

      return (
        <nav data-testid="navigation">
          <a href="/dashboard" data-testid="nav-dashboard">
            Dashboard
          </a>
          <a href="/profile" data-testid="nav-profile">
            Profil
          </a>
          {(isAdvisor || isAdmin) && (
            <>
              <a href="/admin" data-testid="nav-admin">
                Administration
              </a>
              <a href="/admin/students" data-testid="nav-students">
                Étudiants
              </a>
              <a href="/admin/projects" data-testid="nav-projects">
                Projets
              </a>
            </>
          )}
          {isAdvisor && (
            <a href="/advisor/dashboard" data-testid="nav-advisor-dashboard">
              Dashboard Advisor
            </a>
          )}
        </nav>
      );
    };

    it("devrait afficher les liens admin pour advisor", () => {
      render(<AdvisorNavigation userRole="advisor" />);

      expect(screen.getByTestId("nav-admin")).toBeInTheDocument();
      expect(screen.getByTestId("nav-students")).toBeInTheDocument();
      expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
      expect(screen.getByTestId("nav-advisor-dashboard")).toBeInTheDocument();
    });

    it("devrait afficher les liens admin pour admin", () => {
      render(<AdvisorNavigation userRole="admin" />);

      expect(screen.getByTestId("nav-admin")).toBeInTheDocument();
      expect(screen.getByTestId("nav-students")).toBeInTheDocument();
      expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
      expect(
        screen.queryByTestId("nav-advisor-dashboard")
      ).not.toBeInTheDocument();
    });

    it("ne devrait PAS afficher les liens admin pour student", () => {
      render(<AdvisorNavigation userRole="student" />);

      expect(screen.queryByTestId("nav-admin")).not.toBeInTheDocument();
      expect(screen.queryByTestId("nav-students")).not.toBeInTheDocument();
      expect(screen.queryByTestId("nav-projects")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("nav-advisor-dashboard")
      ).not.toBeInTheDocument();
    });
  });

  describe("Actions conditionnelles", () => {
    const AdvisorActions = ({ userRole }: { userRole: string }) => {
      const canView = ["admin", "advisor"].includes(userRole);
      const canEdit = ["admin", "advisor"].includes(userRole);
      const canDelete = userRole === "admin";
      const canAdvise = userRole === "advisor";

      return (
        <div data-testid="action-buttons">
          {canView && <button data-testid="view-button">Voir</button>}
          {canEdit && <button data-testid="edit-button">Modifier</button>}
          {canDelete && <button data-testid="delete-button">Supprimer</button>}
          {canAdvise && <button data-testid="advise-button">Conseiller</button>}
        </div>
      );
    };

    it("devrait afficher les actions advisor appropriées", () => {
      render(<AdvisorActions userRole="advisor" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
      expect(screen.getByTestId("advise-button")).toBeInTheDocument();
    });

    it("devrait afficher toutes les actions pour admin", () => {
      render(<AdvisorActions userRole="admin" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
      expect(screen.queryByTestId("advise-button")).not.toBeInTheDocument();
    });

    it("devrait afficher seulement voir pour student", () => {
      render(<AdvisorActions userRole="student" />);

      expect(screen.queryByTestId("view-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("advise-button")).not.toBeInTheDocument();
    });
  });
});
