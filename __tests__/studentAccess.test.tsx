/**
 * Tests spécifiques pour les restrictions d'accès Student
 * Teste les permissions et accès des étudiants
 */

import { render, screen } from "@testing-library/react";

// Composant de test simple pour les permissions student
const StudentPermissionGuard = ({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: string;
}) => {
  if (userRole !== "student") {
    return (
      <div data-testid="access-denied">Accès refusé - Student uniquement</div>
    );
  }

  return <>{children}</>;
};

// Composant qui vérifie les permissions student
const StudentComponent = ({ userRole }: { userRole: string }) => {
  const canAccessStudent = userRole === "student";
  const canView = ["admin", "advisor", "student"].includes(userRole);
  const canEdit = false; // Student ne peut pas modifier
  const canDelete = false; // Student ne peut pas supprimer

  return (
    <div data-testid="student-interface">
      <h1>Interface Étudiant</h1>
      {canAccessStudent && (
        <div data-testid="student-specific">Fonctions spécifiques étudiant</div>
      )}
      {canView && (
        <div data-testid="view-permissions">Permissions de visualisation</div>
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

describe("Restrictions d'accès Student", () => {
  describe("Accès aux interfaces Étudiant", () => {
    it("devrait permettre l'accès student aux pages étudiant", () => {
      render(<StudentComponent userRole="student" />);

      expect(screen.getByTestId("student-interface")).toBeInTheDocument();
      expect(screen.getByTestId("student-specific")).toBeInTheDocument();
      expect(screen.getByTestId("view-permissions")).toBeInTheDocument();
    });

    it("devrait permettre l'accès admin aux pages étudiant (lecture)", () => {
      render(<StudentComponent userRole="admin" />);

      expect(screen.getByTestId("student-interface")).toBeInTheDocument();
      expect(screen.queryByTestId("student-specific")).not.toBeInTheDocument();
      expect(screen.getByTestId("view-permissions")).toBeInTheDocument();
    });

    it("devrait permettre l'accès advisor aux pages étudiant (lecture)", () => {
      render(<StudentComponent userRole="advisor" />);

      expect(screen.getByTestId("student-interface")).toBeInTheDocument();
      expect(screen.queryByTestId("student-specific")).not.toBeInTheDocument();
      expect(screen.getByTestId("view-permissions")).toBeInTheDocument();
    });
  });

  describe("Permissions de modification", () => {
    it("ne devrait PAS permettre à student de modifier", () => {
      render(<StudentComponent userRole="student" />);

      expect(screen.queryByTestId("edit-permissions")).not.toBeInTheDocument();
    });

    it("ne devrait PAS permettre à admin de modifier (dans ce contexte)", () => {
      render(<StudentComponent userRole="admin" />);

      expect(screen.queryByTestId("edit-permissions")).not.toBeInTheDocument();
    });
  });

  describe("Permissions de suppression", () => {
    it("ne devrait PAS permettre à student de supprimer", () => {
      render(<StudentComponent userRole="student" />);

      expect(
        screen.queryByTestId("delete-permissions")
      ).not.toBeInTheDocument();
    });

    it("ne devrait PAS permettre à admin de supprimer (dans ce contexte)", () => {
      render(<StudentComponent userRole="admin" />);

      expect(
        screen.queryByTestId("delete-permissions")
      ).not.toBeInTheDocument();
    });
  });

  describe("Guard de permissions", () => {
    it("devrait permettre l'accès student au composant protégé", () => {
      render(
        <StudentPermissionGuard userRole="student">
          <div data-testid="protected-content">Contenu protégé étudiant</div>
        </StudentPermissionGuard>
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("devrait refuser l'accès admin au composant student-only", () => {
      render(
        <StudentPermissionGuard userRole="admin">
          <div data-testid="protected-content">Contenu protégé étudiant</div>
        </StudentPermissionGuard>
      );

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("devrait refuser l'accès advisor au composant student-only", () => {
      render(
        <StudentPermissionGuard userRole="advisor">
          <div data-testid="protected-content">Contenu protégé étudiant</div>
        </StudentPermissionGuard>
      );

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });
  });

  describe("Navigation conditionnelle", () => {
    const StudentNavigation = ({ userRole }: { userRole: string }) => {
      const isStudent = userRole === "student";
      const isAdmin = userRole === "admin";
      const isAdvisor = userRole === "advisor";

      return (
        <nav data-testid="navigation">
          <a href="/dashboard" data-testid="nav-dashboard">
            Dashboard
          </a>
          <a href="/profile" data-testid="nav-profile">
            Profil
          </a>
          <a href="/projects" data-testid="nav-projects">
            Projets
          </a>
          <a href="/informations" data-testid="nav-informations">
            Informations
          </a>
          {isStudent && (
            <a href="/student/dashboard" data-testid="nav-student-dashboard">
              Dashboard Étudiant
            </a>
          )}
          {(isAdmin || isAdvisor) && (
            <>
              <a href="/admin" data-testid="nav-admin">
                Administration
              </a>
              <a href="/admin/students" data-testid="nav-students">
                Étudiants
              </a>
            </>
          )}
        </nav>
      );
    };

    it("devrait afficher les liens étudiant pour student", () => {
      render(<StudentNavigation userRole="student" />);

      expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("nav-profile")).toBeInTheDocument();
      expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
      expect(screen.getByTestId("nav-informations")).toBeInTheDocument();
      expect(screen.getByTestId("nav-student-dashboard")).toBeInTheDocument();
      expect(screen.queryByTestId("nav-admin")).not.toBeInTheDocument();
    });

    it("devrait afficher les liens admin pour admin", () => {
      render(<StudentNavigation userRole="admin" />);

      expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("nav-profile")).toBeInTheDocument();
      expect(screen.getByTestId("nav-projects")).toBeInTheDocument();
      expect(screen.getByTestId("nav-informations")).toBeInTheDocument();
      expect(
        screen.queryByTestId("nav-student-dashboard")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("nav-admin")).toBeInTheDocument();
      expect(screen.getByTestId("nav-students")).toBeInTheDocument();
    });

    it("devrait afficher les liens admin pour advisor", () => {
      render(<StudentNavigation userRole="advisor" />);

      expect(screen.getByTestId("nav-admin")).toBeInTheDocument();
      expect(screen.getByTestId("nav-students")).toBeInTheDocument();
      expect(
        screen.queryByTestId("nav-student-dashboard")
      ).not.toBeInTheDocument();
    });
  });

  describe("Actions conditionnelles", () => {
    const StudentActions = ({ userRole }: { userRole: string }) => {
      const canView = ["admin", "advisor", "student"].includes(userRole);
      const canEdit = ["admin", "advisor"].includes(userRole);
      const canDelete = userRole === "admin";
      const canSubmit = userRole === "student";

      return (
        <div data-testid="action-buttons">
          {canView && <button data-testid="view-button">Voir</button>}
          {canEdit && <button data-testid="edit-button">Modifier</button>}
          {canDelete && <button data-testid="delete-button">Supprimer</button>}
          {canSubmit && <button data-testid="submit-button">Soumettre</button>}
        </div>
      );
    };

    it("devrait afficher les actions student appropriées", () => {
      render(<StudentActions userRole="student" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("devrait afficher toutes les actions pour admin", () => {
      render(<StudentActions userRole="admin" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
      expect(screen.queryByTestId("submit-button")).not.toBeInTheDocument();
    });

    it("devrait afficher les actions advisor appropriées", () => {
      render(<StudentActions userRole="advisor" />);

      expect(screen.getByTestId("view-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("submit-button")).not.toBeInTheDocument();
    });
  });

  describe("Accès aux pages spécifiques", () => {
    const StudentPages = ({ userRole }: { userRole: string }) => {
      const canAccessStudentPages = userRole === "student";
      const canAccessAdminPages = ["admin", "advisor"].includes(userRole);

      return (
        <div data-testid="student-pages">
          <h2>Pages Étudiant</h2>
          {canAccessStudentPages && (
            <>
              <div data-testid="page-dashboard">Dashboard Étudiant</div>
              <div data-testid="page-projects">Mes Projets</div>
              <div data-testid="page-grades">Mes Notes</div>
            </>
          )}
          {canAccessAdminPages && (
            <>
              <div data-testid="page-admin">Administration</div>
              <div data-testid="page-students">Gestion Étudiants</div>
            </>
          )}
        </div>
      );
    };

    it("devrait afficher les pages étudiant pour student", () => {
      render(<StudentPages userRole="student" />);

      expect(screen.getByTestId("page-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("page-projects")).toBeInTheDocument();
      expect(screen.getByTestId("page-grades")).toBeInTheDocument();
      expect(screen.queryByTestId("page-admin")).not.toBeInTheDocument();
    });

    it("devrait afficher les pages admin pour admin", () => {
      render(<StudentPages userRole="admin" />);

      expect(screen.queryByTestId("page-dashboard")).not.toBeInTheDocument();
      expect(screen.queryByTestId("page-projects")).not.toBeInTheDocument();
      expect(screen.queryByTestId("page-grades")).not.toBeInTheDocument();
      expect(screen.getByTestId("page-admin")).toBeInTheDocument();
      expect(screen.getByTestId("page-students")).toBeInTheDocument();
    });
  });
});
