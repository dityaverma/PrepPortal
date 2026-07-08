import { prisma } from "@/lib/prisma";

export enum RecoveryAction {
  RECOVERY_QUIZ = "RECOVERY_QUIZ",
  MASTERY_MODE = "MASTERY_MODE",
  NONE = "NONE",
}

// retry engine coordinates quiz attempt iterations and controls mastery threshold switches
export class RetryEngine {
  // evaluate the attempt status and decide next steps
  async determineNextAction(workspaceId: string, topicId: string): Promise<{
    attemptNumber: number;
    action: RecoveryAction;
  }> {
    // count previous recovery attempts for this topic in the active workspace
    const attemptCount = await prisma.recoveryQuiz.count({
      where: {
        workspaceId,
        topicId,
      },
    });

    const nextAttemptNumber = attemptCount + 1;

    // maximum allowed ai generated attempts is two
    if (nextAttemptNumber > 2) {
      return {
        attemptNumber: nextAttemptNumber,
        action: RecoveryAction.MASTERY_MODE,
      };
    }

    return {
      attemptNumber: nextAttemptNumber,
      action: RecoveryAction.RECOVERY_QUIZ,
    };
  }
}

export const retryEngine = new RetryEngine();
