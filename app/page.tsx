import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-end items-center bg-background/80 backdrop-blur-sm border-b border-border p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <Button>Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Welcome to Collab Draw</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Create and collaborate on drawings with your team in real-time.
          </p>
          <Button size="lg" className="mt-6">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
