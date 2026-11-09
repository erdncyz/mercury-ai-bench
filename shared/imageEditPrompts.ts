// Mercury-authored photo-editing templates (attach a photo to an image-editing model and fill in the [BRACKETS]).
// prompts.chat is mostly text-to-image, so these are pinned above the live matches in the image-editing sections.

import type { CuratedPrompt } from './architectPrompts.ts'

export type EditStyle = 'cinematic' | 'bw' | 'film' | 'light' | 'retouch'

export interface EditPrompt extends CuratedPrompt {
  style: EditStyle
}

const KEEP_PHOTO = `Edit the attached photo — do not generate a new image from scratch:
- Keep the same subject(s), identity, facial features, expression, pose, framing and composition; no face swaps, no body reshaping.
- Keep every object, text and background element unless this prompt explicitly asks to change it.
- Match the original perspective and resolution; avoid plastic skin, over-sharpening, halos and other AI artefacts.`

const OUTPUT = `Output: [ASPECT, e.g. keep original / 16:9 / 4:5], highest available resolution, no added text, borders or watermark unless requested.`

function edit(
  style: EditStyle,
  id: string,
  title: { en: string; tr: string },
  description: { en: string; tr: string },
  tags: string[],
  body: string,
  output = OUTPUT,
): EditPrompt {
  return { style, id: `mercury-edit-${id}`, type: 'IMAGE', title, description, tags, content: `${body}\n\n${KEEP_PHOTO}\n\n${output}` }
}

