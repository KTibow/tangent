# Will the tasks I run be fine?

## Tasks that run on Tangent

The previous version of Tangent had some cron tasks that did basic things like checking whether or not they could access various features of Tangent, pulling in new identity data from StudentVue, and removing broken passwords. All of these can run client side, so all of them will. It'll be a bit slower, and possibly complicate state management, but not enough to make it a problem. I'm not 100% sure on this though.

## Tasks that rely on Tangent

I have one thing that relies on Tangent data (checks whether it's a sub day in my language class). I also plan to set up APIs/a MCP server, which will likely use Tangent data. I'll probably be forced to build something that connects to Tangent storage on the backend because of this.
