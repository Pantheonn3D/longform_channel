# Channel setup checklist

Work through this in order. YouTube Studio moves menus around now and then, so if something isn't exactly where it's described, search for its name in Studio's settings search.

## 1. Create the channel

- [ ] In YouTube, use **Create a channel** under your Google account and choose a name you can edit (a Brand Account), not your personal name. Brand Accounts let you add managers later without sharing your login.
- [ ] Name: **Orrery**
- [ ] Handle: the first available one from `channel/identity.md`

## 2. Verify (this unlocks features)

- [ ] **Phone verification**: Studio → Settings → Channel → Feature eligibility → *Intermediate features*. This unlocks custom thumbnails and uploads longer than 15 minutes. Video 1 is 12:17, but later videos may run longer.
- [ ] **Advanced features**: same page. Unlock them with video verification, ID, or enough channel history. They're needed for external links in descriptions and, as far as I know, for thumbnail **Test & Compare**. Please check what the page shows for your channel.
- Pinned comments need no verification. Any channel owner can pin a comment.

## 3. Profile and branding

Studio → Customization → Profile:

- [ ] Profile picture: `brand/out/logo-800.png`
- [ ] Banner: `brand/out/banner-2560x1440.png`. Check the device preview: text should be fully visible on mobile.
- [ ] Name / handle as above
- [ ] Description: copy from `channel/identity.md`
- [ ] Contact email: optional. Use a separate address if you don't want the main one public.
- [ ] Video watermark: `brand/out/watermark-150.png`, display time **Entire video**

## 4. Channel settings

Studio → Settings:

- [ ] **Channel → Basic info**: country of residence (it affects monetization terms; use your real one); keywords from `identity.md`
- [ ] **Channel → Advanced settings → Audience**: *No, set this channel as not made for kids*. Videos marked "made for kids" lose comments (so no pinned comments), notifications and personalised ads.
- [ ] **Upload defaults → Basic info**:
  - Description template (the last lines of every description):
    ```
    ——
    Orrery makes animated documentaries about how things actually work.
    Sources are listed above. Corrections are pinned in the comments.
    ```
  - Visibility: Private (publish after checking each upload)
- [ ] **Upload defaults → Advanced settings**: Category **Education**, video language English, title/description language English, caption certification *None*, licence Standard YouTube Licence, allow embedding **on**, "Publish to subscriptions feed" **on**, shorts remixing **on**
- [ ] **Community → Defaults**: comments *Hold potentially inappropriate comments for review*

## 5. Home tab

Customization → Layout:

- [ ] Channel trailer for people who haven't subscribed: video 001, until there's a trailer
- [ ] Featured video for returning subscribers: the newest upload
- [ ] Sections: add "Videos" now; add playlists once there are two or more videos

## 6. Uploading video 001

Everything is in `videos/001-antikythera/package.md`.

## 7. What's not done yet

- **Narration**: the current voice is Kokoro, a local open-source TTS voice. It's usable for review but not the final quality. The ElevenLabs step is already wired up (see `README.md`). One catch: `api.elevenlabs.io` is blocked by this cloud environment's network policy, so either allow that domain in the environment's network settings or run the TTS step on your own machine.
- **Music**: there's no music bed yet. You can add a track from the YouTube Audio Library in Studio's editor after upload, or put a licensed track at `videos/001-antikythera/build/music.wav` and re-render, since the mixer already supports one.
- **Name pronunciation**: I can't listen to audio here. Before publishing, check how "Antikythera", "Hipparchus", "Stais", "Karakalos" and "Saros" are pronounced. Corrections go in `videos/001-antikythera/pronounce.json`.
