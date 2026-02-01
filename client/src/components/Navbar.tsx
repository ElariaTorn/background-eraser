import { Link, useLocation } from "wouter";
import { Layers, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Gallery", icon: Layers },
    { href: "/create", label: "New Project", icon: ImagePlus },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Removr<span className="text-primary">.ai</span>
            </span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "group flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-secondary/80",
                    location === item.href
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
