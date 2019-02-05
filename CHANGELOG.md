# ✍ Changelog

* 0.1 - First release
* 0.1.1 - Refactored authorization function, moved JWT middleware to auth function
* 0.1.2 - Refactored logging system, now it supports context for file, changed the way repositories are created (uses typedi injection), added current user checker, added some validation to me controller, tokens are now deleted when user changes his password or email. Refactored profile upload methods.
* 0.1.3 - Better project structure
* 0.1.4 - Better project structure again, removed graphics magick dependence and replaced it with sharp
* 0.1.5 - Fixed bug with refresh token flow, user would have to make request again to be found by user controller, improved logging
* 0.1.6 - Decoupled database from main server start, fixed load order error with repository injectors in routing-controllers helpers, indented with 2 spaces instead of 4, improved logging, fixed user profile update method
