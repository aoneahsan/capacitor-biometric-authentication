# Using these prompts to get work done using Claude code

## 7-12-25 prompts

### p2

okay, update the frontend-test-app and backend-test-app app so we will only have a test page, and only that rendered in frontend-test-app so we can test the biometric connect, verify and disconnect as quickly as possible, a simple test page, with
  connect button, verify which will show the details and disconnect, and in backend as well, create a new test resolver/queries/mutations etc for this so we can quickly test it and i will be understand as well it fully and properly, again, for this
  test create everything related to this test separately so i will be able to confirm properly, and it should be in 1 folder in both frontend backend for easy understanding

### p1
create CLAUDE.md file, and setup it for this project, we have 3 projects/folders in here, "capacitor-biometric-authentication" is the react + capacitor package mainly for frontend use to implement biometric auth feature in react + capacitor app. then we have "webauthn-server-buildkit" which is backend "node + ts" project mainly to use in backend to provide the backend functionality for "capacitor-biometric-authentication" frontend project. then we have "backend-test-app" this is a test project backend project which we will use to try, finalize our actual biometric server package "webauthn-server-buildkit" and finally we have "frontend-test-app" which is a frontend test project which we will use to test and finalize our "capacitor-biometric-authentication" package.

mean we are mainly working on "capacitor-biometric-authentication" & "webauthn-server-buildkit" biometric frontend and backend packages, and we have "frontend-test-app" & "backend-test-app" frontend and backend test apps to confirm the working of the packages

create the CLAUDE.md file so we can get started on this and get the packages working and corrected

and also create gitignore in root folder so we will not add any re-produceable files in git