# What does identity and authentication look like in practice?

Apps might need many different things:
- A username and password that works for a certain service
- A verified name
- Just "this is the user's identity, they're real"
- Just "the user meets these specific criteria"

I think I have a simple plan for this. You enter in your username and password once, and then from there it can get sent to the server to generate a JWT that vouches for everything else. Working with non-StudentVue providers might be hard once I have to do that though.
