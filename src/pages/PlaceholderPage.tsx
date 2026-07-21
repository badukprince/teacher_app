export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{title}</h1>
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">준비 중인 기능이에요</p>
        <p className="mt-1 text-sm text-slate-500">{title} 화면은 곧 추가될 예정입니다.</p>
      </div>
    </div>
  );
}
