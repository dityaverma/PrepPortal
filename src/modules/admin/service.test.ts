import { adminService } from "./service";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { count: jest.fn() },
    workspace: { count: jest.fn() },
    subject: { count: jest.fn() },
    topic: { count: jest.fn() },
    question: { count: jest.fn() },
  },
}));

describe("AdminService", () => {
  it("should fetch system metadata correctly", async () => {
    // mock count values
    (prisma.user.count as jest.Mock).mockResolvedValue(10);
    (prisma.workspace.count as jest.Mock).mockResolvedValue(5);
    (prisma.subject.count as jest.Mock).mockResolvedValue(3);
    (prisma.topic.count as jest.Mock).mockResolvedValue(8);
    (prisma.question.count as jest.Mock).mockResolvedValue(50);

    const result = await adminService.getSystemMetadata();

    // assert counts and metadata fields
    expect(result.counts.users).toBe(10);
    expect(result.counts.workspaces).toBe(5);
    expect(result.counts.subjects).toBe(3);
    expect(result.counts.topics).toBe(8);
    expect(result.counts.questions).toBe(50);
    expect(result.systemStatus).toBe("HEALTHY");
  });
});
