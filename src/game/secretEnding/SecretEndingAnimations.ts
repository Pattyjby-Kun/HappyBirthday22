import type Phaser from "phaser"

import boyHugArt from "../art/boy-hug.txt?raw"
import boyStandingArt from "../art/boy-standing.txt?raw"
import boyWorryingArt from "../art/boy-worrying.txt?raw"
import girlAngryArt from "../art/girl-angry.txt?raw"
import girlHugArt from "../art/girl-hug.txt?raw"
import heartArt from "../art/heart.txt?raw"
import {
  BoyAnimKeys,
  BoyFramePrefix,
  GirlAnimKeys,
  GirlFramePrefix,
  HeartAnimKey,
  HeartFramePrefix,
} from "../constants"
import { bakeAnimationSet } from "../PlayerAnimations"

/**
 * Bakes every texture/animation used by the hidden secret ending. Called once
 * from BootScene alongside the player animations. Kept separate so none of the
 * normal gameplay art baking is touched.
 */
export function createSecretEndingAnimations(scene: Phaser.Scene): void {
  // Boy's three poses share one bounding box so he doesn't shift between states.
  bakeAnimationSet(scene, [
    { prefix: BoyFramePrefix.Worrying, animKey: BoyAnimKeys.Worrying, frameRate: 4, css: boyWorryingArt },
    { prefix: BoyFramePrefix.Standing, animKey: BoyAnimKeys.Standing, frameRate: 5, css: boyStandingArt },
    { prefix: BoyFramePrefix.Hug, animKey: BoyAnimKeys.Hug, frameRate: 4, css: boyHugArt },
  ])

  // Girl dialogue/hug poses (hug is swapped onto the player sprite during the hug).
  bakeAnimationSet(scene, [
    { prefix: GirlFramePrefix.Hug, animKey: GirlAnimKeys.Hug, frameRate: 4, css: girlHugArt },
    { prefix: GirlFramePrefix.Angry, animKey: GirlAnimKeys.Angry, frameRate: 5, css: girlAngryArt },
  ])

  // Heart plays once (repeat 0) then floats away.
  bakeAnimationSet(scene, [
    { prefix: HeartFramePrefix, animKey: HeartAnimKey, frameRate: 8, css: heartArt, repeat: 0 },
  ])
}
