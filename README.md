
# rss2mastodon

This is a simple script to post RSS feeds to Mastodon, all accounts are **manually** managed in this repository. The codebase is clearly at a proof of concept stage, but it works. It is not meant to be used by anyone else than us, but feel free to fork it.

**We have recently stopped maintaining this system** because the administrators and some users of the instances on which we have deployed this script point out spam in the public feed. Therefore, we looked for alternative solutions to consume RSS feeds with another project we are working on : [socialexplorer](https://github.com/blue-forest/rss2mastodon).

Some improvements that could be made with this project would be to use an API with a full implementation of OAuth as well as the configuration of applications on each concerned instance. This would allow to retrieve RSS feeds URLs from the metadata of the accounts, but it would imply managing the hosting on a private server and a moderation with possible abuse of the service. Currently the execution is based on GitHub Actions and is therefore completely self-sufficient but without any external HTTP endpoint.
