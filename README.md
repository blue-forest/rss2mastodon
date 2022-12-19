
# rss2mastodon

This is a simple script to post RSS feeds to Mastodon, all accounts are **manually** managed in this repository.

The codebase is clearly at a proof of concept stage, but it works. It is not meant to be used by anyone else than us, but feel free to fork it.

An improvement of this project would be to use an API with a full implementation of OAuth as well as the configuration of applications on each concerned instance. This would allow to retrieve RSS feeds URLs from the metadata of the accounts, but it would imply managing the hosting on a private server and a moderation with possible abuse of the service. Currently the system is based on GitHub Actions and is therefore completely self-sufficient.

If this project is of interest to you, please [start a discussion with us](https://github.com/blue-forest/rss2mastodon/discussions) or/and follow `@nazim@blueforest.cc`.