export const IMAGE_EDIT_PROMPTS: EditPrompt[] = [
  // ── Cinematic ─────────────────────────────────────────────────────────────
  edit(
    'cinematic',
    'teal-orange',
    { en: 'Hollywood blockbuster grade (teal & orange)', tr: 'Hollywood gişe filmi renk düzeni (teal & orange)' },
    {
      en: 'Classic action-movie look: warm skin tones against cool teal shadows, punchy contrast and a subtle film grain.',
      tr: 'Klasik aksiyon filmi görünümü: soğuk camgöbeği gölgelere karşı sıcak ten tonları, güçlü kontrast ve hafif film grenı.',
    },
    ['Cinematic', 'Color grading', 'Teal & orange'],
    `Color-grade the attached photo like a frame from a modern Hollywood blockbuster.

Grade:
- Teal & orange split: push shadows and backgrounds toward cool teal/cyan, keep skin tones and highlights warm amber.
- Contrast: strong S-curve, deep but not crushed blacks, highlights rolled off softly (no clipping).
- Saturation: rich skin, slightly muted greens; intensity [INTENSITY, e.g. subtle / medium / heavy].
- Finish: fine 35 mm film grain, gentle vignette, slight halation on bright edges.
- Mood: [MOOD, e.g. heroic, tense, epic].`,
  ),
  edit(
    'cinematic',
    'anamorphic-still',
    { en: 'Anamorphic widescreen film still (2.39:1)', tr: 'Anamorfik geniş ekran film karesi (2.39:1)' },
    {
      en: 'Turns a photo into a cinema frame: letterbox bars, horizontal lens flares, oval bokeh and a theatrical grade.',
      tr: 'Fotoğrafı sinema karesine çevirir: siyah bantlar, yatay lens parlamaları, oval bokeh ve sinema renk düzeni.',
    },
    ['Cinematic', 'Anamorphic', 'Film still', 'Letterbox'],
    `Turn the attached photo into a still frame from a feature film shot on anamorphic lenses.

- Crop/extend to a 2.39:1 frame with thin black letterbox bars top and bottom; extend the background naturally if needed, never squash the subject.
- Add subtle horizontal blue-streak lens flares from the brightest light sources and oval (anamorphic) bokeh in out-of-focus areas.
- Shallow depth of field focused on [FOCUS_SUBJECT, e.g. the person's eyes].
- Grade: [GRADE, e.g. warm tungsten interior / cold steel-blue night / dusty golden western].
- Fine film grain, slight edge softness and barrel distortion typical of vintage anamorphic glass.`,
    `Output: 2.39:1 inside a [CANVAS, e.g. 16:9] canvas with letterbox bars, high resolution, no subtitles or watermark unless requested.`,
  ),
  edit(
    'cinematic',
    'neon-noir',
    { en: 'Neon noir night (cyberpunk city grade)', tr: 'Neon noir gece (cyberpunk şehir renk düzeni)' },
    {
      en: 'Rainy-night sci-fi mood: magenta and cyan neon spill, wet reflections, haze and deep shadows.',
      tr: 'Yağmurlu gece bilim kurgu havası: macenta ve camgöbeği neon ışıkları, ıslak yansımalar, pus ve derin gölgeler.',
    },
    ['Cinematic', 'Neon', 'Night', 'Cyberpunk'],
    `Re-grade and relight the attached photo as a neon-noir night scene from a sci-fi film.

- Convert the scene to night; light the subject with [NEON_COLORS, e.g. magenta key + cyan rim] neon spill coming from signs in the background.
- Add atmospheric haze/smog so light beams are visible; wet surfaces with colored reflections.
- Deep, inky shadows; keep faces readable and skin texture natural.
- Optional background signage language: [SIGN_LANGUAGE, e.g. Japanese / none] (illegible, no real brands).
- Fine grain and slight chromatic aberration at the frame edges.`,
  ),
  edit(
    'cinematic',
    'thriller-desat',
    { en: 'Moody thriller grade (desaturated green-cyan)', tr: 'Gerilim filmi renk düzeni (soluk yeşil-camgöbeği)' },
    {
      en: 'Cold, desaturated crime-thriller look with sickly green-cyan shadows and controlled, low-key contrast.',
      tr: 'Soğuk, soluk renkli suç-gerilim görünümü; yeşilimsi camgöbeği gölgeler ve kontrollü düşük ton kontrast.',
    },
    ['Cinematic', 'Thriller', 'Desaturated', 'Moody'],
    `Color-grade the attached photo like a dark psychological crime thriller.

- Overall saturation down ~40%; shadows pushed toward green-cyan, highlights slightly yellow and dirty.
- Low-key exposure: darker midtones, keep detail in the shadows (no crushed blacks).
- Skin looks pale and realistic, never orange.
- Light: single motivated source, [LIGHT_SOURCE, e.g. overhead fluorescent / desk lamp / window].
- Finish: fine grain, subtle vignette, slightly soft highlights.`,
  ),
  edit(
    'cinematic',
    'pastel-symmetry',
    { en: 'Pastel storybook film look (symmetrical, whimsical)', tr: 'Pastel masalsı film görünümü (simetrik, eğlenceli)' },
    {
      en: 'Quirky indie-film aesthetic: soft pastel palette, centered symmetry, flat even light and a tidy, storybook feel.',
      tr: 'Tuhaf ve sevimli bağımsız film estetiği: pastel palet, ortalanmış simetri, düz ve yumuşak ışık, masalsı hava.',
    },
    ['Cinematic', 'Pastel', 'Symmetry', 'Indie film'],
    `Restyle the attached photo as a frame from a whimsical, symmetrical indie comedy.

- Palette: [PALETTE, e.g. dusty pink, mint, mustard yellow, powder blue]; shift existing colors toward it, keep skin natural.
- Flat, even, soft frontal light; minimal harsh shadows.
- If the framing allows, straighten verticals and center the subject for a symmetrical composition (crop only, do not move the subject).
- Clean, slightly matte finish with lifted blacks and very fine grain.`,
  ),
  edit(
    'cinematic',
    'desert-epic',
    { en: 'Epic desert sci-fi grade (warm haze)', tr: 'Epik çöl bilim kurgu renk düzeni (sıcak pus)' },
    {
      en: 'Vast, sun-bleached epic look: warm ochre palette, atmospheric haze, muted contrast and monumental scale.',
      tr: 'Uçsuz bucaksız, güneşte solmuş epik görünüm: sıcak toprak paleti, atmosferik pus, yumuşak kontrast.',
    },
    ['Cinematic', 'Epic', 'Warm', 'Haze'],
    `Grade the attached photo like a wide shot from an epic desert sci-fi film.

- Palette: monochromatic warm ochre / sand / burnt orange; skies pale and hazy, never saturated blue.
- Add dense atmospheric haze and floating dust that softens the background and increases depth.
- Muted, low-contrast highlights; deep warm-brown shadows.
- Optional: [EXTRA, e.g. distant sandstorm on the horizon / harsh midday sun / none].
- Large-format film texture with subtle grain.`,
  ),
  edit(
    'cinematic',
    'horror-a24',
    { en: 'Arthouse horror grade (eerie, muted)', tr: 'Sanat filmi korku renk düzeni (tekinsiz, soluk)' },
    {
      en: 'Unsettling elevated-horror atmosphere: sickly muted colors, deep shadows and quiet dread — no monsters added.',
      tr: 'Rahatsız edici “elevated horror” havası: hastalıklı soluk renkler, derin gölgeler ve sessiz bir tedirginlik — canavar eklenmez.',
    },
    ['Cinematic', 'Horror', 'Moody', 'Arthouse'],
    `Grade the attached photo like a still from an arthouse psychological horror film.

- Muted, slightly sickly palette ([TINT, e.g. yellow-green / cold blue / washed-out daylight]).
- Underexposed edges and corners, light falling off into darkness; faces lit softly from a single practical source.
- Add faint, natural fog or dust only if it suits the scene. Do not add creatures, blood or new people.
- Soft, slightly diffused highlights and organic 16 mm grain for a quiet, dreadful mood.`,
  ),
  edit(
    'cinematic',
    'romance-glow',
    { en: 'Romantic soft-glow drama (diffusion filter)', tr: 'Romantik yumuşak parıltı (difüzyon filtresi)' },
    {
      en: 'Dreamy romance look with Pro-Mist-style bloom, warm creamy highlights and gentle pastel skin tones.',
      tr: 'Pro-Mist tarzı parıltı, sıcak kremsi ışıklar ve yumuşak ten tonlarıyla rüya gibi romantik görünüm.',
    },
    ['Cinematic', 'Romance', 'Glow', 'Soft'],
    `Grade the attached photo like a frame from a romantic drama shot with a 1/4 black diffusion filter.

- Soft bloom around highlights and practical lights; slightly lowered contrast.
- Warm, creamy highlights; peachy, natural skin tones; [ACCENT_COLOR, e.g. soft pink / golden / lavender] ambient tint.
- Gentle backlight / hair light if the light direction allows.
- Very fine grain, no heavy vignette; keep detail in eyes sharp.`,
  ),
  edit(
    'cinematic',
    'movie-poster',
    { en: 'Turn a photo into a theatrical movie poster', tr: 'Fotoğrafı sinema afişine dönüştür' },
    {
      en: 'Keeps the person and turns the shot into a one-sheet: dramatic grade, poster layout, title block and credits.',
      tr: 'Kişiyi korur, kareyi sinema afişine çevirir: dramatik renk düzeni, afiş yerleşimi, başlık ve jenerik bloğu.',
    },
    ['Cinematic', 'Poster', 'Typography'],
    `Turn the attached photo into a theatrical movie poster (one-sheet).

- Genre: [GENRE, e.g. sci-fi thriller / romantic drama / action / horror] — grade, lighting and atmosphere should match it.
- Extend the canvas to a 2:3 poster; place the subject as the hero, leave negative space for the title.
- Title: "[MOVIE_TITLE]" in [TITLE_STYLE, e.g. bold condensed sans-serif / elegant serif], tagline: "[TAGLINE]".
- Bottom credits block in small condensed type (placeholder names), release line "[RELEASE_TEXT, e.g. COMING SOON]".
- Spell all text exactly as written; no real studio logos.`,
    `Output: 2:3 vertical poster, high resolution, only the text specified above.`,
  ),
  edit(
    'cinematic',
    'grade-contact-sheet',
    { en: 'Same shot, four film grades (comparison grid)', tr: 'Aynı kare, dört farklı film renk düzeni (karşılaştırma)' },
    {
      en: 'Produces a 2×2 grid of the same photo in four cinematic grades so you can pick a look before the final edit.',
      tr: 'Aynı fotoğrafı dört sinematik renk düzeninde 2×2 ızgarada gösterir; son düzenlemeden önce görünüm seçmek için.',
    },
    ['Cinematic', 'Color grading', 'Comparison'],
    `Create a 2×2 comparison grid of the attached photo, each panel graded in a different cinematic look:
1. [LOOK_1, e.g. teal & orange blockbuster]
2. [LOOK_2, e.g. desaturated thriller]
3. [LOOK_3, e.g. high-contrast black & white]
4. [LOOK_4, e.g. warm Kodak Portra film]

Every panel must be the identical crop of the same photo — only color, contrast and grain change.
Thin white gutters between panels; a small caption under each panel with the look's name.`,
    `Output: square or [ASPECT] grid, high resolution, captions only as listed.`,
  ),

  // ── Black & white ─────────────────────────────────────────────────────────
  edit(
    'bw',
    'fine-art-bw',
    { en: 'Fine-art black & white (deep blacks, full tonal range)', tr: 'Sanatsal siyah-beyaz (derin siyahlar, tam ton aralığı)' },
    {
      en: 'Gallery-print monochrome with zone-system tonality: rich blacks, luminous whites and lots of midtone detail.',
      tr: 'Zone sistemi ton yapısıyla galeri baskısı kalitesinde siyah-beyaz: zengin siyahlar, parlak beyazlar, bol orta ton detayı.',
    },
    ['Black & white', 'Fine art', 'Monochrome'],
    `Convert the attached photo into a fine-art black & white print.

- Full tonal range: true black in the deepest shadows, clean paper white in the brightest highlights, rich separated midtones.
- Channel mix for drama: [FILTER, e.g. red filter — darker skies, brighter skin / green filter — lighter foliage / neutral].
- Local dodge & burn to guide the eye to [FOCAL_POINT]; subtle vignette.
- Crisp micro-contrast, fine silver-gelatin grain; no color tint (pure neutral gray).`,
  ),
  edit(
    'bw',
    'film-noir',
    { en: 'Classic 1940s film noir', tr: 'Klasik 1940’lar film noir' },
    {
      en: 'Hard-boiled detective look: hard key light, venetian-blind shadows, smoke and high-contrast monochrome.',
      tr: 'Sert dedektif filmi görünümü: sert ana ışık, jaluzi gölgeleri, duman ve yüksek kontrastlı siyah-beyaz.',
    },
    ['Black & white', 'Film noir', 'Cinematic', 'Vintage'],
    `Turn the attached photo into a still from a 1940s film noir.

- Black & white with high contrast and deep, velvety shadows.
- Relight with a single hard key light from [KEY_DIRECTION, e.g. high left]; cast [SHADOW_PATTERN, e.g. venetian-blind stripes / window-frame shadow] across the scene.
- Add thin cigarette smoke or haze catching the light (optional: [SMOKE, yes/no]).
- Slight soft glow on highlights, fine nitrate-film grain, subtle gate weave.
- Optional 4:3 crop for a period-accurate frame.`,
  ),
  edit(
    'bw',
    'soft-matte-bw',
    { en: 'Soft matte black & white portrait', tr: 'Yumuşak mat siyah-beyaz portre' },
    {
      en: 'Modern, gentle monochrome: lifted blacks, creamy skin, low contrast — elegant for portraits and weddings.',
      tr: 'Modern ve yumuşak siyah-beyaz: kaldırılmış siyahlar, kremsi ten, düşük kontrast — portre ve düğün için zarif.',
    },
    ['Black & white', 'Portrait', 'Matte', 'Wedding'],
    `Convert the attached portrait into a soft, matte black & white image.

- Lifted blacks (faded shadows), gentle low-contrast curve, smooth gradations.
- Skin bright and creamy but with real pore texture; eyes slightly brightened.
- Very slight warm tone [TONE, e.g. neutral / faint warm / faint cool].
- Fine, soft grain like a modern monochrome sensor; light vignette.`,
  ),
  edit(
    'bw',
    'selective-color',
    { en: 'Black & white with one color kept (selective color)', tr: 'Tek renk korunmuş siyah-beyaz (seçici renk)' },
    {
      en: 'Everything turns monochrome except one chosen color or object — a striking, cinematic focal point.',
      tr: 'Seçilen tek renk veya nesne dışında her şey siyah-beyaz olur — çarpıcı, sinematik bir odak noktası.',
    },
    ['Black & white', 'Selective color', 'Cinematic'],
    `Convert the attached photo to black & white, keeping only [KEEP_COLOR, e.g. the red dress / the yellow umbrella / all reds] in full color.

- Clean, precise mask around the kept object (no color bleeding onto edges or skin).
- The monochrome part: rich contrast, neutral gray tones.
- The colored part: natural, slightly boosted saturation, matching the original hue.
- Fine film grain over the whole frame so both parts feel unified.`,
  ),
  edit(
    'bw',
    'gritty-street',
    { en: 'Gritty street black & white (pushed Tri-X)', tr: 'Sert sokak siyah-beyazı (push edilmiş Tri-X)' },
    {
      en: 'Raw documentary look: heavy grain, harsh contrast, slight blur and deep blacks — like pushed 35 mm film.',
      tr: 'Ham belgesel görünümü: yoğun gren, sert kontrast, hafif bulanıklık ve derin siyahlar — push edilmiş 35 mm film gibi.',
    },
    ['Black & white', 'Street', 'Grain', 'Documentary'],
    `Convert the attached photo into a gritty street-photography black & white image.

- Look of Kodak Tri-X 400 pushed to [ISO, e.g. 1600 / 3200]: coarse, visible grain and harsh contrast.
- Crushed shadows allowed in the background, keep the subject's face readable.
- Slight tilt/imperfection is fine; optional subtle motion blur in the background.
- Burned edges and corners, raw unpolished finish — no smooth digital look.`,
  ),
  edit(
    'bw',
    'high-key-editorial',
    { en: 'High-key black & white fashion editorial', tr: 'High-key siyah-beyaz moda editoryali' },
    {
      en: 'Clean, bright studio monochrome on a pure white background — crisp, graphic and magazine-ready.',
      tr: 'Saf beyaz fon üzerinde temiz, aydınlık stüdyo siyah-beyazı — net, grafik ve dergiye hazır.',
    },
    ['Black & white', 'Fashion', 'Studio', 'High key'],
    `Turn the attached photo into a high-key black & white fashion editorial portrait.

- Replace the background with seamless pure white (clean edges around hair, no halos).
- Bright, even large-softbox light; minimal shadows; crisp blacks only in clothing, hair and eyes.
- Sharp detail in fabric and hair, natural skin texture.
- Optional crop: [CROP, e.g. full body / three-quarter / tight headshot] — never cut through joints.`,
  ),
  edit(
    'bw',
    'low-key-chiaroscuro',
    { en: 'Low-key chiaroscuro black & white portrait', tr: 'Low-key chiaroscuro siyah-beyaz portre' },
    {
      en: 'Dramatic portrait emerging from a black background, sculpted by one directional light — Rembrandt-style mood.',
      tr: 'Siyah fondan çıkan, tek yönlü ışıkla şekillenen dramatik portre — Rembrandt tarzı atmosfer.',
    },
    ['Black & white', 'Chiaroscuro', 'Portrait', 'Low key'],
    `Turn the attached photo into a low-key chiaroscuro black & white portrait.

- Background falls off to pure black; remove distractions behind the subject.
- Relight with a single soft key from [SIDE, e.g. 45° left], creating a Rembrandt triangle on the shadow cheek.
- Deep shadows, luminous highlights on forehead, nose and cheekbone; keep catchlights in the eyes.
- Fine grain, subtle vignette, timeless museum-print feel.`,
  ),
  edit(
    'bw',
    'long-exposure-minimal',
    { en: 'Minimal long-exposure black & white (architecture / sea)', tr: 'Minimal uzun pozlama siyah-beyaz (mimari / deniz)' },
    {
      en: 'Fine-art minimalism: silky water, streaking clouds, dark sky and clean geometric shapes.',
      tr: 'Sanatsal minimalizm: ipeksi su, akan bulutlar, koyu gökyüzü ve temiz geometrik formlar.',
    },
    ['Black & white', 'Long exposure', 'Architecture', 'Minimal'],
    `Turn the attached photo into a minimalist long-exposure black & white fine-art image.

- Simulate a [DURATION, e.g. 2-minute] ND exposure: water becomes smooth mist, clouds turn into soft streaks.
- Darken the sky dramatically (deep gray to near black at the top), keep the main structure bright and crisp.
- Remove small distractions (people, litter, signs) only if they are tiny and not part of the main subject.
- Clean edges, perfect straight verticals, very fine grain.`,
  ),
  edit(
    'bw',
    'sepia-tintype',
    { en: 'Sepia tintype / wet-plate collodion (1860s)', tr: 'Sepya tintype / ıslak kolodyum (1860’lar)' },
    {
      en: 'Antique 19th-century photograph: warm sepia or silver-brown tones, plate edges, swirly focus fall-off.',
      tr: '19. yüzyıl antika fotoğrafı: sıcak sepya veya gümüş-kahve tonlar, plaka kenarları, girdaplı netlik düşüşü.',
    },
    ['Black & white', 'Sepia', 'Vintage', 'Tintype'],
    `Turn the attached photo into an authentic wet-plate collodion tintype from the 1860s.

- Tone: [TONE, e.g. warm sepia / cold silver-brown]; slightly blue-sensitive response (skin a little darker, skies blown white).
- Shallow, swirly focus fall-off toward the edges; sharp center on the face.
- Irregular dark plate borders with pour marks, small scratches and chemical streaks.
- Do not change clothing or hairstyle unless asked: [PERIOD_COSTUME, e.g. keep modern clothes / convert to period clothing].`,
  ),
  edit(
    'bw',
    'bw-infrared',
    { en: 'Black & white infrared (white foliage, dark sky)', tr: 'Siyah-beyaz kızılötesi (beyaz yapraklar, koyu gökyüzü)' },
    {
      en: 'Surreal IR look: glowing white trees and grass, near-black skies and dreamy halation.',
      tr: 'Gerçeküstü IR görünümü: parlayan beyaz ağaçlar ve çimen, siyaha yakın gökyüzü ve rüya gibi hale.',
    },
    ['Black & white', 'Infrared', 'Surreal', 'Landscape'],
    `Convert the attached photo into a black & white infrared image (720 nm look).

- Vegetation (leaves, grass) turns bright, glowing white; skies and water become very dark.
- Skin smooth and slightly luminous, eyes darker.
- Soft halation/glow around the brightest foliage; fine grain.
- Keep the composition identical; neutral black & white (no color tint).`,
  ),

  // ── Film & vintage ────────────────────────────────────────────────────────
  edit(
    'film',
    'portra-400',
    { en: 'Kodak Portra 400 film look', tr: 'Kodak Portra 400 film görünümü' },
    {
      en: 'Beloved portrait film: soft warm skin, pastel highlights, gentle contrast and fine natural grain.',
      tr: 'Sevilen portre filmi: yumuşak sıcak ten, pastel ışıklar, nazik kontrast ve doğal ince gren.',
    },
    ['Film', 'Kodak Portra', 'Analog', 'Portrait'],
    `Make the attached photo look like it was shot on Kodak Portra 400 (35 mm, [EXPOSURE, e.g. overexposed by +1 stop]).

- Warm, flattering skin with peachy tones; greens slightly olive; blues soft and pastel.
- Low contrast with gently lifted shadows and highlights that roll off without clipping.
- Fine, organic film grain; very slight softness compared to digital.
- Optional: [EXTRA, e.g. light leak on the right edge / 35 mm frame border with edge code / none].`,
  ),
  edit(
    'film',
    'cinestill-800t',
    { en: 'CineStill 800T night (tungsten, red halation)', tr: 'CineStill 800T gece (tungsten, kırmızı hale)' },
    {
      en: 'Cinematic night film: cool tungsten-balanced tones and the signature red-orange glow around lights.',
      tr: 'Sinematik gece filmi: soğuk tungsten dengeli tonlar ve ışıkların etrafındaki imza kırmızı-turuncu parıltı.',
    },
    ['Film', 'CineStill', 'Night', 'Halation'],
    `Make the attached photo look like it was shot on CineStill 800T at night.

- Tungsten white balance: cool teal/blue overall, warm practical lights.
- Signature red-orange halation glow around every bright light source and specular highlight.
- Visible but fine grain, slightly soft focus, deep but not crushed shadows.
- If the photo is daytime: [CONVERT_TO_NIGHT, yes/no].`,
  ),
  edit(
    'film',
    'fuji-classic',
    { en: 'Fujifilm look (Classic Chrome / Velvia)', tr: 'Fujifilm görünümü (Classic Chrome / Velvia)' },
    {
      en: 'Choose documentary-muted Classic Chrome or vivid landscape Velvia — characteristic Fuji colors.',
      tr: 'Belgesel tadında soluk Classic Chrome ya da canlı manzara Velvia — karakteristik Fuji renkleri.',
    },
    ['Film', 'Fujifilm', 'Analog', 'Color'],
    `Apply a Fujifilm film-simulation look to the attached photo: [SIM, e.g. Classic Chrome / Velvia 50 / Pro 400H].

- Classic Chrome: muted saturation, hard tonal contrast, cyan-leaning blues, dry documentary feel.
- Velvia 50: very saturated greens, blues and reds, deep contrast, crisp slide-film look.
- Pro 400H: airy pastel greens and cyans, soft contrast, light and fresh skin.
- Add fine grain matching the chosen stock; no extra effects beyond the film look.`,
  ),
  edit(
    'film',
    'kodachrome',
    { en: '1960s Kodachrome slide', tr: '1960’lar Kodachrome slaytı' },
    {
      en: 'Mid-century travel-slide nostalgia: saturated reds and yellows, deep blues, dense shadows and a slide mount.',
      tr: 'Yüzyıl ortası seyahat slaytı nostaljisi: doygun kırmızı ve sarılar, derin maviler, yoğun gölgeler ve slayt çerçevesi.',
    },
    ['Film', 'Kodachrome', 'Vintage', '1960s'],
    `Make the attached photo look like a 1960s Kodachrome 64 slide.

- Rich, saturated reds and yellows, deep cyan-blue skies, dense dark shadows.
- Slightly warm overall cast with mild fading as if the slide is 60 years old.
- Very fine grain, crisp detail.
- Frame: [FRAME, e.g. white cardboard slide mount with handwritten date "[DATE]" / no frame].`,
  ),
  edit(
    'film',
    'disposable-flash',
    { en: '90s disposable camera flash (date stamp)', tr: '90’lar tek kullanımlık kamera flaşı (tarih damgası)' },
    {
      en: 'Party-snapshot nostalgia: harsh on-camera flash, dark fall-off, warm color shifts and an orange date stamp.',
      tr: 'Parti fotoğrafı nostaljisi: sert kamera flaşı, karanlığa düşen arka plan, sıcak renk kayması ve turuncu tarih damgası.',
    },
    ['Film', '90s', 'Flash', 'Y2K', 'Nostalgia'],
    `Make the attached photo look like a snapshot from a 1990s disposable film camera with built-in flash.

- Harsh direct flash: bright faces, hard shadows behind the subject, background falling quickly into darkness.
- Slight red-eye is OK ([RED_EYE, yes/no]); oversaturated warm tones, slightly greenish shadows.
- Soft plastic-lens sharpness, chunky grain, mild vignette.
- Orange LED date stamp in the bottom-right corner: "[DATE, e.g. '98 07 14]".`,
  ),
  edit(
    'film',
    'polaroid',
    { en: 'Instant film / Polaroid print', tr: 'Anlık film / Polaroid baskı' },
    {
      en: 'Turns the photo into a scanned instant print: faded colors, soft focus, chemistry marks and white frame.',
      tr: 'Fotoğrafı taranmış anlık baskıya çevirir: solmuş renkler, yumuşak netlik, kimyasal izler ve beyaz çerçeve.',
    },
    ['Film', 'Polaroid', 'Instant', 'Vintage'],
    `Turn the attached photo into a scanned instant-film print.

- Square crop (keep the subject fully in frame) inside a classic white instant-film border with a thicker bottom edge.
- Faded, slightly washed colors with a [CAST, e.g. warm yellow / cool cyan] cast, soft focus, low contrast.
- Subtle chemistry marks near the edges, faint dust and a tiny fingerprint.
- Optional handwritten caption on the bottom border in marker: "[CAPTION or none]".`,
    `Output: the full print on a [SURFACE, e.g. plain off-white / wooden table] background, high resolution.`,
  ),
  edit(
    'film',
    'vhs-80s',
    { en: '80s VHS / camcorder still', tr: '80’ler VHS / kamera kaydı karesi' },
    {
      en: 'Retro home-video frame: scanlines, chroma bleed, tracking noise and an on-screen timestamp.',
      tr: 'Retro ev videosu karesi: tarama çizgileri, renk taşması, tracking parazitleri ve ekran üstü zaman damgası.',
    },
    ['Film', 'VHS', '80s', 'Retro'],
    `Make the attached photo look like a paused frame from a 1980s VHS camcorder tape.

- 4:3 frame, low resolution softness, horizontal scanlines and subtle interlacing.
- Chroma bleed (colors smearing to the right), slightly oversaturated reds, crushed blacks.
- A thin band of tracking noise near the bottom; slight frame wobble.
- On-screen display text in white blocky font: "[OSD, e.g. PLAY ▶  JUL 14 1987  10:42 PM]".`,
    `Output: 4:3, only the on-screen text specified above.`,
  ),
  edit(
    'film',
    'aerochrome',
    { en: 'Aerochrome color infrared (pink foliage)', tr: 'Aerochrome renkli kızılötesi (pembe yapraklar)' },
    {
      en: 'Psychedelic false-color infrared: foliage turns hot pink and red, skies deep blue — surreal but photographic.',
      tr: 'Psikedelik sahte renkli kızılötesi: yapraklar pembe-kırmızıya, gökyüzü koyu maviye döner — gerçeküstü ama fotoğrafik.',
    },
    ['Film', 'Aerochrome', 'Infrared', 'Surreal'],
    `Convert the attached photo into a Kodak Aerochrome color-infrared look.

- All vegetation becomes [FOLIAGE, e.g. hot pink / crimson red / magenta], intensity by how green it originally was.
- Skies deep saturated blue, water dark navy; skin slightly pale and waxy.
- Keep non-vegetation colors close to neutral; fine film grain and slight softness.`,
  ),

  // ── Light & atmosphere ────────────────────────────────────────────────────
  edit(
    'light',
    'golden-hour',
    { en: 'Relight to golden hour', tr: 'Altın saate göre yeniden ışıkla' },
    {
      en: 'Swaps flat or midday light for low, warm sunset light with long shadows, rim light and a glowing sky.',
      tr: 'Düz veya öğle ışığını uzun gölgeli, kenar ışıklı, sıcak gün batımı ışığıyla değiştirir.',
    },
    ['Lighting', 'Golden hour', 'Relight'],
    `Relight the attached photo as if it were taken at golden hour.

- Low sun from [SUN_DIRECTION, e.g. behind-left of the subject], warm 3200–3800 K light.
- Long, soft shadows consistent with that direction on every object and person.
- Warm rim light on hair and shoulders; gentle lens flare [FLARE, yes/no].
- Sky: [SKY, e.g. clear amber gradient / scattered pink-orange clouds / keep existing sky, recolor only].
- Shadows slightly cool so the warmth reads; skin glowing but natural.`,
  ),
  edit(
    'light',
    'day-to-night',
    { en: 'Day to night (blue hour with practical lights)', tr: 'Gündüzden geceye (pratik ışıklarla mavi saat)' },
    {
      en: 'Converts a daytime shot into a believable blue-hour/night scene with windows, street lamps and signs switched on.',
      tr: 'Gündüz karesini pencereleri, sokak lambaları ve tabelaları yanan inandırıcı bir mavi saat / gece sahnesine çevirir.',
    },
    ['Lighting', 'Night', 'Blue hour', 'Relight'],
    `Convert the attached daytime photo into a [TIME, e.g. blue hour / deep night] scene.

- Sky: [SKY, e.g. deep blue gradient with the last glow on the horizon / starry night / overcast city glow].
- Switch on all plausible practical lights: windows, street lamps, car lights, signs — warm tungsten vs. cool ambient.
- People and objects lit by those sources (correct direction and falloff); remove sunlight shadows.
- Add slight wet-street reflections if it suits: [WET_STREET, yes/no]. Keep everything else identical.`,
  ),
  edit(
    'light',
    'rembrandt-studio',
    { en: 'Studio relight (Rembrandt / butterfly / split)', tr: 'Stüdyo ışığıyla yeniden ışıkla (Rembrandt / butterfly / split)' },
    {
      en: 'Gives a casual portrait professional studio lighting with a chosen classic pattern and backdrop.',
      tr: 'Sıradan bir portreye seçilen klasik ışık şeması ve fonla profesyonel stüdyo ışığı verir.',
    },
    ['Lighting', 'Portrait', 'Studio', 'Relight'],
    `Relight the attached portrait with professional studio lighting.

- Pattern: [PATTERN, e.g. Rembrandt / butterfly (paramount) / split / loop].
- Key: large softbox from [KEY_POSITION, e.g. 45° camera-left, slightly above eye level]; fill ratio [RATIO, e.g. 4:1].
- Subtle hair/rim light to separate the subject from the background.
- Background: [BACKDROP, e.g. mottled charcoal canvas / seamless warm gray / keep original but darker].
- Natural skin texture, clear catchlights matching the key position.`,
  ),
  edit(
    'light',
    'cinematic-rain',
    { en: 'Add cinematic rain & wet reflections', tr: 'Sinematik yağmur ve ıslak yansımalar ekle' },
    {
      en: 'Turns a dry scene into a moody rainy one: backlit raindrops, puddles, wet hair and glistening surfaces.',
      tr: 'Kuru sahneyi duygusal bir yağmur sahnesine çevirir: arkadan aydınlanan damlalar, su birikintileri, ıslak saç ve parlayan yüzeyler.',
    },
    ['Atmosphere', 'Rain', 'Cinematic', 'Weather'],
    `Add cinematic rain to the attached photo.

- Rain intensity: [INTENSITY, e.g. light drizzle / steady rain / downpour], streaks backlit by the strongest light source.
- Wet surfaces: glistening ground with puddles and reflections of lights; wet hair and clothing on people (same outfit).
- Overcast, cooler grade with slightly lower contrast; optional umbrella: [UMBRELLA, none / black / clear].
- Mist where rain meets the ground; raindrops on the lens only if [LENS_DROPS, yes/no].`,
  ),
  edit(
    'light',
    'fog-god-rays',
    { en: 'Add fog and volumetric light rays', tr: 'Sis ve hacimsel ışık huzmeleri ekle' },
    {
      en: 'Adds depth and mystery: layered fog, light shafts cutting through trees, windows or dust.',
      tr: 'Derinlik ve gizem katar: katman katman sis, ağaçların, pencerelerin veya tozun arasından geçen ışık huzmeleri.',
    },
    ['Atmosphere', 'Fog', 'God rays', 'Volumetric'],
    `Add atmospheric fog and volumetric light to the attached photo.

- Fog density: [DENSITY, e.g. light haze / medium morning mist / thick fog], denser with distance for depth.
- God rays from [LIGHT_SOURCE, e.g. the sun behind the trees / the window on the left] cutting through the fog, consistent with existing light direction.
- Background contrast reduced, foreground subject stays crisp and readable.
- Color of the light: [LIGHT_COLOR, e.g. warm gold / cold moonlight blue / neutral].`,
  ),
  edit(
    'light',
    'season-change',
    { en: 'Change the season (e.g. summer → snowy winter)', tr: 'Mevsimi değiştir (ör. yazdan karlı kışa)' },
    {
      en: 'Repaints the same place in another season — snow, autumn leaves or spring bloom — with matching light and clothing cues.',
      tr: 'Aynı yeri başka bir mevsimde yeniden boyar — kar, sonbahar yaprakları veya bahar çiçekleri — uyumlu ışık ve detaylarla.',
    },
    ['Atmosphere', 'Season', 'Snow', 'Autumn'],
    `Transform the attached photo from its current season to [SEASON, e.g. snowy winter / peak autumn / spring bloom].

- Winter: fresh snow on horizontal surfaces, frost, breath vapor, flat cold light, gently falling snow [FALLING, yes/no].
- Autumn: trees in orange/red/gold, leaves on the ground, low warm light.
- Spring: blossoms on trees, fresh light-green foliage, soft bright light.
- Keep buildings, people and composition identical; clothing stays the same unless [ADD_LAYERS, e.g. add a scarf and coat].`,
  ),
  edit(
    'light',
    'neon-gels',
    { en: 'Dual color-gel portrait (neon rim light)', tr: 'Çift renk jelatinli portre (neon kenar ışığı)' },
    {
      en: 'Music-video style portrait lighting: two contrasting colored lights sculpting the face from both sides.',
      tr: 'Klip tarzı portre ışığı: yüzü iki yandan şekillendiren iki zıt renkli ışık.',
    },
    ['Lighting', 'Neon', 'Gels', 'Portrait'],
    `Relight the attached portrait with two colored gel lights.

- Left light: [COLOR_1, e.g. magenta]; right light: [COLOR_2, e.g. electric blue]; both as rim/side lights.
- Darken the background to near black, or tint it with [BACKGROUND, e.g. a soft gradient of the two colors].
- Natural skin texture preserved; colors wrap realistically around nose, cheekbones and jawline.
- Light haze for glow; small matching catchlights in the eyes.`,
  ),

  // ── Retouch & restoration ─────────────────────────────────────────────────
  edit(
    'retouch',
    'natural-retouch',
    { en: 'Natural portrait retouch (keeps skin texture)', tr: 'Doğal portre rötuşu (cilt dokusunu korur)' },
    {
      en: 'Magazine-quality but believable retouch: blemishes and stray hairs gone, real pores and identity kept.',
      tr: 'Dergi kalitesinde ama inandırıcı rötuş: sivilce ve dağınık saçlar gider, gerçek gözenekler ve kimlik korunur.',
    },
    ['Retouch', 'Portrait', 'Skin'],
    `Retouch the attached portrait naturally, like a high-end beauty retoucher using frequency separation.

- Remove temporary blemishes, small marks and stray flyaway hairs; reduce under-eye darkness by [AMOUNT, e.g. 30%].
- Keep moles/freckles: [KEEP_MARKS, yes/no]. Keep pores, fine lines and skin texture — no blur, no plastic look.
- Even skin tone slightly, gentle dodge & burn for shape; brighten eyes and teeth subtly (not white-out).
- No changes to face shape, body, makeup or age.`,
  ),
  edit(
    'retouch',
    'restore-old-photo',
    { en: 'Restore an old, damaged photo', tr: 'Eski ve hasarlı fotoğrafı onar' },
    {
      en: 'Repairs scratches, tears, stains and fading on an old print while keeping it authentic and faithful.',
      tr: 'Eski baskıdaki çizik, yırtık, leke ve solmaları giderir; fotoğrafı özgün ve aslına sadık tutar.',
    },
    ['Restoration', 'Old photo', 'Repair'],
    `Restore the attached old, damaged photograph.

- Remove scratches, dust, cracks, tears, fold lines, water stains and mold spots.
- Reconstruct missing areas conservatively from surrounding detail; do not invent new objects or change faces.
- Correct fading and uneven exposure; recover contrast and detail; reduce noise but keep a natural film grain.
- Colors: [COLOR_MODE, e.g. keep original black & white / keep original sepia / neutralize color cast].
- Faces must remain exactly the same people — same features, age and expression.`,
  ),
  edit(
    'retouch',
    'colorize',
    { en: 'Colorize a black & white photo (historically accurate)', tr: 'Siyah-beyaz fotoğrafı renklendir (döneme uygun)' },
    {
      en: 'Adds natural, period-appropriate color to a monochrome photo — realistic skin, fabrics and environment.',
      tr: 'Siyah-beyaz fotoğrafa doğal ve döneme uygun renkler ekler — gerçekçi ten, kumaş ve çevre.',
    },
    ['Restoration', 'Colorize', 'Black & white', 'History'],
    `Colorize the attached black & white photo realistically.

- Era and place: [ERA_PLACE, e.g. 1950s Istanbul / 1920s rural Anatolia / 1970s London]; colors must be plausible for that period.
- Natural skin tones with subtle variation (cheeks, lips, ears warmer); eye color [EYE_COLOR, or "natural guess"].
- Known colors: [KNOWN_COLORS, e.g. dress was navy blue, car was red] — follow these exactly.
- Restrained, slightly muted film-like saturation; no neon or oversaturated tones; keep original grain and detail.`,
  ),
  edit(
    'retouch',
    'background-replace',
    { en: 'Replace or remove the background', tr: 'Arka planı değiştir veya kaldır' },
    {
      en: 'Clean cut-out with natural hair edges, then a new background with matching light, perspective and shadow.',
      tr: 'Doğal saç kenarlarıyla temiz kesim, ardından ışığı, perspektifi ve gölgesi uyumlu yeni bir arka plan.',
    },
    ['Retouch', 'Background', 'Compositing'],
    `Replace the background of the attached photo.

- New background: [BACKGROUND, e.g. seamless light-gray studio / blurred modern office / transparent (cut-out only) / Istanbul Bosphorus at sunset].
- Precise mask: natural hair strands and soft edges, no halos or leftover old background.
- Match light direction, color temperature and perspective of the new background to the subject; add a realistic contact shadow.
- Depth of field: [DOF, e.g. background softly blurred like f/2 / everything sharp].`,
  ),
  edit(
    'retouch',
    'object-removal',
    { en: 'Remove unwanted objects or people', tr: 'İstenmeyen nesne veya kişileri kaldır' },
    {
      en: 'Erases photobombers, cables, signs or litter and rebuilds what was behind them seamlessly.',
      tr: 'Kadraja giren kişileri, kabloları, tabelaları veya çöpleri siler; arkalarındaki alanı kusursuz şekilde yeniden oluşturur.',
    },
    ['Retouch', 'Cleanup', 'Object removal'],
    `Remove the following from the attached photo: [REMOVE, e.g. the people in the background, the power lines, the trash can on the right].

- Rebuild the area behind them realistically, continuing textures, lines, patterns and lighting.
- No smudges, repeated clone patterns, ghosting or leftover shadows/reflections of removed items.
- Everything not listed above stays exactly as it is.`,
  ),
  edit(
    'retouch',
    'upscale-enhance',
    { en: 'Upscale & enhance (sharpen, denoise, detail)', tr: 'Büyüt ve iyileştir (keskinleştir, gürültü azalt, detay)' },
    {
      en: 'Faithful 2–4× upscale for low-res or blurry shots: cleaner noise, recovered detail, no invented features.',
      tr: 'Düşük çözünürlüklü veya bulanık kareler için aslına sadık 2–4× büyütme: temiz gürültü, geri kazanılmış detay, uydurma yok.',
    },
    ['Enhance', 'Upscale', 'Sharpen', 'Denoise'],
    `Upscale the attached photo by [FACTOR, e.g. 2× / 4×] and enhance it faithfully.

- Remove noise and JPEG compression artefacts; correct mild motion/focus blur.
- Recover fine detail (hair, fabric, foliage, text) without inventing new features or changing faces.
- Natural sharpening only — no halos, no oversharpened edges, no waxy skin.
- Keep the original colors and exposure, only fix [FIX, e.g. slight underexposure / color cast / nothing].`,
    `Output: [FACTOR] the original resolution, same aspect ratio, no added text or watermark.`,
  ),
  edit(
    'retouch',
    'pro-headshot',
    { en: 'Casual selfie → professional headshot', tr: 'Sıradan selfie’den profesyonel vesikalık/LinkedIn fotoğrafına' },
    {
      en: 'Keeps your face and turns a casual photo into a clean LinkedIn/CV headshot with studio light and business attire.',
      tr: 'Yüzünü korur; sıradan bir fotoğrafı stüdyo ışığı ve iş kıyafetiyle temiz bir LinkedIn/CV fotoğrafına çevirir.',
    },
    ['Retouch', 'Headshot', 'LinkedIn', 'Portrait'],
    `Turn the attached photo into a professional corporate headshot of the same person.

- Identity is critical: identical face, features, skin tone, hairstyle and age — the person must be instantly recognizable.
- Framing: head and shoulders, eyes in the upper third, slight angle, looking at camera.
- Attire: [ATTIRE, e.g. navy blazer over white shirt / keep my own clothes / dark knit sweater].
- Background: [BACKGROUND, e.g. soft gray gradient / blurred bright office].
- Soft studio key with gentle fill, natural retouch only.`,
    `Output: [ASPECT, e.g. 1:1 or 4:5], high resolution, no text or watermark.`,
  ),
  edit(
    'retouch',
    'product-cleanup',
    { en: 'E-commerce product photo cleanup', tr: 'E-ticaret ürün fotoğrafı temizliği' },
    {
      en: 'Phone shot → marketplace-ready product image: pure white background, straightened, color-correct, soft shadow.',
      tr: 'Telefon çekiminden pazaryeri ürün görseline: saf beyaz fon, düzeltilmiş açı, doğru renk, yumuşak gölge.',
    },
    ['Retouch', 'Product', 'E-commerce', 'Background'],
    `Clean up the attached product photo for an online store listing.

- Pure white background (#FFFFFF) with a soft, natural contact shadow under the product.
- Straighten and center the product, filling about [FILL, e.g. 85%] of the frame.
- Remove dust, fingerprints, scratches and reflections of the photographer; keep labels, logos and text exactly as they are.
- Accurate, neutral colors; even studio lighting; crisp edges.
- Do not change the product's shape, color, size or design.`,
    `Output: [ASPECT, e.g. 1:1, 2000×2000 px], no added text or watermark.`,
  ),
  edit(
    'retouch',
    'sky-replace',
    { en: 'Sky replacement (dramatic sky)', tr: 'Gökyüzü değiştirme (dramatik gökyüzü)' },
    {
      en: 'Swaps a dull or blown-out sky for a dramatic one and re-lights the scene to match.',
      tr: 'Sönük veya patlamış gökyüzünü dramatik bir gökyüzüyle değiştirir ve sahne ışığını buna uyarlar.',
    },
    ['Retouch', 'Sky', 'Landscape', 'Compositing'],
    `Replace the sky in the attached photo with [SKY, e.g. dramatic storm clouds / pastel sunset / clear deep-blue sky / starry Milky Way].

- Precise mask along rooftops, trees and fine branches; no halos.
- Re-light the landscape to match the new sky: color temperature, light direction and reflections in water/glass.
- Keep the horizon position and perspective; foreground unchanged otherwise.`,
  ),
  edit(
    'retouch',
    'double-exposure',
    { en: 'Double exposure portrait', tr: 'Çift pozlama portre' },
    {
      en: 'Blends a portrait silhouette with a landscape or city texture — artistic, poster-like and clean.',
      tr: 'Portre siluetini bir manzara veya şehir dokusuyla harmanlar — sanatsal, afiş gibi ve temiz.',
    },
    ['Artistic', 'Double exposure', 'Portrait'],
    `Create a double-exposure image from the attached portrait.

- Keep the person's profile/silhouette and key facial features clearly recognizable.
- Fill the silhouette with [TEXTURE, e.g. a misty pine forest / the Istanbul skyline at dusk / ocean waves], blended naturally into hair and shoulders.
- Background: [BACKGROUND, e.g. clean white / soft gradient]; overall palette [PALETTE, e.g. black & white / muted teal / warm sepia].
- Clean, minimal composition; no added text.`,
  ),
]
