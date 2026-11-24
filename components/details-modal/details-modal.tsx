"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type DetailValue = string | number | null | undefined;

export type DetailSectionsData = Readonly<
  Record<string, Readonly<Record<string, DetailValue>>>
>;

type DetailsModalProps = {
  title: string;
  triggerLabel: string;
  sections?: DetailSectionsData;
  children?: ReactNode;
};

export function DetailSections({ sections }: { sections: DetailSectionsData }) {
  return Object.entries(sections).map(([heading, fields]) => {
    const entries = Object.entries(fields).filter(([, value]) =>
      typeof value === "number"
        ? Number.isFinite(value)
        : Boolean(value?.trim()),
    );
    if (entries.length === 0) return null;
    return (
      <section
        key={heading}
        className="my-4 [&+&]:border-t [&+&]:border-[#6b4975] [&+&]:pt-4"
      >
        <h3 className="text-[1.2rem] text-[#f4a6f0]">{heading}</h3>
        <dl className="mt-[0.55rem] grid grid-cols-2 gap-x-4 gap-y-[0.65rem]">
          {entries.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[#d4c2d9]">{label}</dt>
              <dd className="wrap-anywhere">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  });
}

export function DetailsModal({
  title,
  triggerLabel,
  sections,
  children,
}: DetailsModalProps) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  useEffect(() => {
    const element = dialog.current;
    return () => element?.close();
  }, []);

  return (
    <>
      <button
        className={
          "cursor-pointer rounded-[0.4rem] border border-[#a47bb6] bg-[#211529] px-[0.6rem] py-1 " +
          "text-[#faf7fb] hover:border-[#f4a6f0] focus-visible:border-[#f4a6f0]"
        }
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialog}
        className={
          "fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] overflow-auto rounded-2xl border border-[#a47bb6] " +
          "bg-[#100d14] p-[clamp(1rem,4vw,1.75rem)] text-[#faf7fb] backdrop:bg-[#080709cc] " +
          "w-[min(35rem,calc(100%-2rem))] scheme-dark"
        }
        aria-labelledby={headingId}
        lang="pl"
        onClose={() => setOpen(false)}
      >
        <header className="flex items-start justify-between gap-x-4 gap-y-2">
          <h2
            id={headingId}
            className={
              "min-w-0 wrap-anywhere text-[clamp(1.6rem,5vw,2.35rem)] leading-[1.1] font-normal text-[#f4a6f0]"
            }
          >
            {title}
          </h2>
          <form method="dialog">
            <button
              className={
                "cursor-pointer rounded-[0.4rem] border border-[#a47bb6] bg-[#211529] px-[0.6rem] py-1 " +
                "text-[#faf7fb] hover:border-[#f4a6f0] focus-visible:border-[#f4a6f0]"
              }
              type="submit"
              autoFocus
            >
              Zamknij
            </button>
          </form>
        </header>
        {open && (
          <>
            {sections && <DetailSections sections={sections} />}
            {children}
          </>
        )}
      </dialog>
    </>
  );
}
