# How do we identify users?

It's becoming clear that Tangent will be mostly pointless if we can't clearly identify users, since we literally cannot provide things of value to users who may be fraudulent. This sets some interesting constraints for the identity system.

## Persona: Alice

Alice is the average user of Tangent. Alice just logs in with her password every time, and Tangent does everything else automatically.

## Persona: Bob

Bob does not trust Tangent a lot. We still have to prove that he's real, and we can, through face verification.

## Persona: Charlie

Charlie does not trust Tangent at all. The only features Tangent could offer are files and apps that only use files, and he would have to bring his own S3 bucket. It doesn't make sense to care for Charlie.

## So

We won't negotiate on verifying identity. At this point, we'll just make verifying identity the same as logging in, even if you already have storage elsewhere. Everything else is a matter of configuration.
