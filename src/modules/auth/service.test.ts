import { AuthService } from "./service";
import { ValidationError, AuthError } from "@/common/errors";

describe("AuthService", () => {
  let authService: AuthService;
  let mockAuthRepository: any;

  beforeEach(() => {
    mockAuthRepository = {
      findByEmail: jest.fn(),
      findRoleByName: jest.fn(),
      createRole: jest.fn(),
      createPermission: jest.fn(),
      assignPermissionToRole: jest.fn(),
      createUser: jest.fn(),
      getUserPermissions: jest.fn(),
    };
    authService = new AuthService(mockAuthRepository);
  });

  describe("register", () => {
    it("should throw ValidationError if email already exists", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue({ id: "123", email: "test@example.com" });

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          roleName: "STUDENT",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should successfully register a new user and return JWT", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockAuthRepository.findRoleByName.mockResolvedValue({ id: "role-1", name: "STUDENT" });
      mockAuthRepository.createUser.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        roleId: "role-1",
        role: { name: "STUDENT" },
      });
      mockAuthRepository.getUserPermissions.mockResolvedValue(["ACCESS_STUDENT"]);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        roleName: "STUDENT",
      });

      expect(result).toHaveProperty("token");
      expect(result.user.email).toBe("test@example.com");
      expect(mockAuthRepository.createUser).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should throw AuthError if email does not exist", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(AuthError);
    });
  });
});
