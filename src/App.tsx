import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Home } from "@/pages/Home";
import { Movies } from "@/pages/Movies";
import { Trending } from "@/pages/Trending";
import { MovieDetails } from "@/pages/MovieDetails";
import { Search } from "@/pages/Search";
import { Watchlist } from "@/pages/Watchlist";
import { Popular } from "@/pages/Popular";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/movies"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Movies />
            </motion.div>
          }
        />
        <Route
          path="/trending"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Trending />
            </motion.div>
          }
        />
        <Route
          path="/popular"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Popular />
            </motion.div>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <MovieDetails />
            </motion.div>
          }
        />
        <Route
          path="/search"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Search />
            </motion.div>
          }
        />
        <Route
          path="/watchlist"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Watchlist />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <WatchlistProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <AppRoutes />
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </BrowserRouter>
    </WatchlistProvider>
  );
}

export default App;
