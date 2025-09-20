import { SignInButton as ClerkSignInButton } from '@clerk/clerk-react';

export default function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <button className="btn-primary text-lg px-8 py-3">
        Sign In to WebBot
      </button>
    </ClerkSignInButton>
  );
}