# Custom Workspace Rules for D100

- **NO WHITE STROKES / BORDERS**: Never use bright white borders, strokes, or outlines on cards, buttons, set items, or input fields. Avoid using `border-[var(--green)]/30` or similar opacity-variable combinations that fail compilation in CSS and fall back to white. Prefer completely borderless designs with subtle backgrounds (e.g. `bg-[var(--bg-base)]`) or soft, pre-defined borders (e.g. `border-[var(--border)]`).
