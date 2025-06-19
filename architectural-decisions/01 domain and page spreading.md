# How should Tangent spread itself?

It's hard to accept, but the answer is probably "as little as possible".

## On domains

Now that Tangent is a public project, it makes sense to just use one domain. There isn't much to gain from using multiple when everything's open source. Tangent can just be another website you visit again.

What about the benefits? You can get the benefits of having multiple domains through other means, like using special URIs that directly run content or are viewed as trusted. So it's fine to just use one domain again.

## On pages

Now that Tangent is back on SvelteKit, it would make a lot of sense to use what it's good at. But how?

### First, let's just look at the log in page
SvelteKit gives us benefits for making it its own page like forms, but doing this means it's on a different path (like `/login` or something), which is a bit less clean. On the other hand, there are some (mainly mental) benefits to having the app be `/` and the log in page not occupy `/`.

### Now, what about the apps themselves
A first concept is to have each app loaded in iframes that can communicate with Tangent. This is hyperseparated, which makes things very hard for apps that need to be deeply integrated and easy for those that don't. It also has an unpleasant overhead.

A second concept is to make each app a component. This approach requires each app to manually handle things like loading data and its window. It's the way that each app in the previous version of Tangent worked.

I might do both. Core apps are their own components and get bundled in, while others (possibly more sensitive or custom) are framed.
