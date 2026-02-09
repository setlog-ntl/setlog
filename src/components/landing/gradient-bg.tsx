'use client';

export function GradientBg() {
  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(at_40%_20%,oklch(0.7_0.15_260/0.15)_0px,transparent_50%),radial-gradient(at_80%_0%,oklch(0.65_0.2_200/0.1)_0px,transparent_50%),radial-gradient(at_0%_50%,oklch(0.7_0.18_290/0.08)_0px,transparent_50%)] dark:bg-[radial-gradient(at_40%_20%,oklch(0.35_0.2_260/0.2)_0px,transparent_50%),radial-gradient(at_80%_0%,oklch(0.3_0.25_200/0.15)_0px,transparent_50%),radial-gradient(at_0%_50%,oklch(0.35_0.22_290/0.12)_0px,transparent_50%)]" />
    </div>
  );
}
