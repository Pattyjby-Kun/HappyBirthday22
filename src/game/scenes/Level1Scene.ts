import Phaser from "phaser"

import {
  Colors,
  FONT_FAMILY,
  GAME_HEIGHT,
  LEVEL_WIDTH,
  SceneKeys,
  TextureKeys,
  TOTAL_COINS,
} from "../constants"
import { Player } from "../Player"
import type { PlayerInput } from "../Player"
import { audioManager } from "../audio"
import { SecretEndingController } from "../secretEnding"
import type { TouchInputState } from "../touchInput"

interface MovementKeys {
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
  up: Phaser.Input.Keyboard.Key
  jump: Phaser.Input.Keyboard.Key
}

const PLATFORM_LAYOUT: ReadonlyArray<{ x: number; y: number }> = [
  { x: 280, y: 430 },
  { x: 500, y: 360 },
  { x: 720, y: 300 },
  { x: 940, y: 370 },
  { x: 1160, y: 300 },
  { x: 1380, y: 370 },
  { x: 1600, y: 300 },
  { x: 1820, y: 370 },
  { x: 2040, y: 300 },
  { x: 2240, y: 410 },
]

export class Level1Scene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private playerController!: Player
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private coins!: Phaser.Physics.Arcade.Group
  private door?: Phaser.Physics.Arcade.Sprite

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: MovementKeys

  private coinText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text

  private coinsCollected = 0
  private hasWon = false

  /** Optional hidden ending; created only after the door opens. */
  private secretEnding?: SecretEndingController

  constructor() {
    super(SceneKeys.Level1)
  }

  create(): void {
    this.coinsCollected = 0
    this.hasWon = false
    this.door = undefined
    this.secretEnding = undefined

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBackgroundColor(Colors.background)

    this.createPlatforms()
    this.createPlayer()
    this.createCoins()
    this.createHud()
    this.createInput()

    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.overlap(this.player, this.coins, this.handleCoinOverlap, undefined, this)

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
  }

  update(): void {
    if (this.hasWon) {
      return
    }

    // Secret ending owns the player during the hug/ending: skip the movement +
    // animation state machine entirely so the hug pose isn't overwritten. The
    // controller has already zeroed the player's velocity.
    if (this.secretEnding?.isPlayerLocked()) {
      this.secretEnding.update()
      return
    }

    // Movement + animation now live in the Player class; the scene only reads input.
    this.playerController.update(this.readInput())

    // Optional hidden ending (present only after the door opens); never affects
    // the normal win path above.
    this.secretEnding?.update()
  }

  /** Merges keyboard and optional touch input into a single movement intent. */
  private readInput(): PlayerInput {
    // Optional touch input (mobile). Absent on desktop, so keyboard is untouched.
    const touch = this.game.registry.get("touchInput") as TouchInputState | undefined

    const left = this.cursors.left?.isDown || this.keys.left.isDown || touch?.left === true
    const right = this.cursors.right?.isDown || this.keys.right.isDown || touch?.right === true

    const keyboardJump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump)

    // Consume the queued touch jump so holding the button can't repeat-jump.
    const touchJump = touch?.jumpQueued === true
    if (touch) {
      touch.jumpQueued = false
    }

    return { left, right, jump: keyboardJump || touchJump }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup()

    const groundY = GAME_HEIGHT - 16
    for (let x = 0; x < LEVEL_WIDTH; x += 64) {
      this.platforms.create(x + 32, groundY, TextureKeys.Ground)
    }

    PLATFORM_LAYOUT.forEach((p) => {
      this.platforms.create(p.x, p.y, TextureKeys.Platform)
    })
  }

  private createPlayer(): void {
    // Player owns its sprite; the scene keeps a reference for colliders/camera.
    this.playerController = new Player(this, 80, GAME_HEIGHT - 120)
    this.player = this.playerController.sprite
  }

  private createCoins(): void {
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true })

    const positions = this.buildCoinPositions()
    positions.forEach((pos, index) => {
      const coin = this.coins.create(pos.x, pos.y, TextureKeys.Coin) as Phaser.Physics.Arcade.Sprite
      coin.setCircle(8)
      this.tweens.add({
        targets: coin,
        y: pos.y - 8,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
        delay: (index % 6) * 90,
      })
    })
  }

  /** 10 coins along the ground and 10 hovering above the platforms = 20 total. */
  private buildCoinPositions(): ReadonlyArray<{ x: number; y: number }> {
    const positions: { x: number; y: number }[] = []

    for (let i = 0; i < 10; i += 1) {
      positions.push({ x: 200 + i * 220, y: GAME_HEIGHT - 70 })
    }

    PLATFORM_LAYOUT.forEach((p) => {
      positions.push({ x: p.x, y: p.y - 38 })
    })

    return positions
  }

  private createHud(): void {
    this.coinText = this.add
      .text(16, 16, this.formatCoinText(), {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#ffd447",
      })
      .setScrollFactor(0)
      .setDepth(50)

    this.hintText = this.add
      .text(this.scale.width / 2, 20, "", {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#8be9fd",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(50)
  }

  private createInput(): void {
    const keyboard = this.input.keyboard
    if (!keyboard) {
      return
    }

    this.cursors = keyboard.createCursorKeys()
    this.keys = keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as MovementKeys

    keyboard.on("keydown-ESC", this.exitToShell)
  }

  private handleCoinOverlap: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, coinObject) => {
    const coin = coinObject as Phaser.Physics.Arcade.Sprite
    if (!coin.active) {
      return
    }

    coin.disableBody(true, true)
    this.coinsCollected += 1
    this.coinText.setText(this.formatCoinText())
    audioManager.playCoin()

    if (this.coinsCollected >= TOTAL_COINS) {
      this.spawnDoor()
    }
  }

  private spawnDoor(): void {
    const doorX = LEVEL_WIDTH - 80
    const doorY = GAME_HEIGHT - 32 - 32

    this.door = this.physics.add.sprite(doorX, doorY, TextureKeys.Door)
    this.door.setImmovable(true)
    const body = this.door.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)

    this.door.setAlpha(0)
    this.tweens.add({ targets: this.door, alpha: 1, duration: 400 })

    this.hintText.setText("THE DOOR HAS OPENED! →")
    this.physics.add.overlap(this.player, this.door, this.handleDoorOverlap, undefined, this)

    // Victory → mail SFX, then notify React to show the toast exactly once.
    audioManager.playVictoryThenMail(() => {
      this.game.events.emit("mail-unlocked")
    })

    // The door is open. Enter it for the normal ending (unchanged), OR walk back
    // to the start to discover the optional secret ending. Spawn its controller
    // now; it stays dormant until the player returns to the NPC.
    const groundTopY = GAME_HEIGHT - 32
    this.secretEnding = new SecretEndingController(this, this.player, groundTopY)
  }

  private handleDoorOverlap: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (this.hasWon) {
      return
    }
    this.hasWon = true
    this.showWinScreen()
  }

  private showWinScreen(): void {
    audioManager.setWalking(false)
    this.physics.pause()
    this.player.setVelocity(0, 0)
    this.player.setTint(0x00ff88)

    const { width, height } = this.scale

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setScrollFactor(0)
      .setDepth(100)

    this.add
      .text(width / 2, height * 0.4, "YOU WON OF MY HEART!", {
        fontFamily: FONT_FAMILY,
        fontSize: "48px",
        color: "#ffd447",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)

    this.add
      .text(width / 2, height * 0.55, `${TOTAL_COINS} / ${TOTAL_COINS} COINS COLLECTED`, {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)

    const again = this.add
      .text(width / 2, height * 0.72, "PRESS SPACE / CLICK FOR MENU", {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        color: "#8be9fd",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)

    this.tweens.add({
      targets: again,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    this.input.keyboard?.once("keydown-SPACE", this.returnToMenu)
    this.input.once("pointerdown", this.returnToMenu)
    this.game.events.emit("level-complete")
  }

  private returnToMenu = (): void => {
    this.scene.start(SceneKeys.Menu)
  }

  private exitToShell = (): void => {
    const onExit = this.game.registry.get("onExit") as (() => void) | undefined
    onExit?.()
  }

  private formatCoinText(): string {
    return `COINS ${this.coinsCollected} / ${TOTAL_COINS}`
  }
}
