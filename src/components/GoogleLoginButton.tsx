import React from 'react';
import Button from 'payload/dist/admin/components/elements/Button';

/**
 * GoogleLogin Component
 * Renders a button for initiating OAuth2 Google Login.
 * The url has to be the same as the passport.authenticate... call
 * in the server.ts
 */
export default function GoogleLoginButton() {
  return (
    <div>
      <Button el="anchor" url="/oauth2/authorize">
        Login with Google
      </Button>
    </div>
  );
}