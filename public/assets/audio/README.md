# Audio assets

Files are served by Vite from `public/` at `/assets/audio/…`.

## Music (`public/assets/audio/music/`)

| File | URL | Usage |
|------|-----|--------|
| `gamestart.mp3` | `/assets/audio/music/gamestart.mp3` | Menu — loops until Play |
| `background sound.mp3` | `/assets/audio/music/background%20sound.mp3` | Gameplay — fades in after menu |

## Sound effects (`public/assets/audio/sfx/`)

| File | URL | Usage |
|------|-----|--------|
| `click.mp3` | `/assets/audio/sfx/click.mp3` | Play, Mail, Close, Exit |
| `getcoin.wav` | `/assets/audio/sfx/getcoin.wav` | Coin pickup |
| `jumpsound.wav` | `/assets/audio/sfx/jumpsound.wav` | Jump |
| `walking.mp3` | `/assets/audio/sfx/walking.mp3` | Walking loop |
| `mailalert.wav` | `/assets/audio/sfx/mailalert.wav` | After victory at 20/20 coins |
| `vicotroy.mp3` | `/assets/audio/sfx/vicotroy.mp3` | 20th coin collected |
| `boytalk.wav` | `/assets/audio/sfx/boytalk.wav` | Boy speech blip (secret-ending dialogue) |
| `girltalk.wav` | `/assets/audio/sfx/girltalk.wav` | Girl speech blip (secret-ending dialogue) |

## Music (optional, secret ending)

| File | URL | Usage |
|------|-----|--------|
| `emotional.mp3` | `/assets/audio/music/emotional.mp3` | Soft track during the visual novel |

No rebuild is required after adding files — refresh the page.

Missing files log a `[AudioManager] Audio file not found:` warning; the game continues silently.
