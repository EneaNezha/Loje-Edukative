import React, { useState, useEffect } from "react";
import GameBoard from "./components/GameBoard";
import { ALBANIAN_LABELS } from "./constants";
import { LevelFormat } from "./types";
import { v4 as uuidv4 } from "uuid";

// This helper function gets or creates a unique ID for the user
// and stores it in the browser's local storage.
function getUserId() {
  let userId = localStorage.getItem("loja_user_id");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("loja_user_id", userId);
  }
  return userId;
}

const App: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [levels, setLevels] = useState<LevelFormat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState<string>(getUserId());

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both levels and user progress at the same time
        const [levelsResponse, progressResponse] = await Promise.all([
          fetch("/api/levels"),
          fetch(`/api/progress/${userId}`),
        ]);

        if (!levelsResponse.ok || !progressResponse.ok) {
          throw new Error("Failed to load game data");
        }

        const levelsData = await levelsResponse.json();
        const progressData = await progressResponse.json();

        setLevels(levelsData);
        // Start the user at their last completed level
        const startingLevel = progressData.last_completed_level || 0;

        if (startingLevel >= levelsData.length && levelsData.length > 0) {
          setIsGameComplete(true);
        } else {
          setCurrentLevelIndex(startingLevel);
        }
      } catch (e) {
        console.error("Failed to fetch game data:", e);
        setError("Nuk mund të ngarkoheshin të dhënat e lojës.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [userId]);

  const handleLevelComplete = async () => {
    const nextLevelIndex = currentLevelIndex + 1;

    // Save progress to the backend
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lastCompletedLevel: nextLevelIndex }),
      });
    } catch (e) {
      console.error("Failed to save progress:", e);
    }

    if (nextLevelIndex < levels.length) {
      setCurrentLevelIndex(nextLevelIndex);
    } else {
      setIsGameComplete(true);
    }
  };

  const restartGame = async () => {
    // Reset progress on the server
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lastCompletedLevel: 0 }),
      });
    } catch (e) {
      console.error("Failed to reset progress:", e);
    }
    setCurrentLevelIndex(0);
    setIsGameComplete(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 p-4">
        <h1 className="text-4xl font-bold text-sky-700 mb-8 animate-pulse">
          {ALBANIAN_LABELS.LOADING}
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 p-4">
        <h1 className="text-3xl font-bold text-red-700 mb-4">
          Gabim në Rrjet!
        </h1>
        <p className="text-xl text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          Provo Përsëri
        </button>
      </div>
    );
  }

  if (isGameComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4 text-white">
        <h1 className="text-5xl font-extrabold mb-6 text-center shadow-text">
          🎉 {ALBANIAN_LABELS.ALL_LEVELS_COMPLETE} 🎉
        </h1>
        <p className="text-2xl mb-8 text-center">
          Ju keni përfunduar me sukses të gjitha nivelet!
        </p>
        <button
          onClick={restartGame}
          className="px-10 py-4 bg-amber-400 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-amber-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          Luaj Përsëri
        </button>
      </div>
    );
  }

  const currentLevelData = levels[currentLevelIndex];

  if (!currentLevelData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 p-4">
        <h1 className="text-3xl font-bold text-red-700 mb-4">
          Gabim në Ngarkimin e Nivelit!
        </h1>
        <p className="text-xl text-red-600">
          Niveli {currentLevelIndex + 1} nuk mund të gjendet.
        </p>
        <button
          onClick={restartGame}
          className="mt-6 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          Rifillo Lojën
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-sky-50 pt-6 sm:pt-10">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          {ALBANIAN_LABELS.APP_TITLE}
        </h1>
      </header>
      <main className="w-full max-w-3xl xl:max-w-4xl px-2">
        <GameBoard
          level={currentLevelData}
          onLevelComplete={handleLevelComplete}
          currentLevelIndex={currentLevelIndex}
          totalLevels={levels.length}
        />
      </main>
      <footer className="w-full text-center py-6 mt-auto text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} Loja Matematikore. Të gjitha të drejtat
          të rezervuara.
        </p>
      </footer>
    </div>
  );
};

export default App;
