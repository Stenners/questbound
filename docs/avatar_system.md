# Layered Avatar System ("Paper Doll") Plan

## Objective
To build a highly modular "Paper Doll" avatar system where players can individually select and stack their base body, face, hair, and accessories, completely replacing the static single-image approach.

## Proposed Architecture Changes

### 1. Asset Structure (`public/avatars/`)
We will organize your future SVG/PNG files into layered categories inside the `public/` directory. For example:
- `public/avatars/bases/` (Body shapes/skin colors)
- `public/avatars/faces/` (Eyes, mouths, expressions)
- `public/avatars/hair/`  (Different hair styles)
- `public/avatars/accessories/` (Hats, glasses, capes)

When you buy a modular SVG pack, you will save the transparent files directly into these folders.

### 2. Data Model Update
The player state will be updated from a single `avatarIcon` string to a deep `avatar` object:
```javascript
avatar: {
  base: 'human_light.png',
  face: 'happy_eyes.png',
  hair: 'spikey_blonde.png',
  accessory: 'wizard_hat.png'
}
```

### 3. Rendering Engine (`<AvatarDisplay />`)
We will create a specific React component whose sole job is to stack these images perfectly on top of each other.
- It will use a `position: relative` container.
- Every layer will be loaded as an `<img>` tag with `position: absolute`, stretching 100% of the container width and height. Ensure all SVGs you purchase from a pack share the exact same canvas dimensions (e.g., 512x512) so they naturally align without complex CSS math!

### 4. Wardrobe UI Refactor
The "Wardrobe" will be upgraded into a tabbed interface.
- A horizontal menu mapping the categories: **[BODY] [FACE] [HAIR] [ACCESSORIES]** 
- A live preview of the fully layered avatar on the left.
- A grid of selectable options on the right, dynamically pulling from a configuration list we define in the code.

## Implementation Steps

1. **Scaffold State:** Update `App.jsx` player state to house the new `avatar` category object. 
2. **Build Display Component:** Write the `<AvatarDisplay />` component and replace the static Lucide icons in both the Profile Selector and Character Sheet.
3. **Build Tabbed Wardrobe:** Overhaul the Customization panel to allow iterating through arrays of body parts to change the state.
4. **Placeholders:** I will use basic colored shapes or placehold.co images temporarily so you can see the layering physics working perfectly before you drop your own art in.

## Open Questions

1. **Color Overlay:** In many modular packs, you purchase greyscale hair shapes and colorize them in code. Do you want to try and support CSS-based coloring of these SVGs, or keep it simple and just rely entirely on pre-colored SVGs that you drop in?
2. **Z-Index Strictness:** Currently, the render order will be: Body -> Face -> Hair -> Accessory. Can you confirm this basic layering order fits what you realistically expect from an asset pack?
