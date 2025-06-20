# What's the best way to store and sync data?

Storage and sync is one of the trickiest parts of app development. If I get it right, I'll have a great foundation; if I get it wrong, I'll be hurting myself for months to come.

## Basis

The registry is a file; app data is a file; images and markdown are files. Each user needs their own filesystem for storage. I need to be able to provide limited and contained storage to people using Tangent directly and its storage. I also need to connect to external storage if users would like.

## Idea: all your data is one .tar.gz

Limiting: simple
Connecting from Tangent: complex (need to handle the tar and the gzip)
Syncing from Tangent: simple (don't need to use S3-like APIs)
Directly connecting: complex (need to decompress, read or edit, and recompress every time)
Usage in prod: rare

## Idea: you get your own bucket

Limiting: could be complex (does R2 let you limit buckets?)
Connecting from Tangent: complex (will have to keep track of auth keys)
Syncing from Tangent: complex (reading and writing will be asynchronous)
Directly connecting: simple
Usage in prod: more in B2B

## Idea: you get a prefixed section of one bucket

Limiting: complex (need to sum the sizes of everything under a prefix)
Connecting from Tangent: simple
Syncing from Tangent: complex (reading and writing will be asynchronous)
Directly connecting: complex (need to proxy R2)
Usage in prod: common

## Number 2 or 3?

Giving each user their own bucket is definitely cleaner and direct. It's a path less traveled though. It's not clear how to manage limits or auth keys. But are prefixed sections that much better? Is it simple to limit the size of a prefix or make an S3 proxy that accepts a JWT both from Tangent and from other sources? No.

I'm biting the bullet. I'm going to give each user their own R2 bucket, and figure out the details later. Definitely easier than making an S3 proxy.

## Being "transparent about [AI]"

I got more context on each pattern and more advice from Sonnet, Opus, and o4-mini.
