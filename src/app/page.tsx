
import { auth, signOut } from "@/lib/auth";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold text-gray-700">
                Welcome back, {session?.user?.name || "Athlete"}!
              </h2>
              <p className="mt-2 text-gray-500">
                Your Strava authentication is working perfectly.
              </p>
              <div className="mt-8 p-4 bg-gray-100 rounded text-left max-w-2xl w-full overflow-auto text-xs font-mono">
                <p className="font-bold mb-2">Session Data:</p>
                {JSON.stringify(session, null, 2)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
