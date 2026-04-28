import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Runs every day at Midnight (timezone: Australia/Sydney)
export const dailyQuestReset = onSchedule({
  schedule: "0 0 * * *",
  timeZone: "Australia/Sydney",
}, async () => {
  console.log("Starting daily quest reset check...");

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const currentDay = new Date().getDay();
  const isSunday = currentDay === 0;

  try {
    // 1. Fetch all completed quests
    const questsSnapshot = await db.collection("quests")
      .where("status", "==", "Completed")
      .get();

    const batch = db.batch();
    let resetCount = 0;

    questsSnapshot.forEach((doc) => {
      const questData = doc.data();
      const frequency = questData.frequency || "one-off";

      let shouldReset = false;

      if (frequency === "daily") {
        shouldReset = true;
      } else if (frequency === "weekly" && isSunday) {
        shouldReset = true;
      }

      if (shouldReset) {
        batch.update(doc.ref, {
          status: "Available",
          claimedBy: null,
        });
        resetCount++;
      }
    });

    // 2. Weekly Player Reset (Reset allowance progress on Sunday)
    let playerResetCount = 0;
    if (isSunday) {
      console.log("It's Sunday! Resetting player weekly allowance progress...");
      const playersSnapshot = await db.collection("players").get();
      playersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          weeklyNonNegotiablesCompleted: 0,
        });
        playerResetCount++;
      });
    }

    // 3. Commit the batch
    if (resetCount > 0 || playerResetCount > 0) {
      await batch.commit();
      console.log(
        `Successfully reset ${resetCount} quests and ` +
        `${playerResetCount} players.`
      );
    } else {
      console.log("No quests or players required resetting today.");
    }
  } catch (error) {
    console.error("Error during quest reset execution:", error);
  }
});
