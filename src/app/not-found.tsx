import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                        404
                    </h1>
                </div>

                <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
                    Page Not Found
                </h2>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/">
                            <Search className="w-4 h-4 mr-2" />
                            Search Prompts
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
