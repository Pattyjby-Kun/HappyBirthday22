/**
 * Visual-novel content for the secret ending. Pure data + metadata so future
 * stories can be dropped in without touching the dialogue system: each line
 * references a character ID from `characters.ts` and, optionally, a special
 * animation to play instead of the default "talking" pose.
 */

import { CharacterIds, type CharacterId } from "./characters"

export type { CharacterId }

/** Optional per-line animation override (otherwise the speaker just "talks"). */
export type DialogueAnimation = "worrying" | "angry"

export interface DialogueLine {
  speaker: CharacterId
  text: string
  /** Emotional pose held for this whole line (overrides the talking pose). */
  animation?: DialogueAnimation
}

/** Typewriter speed in ms/char (spec: 30–40ms). */
export const TYPE_SPEED_MS = 35

export const SECRET_ENDING_DIALOGUE: readonly DialogueLine[] = [
  { speaker: CharacterIds.Press, text: "ว่างไงจ๊ะที่รัก เค้าส่งจดหมายไปให้ได้อ่านมุ้ย" },
  { speaker: CharacterIds.Tulip, text: "อ่านแย้ว ตะไมอุนเตอมาอยู่ตรงนี้เนี่ย", animation: "angry" },
  {
    speaker: CharacterIds.Press,
    text: "เอ่อ...\nเค้าแค่อยากจะเซอร์ไพร์สสะหน่อย\nมะดุเค้า",
    animation: "worrying",
  },
  { speaker: CharacterIds.Tulip, text: "งืออ\nมะเป็นไย" },
  {
    speaker: CharacterIds.Press,
    text: "เค้าขอกอดหน่อยได้ไหม\nเค้าอยากจะเพิ่มพลังให้หม่ำมี๊\nคงเล่นเกมกระโดดไปมาจนเหนื่อยเลยใช่ไหม",
  },
  { speaker: CharacterIds.Tulip, text: "อื้ออ\nได้จิมาให้กอดเยยย" },
]

/** Final "Happy Ending" card shown after the last hug. */
export const HAPPY_ENDING = {
  header: "Happy Ending",
  body: "สุขสันต์วันเกิดครบ 22 ปี\nและครบรอบ 4 ปีล่วงหน้านะหม่ำมี๊ ☺️🥰",
  heart: "❤️",
  footer: "Thank you for playing.",
} as const
