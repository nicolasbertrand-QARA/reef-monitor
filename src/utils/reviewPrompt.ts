import { Alert } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { Status } from '@/src/models/types';
import { getAppSetting, setAppSetting, getDistinctLoggingDays } from '@/src/db/queries';
import i18n from '@/src/i18n';

const MIN_DISTINCT_LOGGING_DAYS = 3;
const PROMPT_COOLDOWN_DAYS = 120;
const DECLINE_COOLDOWN_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Ask for an App Store rating only at a positive moment:
 * - the reading that was just saved is within target (never after a bad test),
 * - the user has logged on at least 3 distinct days (they actually use the app),
 * - no system prompt in the last 120 days, no declined pre-prompt in the last 60.
 *
 * A custom pre-prompt sheet filters intent before spending one of Apple's
 * 3 yearly SKStoreReview slots; decliners are routed nowhere (no store page).
 */
export async function maybePromptReview(lastSaveStatus: Status): Promise<void> {
  try {
    if (lastSaveStatus !== 'ok') return;
    if (!(await StoreReview.isAvailableAsync())) return;

    const now = Date.now();
    const lastPrompt = await getAppSetting('review_last_prompt_at');
    if (lastPrompt && now - Date.parse(lastPrompt) < PROMPT_COOLDOWN_DAYS * DAY_MS) return;
    const declined = await getAppSetting('review_declined_at');
    if (declined && now - Date.parse(declined) < DECLINE_COOLDOWN_DAYS * DAY_MS) return;

    const days = await getDistinctLoggingDays();
    if (days < MIN_DISTINCT_LOGGING_DAYS) return;

    // Let the save sheet finish closing before showing anything
    setTimeout(() => {
      Alert.alert(
        i18n.t('review.title'),
        i18n.t('review.message'),
        [
          {
            text: i18n.t('review.notNow'),
            style: 'cancel',
            onPress: () => { setAppSetting('review_declined_at', new Date().toISOString()); },
          },
          {
            text: i18n.t('review.rate'),
            onPress: async () => {
              await setAppSetting('review_last_prompt_at', new Date().toISOString());
              StoreReview.requestReview().catch(() => {});
            },
          },
        ]
      );
    }, 900);
  } catch {
    // Never let the review flow break a save
  }
}
