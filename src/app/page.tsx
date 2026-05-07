import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <Image
        src="/logo.png"
        alt="Home & Care"
        width={200}
        height={200}
        priority
        className="mb-8 h-auto w-[200px]"
      />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Admin Home &amp; Care
      </h1>
      <p className="mt-3 text-base text-slate-600">Espace administration</p>
    </main>
  );
}
