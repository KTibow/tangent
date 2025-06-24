# Did I make good decisions?

Despite planning and precomputing a lot of Tangent as a computer, a lot of decisions were made and a lot of code was written on one day. I need to examine all of them if I want to keep using this foundation.

## Remembering what you should be able to do on Tangent

- Easily log on and trust Tangent
- Use a very optimized home screen (that includes grades)
- Use FS-based apps: files, daily notes, wiki, running code
- Use trust-based apps: AI, Web
- Advanced AI perhaps: that can provide on screen assistance or use the web
- Use other apps: an ecosystem of other apps

**What this makes me think about the current foundation**

The current foundation was definitely based on those needs. It shows in the best way.

## Comparing to and learning from other apps

- Popular browsers and operating systems: 1. They progressively disclose things, only hitting you with information or dialogs once per launch or when it becomes relevant. 2. They get out of the way. 3. They use tabs, docks, and window views depending on context.
- GradeVue: It's very simple because it uses direct connection and client-side storage - some important principles, and we should strive for them and their benefits, but we can't always follow them (eg we can't take the client word's for "I'm a real student").
- Libby: Libby has an antipattern that's unfortunately becoming too common: requiring entering your username before entering your password. It seems some people (including me) forgot that password amnagers exist.
- Unblockers: There are so many unblockers, but they're all very interesting. Some are tabbed and allow saving data to a local file. Ideally Tangent would autosave, but also allow syncing with local storage (although I need to remember why that's important).
- Anura: is where you can run Linux in your browser. How cool is that? It uses v86 to do so, which I'll eventually have to figure out.

**What this makes me think about the current foundation**

I don't really like the current sign in flow - it's half baked in many ways and isn't truly necessary for a decent chunk of Tangent. It should be more tastefully spread across Tangent.

It makes sense to make the "trust Tangent" and "don't trust Tangent" routes more cohesive. Mixing things between the two is confusing, so making them explicit routes is less confusing.

Storage and sync is hard as ever. Perhaps things should be local-first? Then things wouldn't go crazy if you're offline. Writing this I realize that I could make Tangent work completely offline and use offline storage, which would be really good for those who don't trust Tangent. So local-first is good. This might look something like: people who trust Tangent will log in by first getting authentication then connecting to storage, while people who don't trust Tangent will log in by first connecting to "storage" (a local file) then loading authentication from it.

So all in all, I can delete more or less the majority of the frontend code because it's flawed. Such is development.
