import Phaser from "phaser"

import { BoyAnimKeys, GirlAnimKeys, SceneKeys } from "../constants"
import { DialogueBox } from "./DialogueBox"
import { DialogueAudio } from "./DialogueAudio"
import { DialogueManager } from "./DialogueManager"
import { SECRET_ENDING_DIALOGUE, TYPE_SPEED_MS } from "./script"
import { SpeakerController } from "./SpeakerController"
import { Typewriter } from "./Typewriter"

export interface DialogueSceneData {
  /** Called once the conversation has finished and faded out. */
  onComplete?: () => void
}

/**
 * Dedicated visual-novel scene launched over Level1. Renders a background, two
 * animated speaker sprites and a retro dialogue box, and runs the typewriter +
 * speech-blip loop. On completion it fades out and invokes `onComplete`, which
 * returns control to the secret-ending controller for the hug + happy ending.
 *
 * All dialogue logic lives here / in the reusable helpers — never in Level1.
 */
export class DialogueScene extends Phaser.Scene {
  private manager!: DialogueManager
  private speakers!: SpeakerController
  private box!: DialogueBox
  private readonly typewriter = new Typewriter()
  private readonly voice = new DialogueAudio()

  private onComplete?: () => void
  private ready = false
  private finishing = false
  private typingDoneHandled = false

  constructor() {
    super(SceneKeys.Dialogue)
  }

  create(data: DialogueSceneData): void {
    this.onComplete = data?.onComplete
    this.ready = false
    this.finishing = false

    const { width, height } = this.scale

    // Retro backdrop: deep purple sky over a darker floor band.
    this.cameras.main.setBackgroundColor("#080611")
    const bg = this.add.graphics().setDepth(0)
    bg.fillStyle(0x160f2e, 1)
    bg.fillRect(0, 0, width, height)
    bg.fillStyle(0x0b0b12, 1)
    bg.fillRect(0, height * 0.72, width, height * 0.28)
    bg.lineStyle(2, 0x2a2350, 1)
    bg.lineBetween(0, height * 0.72, width, height * 0.72)

    this.manager = new DialogueManager(SECRET_ENDING_DIALOGUE)
    this.speakers = new SpeakerController(this)
    this.box = new DialogueBox(this)
    this.voice.reset()

    // Verify secret-ending clips were baked at boot (debug).
    console.log("[DialogueScene] boy-anim-worrying exists:", this.anims.exists(BoyAnimKeys.Worrying))
    console.log("[DialogueScene] girl-anim-angry exists:", this.anims.exists(GirlAnimKeys.Angry))

    this.input.keyboard?.on("keydown-SPACE", this.handleAdvance, this)
    this.input.keyboard?.on("keydown-ENTER", this.handleAdvance, this)
    this.input.on("pointerdown", this.handleAdvance, this)

    this.cameras.main.fadeIn(400, 0, 0, 0)
    // Small guard so the tap that opened the dialogue can't instantly advance.
    this.time.delayedCall(220, () => {
      this.ready = true
    })

    this.startLine()
  }

  update(_time: number, delta: number): void {
    if (this.typewriter.isDone) {
      return
    }
    this.typewriter.update(delta)
    this.box.setText(this.typewriter.text)
    if (this.typewriter.isDone) {
      this.onTypingComplete()
    }
  }

  private startLine(): void {
    const line = this.manager.current
    if (!line) {
      this.finish()
      return
    }

    this.typingDoneHandled = false
    this.box.setSpeaker(line.speaker)
    this.box.setText("")
    this.box.hideIndicator()

    this.speakers.beginLine(line)

    const speaker = line.speaker
    this.typewriter.start(line.text, TYPE_SPEED_MS, (char) => this.voice.onCharacter(speaker, char))
  }

  private onTypingComplete(): void {
    if (this.typingDoneHandled) {
      return
    }
    this.typingDoneHandled = true

    this.box.setText(this.typewriter.text)
    this.box.showIndicator()

    const line = this.manager.current
    if (line) {
      this.speakers.onLineTypingComplete(line.speaker)
    }
  }

  private handleAdvance = (): void => {
    if (!this.ready || this.finishing) {
      return
    }

    // First press finishes the current line; second advances.
    if (!this.typewriter.isDone) {
      this.typewriter.skip()
      this.box.setText(this.typewriter.text)
      this.onTypingComplete()
      return
    }

    if (this.manager.isLast()) {
      this.finish()
    } else {
      this.manager.next()
      this.startLine()
    }
  }

  private finish(): void {
    if (this.finishing) {
      return
    }
    this.finishing = true

    this.input.keyboard?.off("keydown-SPACE", this.handleAdvance, this)
    this.input.keyboard?.off("keydown-ENTER", this.handleAdvance, this)
    this.input.off("pointerdown", this.handleAdvance, this)

    this.cameras.main.fadeOut(500, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const done = this.onComplete
      this.scene.stop()
      done?.()
    })
  }
}
