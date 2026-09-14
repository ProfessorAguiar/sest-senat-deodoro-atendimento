import React from "react";

export default function BackgroundCarousel() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -bottom-56 -left-40 h-[30rem] w-[30rem] rounded-full bg-sky-100/70 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#155a91] via-[#00a6df] to-[#155a91]" />
    </div>
  );
}
