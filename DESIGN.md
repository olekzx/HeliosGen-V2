# DESIGN.md — HeliosGen Design System & Direction

> **Soul of HeliosGen**: Instrument-grade visual AI workflow canvas & studio.
> **Anti-Slop Read**: Creative AI pipeline & media generation studio for power creators and engineers, in a dark technical workbench aesthetic.
> **Dial: ENERGY 2 / RHYTHM 3 / MOTION 2**

---

## 1. Product Identity & Vibe

HeliosGen is a desktop and web visual node-based engine for chaining generative AI models (images, video, audio, text, LoRA, reference assets).

- **Aesthetic**: Dark Cybernetic Studio / Industrial Precision / High-Density Instrument. Think Blender node graph meets Linear UI speed and high-end audio workstation tactile feedback.
- **Design Philosophy**: **Instrument over ornament**. Every pixel must serve the creator's mental model. Zero decorative fluff, zero rainbow SaaS blobs, zero AI-slop sparkles.
- **Theme Principle**: **Exclusively Dark-Mode Native**. HeliosGen is a dark studio environment. There is no light mode. All surfaces, contrast ratios, and glow physics assume a `#0B0E14` base void.

---

## 2. Anti-Slop Dials & Levers

### Three Dials (Mandatory Setting)
```text
Dial: ENERGY 2 / RHYTHM 3 / MOTION 2
```
- **ENERGY 2 (Balanced)**: Dark, focused, distraction-free backdrop. High-contrast white typography and surgical neon teal accents only when actively engaged, generating, or connecting.
- **RHYTHM 3 (Bold & Varied)**: The layout is an infinite canvas featuring floating modular cards, resizable nodes, glass action pills, multi-slot media grid cards (2x2), and collapsible sidebars.
- **MOTION 2 (Crisp & Physical)**: Micro-interactions respond in 100–180ms. Modals and popovers enter via spring curves (`cubic-bezier(0.22, 1, 0.36, 1)`). Generating states feature a math-exact linear-speed conic gradient border spotlight.

### Levers & Identity Motifs
1. **One Focal Point Per Screen**:
   - In Canvas: The selected active node or the connection dragging line.
   - In Gallery: The active previewed media or generating job card.
   - In Dashboard: The hero workflow creator or space card being hovered.
2. **Identity Motif**:
   - **Floating micro-label**: Uppercase tracking `0.05em`, 11px `#6A7080`, sitting -20px above cards.
   - **L-bracket corner ticks**: 8px corner resize brackets on selected nodes (`#6A7080`, 1.5px border).
   - **Precision circular port handles**: 28px left-side circular input sockets with semantic color coding and real-time connection glow.
   - **Linear-speed conic generation border**: Continuous perimeter traveling light indicator.

---

## 3. Color Tokens & Palette

### Surface & Elevation Hierarchy
| Token / Element | Value | Purpose |
| :--- | :--- | :--- |
| **Canvas / Root Background** | `#0B0E14` | The primary infinite canvas void |
| **Deep Underlay / Empty Cell** | `#060709` / `#0D1119` | Inset slots, empty thumbnails, inputs |
| **Node Card Surface** | `#141820` | Base surface for node bodies |
| **Panel / Sidebar Surface** | `#0A0C10` (or `rgba(10, 12, 18, 0.95)`) | Docked navigation, sidebar panels |
| **Modal Shell Background** | `rgba(10, 11, 14, 0.98)` | Dialogs, settings panels, asset pickers |
| **Floating Action Bar (Pill)** | `rgba(16, 16, 16, 0.96)` | SelectionToolbar, NodeActionBar |
| **Card Hover Shadow** | `0 0 0 1px rgba(45,212,191,0.12), 0 16px 48px rgba(0,0,0,0.7)` | Hover elevation on cards |

### Borders & Hairlines
| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Subtle Inset Border** | `rgba(255, 255, 255, 0.06)` - `0.08` | Dividers, section separation |
| **Card Inactive Border** | `1px solid #1C2436` or `transparent` | Node boundaries when unselected |
| **Card Selected Border** | `#2DD4BF` | Selected node card or space ring |
| **Input / Field Border** | `1px solid #1A2030` (focus: `#3A4055`) | Form fields, textareas, selects |
| **Dashed Slot Border** | `1.5px dashed rgba(255, 255, 255, 0.16)` | Add node, upload zone, new space |

