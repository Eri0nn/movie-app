import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Search,
  Film,
  TrendingUp,
  Home,
  Bookmark,
  Menu,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/trending", icon: TrendingUp, label: "Trending" },
  { path: "/watchlist", icon: Bookmark, label: "Watchlist" },
];

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 260,
      damping: 20,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const logoVariants = {
  initial: { rotate: -180, scale: 0.5 },
  animate: {
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  hover: {
    rotate: 360,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="border-b">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex gap-2 items-center"
              initial="hidden"
              animate="visible"
              variants={navVariants}
            >
              <Link to="/" className="flex gap-2 items-center">
                <motion.div
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  variants={logoVariants}
                >
                  <Film className="text-primary w-6 h-6" />
                </motion.div>
                <span className="from-primary/90 to-primary text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r">
                  CineVerse
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="md:flex hidden gap-1 items-center"
              variants={navVariants}
              initial="hidden"
              animate="visible"
            >
              {navItems.map(({ path, icon: Icon, label }) => (
                <motion.div
                  key={path}
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <Link
                    to={path}
                    className={cn(
                      "group flex relative gap-2 items-center px-4 py-2 rounded-lg transition-all duration-300",
                      isActiveLink(path)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                    {path === "/watchlist" && watchlist.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {watchlist.length}
                      </Badge>
                    )}
                    {isActiveLink(path) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Search and Mobile Menu */}
            <div className="flex gap-2 items-center">
              {/* Desktop Search */}
              <motion.form
                onSubmit={handleSearch}
                className="md:block hidden relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                <Search className="text-muted-foreground absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2" />
                <Input
                  type="search"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[300px] pl-9 bg-transparent focus-visible:ring-1"
                />
              </motion.form>

              {/* Mobile Search Button */}
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="p-4 w-full">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Search Movies</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2" />
                    <Input
                      type="search"
                      placeholder="Search movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full"
                      autoFocus
                    />
                  </form>
                </SheetContent>
              </Sheet>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader className="mb-4">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="py-4 space-y-4">
                      {navItems.map(({ path, icon: Icon, label }) => (
                        <div key={path}>
                          <Link
                            to={path}
                            onClick={() => document.body.click()} // Close sheet
                            className={cn(
                              "hover:text-primary flex gap-2 items-center py-2 text-sm transition-colors",
                              isActiveLink(path)
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {label}
                            {path === "/watchlist" && watchlist.length > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {watchlist.length}
                              </Badge>
                            )}
                            <ChevronRight className="ml-auto w-4 h-4" />
                          </Link>
                          <Separator className="mt-2" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
