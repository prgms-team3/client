export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-800">로딩 중...</h2>
        <p className="mt-2 text-gray-600">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