### Brand Accents
| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Helios Teal (Primary)** | `#2DD4BF` (`rgb(45, 212, 191)`) | Main interactive accent, selected handles, primary CTA |
| **Teal Glow / Surface** | `rgba(45, 212, 191, 0.12)` - `0.18` | Button background, hovered tags, badge tint |
| **Teal Stroke Border** | `rgba(45, 212, 191, 0.45)` - `0.55` | Accent button borders, focus rings |
| **Neon Cyan / Energy** | `#00F2FF` / `#22d3ee` | Video handles, generating border highlight |

### Semantic Role & Data-Port Colors
**RULE**: Handles, connection wires, and node badges MUST follow these exact color identities:
- **`prompt` / Text**: `#2DD4BF` (Teal)
- **`image` / `resource` / LoRA**: `#fb923c` (Warm Orange)
- **`startFrame` / `endFrame`**: `#818cf8` (Indigo Lavender)
- **`videoRef` / `referenceVideo`**: `#22d3ee` (Cyan) / `#38bdf8` (Sky)
- **`audioRef`**: `#a78bfa` (Violet) / `#5EEAD4` (Mint)
- **`character` / Motion Control**: `#f472b6` (Pink)
- **`assistant` / Reasoning**: `#FBBF24` (Amber Gold)
- **`comment`**: `#FACC15` (Amber Yellow 400)
- **`error` / Warning**: `#ef4444` / `#f87171` (Red)
- **`done` / Ready**: `#34d399` / `#22C55E` (Emerald)
- **`idle` / Neutral**: `#1E1E1E` / `#3a3a3a` / `#6A7080` (Muted Steel)

### Typography Colors
- **White (Primary Text)**: `#FFFFFF` / `rgba(255, 255, 255, 0.95)`
- **Secondary Text**: `rgba(255, 255, 255, 0.7)` / `#A0A0A0`
- **Muted Meta / Labels**: `#6A7080` / `rgba(255, 255, 255, 0.4)`
- **Subtle / Placeholder**: `#3A4055` / `rgba(255, 255, 255, 0.2)`

---

## 4. Typography & Metrics

- **System Font Stack**:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  ```
- **Monospace Stack** (for IDs, tags, ratios, counters, @mentions, keyboard shortcuts):
  ```css
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  ```

### Hierarchy Scale
| Role | Size | Weight | Tracking / Transform | Example Context |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 32px–40px | 700 (Bold) | `tracking-[-1.28px]` uppercase | Landing / Space Hero |
| **Section Header** | 14px–16px | 600 (Semibold) | Normal | Modal header, Gallery category |
| **Node Card Title** | 12px | 500 (Medium) | `0.02em` uppercase | `.node-header .node-label` |
| **Floating Over-Label** | 11px | 500 (Medium) | `0.05em` uppercase | `.node-above-label` above card |
| **Field / Input Label** | 11px | 400 (Regular) | `0.02em` | Parameter headers (Prompt, Aspect Ratio) |
| **Input Body Text** | 12px–13px | 400 (Regular) | Line-height 1.5 | Prompt textarea, model picker text |
| **Pill / Kbd / Badge** | 10px–11px | 500–600 | `0.04em` tabular-nums | Shortcuts (`Cmd+K`), counts, ratios |

---

## 5. Component Anatomy & Blueprints

### A. The Node Card
```text
+-------------------------------------------------------+
|  [UPPERCASE FLOATING LABEL: e.g. "IMAGE GENERATOR"]   |  <- top: -20px, left: 2px, #6A7080
+--[CornerResizer L-brackets: 8x8px, #6A7080]-----------+
| (H1) [Icon] NODE TITLE                  [Status Dot]  |  <- .node-header (#1C2436 border-bottom)
|                                           (Out Port) >|
| (H2)  Prompt / Parameters                 (Out Port) >|  <- Input Area (#0D1119 input surface)
|                                                       |
| (H3)  [Preview / Generated Media Viewport]            |  <- Aspect ratio container / Media view
|                                                       |
|       [Footer: Model Dropdown | Generate Button]      |  <- Action bar
+-------------------------------------------------------+
```
- **Card Specs**:
  - `background: #141820; border-radius: 8px; border: 1px solid transparent;`
  - Selected state: `border-color: #2DD4BF; box-shadow: 0 0 0 1px #2DD4BF, 0 2px 24px rgba(0,0,0,0.7);`
  - Inactive shadow: `0 2px 16px rgba(0, 0, 0, 0.5)`.
  - Corner brackets: `CornerResizer` renders four 8x8px L-shaped corner indicators offset by `-6px`.

- **Handle Rules**:
  - **Input Handles (Left)**: Circular socket badges (`width: 28px; height: 28px; border-radius: 50%`) with dark background `#0E1015`, 1px border matching role color, and centered SVG icon.
  - **Output Handles (Right)**: Positioned on the right edge, color-coded to outgoing media type.
  - **Connection Mode**: When a wire is dragged, incompatible handles shrink or fade out (`opacity: 0.2; pointer-events: none`), while valid target handles expand with delayed highlight.

### B. Floating Action Bars & Toolbars
- **Structure**:
  - Pill container: `border-radius: 9999px` (`rounded-full`).
  - Surface: `background: rgba(16, 16, 16, 0.96); backdrop-filter: blur(12px);`
  - Border: `1px solid rgba(255, 255, 255, 0.07);`
  - Shadow: `0 4px 24px rgba(0, 0, 0, 0.65), 0 1px 4px rgba(0, 0, 0, 0.4);`
- **Buttons inside Toolbars**:
  - Size: `34x34px` (CanvasToolbar) or `28x28px` (SelectionToolbar / NodeActionBar).
  - Shape: circular `rounded-full` or `rounded-[10px]`.
  - Hover: `background: rgba(255, 255, 255, 0.08); color: #FFFFFF;`
  - Danger (Delete): `color: #FFFFFF; hover:text-red-400; hover:bg-red-400/10;`
  - Dividers: `width: 1px; height: 16px; background: rgba(255, 255, 255, 0.08);`

### C. Buttons & Form Controls
- **Standard Button (Shadcn / Base-UI)**:
  - Radius: `rounded-lg` (8px), NOT pills.
  - Primary (CTA): `bg-primary text-primary-foreground` or Helios Teal styling:
    ```css
    background: rgba(45, 212, 191, 0.18);
    border: 1px solid rgba(45, 212, 191, 0.55);
    color: #2DD4BF;
    backdrop-filter: blur(10px);
    ```
  - Hover: `filter: brightness(1.1);`
  - Disabled: `opacity: 0.5; cursor: not-allowed;`
  - Warning State: `bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.45)] text-red-400`.

- **Inputs, Textareas & Selects**:
  - Surface: `background: #0D1119; border: 1px solid #1A2030; border-radius: 5px;`
  - Font: `12px` (inputs) or `13px` (textareas), color `#FFFFFF`.
  - Focus: `border-color: #3A4055; outline: none;`
  - Placeholders: `#3A4055`.

### D. Modals, Sheets & Popovers
- **Backdrop**: `rgba(0, 0, 0, 0.65)` with `backdrop-filter: blur(4px)`.
- **Modal Shell**:
  - Radius: `18px` (`rounded-[18px]`).
  - Background: `rgba(10, 11, 14, 0.98);`
  - Border: `1px solid rgba(255, 255, 255, 0.08);`
  - Shadow: `0 32px 80px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.5);`
  - Two-pane layout: Left navigation (200px, border-right `rgba(255,255,255,0.06)`), Right content scroll view.
  - Close: Escape key listener + backdrop click + upper-right 28px circular close button.

### E. Dashboard Space & Workflow Cards
- **Card Shell**:
  - Radius: `18px` (`rounded-[18px]`).
  - Surface: `#0C0F16`, border `1px solid rgba(255, 255, 255, 0.06)`.
  - Thumbnails: 2x2 grid (`aspect-ratio: 3/2`), 1px gap over `#060709`.
  - Empty cells: `linear-gradient(145deg, #111520 0%, #0a0d14 100%)`.
  - Hover lift: `transform: translateY(-4px);` with border transition to `rgba(255, 255, 255, 0.13)` and teal shadow bloom.
  - "New Space / Workflow" card: `1px dashed rgba(255, 255, 255, 0.12)`, hovering triggers teal stroke `rgba(45, 212, 191, 0.35)` and glowing plus orb.

---

## 6. Motion, Transitions & Physics

### Timing Tokens
- **Micro-transitions (hover, border, color)**: `100ms`–`150ms ease`
- **Action bar entry / exit**: `160ms ease`
- **Modal & Popover Entrance**: `220ms cubic-bezier(0.22, 1, 0.36, 1)`
- **Card Hover Elevation**: `240ms cubic-bezier(0.22, 1, 0.36, 1)`
- **Node Delete / Die**: `200ms ease forwards` (opacity 1 -> 0, pointer-events none)

### Signature Motion Patterns
1. **Generating Border Animation (`useGeneratingBorderAnimation`)**:
   - Instead of a naive spinning square, compute constant perimeter distance speed (`perimToAngle`) on the rounded rect to avoid corner acceleration.
   - Conic-gradient colors:
     ```css
     conic-gradient(from var(--border-angle) at 50% 50%,
       transparent 0deg,
       #00266A 280deg,
       #005FCC 310deg,
       #00AEFF 330deg,
       #00F2FF 342deg,
       #ffffff 345deg,
       transparent 348deg
     )
     ```
2. **Edge Flow Dashes**:
   - When nodes are connected and processing, SVG edges animate with moving `stroke-dashoffset`.
   - Hovering an edge exposes the dynamic mid-point scissors button (`CuttableEdge`) calculated via 64-step curve traversal.
3. **Dot Matrix Background Canvas (`DotCanvasBackground`)**:
   - 1.5x1.5px teal particles `#2DD4BF` oscillating alpha on a 16px grid matrix with subtle sinusoidal pulsation.

---

## 7. Anti-Slop Enforcement & Forbidden Patterns

### STRICTLY FORBIDDEN (AI Slop Tells):
1. **NO light themes or white cards**: Never generate a white background or light surface.
2. **NO generic blue/purple SaaS gradients**: Do not use `from-indigo-500 via-purple-500 to-pink-500` anywhere. Accents are Helios Teal (`#2DD4BF`), Warm Orange (`#fb923c`), Indigo (`#818cf8`), and Cyan (`#22d3ee`).
3. **NO pill buttons for general actions**: `rounded-full` is exclusively reserved for floating action bars/toolbars, tags/chips, and circular icon buttons. Form buttons, selects, and inputs are `rounded-lg` (8px).
4. **NO decorative AI sparkle emojis / icons (`✨`) in place of real features**: Icons must be from `lucide-react`, clean, stroke-width 1.5–2, and semantically relevant.
5. **NO dead mockups or un-clickable buttons**: Every button must have `onClick`, active/disabled states, keyboard bindings (`Escape`, `Enter`, `Cmd+K`), or tooltip warnings explaining missing inputs.
6. **NO random colors on handles/edges**: Port colors communicate data type strictly. Never assign colors randomly.
7. **NO layout shifts during streaming/generation**: Skeletons and aspect-ratio locks (`aspect-video`, `aspect-square`, `aspect-[3/2]`) must preserve layout stability while content is loading.

---

## 8. Verification & Delivery Gate Checklist

Before delivering any UI component or page for HeliosGen, check:
- [ ] Base background is deep dark (`#0B0E14` or `#0C0F16`), not pure black `#000000` or washed gray.
- [ ] Primary accent is `#2DD4BF` (Helios Teal) used deliberately, not painted all over.
- [ ] Node handles match their exact semantic data colors (`prompt`: teal, `image`: orange, `video`: cyan, etc.).
- [ ] Borders use crisp alpha layers (`rgba(255, 255, 255, 0.06–0.08)`).
- [ ] Typography uses uppercase micro-labels for technical telemetry and clean sans for reading.
- [ ] Inputs have visible `:focus` state with `#3A4055` or `#2DD4BF/40`.
- [ ] Every interactive control has hover feedback, disabled opacity (`0.5`), and real callbacks.
- [ ] Desktop/window frame considerations: respect Tauri titlebar regions and avoid iOS safari zoom (`font-size >= 16px` on mobile inputs).
